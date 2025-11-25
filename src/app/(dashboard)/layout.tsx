import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar dict={dict} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </div>
        </div>
    );
}
