
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { PrintButton } from '@/components/PrintButton';

interface TestResult {
    status: string;
    logs: string | null;
    screenshot: string | null;
    createdAt: Date;
}

interface StoryWithResults {
    id: string;
    title: string;
    acceptanceCriteria: string;
    status: string;
    testResults: TestResult[];
}

import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

export default async function ProjectReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            stories: {
                include: {
                    testResults: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
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

    const stories = project.stories as unknown as StoryWithResults[];
    const passedStories = stories.filter((s) => s.status === 'COMPLETED').length;
    const totalStories = stories.length;
    const coverage = totalStories > 0 ? Math.round((passedStories / totalStories) * 100) : 0;

    return (
        <div className="mx-auto max-w-4xl space-y-8 bg-white p-8 print:p-0">
            <div className="border-b border-slate-200 pb-6">
                <h1 className="text-3xl font-bold text-slate-900">{project.name} - {dict.report.title}</h1>
                <p className="mt-2 text-slate-500">{dict.dashboard.lastUpdate} {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-slate-400">{project.baseUrl}</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">{dict.report.totalStories}</p>
                    <p className="text-2xl font-bold text-slate-900">{totalStories}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">{dict.report.passRate}</p>
                    <p className="text-2xl font-bold text-green-600">{passedStories}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Coverage</p>
                    <p className="text-2xl font-bold text-blue-600">{coverage}%</p>
                </div>
            </div>

            <div>
                <h2 className="mb-4 text-xl font-semibold text-slate-900">{dict.report.result}</h2>
                <div className="space-y-4">
                    {stories.map((story) => {
                        const lastResult = story.testResults[0];
                        return (
                            <div key={story.id} className="border-b border-slate-100 pb-4 last:border-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-slate-900">{story.title}</h3>
                                        <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{story.acceptanceCriteria}</p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        {lastResult ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${lastResult.status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {lastResult.status === 'PASS' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                    {lastResult.status}
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(lastResult.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                                                <Clock className="h-4 w-4" />
                                                Pending
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {lastResult && lastResult.logs && (
                                    <div className="mt-2 rounded bg-slate-50 p-2 text-xs font-mono text-slate-600 whitespace-pre-wrap">
                                        <span className="font-bold">{dict.report.logs}:</span>
                                        {lastResult.logs}
                                    </div>
                                )}
                                {lastResult && lastResult.screenshot && (
                                    <div className="mt-4">
                                        <p className="text-xs font-medium text-slate-500 mb-2">{dict.report.screenshot}:</p>
                                        <img src={lastResult.screenshot} alt="Test Screenshot" className="rounded border border-slate-200 max-w-full h-auto shadow-sm" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="print:hidden mt-8 flex justify-end">
                <PrintButton />
            </div>
        </div>
    );
}

