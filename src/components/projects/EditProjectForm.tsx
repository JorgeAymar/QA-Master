'use client';

import { updateProject } from '@/app/actions/projects';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface EditProjectFormProps {
    project: {
        id: string;
        name: string;
        baseUrl: string;
        description: string | null;
    };
}

export function EditProjectForm({ project }: EditProjectFormProps) {
    const updateProjectWithId = updateProject.bind(null, project.id);

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/projects/${project.id}`}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Edit Project</h1>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <form action={updateProjectWithId} className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Project Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            defaultValue={project.name}
                            required
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="baseUrl"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Base URL
                        </label>
                        <input
                            type="url"
                            name="baseUrl"
                            id="baseUrl"
                            defaultValue={project.baseUrl}
                            required
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            rows={3}
                            defaultValue={project.description || ''}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link
                            href={`/projects/${project.id}`}
                            className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
