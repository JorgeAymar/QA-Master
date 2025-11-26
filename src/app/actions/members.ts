'use server';

import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function addMember(projectId: string, email: string, role: 'READ' | 'FULL') {
    const session = await verifySession();
    if (!session) return { error: 'Unauthorized' };

    if (role !== 'READ' && role !== 'FULL') {
        return { error: 'Invalid role' };
    }

    // Verify current user has FULL access or is ADMIN
    const currentMember = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: session.userId
            }
        }
    });

    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    // Allow if admin or if member with FULL access
    // Note: We need to handle the case where the project creator isn't explicitly in members table yet
    // For now, let's assume admins can add members, and existing FULL members can add members.
    // Ideally, the project creator should be added as a member upon creation.

    // For simplicity in this iteration: Admins can do anything. 
    // If we want project owners to manage, we need to check ownership or FULL membership.

    const isAuthorized = currentUser?.role === 'ADMIN' || currentMember?.role === 'FULL';

    if (!isAuthorized) {
        // Fallback: Check if user is the implicit owner (if we tracked that, but currently Project doesn't have ownerId)
        // Since we don't have ownerId on Project, we rely on Admin or existing members.
        // If the user is an Admin, they can add.
        if (currentUser?.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
    }

    const userToAdd = await prisma.user.findUnique({
        where: { email }
    });

    if (!userToAdd) {
        return { error: 'User not found' };
    }

    try {
        await prisma.projectMember.create({
            data: {
                projectId,
                userId: userToAdd.id,
                role
            }
        });
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to add member:', error);
        return { error: 'Failed to add member. User might already be a member.' };
    }
}

export async function removeMember(projectId: string, userId: string) {
    const session = await verifySession();

    // Authorization check (similar to addMember)
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    const currentMember = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: session.userId
            }
        }
    });

    const isAuthorized = currentUser?.role === 'ADMIN' || currentMember?.role === 'FULL';

    if (!isAuthorized) {
        throw new Error('Unauthorized');
    }

    await prisma.projectMember.delete({
        where: {
            projectId_userId: {
                projectId,
                userId
            }
        }
    });

    revalidatePath(`/projects/${projectId}`);
}

export async function updateMemberRole(projectId: string, userId: string, role: 'READ' | 'FULL') {
    const session = await verifySession();

    // Authorization check
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    const currentMember = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId,
                userId: session.userId
            }
        }
    });

    const isAuthorized = currentUser?.role === 'ADMIN' || currentMember?.role === 'FULL';

    if (!isAuthorized) {
        throw new Error('Unauthorized');
    }

    await prisma.projectMember.update({
        where: {
            projectId_userId: {
                projectId,
                userId
            }
        },
        data: { role }
    });

    revalidatePath(`/projects/${projectId}`);
}
