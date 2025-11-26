'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ProjectMembers } from '@/components/projects/ProjectMembers';
import { Dictionary } from '@/lib/dictionaries';

interface Member {
    id: string;
    userId: string;
    role: string;
    user: {
        name: string | null;
        email: string;
        image: string | null;
    };
}

interface ShareProjectModalProps {
    projectId: string;
    members: Member[];
    currentUserRole: string;
    dict: Dictionary;
}

export function ShareProjectModal({ projectId, members, currentUserRole, dict }: ShareProjectModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                title="Share Project"
            >
                <Share2 className="h-4 w-4" />
                Share
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Share Project"
            >
                <div className="mt-4">
                    <ProjectMembers
                        projectId={projectId}
                        members={members}
                        currentUserRole={currentUserRole}
                        dict={dict}
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                        onClick={() => setIsOpen(false)}
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </>
    );
}
