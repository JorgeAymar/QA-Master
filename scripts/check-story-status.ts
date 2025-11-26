
import { prisma } from '../src/lib/prisma';

async function main() {
    const stories = await prisma.userStory.findMany({
        include: {
            testResults: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    console.log(JSON.stringify(stories, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
