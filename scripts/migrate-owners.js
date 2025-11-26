const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration to set project owners...');

    const projects = await prisma.project.findMany({
        include: {
            members: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    for (const project of projects) {
        if (project.members.length > 0) {
            const owner = project.members[0];
            console.log(`Setting owner for project ${project.name} (${project.id}) to user ${owner.userId}`);

            await prisma.projectMember.update({
                where: {
                    id: owner.id
                },
                data: {
                    role: 'OWNER'
                }
            });
        } else {
            console.log(`Project ${project.name} has no members.`);
        }
    }

    console.log('Migration completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
