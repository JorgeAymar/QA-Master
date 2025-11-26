'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, LogOut, User, Bug, Shield } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { Dictionary } from '@/lib/dictionaries';
import { UserMenu } from './UserMenu';

interface SidebarProps {
    dict: Dictionary;
    user?: {
        name: string | null;
        email: string | null;
        role: string;
    } | null;
}

export function Sidebar({ dict, user }: SidebarProps) {
    const pathname = usePathname();

    const navigation = [
        { name: dict.sidebar.dashboard, href: '/', icon: LayoutDashboard },
        { name: dict.sidebar.projects, href: '/projects', icon: FolderKanban },
    ];

    if (user?.role === 'ADMIN') {
        navigation.push({ name: 'Admin', href: '/admin', icon: Shield });
    }

    return (
        <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
            <div className="flex h-16 items-center justify-center border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Bug className="h-6 w-6 text-blue-500" />
                    <span>QA Master</span>
                </div>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon
                                className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'
                                    }`}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-slate-800 p-4">
                {user && <UserMenu dict={dict} user={user} />}
            </div>
        </div>
    );
}
