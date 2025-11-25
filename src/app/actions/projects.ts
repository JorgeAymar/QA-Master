'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getProjects() {
    return await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { stories: true, testRuns: true }
            }
        }
    });
}

export async function createProject(formData: FormData) {
    const name = formData.get('name') as string;
    const baseUrl = formData.get('baseUrl') as string;
    const description = formData.get('description') as string;

    if (!name || !baseUrl) {
        throw new Error('Name and Base URL are required');
    }

    await prisma.project.create({
        data: {
            name,
            baseUrl,
            description,
        },
    });

    revalidatePath('/projects');
    redirect('/projects');
}

export async function updateProject(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const baseUrl = formData.get('baseUrl') as string;
    const description = formData.get('description') as string;

    if (!name || !baseUrl) {
        throw new Error('Name and Base URL are required');
    }

    await prisma.project.update({
        where: { id },
        data: {
            name,
            baseUrl,
            description,
        },
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath('/projects');
    redirect(`/projects/${id}`);
}
