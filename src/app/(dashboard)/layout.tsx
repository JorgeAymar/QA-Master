import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getUserLanguage, verifySession } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';
import { prisma } from '@/lib/prisma';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);
    const session = await verifySession();

    // Fetch fresh role from database to handle role updates immediately
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar dict={dict} role={user?.role} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header dict={dict} />
                <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </div>
        </div>
    );
}
