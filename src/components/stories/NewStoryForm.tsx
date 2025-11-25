'use client';

import Link from 'next/link';
import { createStory } from '@/app/actions/stories';
import { Save } from 'lucide-react';
import { Dictionary } from '@/lib/dictionaries';

interface Feature {
    id: string;
    name: string;
}

interface NewStoryFormProps {
    projectId: string;
    features: Feature[];
    dict: Dictionary;
}

export function NewStoryForm({ projectId, features, dict }: NewStoryFormProps) {
    return (
        <form action={createStory.bind(null, projectId)} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-slate-700">
                    {dict.forms.storyTitle}
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder={dict.forms.storyPlaceholder}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="featureId" className="text-sm font-medium text-slate-700">
                    {dict.forms.feature}
                </label>
                <select
                    id="featureId"
                    name="featureId"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                    <option value="">{dict.forms.selectFeature}</option>
                    {features.map(feature => (
                        <option key={feature.id} value={feature.id}>
                            {feature.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="acceptanceCriteria" className="text-sm font-medium text-slate-700">
                    {dict.forms.acceptanceCriteria}
                </label>
                <textarea
                    id="acceptanceCriteria"
                    name="acceptanceCriteria"
                    rows={5}
                    placeholder={dict.forms.criteriaPlaceholder}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Link
                    href={`/projects/${projectId}`}
                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                    {dict.forms.cancel}
                </Link>
                <button
                    type="submit"
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Save className="h-4 w-4" />
                    {dict.forms.createStory}
                </button>
            </div>
        </form>
    );
}
