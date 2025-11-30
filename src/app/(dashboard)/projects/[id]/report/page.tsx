import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';
import { logActivity } from '@/lib/activity';
import { ReportContent } from './ReportContent';

interface TestResult {
    status: string;
    logs: string | null;
    screenshot: string | null;
    createdAt: Date;
    testRun: {
        createdAt: Date;
        completedAt: Date | null;
    };
}

interface StoryWithResults {
    id: string;
    title: string;
    acceptanceCriteria: string;
    status: string;
    testResults: TestResult[];
    feature: { name: string } | null;
}

export default async function ProjectReportPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ storyId?: string }>
}) {
    const { id } = await params;
    const { storyId } = await searchParams;
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    const whereStory = storyId ? { id: storyId } : {};

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            stories: {
                where: whereStory,
                include: {
                    feature: true, // Include feature details
                    testResults: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        include: {
                            testRun: true
                        }
                    }
                }
            },
            testRuns: {
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    });

    if (!project) {
        notFound();
    }

    // Log activity
    await logActivity(project.id, 'VIEW_REPORT', 'PROJECT', project.name);

    const stories = (project.stories as unknown as StoryWithResults[]).map(story => ({
        ...story,
        testResults: story.testResults.map(result => ({
            ...result,
            createdAt: new Date(result.createdAt).toLocaleString('es-ES'),
            testRun: {
                ...result.testRun,
                createdAt: new Date(result.testRun.createdAt).toLocaleString('es-ES'),
                completedAt: result.testRun.completedAt
                    ? new Date(result.testRun.completedAt).toLocaleString('es-ES')
                    : null
            }
        }))
    }));

    const passedStories = stories.filter((s) => s.status === 'COMPLETED').length;
    const totalStories = stories.length;
    const coverage = totalStories > 0 ? Math.round((passedStories / totalStories) * 100) : 0;

    return (
        <ReportContent
            project={{ name: project.name, baseUrl: project.baseUrl }}
            stories={stories}
            stats={{ total: totalStories, passed: passedStories, coverage }}
            dict={dict}
            generatedAt={new Date().toLocaleDateString('es-ES')}
        />
    );
}
