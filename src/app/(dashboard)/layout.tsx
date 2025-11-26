import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getUserLanguage, verifySession } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);
    const { role } = await verifySession();

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar dict={dict} role={role} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header dict={dict} />
                <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </div>
        </div>
    );
}
