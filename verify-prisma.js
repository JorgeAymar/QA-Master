const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const feature = await prisma.feature.findFirst();
        console.log('Feature found:', feature);
        if (feature && 'order' in feature) {
            console.log('Order field exists:', feature.order);
        } else {
            console.log('Order field MISSING in runtime object');
        }

        // Test update with order
        if (feature) {
            await prisma.feature.update({
                where: { id: feature.id },
                data: { order: feature.order || 0 }
            });
            console.log('Update with order successful');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
