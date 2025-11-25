'use client';

import { createProject } from '@/app/actions/projects';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Dictionary } from '@/lib/dictionaries';

export function NewProjectForm({ dict }: { dict: Dictionary }) {
    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/projects"
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">{dict.forms.newProjectTitle}</h1>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <form action={createProject} className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-slate-700"
                        >
                            {dict.forms.projectName}
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={dict.forms.projectPlaceholder}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="baseUrl"
                            className="block text-sm font-medium text-slate-700"
                        >
                            {dict.forms.baseUrl}
                        </label>
                        <input
                            type="url"
                            name="baseUrl"
                            id="baseUrl"
                            required
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="githubRepo"
                            className="block text-sm font-medium text-slate-700"
                        >
                            {dict.forms.githubRepo}
                        </label>
                        <input
                            type="text"
                            name="githubRepo"
                            id="githubRepo"
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={dict.forms.githubPlaceholder}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-slate-700"
                        >
                            {dict.forms.description}
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={dict.forms.descPlaceholder}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link
                            href="/projects"
                            className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                            {dict.forms.cancel}
                        </Link>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {dict.forms.createProject}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
