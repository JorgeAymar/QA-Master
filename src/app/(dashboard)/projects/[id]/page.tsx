import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getProjectStories, deleteStory } from '@/app/actions/stories';
import { createFeature, deleteFeature } from '@/app/actions/features';
import { runTests } from '@/app/actions/testing';
import { Plus, ArrowLeft, CheckCircle, XCircle, Clock, Trash2, Play, FileText, Layers, FolderPlus } from 'lucide-react';
import { notFound } from 'next/navigation';

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
    feature?: Feature | null;
}

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
        include: { features: true },
    });

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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/projects"
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                        <Link
                            href={`/projects/${project.id}/edit`}
                            className="text-sm text-slate-400 hover:text-blue-600"
                        >
                            Edit
                        </Link>
                    </div>
                    <a href={project.baseUrl} target="_blank" className="text-sm text-blue-600 hover:underline">{project.baseUrl}</a>
                </div>
            </div>

            {/* Project Dashboard */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Total Stories</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{stories.length}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Completed</p>
                    <div className="flex items-end justify-between">
                        <p className="mt-1 text-2xl font-bold text-green-600">
                            {stories.filter((s) => s.status === 'COMPLETED').length}
                        </p>
                        <p className="text-sm text-slate-500 mb-1">
                            {stories.length > 0
                                ? Math.round((stories.filter((s) => s.status === 'COMPLETED').length / stories.length) * 100)
                                : 0}%
                        </p>
                    </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Pending</p>
                    <p className="mt-1 text-2xl font-bold text-yellow-600">
                        {stories.filter((s) => s.status === 'PENDING').length}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 className="text-lg font-semibold text-slate-900">Features & Stories</h2>
                <div className="flex gap-2">
                    <form action={createFeature.bind(null, project.id)} className="flex gap-2">
                        <input
                            type="text"
                            name="name"
                            placeholder="New Feature Name"
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            required
                        />
                        <button className="flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                            <FolderPlus className="h-4 w-4" />
                            Add Feature
                        </button>
                    </form>
                    <div className="w-px bg-slate-300 mx-2"></div>
                    <Link
                        href={`/projects/${project.id}/report`}
                        className="flex items-center gap-2 rounded-md bg-white border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <FileText className="h-4 w-4" />
                        Report
                    </Link>
                    <form action={runTests.bind(null, project.id)}>
                        <button className="flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900">
                            <Play className="h-4 w-4" />
                            Run Tests
                        </button>
                    </form>
                    <Link
                        href={`/projects/${project.id}/stories/new`}
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Story
                    </Link>
                </div>
            </div>

            <div className="space-y-8">
                {/* Features Groups */}
                {project.features.map((feature: Feature) => (
                    <div key={feature.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-slate-900">{feature.name}</h3>
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                                    {storiesByFeature[feature.id]?.length || 0} stories
                                </span>
                            </div>
                            <form action={deleteFeature.bind(null, feature.id, project.id)}>
                                <button className="text-slate-400 hover:text-red-500" title="Delete Feature">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </form>
                        </div>

                        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                            {storiesByFeature[feature.id]?.map(story => (
                                <StoryCard key={story.id} story={story} projectId={project.id} />
                            ))}
                            {(!storiesByFeature[feature.id] || storiesByFeature[feature.id].length === 0) && (
                                <p className="text-sm text-slate-400 italic">No stories in this feature yet.</p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Uncategorized Stories */}
                {uncategorizedStories.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">Uncategorized Stories</h3>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {uncategorizedStories.length} stories
                            </span>
                        </div>
                        <div className="space-y-3">
                            {uncategorizedStories.map(story => (
                                <StoryCard key={story.id} story={story} projectId={project.id} />
                            ))}
                        </div>
                    </div>
                )}

                {stories.length === 0 && project.features.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
                        <p className="text-sm text-slate-500">No stories or features added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StoryCard({ story, projectId }: { story: StoryWithResults, projectId: string }) {
    const lastResult = story.testResults[0];
    return (
        <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900">{story.title}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${story.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {story.status}
                    </span>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{story.acceptanceCriteria}</p>
            </div>

            <div className="flex items-center gap-4">
                {lastResult ? (
                    <div className="flex items-center gap-1 text-sm">
                        {lastResult.status === 'PASS' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={lastResult.status === 'PASS' ? 'text-green-600' : 'text-red-600'}>
                            {lastResult.status}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>Not tested</span>
                    </div>
                )}

                <form action={deleteStory.bind(null, story.id, projectId)}>
                    <button className="text-slate-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
