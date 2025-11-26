'use client';

import { useState } from 'react';
import { Mail, Ban, CheckCircle } from 'lucide-react';
import { toggleUserStatus, sendInvitation } from '@/app/actions/admin';

interface UserActionsProps {
    user: {
        id: string;
        isActive: boolean;
        email: string;
    };
    dict: any;
}

export default function UserActions({ user, dict }: UserActionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInviteClick = () => {
        setIsModalOpen(true);
    };

    const handleConfirmInvite = async () => {
        setIsLoading(true);
        try {
            const result = await sendInvitation(user.id);
            if (result.success) {
                setIsModalOpen(false);
                // Small delay to allow modal to close smoothly before alert
                setTimeout(() => {
                    alert(dict.admin.emailSentSuccess.replace('{email}', user.email));
                }, 100);
            } else {
                console.error('Failed to send invitation:', result.error);
                alert('Failed to send invitation. Please check server logs.');
            }
        } catch (error) {
            console.error('Failed to send invitation:', error);
            alert('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            await toggleUserStatus(user.id, !user.isActive);
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={handleInviteClick}
                title={dict.admin.sendInvitationAction}
                className="p-1.5 rounded-md transition-colors text-blue-600 hover:bg-blue-50"
                disabled={isLoading}
            >
                <Mail className="h-4 w-4" />
            </button>

            <button
                onClick={handleToggleStatus}
                title={user.isActive ? dict.admin.deactivateUser : dict.admin.activateUser}
                className={`p-1.5 rounded-md transition-colors ${user.isActive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-green-600 hover:bg-green-50'
                    }`}
            >
                {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {dict.admin.inviteModalTitle}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            {dict.admin.inviteModalMessage.replace('{email}', user.email)}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                disabled={isLoading}
                            >
                                {dict.admin.cancel}
                            </button>
                            <button
                                onClick={handleConfirmInvite}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? '...' : dict.admin.confirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
