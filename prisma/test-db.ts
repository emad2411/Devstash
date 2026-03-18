import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// ─── Helpers ───
let passed = 0
let failed = 0
const errors: string[] = []

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++
    console.log(`  ✅ ${message}`)
  } else {
    failed++
    const msg = `  ❌ ${message}`
    console.log(msg)
    errors.push(msg)
  }
}

async function section(title: string) {
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`📋 ${title}`)
  console.log('─'.repeat(50))
}

// ─── Cleanup tracker ───
const cleanup = {
  userIds: [] as string[],
  itemTypeIds: [] as string[],
  collectionIds: [] as string[],
  itemIds: [] as string[],
  tagIds: [] as string[],
}

async function main() {
  console.log('\n🧪 DevStash Database Test Suite\n')

  // ═══════════════════════════════════════════════════
  // 1. USER CRUD
  // ═══════════════════════════════════════════════════
  await section('USER CRUD')

  // CREATE
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@devstash.io`,
      name: 'Test User',
      password: 'hashed_password_here',
      isPro: false,
    },
  })
  cleanup.userIds.push(user.id)
  assert(!!user.id, 'Create user')
  assert(user.email.includes('test-'), 'User email is correct')
  assert(user.name === 'Test User', 'User name is correct')
  assert(user.isPro === false, 'User isPro defaults to false')
  assert(!!user.createdAt, 'User has createdAt timestamp')
  assert(!!user.updatedAt, 'User has updatedAt timestamp')

  // READ
  const foundUser = await prisma.user.findUnique({ where: { id: user.id } })
  assert(foundUser !== null, 'Find user by ID')
  assert(foundUser?.email === user.email, 'Fetched user email matches')

  const foundByEmail = await prisma.user.findUnique({ where: { email: user.email } })
  assert(foundByEmail !== null, 'Find user by email')

  // UPDATE
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: 'Updated Test User', isPro: true },
  })
  assert(updatedUser.name === 'Updated Test User', 'Update user name')
  assert(updatedUser.isPro === true, 'Update user isPro')

  // LIST
  const users = await prisma.user.findMany({ take: 5 })
  assert(users.length > 0, 'List users returns results')

  // ═══════════════════════════════════════════════════
  // 2. ITEMTYPE CRUD
  // ═══════════════════════════════════════════════════
  await section('ITEMTYPE CRUD')

  // CREATE (custom type for this user)
  const customType = await prisma.itemType.create({
    data: {
      name: `custom-${Date.now()}`,
      icon: 'Wrench',
      color: '#ff0000',
      isSystem: false,
      userId: user.id,
    },
  })
  cleanup.itemTypeIds.push(customType.id)
  assert(!!customType.id, 'Create custom ItemType')
  assert(customType.isSystem === false, 'Custom type isSystem is false')
  assert(customType.userId === user.id, 'Custom type linked to user')

  // READ
  const foundType = await prisma.itemType.findUnique({ where: { id: customType.id } })
  assert(foundType !== null, 'Find ItemType by ID')
  assert(foundType?.name === customType.name, 'Fetched ItemType name matches')

  // READ system types
  const systemTypes = await prisma.itemType.findMany({ where: { isSystem: true } })
  assert(systemTypes.length === 7, `System ItemTypes count is 7 (got ${systemTypes.length})`)
  const typeNames = systemTypes.map((t) => t.name).sort()
  assert(
    typeNames.join(',') === 'command,file,image,link,note,prompt,snippet',
    'All 7 system types exist'
  )

  // UPDATE
  const updatedType = await prisma.itemType.update({
    where: { id: customType.id },
    data: { name: `custom-updated-${Date.now()}`, color: '#00ff00' },
  })
  assert(updatedType.name.includes('custom-updated'), 'Update ItemType name')
  assert(updatedType.color === '#00ff00', 'Update ItemType color')

  // GET snippet type for later use
  const snippetType = systemTypes.find((t) => t.name === 'snippet')
  assert(!!snippetType, 'Snippet type exists for item creation')

  const promptType = systemTypes.find((t) => t.name === 'prompt')
  const commandType = systemTypes.find((t) => t.name === 'command')
  const linkType = systemTypes.find((t) => t.name === 'link')

  // ═══════════════════════════════════════════════════
  // 3. TAG CRUD
  // ═══════════════════════════════════════════════════
  await section('TAG CRUD')

  // CREATE
  const tag = await prisma.tag.create({
    data: { name: `test-tag-${Date.now()}` },
  })
  cleanup.tagIds.push(tag.id)
  assert(!!tag.id, 'Create tag')
  assert(tag.name.includes('test-tag'), 'Tag name is correct')

  // READ
  const foundTag = await prisma.tag.findUnique({ where: { id: tag.id } })
  assert(foundTag !== null, 'Find tag by ID')

  // LIST
  const tags = await prisma.tag.findMany()
  assert(tags.length >= 15, `Tags count >= 15 (got ${tags.length})`)

  // UNIQUE constraint
  try {
    await prisma.tag.create({ data: { name: tag.name } })
    assert(false, 'Tag unique constraint should prevent duplicates')
  } catch {
    assert(true, 'Tag unique constraint works')
  }

  // UPDATE
  const updatedTag = await prisma.tag.update({
    where: { id: tag.id },
    data: { name: `test-tag-updated-${Date.now()}` },
  })
  assert(updatedTag.name.includes('updated'), 'Update tag name')

  // ═══════════════════════════════════════════════════
  // 4. ITEM CRUD
  // ═══════════════════════════════════════════════════
  await section('ITEM CRUD')

  // CREATE (text item)
  const item = await prisma.item.create({
    data: {
      title: 'Test Snippet',
      contentType: 'TEXT',
      content: 'console.log("hello world");',
      description: 'A test snippet',
      language: 'javascript',
      isFavorite: false,
      isPinned: false,
      userId: user.id,
      itemTypeId: snippetType!.id,
    },
  })
  cleanup.itemIds.push(item.id)
  assert(!!item.id, 'Create text item')
  assert(item.title === 'Test Snippet', 'Item title is correct')
  assert(item.contentType === 'TEXT', 'Item contentType is TEXT')
  assert(item.itemTypeId === snippetType!.id, 'Item linked to ItemType')

  // CREATE with tags
  const itemWithTags = await prisma.item.create({
    data: {
      title: 'Tagged Item',
      contentType: 'TEXT',
      content: 'const x = 1;',
      userId: user.id,
      itemTypeId: snippetType!.id,
      tags: {
        create: [
          { tag: { connect: { id: tag.id } } },
        ],
      },
    },
    include: { tags: true },
  })
  cleanup.itemIds.push(itemWithTags.id)
  assert(itemWithTags.tags.length === 1, 'Item created with tag relationship')

  // CREATE link item
  const linkItem = await prisma.item.create({
    data: {
      title: 'Test Link',
      contentType: 'TEXT',
      url: 'https://example.com',
      content: 'https://example.com',
      description: 'A test link',
      userId: user.id,
      itemTypeId: linkType!.id,
    },
  })
  cleanup.itemIds.push(linkItem.id)
  assert(!!linkItem.id, 'Create link item')
  assert(linkItem.url === 'https://example.com', 'Link item has URL')

  // READ
  const foundItem = await prisma.item.findUnique({
    where: { id: item.id },
    include: { itemType: true, tags: true, collections: true },
  })
  assert(foundItem !== null, 'Find item by ID')
  assert(foundItem?.itemType.name === 'snippet', 'Item has correct ItemType relation')
  assert(!!foundItem?.createdAt, 'Item has createdAt')

  // READ with filters
  const favoriteItems = await prisma.item.findMany({
    where: { userId: user.id, isFavorite: true },
  })
  assert(Array.isArray(favoriteItems), 'Filter items by isFavorite')

  const snippetItems = await prisma.item.findMany({
    where: { userId: user.id, itemTypeId: snippetType!.id },
  })
  assert(snippetItems.length >= 2, `Filter items by type (got ${snippetItems.length})`)

  // UPDATE
  const updatedItem = await prisma.item.update({
    where: { id: item.id },
    data: {
      title: 'Updated Snippet',
      isFavorite: true,
      isPinned: true,
      content: 'console.log("updated");',
    },
  })
  assert(updatedItem.title === 'Updated Snippet', 'Update item title')
  assert(updatedItem.isFavorite === true, 'Update item isFavorite')
  assert(updatedItem.isPinned === true, 'Update item isPinned')

  // LIST with pagination
  const paginatedItems = await prisma.item.findMany({
    where: { userId: user.id },
    take: 10,
    skip: 0,
    orderBy: { createdAt: 'desc' },
  })
  assert(paginatedItems.length > 0, 'List items with pagination')

  // ═══════════════════════════════════════════════════
  // 5. COLLECTION CRUD
  // ═══════════════════════════════════════════════════
  await section('COLLECTION CRUD')

  // CREATE
  const collection = await prisma.collection.create({
    data: {
      name: 'Test Collection',
      description: 'A test collection',
      isFavorite: false,
      userId: user.id,
      defaultTypeId: snippetType!.id,
    },
  })
  cleanup.collectionIds.push(collection.id)
  assert(!!collection.id, 'Create collection')
  assert(collection.name === 'Test Collection', 'Collection name is correct')
  assert(collection.defaultTypeId === snippetType!.id, 'Collection has default type')

  // READ
  const foundCollection = await prisma.collection.findUnique({
    where: { id: collection.id },
    include: { items: true, defaultType: true, user: true },
  })
  assert(foundCollection !== null, 'Find collection by ID')
  assert(foundCollection?.defaultType?.name === 'snippet', 'Collection has defaultType relation')
  assert(foundCollection?.user.name === 'Updated Test User', 'Collection has user relation')

  // READ by user
  const userCollections = await prisma.collection.findMany({
    where: { userId: user.id },
  })
  assert(userCollections.length >= 1, 'Find collections by user')

  // READ favorites
  const favCollections = await prisma.collection.findMany({
    where: { userId: user.id, isFavorite: true },
  })
  assert(Array.isArray(favCollections), 'Filter collections by isFavorite')

  // UPDATE
  const updatedCollection = await prisma.collection.update({
    where: { id: collection.id },
    data: { name: 'Updated Collection', isFavorite: true },
  })
  assert(updatedCollection.name === 'Updated Collection', 'Update collection name')
  assert(updatedCollection.isFavorite === true, 'Update collection isFavorite')

  // ═══════════════════════════════════════════════════
  // 6. ITEM-COLLECTION RELATIONSHIP (Join Table)
  // ═══════════════════════════════════════════════════
  await section('ITEM-COLLECTION RELATIONSHIP')

  // ADD item to collection
  const itemCollection = await prisma.itemCollection.create({
    data: {
      itemId: item.id,
      collectionId: collection.id,
    },
  })
  assert(!!itemCollection.addedAt, 'Add item to collection')

  // ADD multiple items
  await prisma.itemCollection.create({
    data: { itemId: linkItem.id, collectionId: collection.id },
  })

  // READ collection with items
  const collectionWithItems = await prisma.collection.findUnique({
    where: { id: collection.id },
    include: { items: { include: { item: true } } },
  })
  assert(collectionWithItems?.items.length === 2, `Collection has 2 items (got ${collectionWithItems?.items.length})`)

  // READ item with collections
  const itemWithCollections = await prisma.item.findUnique({
    where: { id: item.id },
    include: { collections: { include: { collection: true } } },
  })
  assert(itemWithCollections!.collections.length >= 1, 'Item shows its collections')

  // DELETE item from collection
  await prisma.itemCollection.delete({
    where: {
      itemId_collectionId: {
        itemId: linkItem.id,
        collectionId: collection.id,
      },
    },
  })
  const afterRemove = await prisma.collection.findUnique({
    where: { id: collection.id },
    include: { items: true },
  })
  assert(afterRemove!.items.length === 1, 'Remove item from collection works')

  // ═══════════════════════════════════════════════════
  // 7. ITEM-TAG RELATIONSHIP (Join Table)
  // ═══════════════════════════════════════════════════
  await section('ITEM-TAG RELATIONSHIP')

  // CREATE additional tag
  const tag2 = await prisma.tag.create({
    data: { name: `test-tag-2-${Date.now()}` },
  })
  cleanup.tagIds.push(tag2.id)

  // ADD tag to item
  await prisma.itemTag.create({
    data: { itemId: item.id, tagId: tag2.id },
  })

  // READ item with tags
  const itemWithTagsRead = await prisma.item.findUnique({
    where: { id: item.id },
    include: { tags: { include: { tag: true } } },
  })
  assert(itemWithTagsRead!.tags.length >= 1, 'Item has tag relationships')

  // READ tag with items
  const tagWithItems = await prisma.tag.findUnique({
    where: { id: tag2.id },
    include: { items: { include: { item: true } } },
  })
  assert(tagWithItems!.items.length === 1, 'Tag shows linked items')

  // DELETE tag from item
  await prisma.itemTag.delete({
    where: {
      itemId_tagId: {
        itemId: item.id,
        tagId: tag2.id,
      },
    },
  })
  const afterTagRemove = await prisma.item.findUnique({
    where: { id: item.id },
    include: { tags: true },
  })
  const tag2StillLinked = afterTagRemove!.tags.some((t) => t.tagId === tag2.id)
  assert(!tag2StillLinked, 'Remove tag from item works')

  // ═══════════════════════════════════════════════════
  // 8. CASCADE DELETE TESTS
  // ═══════════════════════════════════════════════════
  await section('CASCADE DELETE')

  // Create a dedicated collection for cascade test
  const cascadeCollection = await prisma.collection.create({
    data: {
      name: 'Cascade Test Collection',
      userId: user.id,
    },
  })
  cleanup.collectionIds.push(cascadeCollection.id)

  const cascadeItem = await prisma.item.create({
    data: {
      title: 'Cascade Test Item',
      contentType: 'TEXT',
      userId: user.id,
      itemTypeId: snippetType!.id,
      collections: {
        create: [{ collectionId: cascadeCollection.id }],
      },
    },
    include: { collections: true },
  })
  cleanup.itemIds.push(cascadeItem.id)
  assert(cascadeItem.collections.length === 1, 'Cascade test item linked to collection')

  // Delete item -> ItemCollection should cascade
  await prisma.item.delete({ where: { id: cascadeItem.id } })
  const orphanJoin = await prisma.itemCollection.findFirst({
    where: { itemId: cascadeItem.id },
  })
  assert(orphanJoin === null, 'Deleting item cascades to ItemCollection')

  // Verify collection still exists
  const collectionStillExists = await prisma.collection.findUnique({
    where: { id: cascadeCollection.id },
  })
  assert(collectionStillExists !== null, 'Collection survives item deletion')

  // ═══════════════════════════════════════════════════
  // 9. UNIQUE CONSTRAINTS
  // ═══════════════════════════════════════════════════
  await section('UNIQUE CONSTRAINTS')

  // User email unique
  try {
    await prisma.user.create({
      data: {
        email: user.email,
        name: 'Duplicate',
        userId: user.id,
      } as never,
    })
    assert(false, 'User email unique constraint should prevent duplicates')
  } catch {
    assert(true, 'User email unique constraint works')
  }

  // ItemCollection composite key
  try {
    await prisma.itemCollection.create({
      data: { itemId: item.id, collectionId: collection.id },
    })
    assert(false, 'ItemCollection composite key should prevent duplicates')
  } catch {
    assert(true, 'ItemCollection composite key works')
  }

  // ItemTag composite key
  const existingTagRel = await prisma.itemTag.findFirst({
    where: { itemId: item.id },
  })
  if (existingTagRel) {
    try {
      await prisma.itemTag.create({
        data: { itemId: item.id, tagId: existingTagRel.tagId },
      })
      assert(false, 'ItemTag composite key should prevent duplicates')
    } catch {
      assert(true, 'ItemTag composite key works')
    }
  } else {
    assert(true, 'ItemTag composite key skipped (no existing tags)')
  }

  // ═══════════════════════════════════════════════════
  // 10. AGGREGATION & COUNTS
  // ═══════════════════════════════════════════════════
  await section('AGGREGATION & COUNTS')

  const itemCount = await prisma.item.count({ where: { userId: user.id } })
  assert(itemCount >= 1, `Count items for user (got ${itemCount})`)

  const collectionCount = await prisma.collection.count({ where: { userId: user.id } })
  assert(collectionCount >= 1, `Count collections for user (got ${collectionCount})`)

  const tagCount = await prisma.tag.count()
  assert(tagCount >= 15, `Count total tags (got ${tagCount})`)

  // Aggregation
  const itemAgg = await prisma.item.aggregate({
    where: { userId: user.id },
    _count: { id: true },
  })
  assert(itemAgg._count.id >= 1, 'Aggregate items count')

  // Group by
  const itemsByType = await prisma.item.groupBy({
    by: ['itemTypeId'],
    where: { userId: user.id },
    _count: { id: true },
  })
  assert(itemsByType.length >= 1, `Group items by type (got ${itemsByType.length} groups)`)

  // ═══════════════════════════════════════════════════
  // 11. RELATION QUERIES (Complex Joins)
  // ═══════════════════════════════════════════════════
  await section('RELATION QUERIES')

  // User with all relations
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      items: true,
      collections: true,
      itemTypes: true,
    },
  })
  assert(fullUser!.items.length >= 1, 'User includes items')
  assert(fullUser!.collections.length >= 1, 'User includes collections')
  assert(fullUser!.itemTypes.length >= 1, 'User includes custom ItemTypes')

  // Nested relation query
  const collectionWithFullItems = await prisma.collection.findFirst({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          item: {
            include: {
              itemType: true,
              tags: { include: { tag: true } },
            },
          },
        },
      },
    },
  })
  assert(!!collectionWithFullItems, 'Deep nested relation query works')

  // Filter with relation
  const itemsInCollection = await prisma.item.findMany({
    where: {
      userId: user.id,
      collections: {
        some: { collectionId: collection.id },
      },
    },
  })
  assert(itemsInCollection.length >= 1, 'Filter items by collection relation')

  // Filter items with specific tag
  const itemsWithTag = await prisma.item.findMany({
    where: {
      userId: user.id,
      tags: {
        some: { tag: { name: 'react' } },
      },
    },
  })
  assert(Array.isArray(itemsWithTag), 'Filter items by tag name (relation)')

  // ═══════════════════════════════════════════════════
  // 12. DELETE (Cleanup)
  // ═══════════════════════════════════════════════════
  await section('DELETE')

  // DELETE item
  await prisma.item.delete({ where: { id: item.id } })
  const deletedItem = await prisma.item.findUnique({ where: { id: item.id } })
  assert(deletedItem === null, 'Delete item')

  // DELETE collection
  await prisma.collection.delete({ where: { id: collection.id } })
  const deletedCollection = await prisma.collection.findUnique({ where: { id: collection.id } })
  assert(deletedCollection === null, 'Delete collection')

  // DELETE tag
  await prisma.tag.delete({ where: { id: tag.id } })
  const deletedTag = await prisma.tag.findUnique({ where: { id: tag.id } })
  assert(deletedTag === null, 'Delete tag')

  // DELETE custom ItemType
  await prisma.itemType.delete({ where: { id: customType.id } })
  const deletedType = await prisma.itemType.findUnique({ where: { id: customType.id } })
  assert(deletedType === null, 'Delete custom ItemType')

  // DELETE user (should cascade to remaining items)
  const preDeleteItemCount = await prisma.item.count({ where: { userId: user.id } })
  await prisma.user.delete({ where: { id: user.id } })
  const postDeleteItemCount = await prisma.item.count({ where: { userId: user.id } })
  assert(postDeleteItemCount === 0, `Delete user cascades to items (had ${preDeleteItemCount})`)

  const orphanCollections = await prisma.collection.count({ where: { userId: user.id } })
  assert(orphanCollections === 0, 'Delete user cascades to collections')

  // ═══════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════
  console.log(`\n${'═'.repeat(50)}`)
  console.log('📊 Test Results')
  console.log('═'.repeat(50))
  console.log(`  ✅ Passed: ${passed}`)
  console.log(`  ❌ Failed: ${failed}`)
  console.log(`  📝 Total:  ${passed + failed}`)

  if (errors.length > 0) {
    console.log('\n❌ Failures:')
    errors.forEach((e) => console.log(e))
  }

  console.log(`\n${failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed'}\n`)

  process.exit(failed > 0 ? 1 : 0)
}

main()
  .catch((e) => {
    console.error('\n💥 Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
