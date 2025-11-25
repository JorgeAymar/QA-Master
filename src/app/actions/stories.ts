'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProjectStories(projectId: string) {
    return await prisma.userStory.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        include: {
            testResults: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            feature: true
        }
    });
}

export async function createStory(projectId: string, formData: FormData) {
    const title = formData.get('title') as string;
    const acceptanceCriteria = formData.get('acceptanceCriteria') as string;
    const featureId = formData.get('featureId') as string;

    if (!title || !acceptanceCriteria) {
        return;
    }

    await prisma.userStory.create({
        data: {
            title,
            acceptanceCriteria,
            projectId,
            featureId: featureId || null,
            status: 'PENDING',
        },
    });

    revalidatePath(`/projects/${projectId}`);
    // redirect(`/projects/${projectId}`); // Removed redirect to allow multiple additions or stay on page
}

export async function deleteStory(id: string, projectId: string) {
    await prisma.userStory.delete({
        where: { id },
    });

    revalidatePath(`/projects/${projectId}`);
}

export async function moveStory(storyId: string, newFeatureId: string | null, projectId: string) {
    await prisma.userStory.update({
        where: { id: storyId },
        data: { featureId: newFeatureId },
    });

    revalidatePath(`/projects/${projectId}`);
}

export async function reorderStories(items: { id: string; order: number }[], projectId: string) {
    const transaction = items.map((item) =>
        prisma.userStory.update({
            where: { id: item.id },
            data: { order: item.order },
        })
    );

    await prisma.$transaction(transaction);
    revalidatePath(`/projects/${projectId}`);
}

export async function updateStory(storyId: string, projectId: string, formData: FormData) {
    const title = formData.get('title') as string;
    const acceptanceCriteria = formData.get('acceptanceCriteria') as string;
    const featureId = formData.get('featureId') as string;

    if (!title || !acceptanceCriteria) {
        return;
    }

    await prisma.userStory.update({
        where: { id: storyId },
        data: {
            title,
            acceptanceCriteria,
            featureId: featureId || null,
        },
    });

    revalidatePath(`/projects/${projectId}`);
}
