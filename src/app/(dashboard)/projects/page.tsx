import Link from 'next/link';
import { getProjects } from '@/app/actions/projects';
import { Plus, Globe, FileText, PlayCircle, Github } from 'lucide-react';
import { ProjectGithubLink } from '@/components/projects/ProjectGithubLink';
import { DraggableProjectList } from '@/components/projects/DraggableProjectList';
import { getUserLanguage, verifySession } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

// Force dynamic rendering - this page needs database access
export const dynamic = 'force-dynamic';

interface ProjectWithCounts {
    id: string;
    name: string;
    description: string | null;
    baseUrl: string;
    githubRepo: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        stories: number;
        testRuns: number;
    };
    createdById: string | null;
    createdBy?: { name: string | null } | null;
    updatedBy?: { name: string | null } | null;
}

export default async function ProjectsPage() {
    const projects = await getProjects() as unknown as ProjectWithCounts[];
    console.log('Projects data:', JSON.stringify(projects, null, 2));
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);
    const session = await verifySession();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{dict.dashboard.projectsTitle}</h1>
                <Link
                    href="/projects/new"
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    {dict.dashboard.newProject}
                </Link>
            </div>

            <DraggableProjectList projects={projects} dict={dict} currentUserId={session.userId} />
        </div>
    );
}
