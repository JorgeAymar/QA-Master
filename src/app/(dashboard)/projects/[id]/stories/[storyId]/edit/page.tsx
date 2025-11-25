import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { EditStoryForm } from '@/components/stories/EditStoryForm';
import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

export default async function EditStoryPage({ params }: { params: Promise<{ id: string; storyId: string }> }) {
    const { id, storyId } = await params;
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    const project = await prisma.project.findUnique({
        where: { id },
        include: { features: true },
    });

    const story = await prisma.userStory.findUnique({
        where: { id: storyId },
    });

    if (!project || !story) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/projects/${id}`}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{dict.forms.editStoryTitle}</h1>
                    <p className="text-sm text-slate-500">{dict.forms.editStorySubtitle} {project.name}</p>
                </div>
            </div>

            <EditStoryForm projectId={id} story={story} features={project.features} dict={dict} />
        </div>
    );
}
