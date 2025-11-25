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

export async function deleteStory(storyId: string, projectId: string) {
    await prisma.userStory.delete({
        where: { id: storyId }
    });
    revalidatePath(`/projects/${projectId}`);
}
