'use client';

import { useState, useEffect } from 'react';
import { X, Users, Check, AlertCircle, User as UserIcon, Trash2 } from 'lucide-react';
import { addProjectMember, getProjectMembers, removeProjectMember } from '@/app/actions/projects';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ShareProjectModalProps {
    projectId: string;
    projectName: string;
    isOpen: boolean;
    onClose: () => void;
    dict: any;
}

interface Member {
    id: string;
    role: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
}

export function ShareProjectModal({ projectId, projectName, isOpen, onClose, dict }: ShareProjectModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'READ' | 'FULL'>('READ');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; memberId: string; memberName: string; memberRole: string }>({
        isOpen: false,
        memberId: '',
        memberName: '',
        memberRole: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen, projectId]);

    const fetchMembers = async () => {
        setIsLoadingMembers(true);
        try {
            const data = await getProjectMembers(projectId);
            setMembers(data);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await addProjectMember(projectId, email, role);
            setSuccess(true);
            setEmail('');
            fetchMembers(); // Refresh list
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError('Failed to add member. Please check the email and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string, memberRole: string) => {
        if (memberRole === 'OWNER') {
            setError('Cannot remove the project owner');
            return;
        }

        setConfirmDialog({
            isOpen: true,
            memberId,
            memberName,
            memberRole
        });
    };

    const confirmRemoveMember = async () => {
        try {
            await removeProjectMember(projectId, confirmDialog.memberId);
            setConfirmDialog({ isOpen: false, memberId: '', memberName: '', memberRole: '' });
            fetchMembers(); // Refresh list
        } catch (err) {
            setError('Failed to remove member. Please try again.');
            setConfirmDialog({ isOpen: false, memberId: '', memberName: '', memberRole: '' });
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                        <Users className="h-5 w-5 text-blue-600" />
                        Share "{projectName}"
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                                <Check className="h-4 w-4" />
                                Member added successfully!
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="colleague@example.com"
                                />
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'READ' | 'FULL')}
                                    className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="READ">Viewer</option>
                                    <option value="FULL">Editor</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Adding...' : 'Add Member'}
                        </button>
                    </form>

                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-900">Current Members</h4>
                        {isLoadingMembers ? (
                            <div className="text-center py-4 text-sm text-slate-500">Loading members...</div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-4 text-sm text-slate-500">No members found.</div>
                        ) : (
                            <div className="space-y-3">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                {member.user.image ? (
                                                    <img src={member.user.image} alt={member.user.name || ''} className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-medium">
                                                        {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {member.user.name || 'Unknown User'}
                                                </p>
                                                <p className="text-xs text-slate-500">{member.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${member.role === 'OWNER' ? 'bg-purple-50 text-purple-700' :
                                                member.role === 'FULL' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-slate-50 text-slate-700'
                                                }`}>
                                                {member.role === 'OWNER' ? 'Owner' : member.role === 'FULL' ? 'Editor' : 'Viewer'}
                                            </span>
                                            {member.role !== 'OWNER' && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id, member.user.name || member.user.email, member.role)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-md"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Remove Member"
                message={`Are you sure you want to remove ${confirmDialog.memberName} from this project? They will lose all access immediately.`}
                confirmText="Remove"
                cancelText="Cancel"
                variant="danger"
                onConfirm={confirmRemoveMember}
                onCancel={() => setConfirmDialog({ isOpen: false, memberId: '', memberName: '', memberRole: '' })}
            />
        </div>
    );
}
