'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { runStoryTest } from '@/app/actions/testing';
import { deleteStory, updateStory } from '@/app/actions/stories';
import { CheckCircle, XCircle, Clock, Trash2, Play, FileText, Pencil, ChevronDown, ChevronUp, Github, Upload } from 'lucide-react';
import { useState } from 'react';
import { Dictionary } from '@/lib/dictionaries';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { StoryHistoryModal } from './StoryHistoryModal';
import { useTestExecution } from '@/context/TestExecutionContext';
import { format } from 'date-fns';

interface TestResult {
    status: string;
    logs: string | null;
    createdAt: Date;
    testRun?: {
        user?: {
            name: string | null;
        } | null;
    } | null;
}

interface StoryWithResults {
    id: string;
    title: string;
    acceptanceCriteria: string;
    status: string;
    testResults: TestResult[];
    featureId: string | null;
    documentUrl: string | null;
    createdBy?: { name: string | null } | null;
    updatedBy?: { name: string | null } | null;
    createdAt: Date;
    updatedAt: Date;
}

interface StoryCardProps {
    story: StoryWithResults;
    projectId: string;
    dict: Dictionary;
    githubRepo?: string | null;
    userRole?: string; // 'ADMIN', 'FULL', 'READ'
}

export function StoryCard({ story, projectId, dict, githubRepo, userRole = 'READ' }: StoryCardProps) {
    const router = useRouter();
    const lastResult = story.testResults[0];
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRunModalOpen, setIsRunModalOpen] = useState(false);
    const { setIsExecuting } = useTestExecution();

    const canEdit = userRole === 'ADMIN' || userRole === 'FULL';

    const getGithubIssueUrl = () => {
        if (!githubRepo || !lastResult || lastResult.status !== 'FAIL') return null;

        const title = encodeURIComponent(`${dict.project.bug} ${story.title}`);
        const body = encodeURIComponent(
            `${dict.project.storyLabel} ${story.title}\n\n` +
            `${dict.project.criteriaLabel}\n${story.acceptanceCriteria}\n\n` +
            `${dict.project.failureLogsLabel}\n\`\`\`\n${lastResult.logs || dict.project.noLogs}\n\`\`\`\n\n` +
            `${dict.project.contextLabel}\n${dict.project.contextDesc}`
        );

        return `https://github.com/${githubRepo}/issues/new?title=${title}&body=${body}`;
    };

    const githubUrl = getGithubIssueUrl();

    return (
        <>
            <div className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full ${lastResult?.status === 'PASS' ? 'bg-green-500' :
                                lastResult?.status === 'FAIL' ? 'bg-red-500' :
                                    'bg-slate-400'
                                }`} />
                            <h3 className="font-semibold text-slate-900 leading-tight">{story.title}</h3>
                        </div>

                        <div className={`text-sm text-slate-600 ${!isExpanded && 'line-clamp-2'}`}>
                            <p className="whitespace-pre-wrap">{story.acceptanceCriteria}</p>
                            {story.documentUrl && (
                                <div className="mt-2">
                                    <a
                                        href={story.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                                    >
                                        <FileText className="h-3 w-3" />
                                        {dict.forms.documentUrl}
                                    </a>
                                </div>
                            )}
                        </div>

                        {story.acceptanceCriteria.length > 100 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                                {isExpanded ? (
                                    <>{dict.common.showLess} <ChevronUp className="h-3 w-3" /></>
                                ) : (
                                    <>{dict.common.showMore} <ChevronDown className="h-3 w-3" /></>
                                )}
                            </button>
                        )}

                        <div className="flex flex-col gap-1 text-[10px] text-slate-400 mt-1">
                            {story.createdBy?.name && <span>{dict.common.createdBy} {story.createdBy.name} {dict.common.on} {format(new Date(story.createdAt), 'dd/MM/yyyy HH:mm')}</span>}
                            {story.updatedBy?.name && <span>{dict.common.updatedBy} {story.updatedBy.name} {dict.common.on} {format(new Date(story.updatedAt), 'dd/MM/yyyy HH:mm')}</span>}
                            {lastResult && (
                                <span>
                                    {dict.report.lastRun} {lastResult.testRun?.user?.name ? `${dict.common.by} ${lastResult.testRun.user.name} ` : ''}
                                    {dict.common.on} {format(new Date(lastResult.createdAt), 'dd/MM/yyyy HH:mm')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        {lastResult ? (
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors hover:opacity-80 ${lastResult.status === 'PASS'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                    }`}
                                title={dict.common.viewHistory}
                            >
                                {lastResult.status === 'PASS' ? (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                    <XCircle className="h-3.5 w-3.5" />
                                )}
                                {lastResult.status === 'PASS' ? dict.project.testPass : dict.project.testFail}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
                                title={dict.common.viewHistory}
                            >
                                <Clock className="h-3.5 w-3.5" />
                                {dict.project.notTested}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-1">
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <button
                                onClick={() => setIsRunModalOpen(true)}
                                className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                                title={dict.project.play}
                            >
                                <Play className="h-3.5 w-3.5" />
                                {dict.project.play}
                            </button>
                        )}
                        <Link
                            href={`/projects/${projectId}/report?storyId=${story.id}`}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                            title={dict.project.viewReport}
                        >
                            <FileText className="h-3.5 w-3.5" />
                            {dict.project.report}
                        </Link>
                        {githubUrl && (
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                title={dict.project.createIssue}
                            >
                                <Github className="h-3.5 w-3.5" />
                                {dict.project.issue}
                            </a>
                        )}
                    </div>

                    {canEdit && (
                        <div className="flex items-center gap-1">
                            <Link
                                href={`/projects/${projectId}/stories/${story.id}/edit`}
                                className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
                                title={dict.common.edit}
                            >
                                <Pencil className="h-4 w-4" />
                            </Link>
                            <label className="cursor-pointer rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600" title="Import from text file">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".txt,.md"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const reader = new FileReader();
                                        reader.onload = async (event) => {
                                            const text = event.target?.result as string;
                                            if (text) {
                                                const formData = new FormData();
                                                formData.append('title', story.title);
                                                // Append new text to existing acceptance criteria
                                                const newCriteria = story.acceptanceCriteria
                                                    ? `${story.acceptanceCriteria}\n\n${text}`
                                                    : text;
                                                formData.append('acceptanceCriteria', newCriteria);
                                                if (story.featureId) formData.append('featureId', story.featureId);
                                                if (story.documentUrl) formData.append('documentUrl', story.documentUrl);

                                                await updateStory(story.id, projectId, formData);
                                                router.refresh();
                                            }
                                        };
                                        reader.readAsText(file);
                                        // Reset input
                                        e.target.value = '';
                                    }}
                                />
                                <Upload className="h-4 w-4" />
                            </label>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                title={dict.common.delete}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <StoryHistoryModal
                storyId={story.id}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                dict={dict}
            />

            <ConfirmationModal
                isOpen={isRunModalOpen}
                onClose={() => setIsRunModalOpen(false)}
                onConfirm={async () => {
                    try {
                        setIsExecuting(true);
                        setIsRunModalOpen(false); // Close modal immediately
                        await runStoryTest(projectId, story.id);
                        router.refresh();
                    } catch (error) {
                        console.error('Error running test:', error);
                    } finally {
                        setIsExecuting(false);
                    }
                }}
                title={dict.project.runTests}
                message={
                    <span>
                        {dict.project.runQaAnalysis} <strong>"{story.title}"</strong>?
                        <br />
                        <span className="text-sm text-slate-500 mt-2 block">
                            {dict.project.runQaAnalysisDesc}
                        </span>
                    </span>
                }
                confirmText={dict.project.play}
                cancelText={dict.forms.cancel}
                isDangerous={false}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={async () => {
                    await deleteStory(story.id, projectId);
                    router.refresh();
                }}
                title={dict.common.delete}
                message={
                    <span>
                        {dict.common.delete} <strong>"{story.title}"</strong>?
                        <br />
                        <span className="text-sm text-slate-500 mt-2 block">
                            {dict.common.cannotUndo}
                        </span>
                    </span>
                }
                confirmText={dict.common.delete}
                cancelText={dict.forms.cancel}
                isDangerous={true}
            />
        </>
    );
}
