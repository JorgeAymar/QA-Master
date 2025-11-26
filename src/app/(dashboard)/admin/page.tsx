import { getDictionary } from '@/lib/dictionaries';
import { getUserLanguage, verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { Shield, User as UserIcon, CheckCircle, XCircle, Plus, Mail, Ban } from 'lucide-react';
import Link from 'next/link';
import UserActions from '@/components/admin/UserActions';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
}

export default async function AdminPage() {
    const session = await verifySession();

    // Double check role in database for security
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
        redirect('/');
    }

    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{dict.admin.title}</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {dict.admin.users}: {users.length}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        <Plus className="h-4 w-4" />
                        {dict.admin.createUser}
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">{dict.admin.name}</th>
                                <th className="px-6 py-3 font-medium">{dict.admin.email}</th>
                                <th className="px-6 py-3 font-medium">{dict.admin.role}</th>
                                <th className="px-6 py-3 font-medium">{dict.admin.status}</th>
                                <th className="px-6 py-3 font-medium">{dict.admin.joined}</th>
                                <th className="px-6 py-3 font-medium text-right">{dict.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        {dict.admin.noUsers}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: User) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                    <UserIcon className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-slate-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.isActive
                                                    ? <CheckCircle className="h-3 w-3" />
                                                    : <XCircle className="h-3 w-3" />
                                                }
                                                {user.isActive ? dict.admin.active : dict.admin.inactive}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.id !== session.userId && (
                                                <UserActions user={user} dict={dict} />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
