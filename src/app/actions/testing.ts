'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity';

// ...

export async function runTests(projectId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { stories: true },
    });

    if (!project) throw new Error('Project not found');

    // Create Test Run
    const testRun = await prisma.testRun.create({
        data: {
            projectId,
            status: 'RUNNING',
        },
    });

    await logActivity(projectId, 'EXECUTE', 'PROJECT', 'Full Project Test Run');

    try {
        // ... (existing code)
    } catch (error) {
        // ...
    }

    revalidatePath(`/projects/${projectId}`);
}

import { evaluateStoryWithAI } from '@/lib/ai-testing';

export async function runStoryTest(projectId: string, storyId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            stories: {
                where: { id: storyId }
            }
        },
    });

    if (!project || project.stories.length === 0) throw new Error('Project or Story not found');

    const story = project.stories[0];

    // Create Test Run
    const testRun = await prisma.testRun.create({
        data: {
            projectId,
            status: 'RUNNING',
        },
    });

    await logActivity(projectId, 'EXECUTE', 'STORY', story.title);

    try {
        // ... (existing code)
    } catch (error) {
        // ...
    }

    revalidatePath(`/projects/${projectId}`);
}

export async function getStoryHistory(storyId: string) {
    const results = await prisma.testResult.findMany({
        where: { storyId },
        orderBy: { createdAt: 'desc' },
        include: {
            testRun: true
        }
    });
    return results;
}
