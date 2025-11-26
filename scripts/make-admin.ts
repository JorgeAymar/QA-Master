const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Connecting to database...')
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log('No user found in the database.')
        return
    }
    console.log(`Found user: ${user.email}`)

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN', isActive: true },
    })
    console.log(`User ${updated.email} updated successfully!`)
    console.log(`Role: ${updated.role}`)
    console.log(`Active: ${updated.isActive}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
