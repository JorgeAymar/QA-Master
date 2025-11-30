'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShareProjectModal } from '@/components/projects/ShareProjectModal';
import { ImportStoriesModal } from '@/components/projects/ImportStoriesModal';
import { Users, Pencil, Upload } from 'lucide-react';

interface ProjectHeaderActionsProps {
    projectId: string;
    projectName: string;
    dict: any;
    canEdit: boolean;
    isOwner: boolean;
}

export function ProjectHeaderActions({ projectId, projectName, dict, canEdit, isOwner }: ProjectHeaderActionsProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    if (!canEdit) return null;

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                title={dict.project.import}
            >
                <Upload className="h-4 w-4" />
            </button>

            <Link
                href={`/projects/${projectId}/edit`}
                className="flex items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                title={dict.common.edit}
            >
                <Pencil className="h-4 w-4" />
            </Link>
            {isOwner && (
                <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                >
                    <Users className="h-3 w-3" />
                    Share
                </button>
            )}
            <ShareProjectModal
                projectId={projectId}
                projectName={projectName}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                dict={dict}
            />
            <ImportStoriesModal
                projectId={projectId}
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                dict={dict}
            />
        </div>
    );
}
