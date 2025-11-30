'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFeature, deleteFeature } from '@/app/actions/features';
import { ChevronDown, ChevronRight, Plus, MoreVertical, Pencil, Trash2, GripVertical, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Dictionary } from '@/lib/dictionaries';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { format } from 'date-fns';

interface Feature {
    id: string;
    name: string;
}

interface FeatureGroupProps {
    feature: {
        id: string;
        name: string;
        createdBy?: { name: string | null } | null;
        updatedBy?: { name: string | null } | null;
        createdAt: Date;
        updatedAt: Date;
    };
    projectId: string;
    storyCount: number;
    children: React.ReactNode;
    dict: Dictionary;
    dragHandleProps?: any;
    userRole?: string;
}

export function FeatureGroup({ feature, projectId, storyCount, children, dict, dragHandleProps, userRole = 'READ' }: FeatureGroupProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [name, setName] = useState(feature.name);

    const canEdit = userRole === 'ADMIN' || userRole === 'FULL' || userRole === 'OWNER';

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
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 dark:backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-4 py-3">
                <div className="flex items-center gap-3 flex-1">
                    {dragHandleProps && canEdit && (
                        <button {...dragHandleProps} className="cursor-grab hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
                            <GripVertical className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="rounded p-1 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300"
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
                                className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
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
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{feature.name}</h3>
                                    <span className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                        {storyCount} {dict.project.stories}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                                    {feature.createdBy?.name && <span>{dict.common.createdBy} {feature.createdBy.name} {dict.common.on} {format(new Date(feature.createdAt), 'dd/MM/yyyy HH:mm')}</span>}
                                    {feature.updatedBy?.name && <span>{dict.common.updatedBy} {feature.updatedBy.name} {dict.common.on} {format(new Date(feature.updatedAt), 'dd/MM/yyyy HH:mm')}</span>}
                                </div>
                            </div>
                            {canEdit && (
                                <>
                                    <Link
                                        href={`/projects/${projectId}/stories/new?featureId=${feature.id}`}
                                        className="ml-2 rounded p-1 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400"
                                        title={dict.project.newStory}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-zinc-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400"
                                        title={dict.project.renameFeature}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>

                {!isEditing && canEdit && (
                    <button
                        onClick={handleDelete}
                        className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
                        title={dict.project.deleteFeature}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="space-y-3 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 p-4">
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
