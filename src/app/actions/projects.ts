'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { logActivity } from '@/lib/activity';

import { verifySession } from '@/lib/session';

async function checkPermission(projectId: string | null, requiredRole: 'READ' | 'FULL' = 'FULL') {
    const session = await verifySession();
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role === 'ADMIN') return true;

    if (!projectId) {
        // Creating a project requires ADMIN (or we could allow any user to create projects)
        // For now, let's restrict project creation to ADMINs as per original logic implies (though not explicitly enforced before)
        // Actually, original logic didn't enforce admin for creation, just for /admin routes.
        // Let's allow any user to create a project? Or stick to Admin?
        // The prompt implies sharing projects, so users should probably be able to create them.
        // But the previous code didn't check anything for createProject other than session.
        return true;
    }

    const member = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: session.userId
            }
        }
    });

    if (!member) return false;

    if (requiredRole === 'FULL' && member.role !== 'FULL') return false;

    return true;
}

export async function getProjects() {
    const session = await verifySession();
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role === 'ADMIN') {
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

    // Return projects where user is a member
    return await prisma.project.findMany({
        where: {
            members: {
                some: {
                    userId: session.userId
                }
            }
        },
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
    // Only admins can reorder all projects? Or maybe just disable for now for non-admins
    const session = await verifySession();
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

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
    const session = await verifySession(); // Ensure logged in

    const name = formData.get('name') as string;
    const baseUrl = formData.get('baseUrl') as string;
    const description = formData.get('description') as string;
    const githubRepo = formData.get('githubRepo') as string;

    const data = {
        name: formData.get('name') as string,
        baseUrl: formData.get('baseUrl') as string,
        description: formData.get('description') as string,
        githubRepo: formData.get('githubRepo') as string,
    };

    if (!data.name || !data.baseUrl) {
        throw new Error('Name and Base URL are required');
    }

    const project = await prisma.project.create({
        data: {
            name: data.name,
            description: data.description,
            baseUrl: data.baseUrl,
            githubRepo: data.githubRepo || null,
            createdById: session.userId,
            updatedById: session.userId,
            members: {
                create: {
                    userId: session.userId,
                    role: 'OWNER'
                }
            }
        }
    });

    await logActivity(project.id, 'CREATE', 'PROJECT', project.name);

    revalidatePath('/projects');
    redirect('/projects');
}

export async function updateProject(id: string, formData: FormData) {
    if (!await checkPermission(id, 'FULL')) {
        throw new Error('Unauthorized');
    }

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
