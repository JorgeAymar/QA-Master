'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

    try {
        // Fetch page content
        const response = await fetch(project.baseUrl);
        const html = await response.text();
        const isReachable = response.ok;

        for (const story of project.stories) {
            // Simple keyword matching logic
            // In a real agent, this would be an LLM call or Playwright script
            const keywords = story.title.split(' ').filter((w: string) => w.length > 3);
            const criteriaKeywords = story.acceptanceCriteria.split(' ').filter((w: string) => w.length > 3);

            const allKeywords = [...keywords, ...criteriaKeywords];
            const foundKeywords = allKeywords.filter(k => html.toLowerCase().includes(k.toLowerCase()));

            // Heuristic: If > 20% of keywords are found, or if URL is reachable and story is simple
            const passThreshold = 0.2;
            const matchRatio = foundKeywords.length / allKeywords.length;

            let status = 'FAIL';
            let logs = `Tested URL: ${project.baseUrl}\n`;

            if (!isReachable) {
                logs += `Error: URL not reachable (Status: ${response.status})\n`;
            } else if (matchRatio > passThreshold || allKeywords.length === 0) {
                status = 'PASS';
                logs += `Success: Found relevant content on page.\nMatched keywords: ${foundKeywords.join(', ')}`;
            } else {
                logs += `Failure: Could not find sufficient evidence of feature.\nMissing keywords: ${allKeywords.filter(k => !foundKeywords.includes(k)).join(', ')}`;
            }

            await prisma.testResult.create({
                data: {
                    runId: testRun.id,
                    storyId: story.id,
                    status,
                    logs,
                },
            });

            // Update story status
            if (status === 'PASS') {
                await prisma.userStory.update({
                    where: { id: story.id },
                    data: { status: 'COMPLETED' }
                });
            }
        }

        await prisma.testRun.update({
            where: { id: testRun.id },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });

    } catch (error) {
        await prisma.testRun.update({
            where: { id: testRun.id },
            data: { status: 'FAILED', completedAt: new Date() },
        });
        console.error('Test run failed:', error);
    }

    revalidatePath(`/projects/${projectId}`);
}
