const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting backfill of creator/updater data...');

    const projects = await prisma.project.findMany({
        include: {
            members: {
                where: { role: 'OWNER' },
                take: 1
            }
        }
    });

    const fallbackUser = await prisma.user.findFirst();
    if (!fallbackUser) {
        console.error('No users found in database. Cannot backfill.');
        return;
    }
    console.log(`Using fallback user: ${fallbackUser.name} (${fallbackUser.id})`);

    for (const project of projects) {
        let ownerId = null;

        // Try to find the owner
        if (project.members.length > 0) {
            ownerId = project.members[0].userId;
        } else {
            // If no owner, find any member
            const anyMember = await prisma.projectMember.findFirst({
                where: { projectId: project.id }
            });
            if (anyMember) {
                ownerId = anyMember.userId;
            }
        }

        if (!ownerId) {
            console.log(`Project ${project.name} (${project.id}) has no members. Using fallback user.`);
            ownerId = fallbackUser.id;
        }

        console.log(`Updating project ${project.name} (${project.id}) with user ${ownerId}...`);

        // Update Project
        await prisma.project.update({
            where: { id: project.id },
            data: {
                createdById: project.createdById || ownerId,
                updatedById: project.updatedById || ownerId
            }
        });

        // Update Features
        const featuresResult = await prisma.feature.updateMany({
            where: {
                projectId: project.id,
                createdById: null
            },
            data: {
                createdById: ownerId,
                updatedById: ownerId
            }
        });
        console.log(`  Updated ${featuresResult.count} features.`);

        // Update User Stories
        const storiesResult = await prisma.userStory.updateMany({
            where: {
                projectId: project.id,
                createdById: null
            },
            data: {
                createdById: ownerId,
                updatedById: ownerId
            }
        });
        console.log(`  Updated ${storiesResult.count} user stories.`);
    }

    console.log('Backfill completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
