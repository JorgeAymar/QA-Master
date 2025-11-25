import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { prisma } from '@/lib/prisma';
import { CheckCircle, FolderKanban, LayoutDashboard, PlayCircle } from 'lucide-react';
import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

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
      <h1 className="text-2xl font-bold text-slate-900">{dict.dashboard.overview}</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* ... (existing stats cards) ... */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{dict.dashboard.totalProjects}</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalProjects}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <FolderKanban className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{dict.dashboard.totalStories}</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalStories}</p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
              <LayoutDashboard className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{dict.dashboard.completedStories}</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completedStories}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{dict.dashboard.totalRuns}</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalRuns}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3 text-orange-600">
              <PlayCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">{dict.dashboard.recentActivity}</h2>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
