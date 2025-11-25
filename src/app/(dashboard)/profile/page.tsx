import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await getSession();

    if (!session?.userId) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
    });

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-500">Full Name</label>
                        <p className="mt-1 text-lg font-medium text-slate-900">{user.name}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500">Email Address</label>
                        <p className="mt-1 text-lg font-medium text-slate-900">{user.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500">Member Since</label>
                        <p className="mt-1 text-lg font-medium text-slate-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
