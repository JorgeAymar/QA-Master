'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity';

// ...

export async function createFeature(projectId: string, formData: FormData) {
    const name = formData.get('name') as string;

    if (!name || name.trim() === '') {
        return;
    }

    await prisma.feature.create({
        data: {
            name,
            projectId,
        },
    });

    await logActivity(projectId, 'CREATE', 'FEATURE', name);

    revalidatePath(`/projects/${projectId}`);
}

export async function deleteFeature(featureId: string, projectId: string) {
    const feature = await prisma.feature.findUnique({ where: { id: featureId } });

    if (feature) {
        await prisma.feature.delete({
            where: { id: featureId },
        });
        await logActivity(projectId, 'DELETE', 'FEATURE', feature.name);
    }

    revalidatePath(`/projects/${projectId}`);
}

export async function updateFeature(featureId: string, name: string, projectId: string) {
    if (!name || name.trim() === '') {
        return;
    }

    await prisma.feature.update({
        where: { id: featureId },
        data: { name },
    });

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
