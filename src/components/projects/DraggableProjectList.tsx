'use client';

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Globe, FileText, PlayCircle, Github, Calendar, Users, Copy, Trash2 } from 'lucide-react';
import { ProjectGithubLink } from './ProjectGithubLink';
import { reorderProjects, duplicateProject, deleteProject } from '@/app/actions/projects';
import { format } from 'date-fns';
import { ShareProjectModal } from './ShareProjectModal';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface ProjectWithCounts {
    id: string;
    name: string;
    description: string | null;
    baseUrl: string;
    githubRepo: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        stories: number;
        testRuns: number;
    };
    createdById: string | null;
    createdBy?: { name: string | null } | null;
    updatedBy?: { name: string | null } | null;
}

interface DraggableProjectListProps {
    projects: ProjectWithCounts[];
    dict: any;
    currentUserId: string;
}

function SortableProjectCard({ project, dict, currentUserId }: { project: ProjectWithCounts; dict: any; currentUserId: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);

    const isOwner = project.createdById === currentUserId;

    const handleDuplicateClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDuplicateModalOpen(true);
    };

    const handleConfirmDuplicate = async () => {
        setIsDuplicating(true);
        try {
            await duplicateProject(project.id);
        } catch (error) {
            console.error('Failed to duplicate project:', error);
            alert('Failed to duplicate project');
        } finally {
            setIsDuplicating(false);
            setIsDuplicateModalOpen(false);
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProject(project.id);
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project');
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsShareModalOpen(true);
    };

    return (
        <>
            <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
                <Link
                    href={`/projects/${project.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200/60 h-full"
                >
                    <div className="p-6 flex flex-col h-full">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {project.name}
                            </h3>
                            <div className="flex items-center gap-1">
                                {isOwner && (
                                    <button
                                        onClick={handleShare}
                                        className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        title="Share Project"
                                    >
                                        <Users className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={handleDuplicateClick}
                                    disabled={isDuplicating || !isOwner}
                                    className={`rounded p-1.5 transition-colors ${isOwner ? 'text-slate-400 hover:bg-blue-50 hover:text-blue-600' : 'text-slate-200 cursor-not-allowed'} disabled:opacity-50`}
                                    title={isOwner ? "Duplicate Project" : undefined}
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting || !isOwner}
                                    className={`rounded p-1.5 transition-colors ${isOwner ? 'text-slate-400 hover:bg-red-50 hover:text-red-600' : 'text-slate-200 cursor-not-allowed'} disabled:opacity-50`}
                                    title={isOwner ? dict.common.delete : undefined}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 space-y-3 flex-1">
                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                <p className="leading-relaxed line-clamp-2">
                                    {project.description || dict.project.noDescription}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Globe className="h-4 w-4 text-slate-400" />
                                <span className="truncate">{project.baseUrl}</span>
                            </div>
                            {project.githubRepo && (
                                <object className="relative z-10 block">
                                    <a
                                        href={`https://github.com/${project.githubRepo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Github className="h-4 w-4 text-slate-400" />
                                        <span className="truncate">{project.githubRepo}</span>
                                    </a>
                                </object>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>{project._count.stories} {dict.project.stories}</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                                    <PlayCircle className="h-3.5 w-3.5" />
                                    <span>{project._count.testRuns} {dict.project.runs}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 text-[10px] text-slate-400">
                                {project.createdBy?.name && <span>{dict.common.createdBy} {project.createdBy.name} on {format(new Date(project.createdAt), 'dd/MM/yyyy HH:mm')}</span>}
                                {project.updatedBy?.name && <span>{dict.common.updatedBy} {project.updatedBy.name} on {format(new Date(project.updatedAt), 'dd/MM/yyyy HH:mm')}</span>}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
            <ShareProjectModal
                projectId={project.id}
                projectName={project.name}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                dict={dict}
            />
            <ConfirmationModal
                isOpen={isDuplicateModalOpen}
                onClose={() => setIsDuplicateModalOpen(false)}
                onConfirm={handleConfirmDuplicate}
                title={dict.project.duplicateTitle}
                message={dict.project.duplicateMessage.replace('{projectName}', project.name)}
                confirmText={dict.project.duplicateConfirm}
                cancelText={dict.common.cancel}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={dict.common.delete}
                message={dict.common.cannotUndo}
                confirmText={dict.common.delete}
                cancelText={dict.common.cancel}
                isDangerous={true}
            />
        </>
    );
}

export function DraggableProjectList({ projects: initialProjects, dict, currentUserId }: DraggableProjectListProps) {
    const [projects, setProjects] = useState(initialProjects);
    const id = useId();

    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setProjects((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update order in database
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    order: index,
                }));
                reorderProjects(updates);

                return newItems;
            });
        }
    }

    return (
        <DndContext
            id={id}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={projects.map(p => p.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <SortableProjectCard key={project.id} project={project} dict={dict} currentUserId={currentUserId} />
                    ))}
                    {projects.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
                            <div className="rounded-full bg-slate-100 p-3">
                                <Globe className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="mt-4 text-sm font-semibold text-slate-900">{dict.dashboard.noProjects}</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {dict.dashboard.getStarted}
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
            </SortableContext>
        </DndContext>
    );
}
