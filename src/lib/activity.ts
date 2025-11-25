import { prisma } from '@/lib/prisma';

export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'VIEW_REPORT';
export type EntityType = 'STORY' | 'FEATURE' | 'PROJECT';

export async function logActivity(
    projectId: string,
    action: ActivityAction,
    entityType: EntityType,
    entityName: string,
    userId?: string
) {
    try {
        await prisma.activityLog.create({
            data: {
                projectId,
                action,
                entityType,
                entityName,
                userId,
            },
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw error to avoid blocking the main action
    }
}

export async function getRecentActivities(projectId: string, limit = 20) {
    return await prisma.activityLog.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}
