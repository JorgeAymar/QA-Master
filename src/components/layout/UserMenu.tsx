'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { Dictionary } from '@/lib/dictionaries';

interface UserMenuProps {
    dict: Dictionary;
    user: {
        name: string | null;
        email: string | null;
        role: string;
    };
}

export function UserMenu({ dict, user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white flex-shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col overflow-hidden flex-1 text-left">
                    <span className="truncate text-sm font-medium text-white">
                        {user.name || 'User'}
                    </span>
                    <span className="truncate text-xs text-slate-400">
                        {user.email}
                    </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 rounded-md bg-slate-800 shadow-lg border border-slate-700 overflow-hidden">
                    <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        <User className="h-4 w-4" />
                        {dict.sidebar.profile}
                    </Link>
                    <form action={logout}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            {dict.sidebar.signOut}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
