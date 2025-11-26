'use client';

import { useState } from 'react';
import { UserPlus, Trash2, Shield, User, Mail, Check, X } from 'lucide-react';
import { addMember, removeMember, updateMemberRole } from '@/app/actions/members';
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

interface ProjectMembersProps {
    projectId: string;
    members: Member[];
    currentUserRole: string; // 'ADMIN', 'OWNER', 'FULL', 'READ'
    dict: Dictionary;
}

export function ProjectMembers({ projectId, members, currentUserRole, dict }: ProjectMembersProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'READ' | 'FULL'>('READ');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const canManage = currentUserRole === 'ADMIN' || currentUserRole === 'OWNER';

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsAdding(true);

        try {
            const result = await addMember(projectId, email, role);
            if (result?.error) {
                setError(result.error);
            } else {
                setEmail('');
                setRole('READ');
                setSuccess('Invitation sent successfully!');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Failed to add member');
        } finally {
            setIsAdding(false);
        }
    };

    const getInitials = (name: string | null, email: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-8">
            {canManage && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900">Invite Team Member</h4>
                            <p className="text-xs text-slate-500">Add collaborators to your project</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddMember} className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="block w-full rounded-lg border-slate-200 pl-10 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="sm:w-40">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'READ' | 'FULL')}
                                    className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="READ">Read Only</option>
                                    <option value="FULL">Full Access</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isAdding}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isAdding ? 'Sending...' : 'Invite'}
                            </button>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                <X className="h-3 w-3" /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100">
                                <Check className="h-3 w-3" /> {success}
                            </div>
                        )}
                    </form>
                </div>
            )}

            <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    Team Members
                    <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{members.length}</span>
                </h3>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <ul role="list" className="divide-y divide-slate-100">
                        {members.map((member) => (
                            <li key={member.id} className="group flex items-center justify-between gap-x-6 p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex min-w-0 gap-x-4">
                                    <div className="h-10 w-10 flex-none rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm shadow-sm ring-2 ring-white">
                                        {getInitials(member.user.name, member.user.email)}
                                    </div>
                                    <div className="min-w-0 flex-auto">
                                        <p className="text-sm font-semibold leading-6 text-slate-900">
                                            {member.user.name || 'Unknown User'}
                                        </p>
                                        <p className="truncate text-xs leading-5 text-slate-500">
                                            {member.user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {member.role === 'OWNER' ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                            <Shield className="h-3 w-3 fill-amber-700" />
                                            Owner
                                        </span>
                                    ) : canManage ? (
                                        <div className="relative">
                                            <select
                                                value={member.role}
                                                onChange={(e) => updateMemberRole(projectId, member.userId, e.target.value as 'READ' | 'FULL')}
                                                className={`appearance-none rounded-full py-1 pl-3 pr-8 text-xs font-medium border-0 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:leading-6 cursor-pointer
                                                    ${member.role === 'FULL'
                                                        ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 focus:ring-indigo-600'
                                                        : 'bg-slate-50 text-slate-600 ring-slate-500/10 focus:ring-slate-500'}`}
                                            >
                                                <option value="READ">Read Only</option>
                                                <option value="FULL">Full Access</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <Shield className={`h-3 w-3 ${member.role === 'FULL' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset
                                            ${member.role === 'FULL'
                                                ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20'
                                                : 'bg-slate-50 text-slate-600 ring-slate-500/10'}`}>
                                            <Shield className="h-3 w-3" />
                                            {member.role === 'READ' ? 'Read Only' : 'Full Access'}
                                        </span>
                                    )}

                                    {canManage && member.role !== 'OWNER' && (
                                        <button
                                            onClick={() => removeMember(projectId, member.userId)}
                                            className="rounded-lg p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
                                            title="Remove member"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                        {members.length === 0 && (
                            <li className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                    <UserPlus className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-sm font-medium text-slate-900">No members yet</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                                    Invite colleagues to collaborate on this project.
                                </p>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
