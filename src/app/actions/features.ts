'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity';
import { verifySession } from '@/lib/session';

// ...

export async function createFeature(projectId: string, formData: FormData) {
    const name = formData.get('name') as string;

    if (!name || name.trim() === '') {
        return;
    }

    // Assuming 'session' and 'lastFeature' are defined elsewhere or passed in a real scenario.
    // For the purpose of this edit, we are adding the lines as requested,
    // which might require further context for 'session' and 'lastFeature' to be syntactically correct.
    const lastFeature = await prisma.feature.findFirst({
        where: { projectId },
        orderBy: { order: 'desc' },
    });

    const session = await verifySession();

    await prisma.feature.create({
        data: {
            name,
            projectId,
            order: lastFeature ? lastFeature.order + 1 : 0,
            createdById: session.userId,
            updatedById: session.userId
        },
    });

    await logActivity(projectId, 'CREATE', 'FEATURE', name);

    revalidatePath(`/projects/${projectId}`);
}

export async function deleteFeature(featureId: string, projectId: string) {
    const feature = await prisma.feature.findUnique({ where: { id: featureId } });

    if (feature) {
        // Delete all stories associated with this feature first (simulating cascade)
        // We use a transaction to ensure both happen or neither
        await prisma.$transaction([
            prisma.userStory.deleteMany({
                where: { featureId: featureId }
            }),
            prisma.feature.delete({
                where: { id: featureId },
            })
        ]);

        await logActivity(projectId, 'DELETE', 'FEATURE', feature.name);
    }

    revalidatePath(`/projects/${projectId}`);
}

export async function updateFeature(featureId: string, name: string, projectId: string) {
    if (!name || name.trim() === '') {
        return;
    }

    const session = await verifySession();

    await prisma.feature.update({
        where: { id: featureId },
        data: {
            name,
            updatedById: session.userId,
            updatedAt: new Date()
        },
    });

    await logActivity(projectId, 'UPDATE', 'FEATURE', name);

    revalidatePath(`/projects/${projectId}`);
}

export async function reorderFeatures(items: { id: string; order: number }[], projectId: string) {
    const transaction = items.map((item) =>
        prisma.feature.update({
            where: { id: item.id },
            data: { order: item.order },
        })
    );

    await prisma.$transaction(transaction);
    revalidatePath(`/projects/${projectId}`);
}
