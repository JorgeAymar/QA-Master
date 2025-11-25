'use client';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createStory } from '@/app/actions/stories';
import { ArrowLeft, Save } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function NewStoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
        include: { features: true },
    });

    if (!project) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/projects/${id}`}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">New User Story</h1>
                    <p className="text-sm text-slate-500">Add a new story to {project.name}</p>
                </div>
            </div>

            <form action={createStory.bind(null, id)} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-slate-700">
                        Story Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="e.g., User can log in with email"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="featureId" className="text-sm font-medium text-slate-700">
                        Feature (Optional)
                    </label>
                    <select
                        id="featureId"
                        name="featureId"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="">-- Select a Feature --</option>
                        {project.features.map((feature: { id: string; name: string }) => (
                            <option key={feature.id} value={feature.id}>
                                {feature.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="acceptanceCriteria" className="text-sm font-medium text-slate-700">
                        Acceptance Criteria
                    </label>
                    <textarea
                        id="acceptanceCriteria"
                        name="acceptanceCriteria"
                        rows={5}
                        placeholder="- Given I am on the login page...&#10;- When I enter valid credentials...&#10;- Then I should be redirected..."
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link
                        href={`/projects/${id}`}
                        className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Save className="h-4 w-4" />
                        Create Story
                    </button>
                </div>
            </form>
        </div>
    );
}
