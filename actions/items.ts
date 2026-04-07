"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createItemSchema } from "@/lib/validations"
import type { ItemType } from "@prisma/client"

export type CreateItemState = {
  error?: string
  errors?: Record<string, string[]>
  success?: boolean
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
