import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { NewStoryForm } from '@/components/stories/NewStoryForm';
import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

export default async function NewStoryPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ featureId?: string }>
}) {
    const { id } = await params;
    const { featureId } = await searchParams;
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    const project = await prisma.project.findUnique({
        where: { id },
        include: { features: true },
    });

    if (!project) {
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
                    <h1 className="text-2xl font-bold text-slate-900">{dict.forms.newStoryTitle}</h1>
                    <p className="text-sm text-slate-500">{dict.forms.newStorySubtitle} {project.name}</p>
                </div>
            </div>

            <NewStoryForm projectId={id} features={project.features} dict={dict} initialFeatureId={featureId} />
        </div>
    );
}
