import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { prisma } from '@/lib/prisma';
import { CheckCircle, FolderKanban, LayoutDashboard, PlayCircle } from 'lucide-react';
import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

// Force dynamic rendering - this page needs database access
export const dynamic = 'force-dynamic';

// ...

async function getStats() {
  const totalProjects = await prisma.project.count();
  const totalStories = await prisma.userStory.count();
  const completedStories = await prisma.userStory.count({ where: { status: 'COMPLETED' } });
  const totalRuns = await prisma.testRun.count();

  return {
    totalProjects,
    totalStories,
    completedStories,
    totalRuns,
  };
}

async function getRecentActivities() {
  return await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
}

export default async function DashboardPage() {
  const stats = await getStats();
  const activities = await getRecentActivities();
  const lang = await getUserLanguage();
  const dict = getDictionary(lang);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{dict.dashboard.overview}</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* ... (existing stats cards) ... */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{dict.dashboard.totalProjects}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalProjects}</p>
            </div>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-400">
              <FolderKanban className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{dict.dashboard.totalStories}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalStories}</p>
            </div>
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3 text-indigo-600 dark:text-indigo-400">
              <LayoutDashboard className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{dict.dashboard.completedStories}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.completedStories}</p>
            </div>
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 text-green-600 dark:text-green-400">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{dict.dashboard.totalRuns}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalRuns}</p>
            </div>
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3 text-orange-600 dark:text-orange-400">
              <PlayCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 dark:backdrop-blur-sm p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{dict.dashboard.recentActivity}</h2>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
