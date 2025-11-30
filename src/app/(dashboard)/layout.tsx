import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getUserLanguage, verifySession } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';
import { prisma } from '@/lib/prisma';
import { TestExecutionProvider } from '@/context/TestExecutionContext';
import { AnalysisStatusBar } from '@/components/ui/AnalysisStatusBar';
import { ThemeProvider } from '@/context/ThemeContext';

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
        select: {
            role: true,
            name: true,
            email: true,
            theme: true
        }
    });

    return (
        <ThemeProvider initialTheme={(user?.theme as 'light' | 'dark') || 'light'}>
            <TestExecutionProvider>
                <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
                    <Sidebar dict={dict} user={user} />
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <Header dict={dict} />
                        <main className="flex-1 overflow-y-auto p-8">{children}</main>
                    </div>
                    <AnalysisStatusBar />
                </div>
            </TestExecutionProvider>
        </ThemeProvider>
    );
}
