import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getProjectStories } from '@/app/actions/stories';
import { createFeature } from '@/app/actions/features';

import { ArrowLeft, FolderPlus, LayoutDashboard, CheckCircle2, Clock, AlertCircle, Pencil, Github, Globe, FileText } from 'lucide-react';
import { notFound } from 'next/navigation';
import { FeatureGroup } from '@/components/features/FeatureGroup';
import { StoryCard } from '@/components/stories/StoryCard';
import { ProjectBoard } from '@/components/projects/ProjectBoard';
import { ShareProjectModal } from '@/components/projects/ShareProjectModal';
import { getUserLanguage, verifySession } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

interface TestResult {
    status: string;
    logs: string | null;
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

    const completedStories = stories.filter((s) => s.status === 'COMPLETED').length;
    const pendingStories = stories.filter((s) => s.status === 'PENDING').length;
    const completionRate = stories.length > 0 ? Math.round((completedStories / stories.length) * 100) : 0;

    const isOwner = userRole === 'OWNER' || userRole === 'ADMIN';
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
                                {isOwner && (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/projects/${project.id}/edit`}
                                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                                        >
                                            {dict.common.edit}
                                        </Link>
                                        <ShareProjectModal
                                            projectId={project.id}
                                            members={project.members}
                                            currentUserRole={userRole}
                                            dict={dict}
                                        />
                                    </div>
                                )}
                                {isShared && (
                                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 border border-indigo-100">
                                        Shared with you
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                {project.createdBy?.name && (
                                    <span>Created by {project.createdBy.name}</span>
                                )}
                                {project.updatedBy?.name && (
                                    <span>Updated by {project.updatedBy.name}</span>
                                )}
                            </div>
                            {project.description && (
                                <div className="flex items-center gap-2 group">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">
                                        {project.description}
                                    </p>
                                    <Link
                                        href={`/projects/${project.id}/edit`}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600"
                                        title={dict.common.edit}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            )}
                            <div className="flex items-center gap-2 group">
                                <Globe className="h-4 w-4 text-slate-400" />
                                <a href={project.baseUrl} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    {project.baseUrl}
                                </a>
                                <Link
                                    href={`/projects/${project.id}/edit`}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600"
                                    title={dict.common.edit}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Link>
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
                                    <Link
                                        href={`/projects/${project.id}/edit`}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600"
                                        title={dict.common.edit}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/projects/${project.id}/edit`}
                                        className="text-sm text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                    >
                                        <Github className="h-3.5 w-3.5" />
                                        <span>{dict.project.addGithub}</span>
                                        <Pencil className="h-3 w-3 ml-1 opacity-50" />
                                    </Link>
                                </div>
                            )}
                        </div>


                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                                <p className="text-sm font-medium text-slate-500">{dict.project.completed}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold text-slate-900">{completedStories}</p>
                                    <span className="text-sm font-medium text-green-600">({completionRate}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-yellow-50 p-3">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{dict.project.pending}</p>
                                <p className="text-2xl font-bold text-slate-900">{pendingStories}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Actions */}
                    <div className="lg:col-span-1 space-y-6">
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
        </div>
    );
}
