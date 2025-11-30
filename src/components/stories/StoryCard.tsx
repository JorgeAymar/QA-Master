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
    attachments?: {
        id: string;
        filename: string;
        path: string;
    }[];
    _count?: {
        testResults: number;
    };
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
    const [showBrowser, setShowBrowser] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<{ id: string; filename: string } | null>(null);
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

    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('storyId', story.id);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            router.refresh();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <>
            <div className="group relative flex flex-col gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-sm p-5 shadow-sm transition-all hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full ${lastResult?.status === 'PASS' ? 'bg-green-500' :
                                lastResult?.status === 'FAIL' ? 'bg-red-500' :
                                    'bg-zinc-400 dark:bg-zinc-600'
                                }`} />
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">{story.title}</h3>
                        </div>

                        <div className={`text-sm text-zinc-600 dark:text-zinc-400 ${!isExpanded && 'line-clamp-2'}`}>
                            <p className="whitespace-pre-wrap">{story.acceptanceCriteria}</p>
                            {story.documentUrl && (
                                <div className="mt-2">
                                    <a
                                        href={story.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        <FileText className="h-3 w-3" />
                                        {dict.forms.documentUrl}
                                    </a>
                                </div>
                            )}

                            {story.attachments && story.attachments.length > 0 && (
                                <div className="mt-3 md:hidden flex flex-wrap gap-2">
                                    {/* Mobile view only - duplicate logic or hide */}
                                </div>
                            )}
                        </div>

                        {story.acceptanceCriteria.length > 100 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                {isExpanded ? (
                                    <>{dict.common.showLess} <ChevronUp className="h-3 w-3" /></>
                                ) : (
                                    <>{dict.common.showMore} <ChevronDown className="h-3 w-3" /></>
                                )}
                            </button>
                        )}

                        <div className="flex flex-col gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                            {story.createdBy?.name && <span>{dict.common.createdBy} {story.createdBy.name} {dict.common.on} {format(new Date(story.createdAt), 'dd/MM/yyyy HH:mm')}</span>}
                            {story.updatedBy?.name && <span>{dict.common.updatedBy} {story.updatedBy.name} {dict.common.on} {format(new Date(story.updatedAt), 'dd/MM/yyyy HH:mm')}</span>}
                            {lastResult && (
                                <span>
                                    {dict.report.lastRun} {lastResult.testRun?.user?.name ? `${dict.common.by} ${lastResult.testRun.user.name} ` : ''}
                                    {dict.common.on} {format(new Date(lastResult.createdAt), 'dd/MM/yyyy HH:mm')}
                                </span>
                            )}
                            {story._count?.testResults !== undefined && story._count.testResults > 0 && (
                                <span>
                                    {story._count.testResults} {dict.project.runs}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[200px] self-stretch">
                        {lastResult ? (
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors hover:opacity-80 ${lastResult.status === 'PASS'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
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
                                className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                title={dict.common.viewHistory}
                            >
                                <Clock className="h-3.5 w-3.5" />
                                {dict.project.notTested}
                            </button>
                        )}

                        {/* Attachments List - Right Column Bottom */}
                        {story.attachments && story.attachments.length > 0 && (
                            <div className="mt-auto flex flex-col gap-2 items-end w-full">
                                {story.attachments.map((file: any) => (
                                    <div
                                        key={file.id}
                                        className="group/file flex items-center gap-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700/50 max-w-full"
                                    >
                                        <a
                                            href={file.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0"
                                        >
                                            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span className="truncate font-medium max-w-[120px]">{file.filename}</span>
                                        </a>
                                        {canEdit && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setAttachmentToDelete(file);
                                                }}
                                                className="ml-1 rounded-full p-0.5 text-zinc-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover/file:opacity-100 flex-shrink-0"
                                                title={dict.common.delete}
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-1">
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <button
                                onClick={() => setIsRunModalOpen(true)}
                                className="flex items-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                                title={dict.project.play}
                            >
                                <Play className="h-3.5 w-3.5" />
                                {dict.project.play}
                            </button>
                        )}
                        <Link
                            href={`/projects/${projectId}/report?storyId=${story.id}`}
                            className="flex items-center gap-1.5 rounded-md bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
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
                                className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
                                title={dict.project.createIssue}
                            >
                                <Github className="h-3.5 w-3.5" />
                                {dict.project.issue}
                            </a>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {canEdit && (
                            <div className="flex items-center gap-1">
                                <Link
                                    href={`/projects/${projectId}/stories/${story.id}/edit`}
                                    className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                                    title={dict.common.edit}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Link>
                                <label className={`cursor-pointer rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`} title="Attach file">
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <Upload className="h-3.5 w-3.5" />
                                </label>
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="rounded-full p-1.5 text-zinc-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                                    title={dict.common.delete}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
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
                        await runStoryTest(projectId, story.id, !showBrowser);
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
                        {story.attachments && story.attachments.length > 0 && (
                            <span className="text-sm text-blue-600 dark:text-blue-400 mt-2 block font-medium flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {dict.project.usingAttachments}
                            </span>
                        )}
                    </span>
                }
                confirmText={dict.project.play}
                cancelText={dict.forms.cancel}
                isDangerous={false}
                extraContent={
                    <div className="mt-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showBrowser"
                            checked={showBrowser}
                            onChange={(e) => setShowBrowser(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                        />
                        <label htmlFor="showBrowser" className="text-sm text-zinc-600 dark:text-zinc-400 select-none cursor-pointer">
                            {dict.project.showBrowser} <span className="text-xs text-zinc-400">({dict.project.localOnly})</span>
                        </label>
                    </div>
                }
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

            <ConfirmationModal
                isOpen={!!attachmentToDelete}
                onClose={() => setAttachmentToDelete(null)}
                onConfirm={async () => {
                    if (!attachmentToDelete) return;
                    try {
                        const res = await fetch(`/api/upload/${attachmentToDelete.id}`, {
                            method: 'DELETE',
                        });
                        if (!res.ok) throw new Error('Failed to delete');
                        router.refresh();
                    } catch (error) {
                        console.error('Error deleting file:', error);
                        alert('Error deleting file');
                    } finally {
                        setAttachmentToDelete(null);
                    }
                }}
                title={dict.common.delete}
                message={
                    <span>
                        {dict.common.delete} <strong>"{attachmentToDelete?.filename}"</strong>?
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
