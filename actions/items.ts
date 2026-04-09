"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createItemSchema, updateItemSchema } from "@/lib/validations"
import type { ItemType } from "@prisma/client"

export type CreateItemState = {
  error?: string
  errors?: Record<string, string[]>
  success?: boolean
}

export type UpdateItemState = {
  error?: string
  errors?: Record<string, string[]>
  success?: boolean
}

export type DeleteItemState = {
  error?: string
  success?: boolean
}

export type ToggleFavoriteState = {
  error?: string
  success?: boolean
  isFavorite?: boolean
}

export async function createItemAction(
  prevState: CreateItemState,
  formData: FormData
): Promise<CreateItemState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const validatedFields = createItemSchema.safeParse({
    title: formData.get("title"),
    itemTypeId: formData.get("itemTypeId"),
    content: formData.get("content") || undefined,
    url: formData.get("url") || undefined,
    description: formData.get("description") || undefined,
    language: formData.get("language") || undefined,
    tags: formData.get("tags") || undefined,
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, itemTypeId, content, url, description, language, tags } = validatedFields.data

  // Verify item type exists and belongs to user (or is system)
  const itemType = await prisma.itemType.findFirst({
    where: {
      id: itemTypeId,
      OR: [
        { isSystem: true },
        { userId: session.user.id },
      ],
    },
  })

  if (!itemType) {
    return { error: "Invalid item type" }
  }

  // Handle tags
  const tagNames = tags
    ? tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .slice(0, 10) // Max 10 tags
    : []

  // Prepare tag connections
  const tagConnections = await Promise.all(
    tagNames.map(async (tagName) => {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        create: { name: tagName },
        update: {},
      })
      return { tagId: tag.id }
    })
  )

  // Determine content type based on item type
  const isLinkType = itemType.name.toLowerCase() === "link"
  const hasUrl = url && url.trim().length > 0

  try {
    await prisma.item.create({
      data: {
        title,
        contentType: isLinkType && hasUrl ? "TEXT" : "TEXT",
        content: content || null,
        url: isLinkType ? url || null : null,
        description: description || null,
        language: language || null,
        userId: session.user.id,
        itemTypeId,
        tags: {
          create: tagConnections.map((tc) => ({
            tag: {
              connect: { id: tc.tagId },
            },
          })),
        },
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/items/[type]")

    return { success: true }
  } catch (error) {
    console.error("Failed to create item:", error)
    return { error: "Failed to create item" }
  }
}

export async function getItemTypes(): Promise<{
  error?: string
  data?: ItemType[]
}> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const itemTypes = await prisma.itemType.findMany({
      where: {
        OR: [
          { isSystem: true },
          { userId: session.user.id },
        ],
      },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    })

    return { data: itemTypes }
  } catch (error) {
    console.error("Failed to fetch item types:", error)
    return { error: "Failed to fetch item types" }
  }
}

export async function updateItemAction(
  prevState: UpdateItemState,
  formData: FormData
): Promise<UpdateItemState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const validatedFields = updateItemSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    itemTypeId: formData.get("itemTypeId"),
    content: formData.get("content") || undefined,
    url: formData.get("url") || undefined,
    description: formData.get("description") || undefined,
    language: formData.get("language") || undefined,
    tags: formData.get("tags") || undefined,
  })

  if (!validatedFields.success) {
    return {
      error: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { id, title, itemTypeId, content, url, description, language, tags } = validatedFields.data

  const existingItem = await prisma.item.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existingItem) {
    return { error: "Item not found" }
  }

  const itemType = await prisma.itemType.findFirst({
    where: {
      id: itemTypeId,
      OR: [{ isSystem: true }, { userId: session.user.id }],
    },
  })

  if (!itemType) {
    return { error: "Invalid item type" }
  }

  const tagNames = tags
    ? tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .slice(0, 10)
    : []

  const tagConnections = await Promise.all(
    tagNames.map(async (tagName) => {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        create: { name: tagName },
        update: {},
      })
      return { tagId: tag.id }
    })
  )

  const isLinkType = itemType.name.toLowerCase() === "link"

  try {
    await prisma.item.update({
      where: { id },
      data: {
        title,
        itemTypeId,
        content: content || null,
        url: isLinkType ? url || null : null,
        description: description || null,
        language: language || null,
        tags: {
          deleteMany: {},
          create: tagConnections.map((tc) => ({
            tag: { connect: { id: tc.tagId } },
          })),
        },
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/items/[type]")

    return { success: true }
  } catch (error) {
    console.error("Failed to update item:", error)
    return { error: "Failed to update item" }
  }
}

export async function deleteItemAction(
  prevState: DeleteItemState,
  formData: FormData
): Promise<DeleteItemState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const itemId = formData.get("itemId") as string
  if (!itemId) {
    return { error: "Item ID is required" }
  }

  const item = await prisma.item.findFirst({
    where: { id: itemId, userId: session.user.id },
  })

  if (!item) {
    return { error: "Item not found" }
  }

  try {
    await prisma.item.delete({
      where: { id: itemId },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/items/[type]")

    return { success: true }
  } catch (error) {
    console.error("Failed to delete item:", error)
    return { error: "Failed to delete item" }
  }
}

export async function toggleFavoriteAction(
  itemId: string
): Promise<ToggleFavoriteState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const item = await prisma.item.findFirst({
    where: { id: itemId, userId: session.user.id },
    select: { isFavorite: true },
  })

  if (!item) {
    return { error: "Item not found" }
  }

  try {
    const updated = await prisma.item.update({
      where: { id: itemId },
      data: { isFavorite: !item.isFavorite },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/items/[type]")

    return { success: true, isFavorite: updated.isFavorite }
  } catch (error) {
    console.error("Failed to toggle favorite:", error)
    return { error: "Failed to toggle favorite" }
  }
}
