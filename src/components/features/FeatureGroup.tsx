'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFeature, deleteFeature } from '@/app/actions/features';
import { ChevronDown, ChevronRight, Plus, MoreVertical, Pencil, Trash2, GripVertical, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Dictionary } from '@/lib/dictionaries';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Feature {
    id: string;
    name: string;
}

interface FeatureGroupProps {
    feature: {
        id: string;
        name: string;
    };
    projectId: string;
    storyCount: number;
    children: React.ReactNode;
    dict: Dictionary;
    dragHandleProps?: any;
}

export function FeatureGroup({ feature, projectId, storyCount, children, dict, dragHandleProps }: FeatureGroupProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [name, setName] = useState(feature.name);

    async function handleUpdate() {
        if (name.trim() === feature.name) {
            setIsEditing(false);
            return;
        }
        await updateFeature(feature.id, name, projectId);
        setIsEditing(false);
    }

    async function handleDelete() {
        setIsDeleteModalOpen(true);
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3 flex-1">
                    {dragHandleProps && (
                        <button {...dragHandleProps} className="cursor-grab hover:bg-slate-100 p-1 rounded text-slate-400 hover:text-slate-600">
                            <GripVertical className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {isEditing ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate();
                            }}
                            className="flex items-center gap-2 flex-1"
                        >
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="rounded p-1 text-green-600 hover:bg-green-50"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setName(feature.name);
                                }}
                                className="rounded p-1 text-red-600 hover:bg-red-50"
                            >
                                <AlertCircle className="h-4 w-4" />
                            </button>
                        </form>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-slate-900">{feature.name}</h3>
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {storyCount} {dict.project.stories}
                            </span>
                            <Link
                                href={`/projects/${projectId}/stories/new?featureId=${feature.id}`}
                                className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                                title={dict.project.newStory}
                            >
                                <Plus className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-slate-400 hover:text-blue-600"
                                title={dict.project.renameFeature}
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>

                {!isEditing && (
                    <button
                        onClick={handleDelete}
                        className="text-slate-400 hover:text-red-500"
                        title={dict.project.deleteFeature}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="space-y-3 pl-4 border-l-2 border-slate-200 p-4">
                    {children}
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={async () => {
                    await deleteFeature(feature.id, projectId);
                    router.refresh();
                }}
                title={dict.project.deleteFeature}
                message={
                    <span>
                        {dict.project.deleteFeature} <strong>"{feature.name}"</strong>?
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
        </div>
    );
}
