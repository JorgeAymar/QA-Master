import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditProjectForm } from '@/components/projects/EditProjectForm';
import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    const project = await prisma.project.findUnique({
        where: { id },
    });

    if (!project) {
        notFound();
    }

    return <EditProjectForm project={project} dict={dict} />;
}
