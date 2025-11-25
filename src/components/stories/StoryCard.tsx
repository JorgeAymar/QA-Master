'use client';

import Link from 'next/link';
import { runStoryTest } from '@/app/actions/testing';
import { deleteStory } from '@/app/actions/stories';
import { CheckCircle, XCircle, Clock, Trash2, Play, FileText, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Dictionary } from '@/lib/dictionaries';

interface TestResult {
    status: string;
    logs: string | null;
}

interface StoryWithResults {
    id: string;
    title: string;
    acceptanceCriteria: string;
    status: string;
    testResults: TestResult[];
    featureId: string | null;
}

interface StoryCardProps {
    story: StoryWithResults;
    projectId: string;
    dict: Dictionary;
}

import { StoryHistoryModal } from './StoryHistoryModal';

export function StoryCard({ story, projectId, dict }: StoryCardProps) {
    const lastResult = story.testResults[0];
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    return (
        <>
            <div className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full ${story.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'
                                }`} />
                            <h3 className="font-semibold text-slate-900 leading-tight">{story.title}</h3>
                        </div>

                        <div className={`text-sm text-slate-600 ${!isExpanded && 'line-clamp-2'}`}>
                            <p className="whitespace-pre-wrap">{story.acceptanceCriteria}</p>
                        </div>

                        {story.acceptanceCriteria.length > 100 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                                {isExpanded ? (
                                    <>Show less <ChevronUp className="h-3 w-3" /></>
                                ) : (
                                    <>Show more <ChevronDown className="h-3 w-3" /></>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        {lastResult ? (
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors hover:opacity-80 ${lastResult.status === 'PASS'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                    }`}
                                title="View History"
                            >
                                {lastResult.status === 'PASS' ? (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                    <XCircle className="h-3.5 w-3.5" />
                                )}
                                {lastResult.status}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
                                title="View History"
                            >
                                <Clock className="h-3.5 w-3.5" />
                                Not tested
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-1">
                    <div className="flex items-center gap-2">
                        <form action={runStoryTest.bind(null, projectId, story.id)}>
                            <button
                                className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                                title={dict.project.play}
                            >
                                <Play className="h-3.5 w-3.5" />
                                {dict.project.play}
                            </button>
                        </form>
                        <Link
                            href={`/projects/${projectId}/report`}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                            title={dict.project.viewReport}
                        >
                            <FileText className="h-3.5 w-3.5" />
                            {dict.project.report}
                        </Link>
                    </div>

                    <div className="flex items-center gap-1">
                        <Link
                            href={`/projects/${projectId}/stories/${story.id}/edit`}
                            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
                            title={dict.common.edit}
                        >
                            <Pencil className="h-4 w-4" />
                        </Link>
                        <form action={deleteStory.bind(null, story.id, projectId)}>
                            <button
                                className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                title={dict.common.delete}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <StoryHistoryModal
                storyId={story.id}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                dict={dict}
            />
        </>
    );
}
