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
                <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm ring-1 ring-slate-100">
                            <UserPlus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900">Invite Team Member</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Add collaborators to your project</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@company.com"
                                className="block w-full rounded-lg border-slate-200 pl-10 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all placeholder:text-slate-400"
                                required
                            />
                        </div>
                        <div className="sm:w-44">
                            <div className="relative">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'READ' | 'FULL')}
                                    className="block w-full rounded-lg border-slate-200 py-2.5 pl-3.5 pr-10 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm cursor-pointer bg-white appearance-none"
                                >
                                    <option value="READ">Read Only</option>
                                    <option value="FULL">Full Access</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <Shield className="h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {isAdding ? 'Sending...' : 'Invite'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 flex items-center gap-3 text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 animate-in fade-in slide-in-from-top-1">
                            <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 border border-red-200">
                                <X className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 flex items-center gap-3 text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-1">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 border border-green-200">
                                <Check className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium">{success}</span>
                        </div>
                    )}
                </div>
            )}

            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        Team Members
                    </h3>
                    <span className="bg-slate-100 text-slate-600 py-1 px-2.5 rounded-full text-xs font-medium border border-slate-200">
                        {members.length} {members.length === 1 ? 'member' : 'members'}
                    </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100">
                    <ul role="list" className="divide-y divide-slate-100">
                        {members.map((member) => (
                            <li key={member.id} className="group flex items-center justify-between gap-x-6 p-4 hover:bg-slate-50/80 transition-colors">
                                <div className="flex min-w-0 gap-x-4 items-center">
                                    <div className="h-10 w-10 flex-none rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white group-hover:ring-blue-50 transition-all">
                                        {getInitials(member.user.name, member.user.email)}
                                    </div>
                                    <div className="min-w-0 flex-auto">
                                        <p className="text-sm font-semibold leading-6 text-slate-900 group-hover:text-blue-700 transition-colors">
                                            {member.user.name || 'Unknown User'}
                                        </p>
                                        <p className="truncate text-xs leading-5 text-slate-500 font-medium">
                                            {member.user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {member.role === 'OWNER' ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 shadow-sm">
                                            <Shield className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                                            Owner
                                        </span>
                                    ) : canManage ? (
                                        <div className="relative group/role">
                                            <select
                                                value={member.role}
                                                onChange={(e) => updateMemberRole(projectId, member.userId, e.target.value as 'READ' | 'FULL')}
                                                className={`appearance-none rounded-full py-1.5 pl-9 pr-8 text-xs font-medium border-0 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:leading-6 cursor-pointer transition-all shadow-sm
                                                    ${member.role === 'FULL'
                                                        ? 'bg-indigo-50 text-indigo-700 ring-indigo-200 focus:ring-indigo-500 hover:bg-indigo-100'
                                                        : 'bg-white text-slate-600 ring-slate-200 focus:ring-slate-400 hover:bg-slate-50'}`}
                                            >
                                                <option value="READ">Read Only</option>
                                                <option value="FULL">Full Access</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Shield className={`h-3.5 w-3.5 ${member.role === 'FULL' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            </div>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset shadow-sm
                                            ${member.role === 'FULL'
                                                ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                                                : 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
                                            <Shield className="h-3.5 w-3.5" />
                                            {member.role === 'READ' ? 'Read Only' : 'Full Access'}
                                        </span>
                                    )}

                                    {canManage && member.role !== 'OWNER' && (
                                        <button
                                            onClick={() => removeMember(projectId, member.userId)}
                                            className="rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Remove member"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                        {members.length === 0 && (
                            <li className="py-16 flex flex-col items-center justify-center text-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-4 ring-1 ring-slate-100 shadow-sm">
                                    <UserPlus className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900">No members yet</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                                    Invite colleagues to collaborate on this project together.
                                </p>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
