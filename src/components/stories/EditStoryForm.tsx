'use client';

import Link from 'next/link';
import { updateStory } from '@/app/actions/stories';
import { Save } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Dictionary } from '@/lib/dictionaries';

interface Feature {
    id: string;
    name: string;
}

interface Story {
    id: string;
    title: string;
    acceptanceCriteria: string;
    featureId: string | null;
    documentUrl: string | null;
}

interface EditStoryFormProps {
    projectId: string;
    story: Story;
    features: Feature[];
    dict: Dictionary;
}

export function EditStoryForm({ projectId, story, features, dict }: EditStoryFormProps) {
    const updateStoryWithId = updateStory.bind(null, story.id, projectId);

    return (
        <form action={async (formData) => {
            await updateStoryWithId(formData);
            redirect(`/projects/${projectId}`);
        }} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-slate-700">
                    {dict.forms.storyTitle}
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={story.title}
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
                    defaultValue={story.featureId || ''}
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
                    defaultValue={story.acceptanceCriteria}
                    rows={5}
                    placeholder={dict.forms.criteriaPlaceholder}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="documentUrl" className="text-sm font-medium text-slate-700">
                    {dict.forms.documentUrl}
                </label>
                <input
                    type="url"
                    id="documentUrl"
                    name="documentUrl"
                    defaultValue={story.documentUrl || ''}
                    placeholder={dict.forms.documentUrlPlaceholder}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
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
                    {dict.forms.updateStory}
                </button>
            </div>
        </form>
    );
}
