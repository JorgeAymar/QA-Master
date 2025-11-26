'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity';
import { evaluateStoryWithAI } from '@/lib/ai-testing';

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
        for (const story of project.stories) {
            const result = await evaluateStoryWithAI(project.baseUrl, story.title, story.acceptanceCriteria);

            await prisma.testResult.create({
                data: {
                    runId: testRun.id,
                    storyId: story.id,
                    status: result.status,
                    logs: result.logs,
                    screenshot: result.screenshot,
                },
            });
        }

        await prisma.testRun.update({
            where: { id: testRun.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });
    } catch (error) {
        console.error('Project Test Execution Failed:', error);
        await prisma.testRun.update({
            where: { id: testRun.id },
            data: {
                status: 'FAILED',
                completedAt: new Date(),
            },
        });
    }

    revalidatePath(`/projects/${projectId}`);
}

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
        const result = await evaluateStoryWithAI(project.baseUrl, story.title, story.acceptanceCriteria);

        await prisma.testResult.create({
            data: {
                runId: testRun.id,
                storyId: story.id,
                status: result.status,
                logs: result.logs,
                screenshot: result.screenshot,
            },
        });

        await prisma.testRun.update({
            where: { id: testRun.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });
    } catch (error) {
        console.error('Test Execution Failed:', error);
        await prisma.testRun.update({
            where: { id: testRun.id },
            data: {
                status: 'FAILED',
                completedAt: new Date(),
            },
        });
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
