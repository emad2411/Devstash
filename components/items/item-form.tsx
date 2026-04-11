"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { createItemAction, updateItemAction, getItemTypes, type CreateItemState, type UpdateItemState } from "@/actions/items"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createItemSchema, updateItemSchema, type CreateItemInput, type UpdateItemInput } from "@/lib/validations"
import { Loader2, Plus, Pencil, X } from "lucide-react"
import { toast } from "sonner"
import type { ItemType } from "@prisma/client"
import type { DashboardItem } from "@/types/dashboard"
import { cn } from "@/lib/utils"

interface ItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: DashboardItem | null
}

export function ItemForm({ open, onOpenChange, editItem }: ItemFormProps) {
  const isEditMode = !!editItem
  const [itemTypes, setItemTypes] = useState<ItemType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ItemType | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateItemInput | UpdateItemInput>({
    resolver: zodResolver(isEditMode ? updateItemSchema : createItemSchema),
    defaultValues: {
      ...(isEditMode && editItem
        ? {
            id: editItem.id,
            title: editItem.title,
            itemTypeId: editItem.itemTypeId,
            content: editItem.content || "",
            url: editItem.url || "",
            description: editItem.description || "",
            language: editItem.language || "",
            tags: editItem.tags.map((t) => t.name).join(", "),
          }
        : {
            title: "",
            itemTypeId: "",
            content: "",
            url: "",
            description: "",
            language: "",
            tags: "",
          }),
    },
  })

  const itemTypeId = watch("itemTypeId")

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      getItemTypes().then((result) => {
        if (result.data) {
          setItemTypes(result.data)
        }
        setIsLoading(false)
      })
    }
  }, [open])

  useEffect(() => {
    if (itemTypeId) {
      const type = itemTypes.find((t) => t.id === itemTypeId)
      setSelectedType(type || null)
    }
  }, [itemTypeId, itemTypes])

  // When editItem changes, reset form with new values
  useEffect(() => {
    if (editItem && open) {
      reset({
        id: editItem.id,
        title: editItem.title,
        itemTypeId: editItem.itemTypeId,
        content: editItem.content || "",
        url: editItem.url || "",
        description: editItem.description || "",
        language: editItem.language || "",
        tags: editItem.tags.map((t) => t.name).join(", "),
      })
    } else if (!open) {
      reset({
        title: "",
        itemTypeId: "",
        content: "",
        url: "",
        description: "",
        language: "",
        tags: "",
      })
      setServerError(null)
      setSelectedType(null)
    }
  }, [open, editItem, reset])

  const onSubmit = async (data: CreateItemInput | UpdateItemInput) => {
    setIsSubmitting(true)
    setServerError(null)

    const formData = new FormData()

    if (isEditMode && "id" in data) {
      // Update mode
      const updateData = data as UpdateItemInput
      formData.append("id", updateData.id)
      formData.append("title", updateData.title)
      formData.append("itemTypeId", updateData.itemTypeId)
      if (updateData.content) formData.append("content", updateData.content)
      if (updateData.url) formData.append("url", updateData.url)
      if (updateData.description) formData.append("description", updateData.description)
      if (updateData.language) formData.append("language", updateData.language)
      if (updateData.tags) formData.append("tags", updateData.tags)

      const result: UpdateItemState = await updateItemAction({}, formData)

      if (result.error) {
        setServerError(result.error)
        setIsSubmitting(false)
        return
      }

      if (result.success) {
        onOpenChange(false)
        toast.success("Item updated successfully")
      }
    } else {
      // Create mode
      const createData = data as CreateItemInput
      formData.append("title", createData.title)
      formData.append("itemTypeId", createData.itemTypeId)
      if (createData.content) formData.append("content", createData.content)
      if (createData.url) formData.append("url", createData.url)
      if (createData.description) formData.append("description", createData.description)
      if (createData.language) formData.append("language", createData.language)
      if (createData.tags) formData.append("tags", createData.tags)

      const result: CreateItemState = await createItemAction({}, formData)

      if (result.error) {
        setServerError(result.error)
        setIsSubmitting(false)
        return
      }

      if (result.success) {
        onOpenChange(false)
        reset()
        toast.success("Item created successfully")
      }
    }

    setIsSubmitting(false)
  }

  const getTypeLabel = (typeName: string) => {
    return typeName.charAt(0).toUpperCase() + typeName.slice(1)
  }

  const needsUrlField = selectedType?.name.toLowerCase() === "link"
  const needsLanguageField = selectedType?.name.toLowerCase() === "snippet"
  const needsContentField =
    selectedType &&
    ["snippet", "prompt", "note", "command"].includes(selectedType.name.toLowerCase())

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Backdrop
          className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out"
        />

        {/* Modal Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
          <DialogPrimitive.Popup
            className="pointer-events-auto w-full max-w-lg bg-popover rounded-xl border border-border shadow-2xl overflow-hidden data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out"
          >
            {/* Header - Fixed height, clear separation */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <DialogPrimitive.Title className="text-lg font-semibold text-popover-foreground">
                  {isEditMode ? "Edit Item" : "Create New Item"}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1">
                  {isEditMode ? "Update your item details." : "Add a new item to your DevStash collection."}
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                render={
                  <button className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                }
              />
            </div>

            {/* Form Content - Scrollable with consistent padding */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
                {/* Item Type */}
                <div className="space-y-2">
                  <Label htmlFor="itemTypeId">Item Type</Label>
                  <Controller
                    name="itemTypeId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="itemTypeId"
                        disabled={isLoading || isEditMode}
                        className={cn(
                          "w-full h-10 px-3 rounded-lg border bg-background text-sm",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          "appearance-none cursor-pointer",
                          errors.itemTypeId ? "border-destructive" : "border-input"
                        )}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 12px center",
                        }}
                      >
                        <option value="" disabled>
                          Select an item type
                        </option>
                        {itemTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {getTypeLabel(type.name)}
                            {!type.isSystem ? " (Custom)" : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.itemTypeId && (
                    <p className="text-xs text-destructive">{errors.itemTypeId.message}</p>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="title"
                        placeholder="Enter a title..."
                        className={cn(
                          "h-10",
                          errors.title && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                    )}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* URL field for Links */}
                {needsUrlField && (
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Controller
                      name="url"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="url"
                          type="url"
                          placeholder="https://example.com"
                          className={cn(
                            "h-10",
                            errors.url && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                      )}
                    />
                    {errors.url && (
                      <p className="text-xs text-destructive">{errors.url.message}</p>
                    )}
                  </div>
                )}

                {/* Language field for Snippets */}
                {needsLanguageField && (
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Controller
                      name="language"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="language"
                          placeholder="e.g., typescript, python, javascript"
                          className="h-10"
                        />
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for syntax highlighting
                    </p>
                  </div>
                )}

                {/* Content field */}
                {needsContentField && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Controller
                      name="content"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="content"
                          placeholder={
                            selectedType?.name.toLowerCase() === "snippet"
                              ? "Paste your code here..."
                              : selectedType?.name.toLowerCase() === "prompt"
                              ? "Enter your AI prompt..."
                              : selectedType?.name.toLowerCase() === "command"
                              ? "Enter terminal command..."
                              : "Enter your note..."
                          }
                          rows={5}
                          className={cn(
                            "resize-none",
                            errors.content && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                      )}
                    />
                    {errors.content && (
                      <p className="text-xs text-destructive">{errors.content.message}</p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description">Description</Label>
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                  </div>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Add a brief description..."
                        rows={2}
                        className={cn(
                          "resize-none",
                          errors.description && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="tags">Tags</Label>
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                  </div>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="tags"
                        placeholder="tag1, tag2, tag3"
                        className={cn(
                          "h-10",
                          errors.tags && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas (max 10 tags)
                  </p>
                  {errors.tags && (
                    <p className="text-xs text-destructive">{errors.tags.message}</p>
                  )}
                </div>

                {/* Server Error */}
                {serverError && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 border border-destructive/20">
                    <p className="text-sm text-destructive">{serverError}</p>
                  </div>
                )}
              </div>

              {/* Footer - Fixed height, clear separation */}
              <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-border bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedType}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Saving..." : "Creating..."}
                    </>
                  ) : isEditMode ? (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Item
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Popup>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}