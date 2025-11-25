'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { logActivity } from '@/lib/activity';

export async function getProjects() {
    return await prisma.project.findMany({
        orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' }
        ],
        include: {
            _count: {
                select: { stories: true, testRuns: true }
            }
        }
    });
}

export async function reorderProjects(items: { id: string; order: number }[]) {
    try {
        await prisma.$transaction(
            items.map((item) =>
                prisma.project.update({
                    where: { id: item.id },
                    data: { order: item.order },
                })
            )
        );
        revalidatePath('/projects');
    } catch (error) {
        console.error('Failed to reorder projects:', error);
        throw new Error('Failed to reorder projects');
    }
}

export async function createProject(formData: FormData) {
    const name = formData.get('name') as string;
    const baseUrl = formData.get('baseUrl') as string;
    const description = formData.get('description') as string;
    const githubRepo = formData.get('githubRepo') as string;

    if (!name || !baseUrl) {
        throw new Error('Name and Base URL are required');
    }

    const project = await prisma.project.create({
        data: {
            name,
            baseUrl,
            description,
            githubRepo: githubRepo || null,
        },
    });

    await logActivity(project.id, 'CREATE', 'PROJECT', project.name);

    revalidatePath('/projects');
    redirect('/projects');
}

export async function updateProject(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const baseUrl = formData.get('baseUrl') as string;
    const description = formData.get('description') as string;
    const githubRepo = formData.get('githubRepo') as string;

    if (!name || !baseUrl) {
        throw new Error('Name and Base URL are required');
    }

    const project = await prisma.project.update({
        where: { id },
        data: {
            name,
            baseUrl,
            description,
            githubRepo: githubRepo || null,
        },
    });

    await logActivity(project.id, 'UPDATE', 'PROJECT', project.name);

    revalidatePath(`/projects/${id}`);
    revalidatePath('/projects');
    redirect(`/projects/${id}`);
}
