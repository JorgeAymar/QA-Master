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
                },
                createdBy: { select: { name: true } },
                updatedBy: { select: { name: true } }
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
            },
            createdBy: { select: { name: true } },
            updatedBy: { select: { name: true } }
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

export async function duplicateProject(projectId: string) {
    const session = await verifySession();

    const originalProject = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            features: true,
            stories: true,
        }
    });

    if (!originalProject) {
        throw new Error('Project not found');
    }

    // Create new project
    const newProject = await prisma.project.create({
        data: {
            name: `Copy of ${originalProject.name}`,
            description: originalProject.description,
            baseUrl: originalProject.baseUrl,
            githubRepo: originalProject.githubRepo,
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

    // Map old feature IDs to new feature IDs
    const featureMap = new Map<string, string>();

    // Duplicate features
    for (const feature of originalProject.features) {
        const newFeature = await prisma.feature.create({
            data: {
                name: feature.name,
                projectId: newProject.id,
                order: feature.order,
                createdById: session.userId,
                updatedById: session.userId,
            }
        });
        featureMap.set(feature.id, newFeature.id);
    }

    // Duplicate stories
    for (const story of originalProject.stories) {
        await prisma.userStory.create({
            data: {
                projectId: newProject.id,
                title: story.title,
                acceptanceCriteria: story.acceptanceCriteria,
                status: 'PENDING', // Reset status
                order: story.order,
                documentUrl: story.documentUrl,
                featureId: story.featureId ? featureMap.get(story.featureId) : null,
                createdById: session.userId,
                updatedById: session.userId,
            }
        });
    }

    await logActivity(newProject.id, 'CREATE', 'PROJECT', newProject.name);
    revalidatePath('/projects');
}

export async function addProjectMember(projectId: string, email: string, role: 'READ' | 'FULL' = 'READ') {
    const session = await verifySession();

    // Check permissions (only OWNER or ADMIN can add members)
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: session.userId
                }
            }
        });

        if (membership?.role !== 'OWNER') {
            throw new Error('Unauthorized');
        }
    }

    const userToAdd = await prisma.user.findUnique({
        where: { email }
    });

    if (!userToAdd) {
        throw new Error('User not found');
    }

    try {
        await prisma.projectMember.create({
            data: {
                projectId,
                userId: userToAdd.id,
                role
            }
        });
    } catch (error) {
        // Ignore if already exists (or handle more gracefully)
        console.error('Error adding member:', error);
        throw new Error('User is already a member or could not be added');
    }

    revalidatePath('/projects');
}

export async function getProjectMembers(projectId: string) {
    const session = await verifySession();

    // Check if user is a member of the project
    const membership = await prisma.projectMember.findUnique({
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

    if (!membership && currentUser?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    return await prisma.projectMember.findMany({
        where: { projectId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
}

export async function removeProjectMember(projectId: string, memberId: string) {
    const session = await verifySession();
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    // Check if user is owner/admin
    if (currentUser?.role !== 'ADMIN') {
        const membership = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: session.userId
                }
            }
        });

        if (membership?.role !== 'OWNER') {
            throw new Error('Unauthorized');
        }
    }

    // Get the member to be removed
    const memberToRemove = await prisma.projectMember.findUnique({
        where: { id: memberId },
        select: { role: true }
    });

    // Prevent removing the owner
    if (memberToRemove?.role === 'OWNER') {
        throw new Error('Cannot remove the project owner');
    }

    await prisma.projectMember.delete({
        where: { id: memberId }
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
    const session = await verifySession();
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true }
    });

    if (!project) {
        throw new Error('Project not found');
    }

    // Only OWNER or ADMIN can delete
    const isOwner = project.members.some(m => m.userId === session.userId && m.role === 'OWNER');
    const isAdmin = currentUser?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
        throw new Error('Unauthorized');
    }

    await prisma.project.delete({
        where: { id: projectId }
    });

    await logActivity(projectId, 'DELETE', 'PROJECT', project.name);
    revalidatePath('/projects');
}
