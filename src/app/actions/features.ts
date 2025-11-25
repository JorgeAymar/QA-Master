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
