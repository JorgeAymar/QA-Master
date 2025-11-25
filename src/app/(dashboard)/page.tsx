import { prisma } from '@/lib/prisma';
import { Plus, ArrowRight, CheckCircle, Clock, FolderKanban, LayoutDashboard, PlayCircle } from 'lucide-react';

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

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Projects</p>
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
              <p className="text-sm font-medium text-slate-500">Total Stories</p>
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
              <p className="text-sm font-medium text-slate-500">Completed Stories</p>
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
              <p className="text-sm font-medium text-slate-500">Total Test Runs</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalRuns}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3 text-orange-600">
              <PlayCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-slate-500">Activity log coming soon...</p>
        </div>
      </div>
    </div>
  );
}
