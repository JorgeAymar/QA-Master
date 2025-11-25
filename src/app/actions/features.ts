'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

    revalidatePath(`/projects/${projectId}`);
}

export async function deleteFeature(featureId: string, projectId: string) {
    await prisma.feature.delete({
        where: { id: featureId },
    });

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
