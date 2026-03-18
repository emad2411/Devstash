import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding system ItemTypes...')

  const systemTypes = [
    { name: 'snippet', icon: 'Code', color: '#3b82f6', isSystem: true },
    { name: 'prompt', icon: 'Sparkles', color: '#8b5cf6', isSystem: true },
    { name: 'command', icon: 'Terminal', color: '#f97316', isSystem: true },
    { name: 'note', icon: 'StickyNote', color: '#fde047', isSystem: true },
    { name: 'file', icon: 'File', color: '#6b7280', isSystem: true },
    { name: 'image', icon: 'Image', color: '#ec4899', isSystem: true },
    { name: 'link', icon: 'Link', color: '#10b981', isSystem: true },
  ]

  for (const type of systemTypes) {
    // Check if system type already exists
    const existing = await prisma.itemType.findFirst({
      where: {
        name: type.name,
        isSystem: true,
      },
    })

    if (!existing) {
      await prisma.itemType.create({
        data: {
          name: type.name,
          icon: type.icon,
          color: type.color,
          isSystem: true,
          userId: null,
        },
      })
      console.log(`Created: ${type.name}`)
    } else {
      console.log(`Skipped (exists): ${type.name}`)
    }
  }

  console.log('System ItemTypes seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
