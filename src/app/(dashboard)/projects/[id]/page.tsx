import Link from 'next/link';
import { ProjectHeaderActions } from '@/components/projects/ProjectHeaderActions';
import { prisma } from '@/lib/prisma';
import { getProjectStories } from '@/app/actions/stories';
import { createFeature } from '@/app/actions/features';

import { ArrowLeft, FolderPlus, LayoutDashboard, CheckCircle2, Clock, AlertCircle, Pencil, Github, Globe, FileText } from 'lucide-react';
import { notFound } from 'next/navigation';
import { FeatureGroup } from '@/components/features/FeatureGroup';
import { StoryCard } from '@/components/stories/StoryCard';
import { ProjectBoard } from '@/components/projects/ProjectBoard';
import { ShareProjectModal } from '@/components/projects/ShareProjectModal';
import { ProjectTestContext } from '@/components/projects/ProjectTestContext';
import { getUserLanguage, verifySession } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';
import { format } from 'date-fns';

interface TestResult {
    status: string;
    logs: string | null;
    createdAt: Date;
}

interface Feature {
    id: string;
    name: string;
}

interface StoryWithResults {
    id: string;
    title: string;
    acceptanceCriteria: string;
    status: string;
    testResults: TestResult[];
    featureId: string | null;
    order: number;
    documentUrl: string | null;
    feature?: Feature | null;
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

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    const session = await verifySession();
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            features: {
                include: {
                    createdBy: { select: { name: true } },
                    updatedBy: { select: { name: true } }
                }
            },
            members: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                }
            },
            createdBy: { select: { name: true } },
            updatedBy: { select: { name: true } }
        },
    });

    let userRole = 'READ';
    if (currentUser?.role === 'ADMIN') {
        userRole = 'ADMIN';
    } else {
        const member = project?.members.find((m: { userId: string, role: string }) => m.userId === session.userId);
        if (member) {
            userRole = member.role;
        }
    }

    if (!project) {
        notFound();
    }

    const stories = await getProjectStories(id) as unknown as StoryWithResults[];

    // Group stories by feature
    const storiesByFeature: Record<string, StoryWithResults[]> = {};
    const uncategorizedStories: StoryWithResults[] = [];

    stories.forEach(story => {
        if (story.featureId) {
            if (!storiesByFeature[story.featureId]) {
                storiesByFeature[story.featureId] = [];
            }
            storiesByFeature[story.featureId].push(story);
        } else {
            uncategorizedStories.push(story);
        }
    });

    const passedStories = stories.filter((s) => s.testResults[0]?.status === 'PASS').length;
    const failedStories = stories.filter((s) => s.testResults[0]?.status === 'FAIL').length;
    const untestedStories = stories.filter((s) => !s.testResults[0]).length;
    const passedRate = stories.length > 0 ? Math.round((passedStories / stories.length) * 100) : 0;

    const isOwner = userRole === 'OWNER' || userRole === 'ADMIN';
    const canEdit = isOwner || userRole === 'FULL';
    const isShared = !isOwner;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Link href="/projects" className="hover:text-slate-900 transition-colors">
                                    {dict.common.projects}
                                </Link>
                                <span>/</span>
                                <span className="text-slate-900 font-medium">{project.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <h1 className={`text-3xl font-bold tracking-tight ${isShared ? 'text-indigo-600' : 'text-slate-900'}`}>
                                    {project.name}
                                </h1>
                                <ProjectHeaderActions
                                    projectId={project.id}
                                    projectName={project.name}
                                    dict={dict}
                                    canEdit={canEdit}
                                    isOwner={isOwner}
                                />
                                {isShared && (
                                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-100">
                                        {userRole === 'READ' ? dict.project.sharedWithYouView : dict.project.sharedWithYouEdit}
                                    </span>
                                )}
                            </div>

                            {project.description && (
                                <div className="flex items-center gap-2 group">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">
                                        {project.description}
                                    </p>
                                    {canEdit && (
                                        <Link
                                            href={`/projects/${project.id}/edit`}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600"
                                            title={dict.common.edit}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2 group">
                                <Globe className="h-4 w-4 text-slate-400" />
                                <a href={project.baseUrl} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    {project.baseUrl}
                                </a>
                                {canEdit && (
                                    <Link
                                        href={`/projects/${project.id}/edit`}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600"
                                        title={dict.common.edit}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                )}
                            </div>
                            {project.githubRepo ? (
                                <div className="flex items-center gap-2 group">
                                    <a
                                        href={`https://github.com/${project.githubRepo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-slate-600 hover:text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <Github className="h-3.5 w-3.5" />
                                        {dict.project.github} {project.githubRepo}
                                    </a>
                                    {canEdit && (
                                        <Link
                                            href={`/projects/${project.id}/edit`}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600"
                                            title={dict.common.edit}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {canEdit && (
                                        <Link
                                            href={`/projects/${project.id}/edit`}
                                            className="text-sm text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                        >
                                            <Github className="h-3.5 w-3.5" />
                                            <span>{dict.project.addGithub}</span>
                                            <Pencil className="h-3 w-3 ml-1 opacity-50" />
                                        </Link>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-col gap-1 text-[10px] text-slate-400 mt-2">
                                {project.createdBy?.name && <span>{dict.common.createdBy} {project.createdBy.name} {dict.common.on} {format(new Date(project.createdAt), 'dd/MM/yyyy HH:mm')}</span>}
                                {project.updatedBy?.name && <span>{dict.common.updatedBy} {project.updatedBy.name} {dict.common.on} {format(new Date(project.updatedAt), 'dd/MM/yyyy HH:mm')}</span>}
                            </div>

                        </div>

                        <div className="w-full md:w-96 mt-4 md:mt-0">
                            <ProjectTestContext
                                projectId={project.id}
                                initialContext={project.testContext}
                                canEdit={canEdit}
                                dict={dict}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Metrics Grid */}
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-blue-50 p-3">
                                <LayoutDashboard className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{dict.report.totalStories}</p>
                                <p className="text-2xl font-bold text-slate-900">{stories.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-green-50 p-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{dict.project.passed}</p>
                                <p className="text-2xl font-bold text-slate-900">{passedStories}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-red-50 p-3">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{dict.project.failed}</p>
                                <p className="text-2xl font-bold text-slate-900">{failedStories}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-slate-50 p-3">
                                <Clock className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{dict.project.untested}</p>
                                <p className="text-2xl font-bold text-slate-900">{untestedStories}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {(userRole === 'ADMIN' || userRole === 'OWNER' || userRole === 'FULL') && (
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-4">{dict.project.features}</h3>
                                <form action={createFeature.bind(null, project.id)} className="space-y-3">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder={dict.project.newFeature}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                                        required
                                    />
                                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all">
                                        <FolderPlus className="h-4 w-4" />
                                        {dict.common.create}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="hidden lg:block rounded-xl border border-slate-200 bg-blue-50 p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-blue-900">{dict.project.proTipTitle}</h4>
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        {dict.project.proTipContent}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main List */}
                    <div className="lg:col-span-3 space-y-8">
                        <ProjectBoard
                            initialStories={stories}
                            features={project.features}
                            projectId={project.id}
                            dict={dict}
                            githubRepo={project.githubRepo}
                            userRole={userRole}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}
