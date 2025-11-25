import Link from 'next/link';
import { getProjects } from '@/app/actions/projects';
import { Plus, Globe, FileText, PlayCircle } from 'lucide-react';

interface ProjectWithCounts {
    id: string;
    name: string;
    description: string | null;
    baseUrl: string;
    _count: {
        stories: number;
        testRuns: number;
    };
}

import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

export default async function ProjectsPage() {
    const projects = await getProjects() as unknown as ProjectWithCounts[];
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">{dict.dashboard.projectsTitle}</h1>
                <Link
                    href="/projects/new"
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    {dict.dashboard.newProject}
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project: ProjectWithCounts) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                                {project.name}
                            </h3>
                            <Globe className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="mb-4 flex-1 text-sm text-slate-500">
                            {project.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>{project._count.stories} {dict.project.stories}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <PlayCircle className="h-3 w-3" />
                                <span>{project._count.testRuns} Runs</span>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-slate-400 truncate">
                            {project.baseUrl}
                        </div>
                    </Link>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
                        <div className="rounded-full bg-slate-100 p-3">
                            <Globe className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-slate-900">{dict.dashboard.noProjects}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Get started by creating a new project.
                        </p>
                        <Link
                            href="/projects/new"
                            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {dict.common.create}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
