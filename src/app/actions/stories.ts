'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logActivity } from '@/lib/activity';

// ...

import { verifySession } from '@/lib/session';

async function checkPermission(projectId: string, requiredRole: 'READ' | 'FULL' = 'FULL') {
    const session = await verifySession();
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role === 'ADMIN') return true;

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

export async function getProjectStories(projectId: string) {
    // READ access is enough
    if (!await checkPermission(projectId, 'READ')) {
        // throw new Error('Unauthorized'); 
        // Or return empty? Better to throw or handle in UI.
        // For now, let's assume the page handles 404/redirect if project not found/authorized
        // But here we just return empty array or throw.
        return [];
    }

    return await prisma.userStory.findMany({
        where: { projectId },
        include: {
            testResults: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: {
                    testRun: {
                        include: {
                            user: { select: { name: true } }
                        }
                    }
                }
            },
            feature: true,
            createdBy: { select: { name: true } },
            updatedBy: { select: { name: true } }
        },
        orderBy: {
            order: 'asc'
        }
    });
}

export async function createStory(projectId: string, formData: FormData) {
    if (!await checkPermission(projectId, 'FULL')) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title') as string;
    const acceptanceCriteria = formData.get('acceptanceCriteria') as string;
    const featureId = formData.get('featureId') as string;

    const session = await verifySession(); // Added to get session.userId



    if (!title || !acceptanceCriteria) {
        return;
    }

    // Fetch the last story to determine the order
    const lastStory = await prisma.userStory.findFirst({
        where: { projectId, featureId: featureId || null },
        orderBy: { order: 'desc' },
        select: { order: true },
    });

    await prisma.userStory.create({
        data: {
            title,
            acceptanceCriteria,
            projectId,
            featureId: featureId || null,
            status: 'PENDING',
            documentUrl: (formData.get('documentUrl') as string) || null,
            order: lastStory ? lastStory.order + 1 : 0, // Added order
            createdById: session.userId, // Added createdById
            updatedById: session.userId, // Added updatedById
        },
    });

    await logActivity(projectId, 'CREATE', 'STORY', title);

    revalidatePath(`/projects/${projectId}`);
    redirect(`/projects/${projectId}`);
}

export async function deleteStory(id: string, projectId: string) {
    if (!await checkPermission(projectId, 'FULL')) {
        throw new Error('Unauthorized');
    }

    try {
        const story = await prisma.userStory.findUnique({ where: { id } });
        if (story) {
            await prisma.userStory.delete({
                where: { id },
            });
            await logActivity(projectId, 'DELETE', 'STORY', story.title);
        }
    } catch (error: any) {
        // Ignore if record not found (P2025)
        if (error.code !== 'P2025') {
            throw error;
        }
    }

    revalidatePath(`/projects/${projectId}`);
}

export async function moveStory(storyId: string, newFeatureId: string | null, projectId: string) {
    if (!await checkPermission(projectId, 'FULL')) {
        throw new Error('Unauthorized');
    }

    await prisma.userStory.update({
        where: { id: storyId },
        data: { featureId: newFeatureId },
    });

    revalidatePath(`/projects/${projectId}`);
}

export async function reorderStories(items: { id: string; order: number }[], projectId: string) {
    if (!await checkPermission(projectId, 'FULL')) {
        throw new Error('Unauthorized');
    }

    const transaction = items.map((item) =>
        prisma.userStory.update({
            where: { id: item.id },
            data: { order: item.order },
        })
    );

    await prisma.$transaction(transaction);
    revalidatePath(`/projects/${projectId}`);
}

export async function updateStory(storyId: string, projectId: string, formData: FormData) {
    if (!await checkPermission(projectId, 'FULL')) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title') as string;
    const acceptanceCriteria = formData.get('acceptanceCriteria') as string;
    const featureId = formData.get('featureId') as string;

    if (!title || !acceptanceCriteria) {
        return;
    }

    const session = await verifySession();

    await prisma.userStory.update({
        where: { id: storyId },
        data: {
            title,
            acceptanceCriteria,
            featureId: featureId || null,
            documentUrl: (formData.get('documentUrl') as string) || null,
            updatedById: session.userId,
            updatedAt: new Date(),
        },
    });

    await logActivity(projectId, 'UPDATE', 'STORY', title);

    revalidatePath(`/projects/${projectId}`);
}
