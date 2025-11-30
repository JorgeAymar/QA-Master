'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity';
import { evaluateStoryWithAI } from '@/lib/ai-testing';
import { verifySession, getUserLanguage } from '@/lib/session';
import fs from 'fs/promises';
import path from 'path';

export async function runTests(projectId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { stories: true },
    });

    if (!project) throw new Error('Project not found');

    const session = await verifySession();

    // Create Test Run
    const testRun = await prisma.testRun.create({
        data: {
            projectId,
            userId: session.userId,
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

            // Update Story Status
            await prisma.userStory.update({
                where: { id: story.id },
                data: {
                    status: result.status === 'PASS' ? 'COMPLETED' : 'FAILED'
                }
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

export async function runStoryTest(projectId: string, storyId: string, headless: boolean = true) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            stories: {
                where: { id: storyId },
                include: { attachments: true }
            }
        },
    });

    if (!project || project.stories.length === 0) throw new Error('Project or Story not found');

    const story = project.stories[0];

    const session = await verifySession();

    // Create Test Run
    const testRun = await prisma.testRun.create({
        data: {
            projectId,
            userId: session.userId,
            status: 'RUNNING',
        },
    });

    await logActivity(projectId, 'EXECUTE', 'STORY', story.title);

    // Read Attachments
    let attachmentsContext = '';
    if (story.attachments && story.attachments.length > 0) {
        try {
            const fileContents = await Promise.all(story.attachments.map(async (att) => {
                try {
                    // Construct absolute path. Assuming att.path is relative to public or absolute?
                    // Based on upload route: /uploads/${storyId}/${filename}
                    // And saved as /uploads/${storyId}/${filename} in DB (relative to public usually for serving)
                    // But for server side reading we need system path.
                    // The DB path seems to be the URL path (e.g. /uploads/...).
                    // So we need to prepend process.cwd() + /public
                    const filePath = path.join(process.cwd(), 'public', att.path);
                    const content = await fs.readFile(filePath, 'utf-8');
                    return `File: ${att.filename}\nContent:\n${content}\n---`;
                } catch (err) {
                    console.error(`Failed to read attachment ${att.filename}:`, err);
                    return `File: ${att.filename}\nContent: (Error reading file)\n---`;
                }
            }));
            attachmentsContext = fileContents.join('\n\n');
        } catch (error) {
            console.error('Error processing attachments:', error);
        }
    }

    try {
        const language = await getUserLanguage();
        const result = await evaluateStoryWithAI(project.baseUrl, story.title, story.acceptanceCriteria, attachmentsContext, language, headless);

        await prisma.testResult.create({
            data: {
                runId: testRun.id,
                storyId: story.id,
                status: result.status,
                logs: result.logs,
                screenshot: result.screenshot,
            },
        });

        // Update Story Status
        await prisma.userStory.update({
            where: { id: story.id },
            data: {
                status: result.status === 'PASS' ? 'COMPLETED' : 'FAILED'
            }
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
