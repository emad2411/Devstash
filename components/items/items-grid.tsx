'use client'

import { useState, useCallback } from 'react'
import { DashboardItem } from '@/types/dashboard'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ItemCard } from '@/components/dashboard/item-card'
import { ItemDrawer } from '@/components/items/item-drawer'
import { ItemForm } from '@/components/items/item-form'
import { DeleteConfirmDialog } from '@/components/items/delete-confirm-dialog'

interface ItemsGridProps {
  items: DashboardItem[]
  emptyMessage?: string
}

type ViewMode = 'grid' | 'list'

export function ItemsGrid({ items, emptyMessage = 'No items found' }: ItemsGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [drawerItem, setDrawerItem] = useState<DashboardItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState<DashboardItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<DashboardItem | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleItemClick = useCallback((item: DashboardItem) => {
    setDrawerItem(item)
    setDrawerOpen(true)
  }, [])

  const handleEdit = useCallback((item: DashboardItem) => {
    setDrawerOpen(false)
    setEditItem(item)
    setEditOpen(true)
  }, [])

  const handleDelete = useCallback((item: DashboardItem) => {
    setDrawerOpen(false)
    setDeleteItem(item)
    setDeleteOpen(true)
  }, [])

  const handleEditClose = useCallback(() => {
    setEditOpen(false)
    setEditItem(null)
  }, [])

  const handleDeleteClose = useCallback(() => {
    setDeleteOpen(false)
    setDeleteItem(null)
  }, [])

  const handleDeleteSuccess = useCallback(() => {
    setDeleteOpen(false)
    setDeleteItem(null)
    setDrawerItem(null)
    setDrawerOpen(false)
  }, [])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with view toggle */}
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md',
              viewMode === 'grid' && 'bg-card text-foreground shadow-sm'
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-md',
              viewMode === 'list' && 'bg-card text-foreground shadow-sm'
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Items grid/list */}
      <div className={cn(
        'grid gap-4',
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
      )}>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={handleItemClick}
          />
        ))}
      </div>

      {/* Item Drawer */}
      <ItemDrawer
        item={drawerItem}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Form */}
      <ItemForm
        open={editOpen}
        onOpenChange={handleEditClose}
        editItem={editItem}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        item={deleteItem}
        open={deleteOpen}
        onOpenChange={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}