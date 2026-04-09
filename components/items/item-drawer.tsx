'use client'

import { useState, useCallback } from 'react'
import { DashboardItem } from '@/types/dashboard'
import { renderIcon } from '@/lib/icon-map'
import { toggleFavoriteAction } from '@/actions/items'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Star,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Highlight, themes } from 'prism-react-renderer'

interface ItemDrawerProps {
  item: DashboardItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (item: DashboardItem) => void
  onDelete: (item: DashboardItem) => void
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// --- Type-aware content blocks ---

function CodeBlock({ content, language }: { content: string; language?: string | null }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-[#1e1e2e]">
        <span className="text-xs text-muted-foreground font-mono">
          {language || 'text'}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <Highlight theme={themes.vsDark} code={content} language={language || 'text'}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(className, 'overflow-x-auto p-4 text-sm font-mono leading-relaxed scrollbar-thin')}
            style={{ ...style, backgroundColor: '#1e1e2e', margin: 0 }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}

function CommandBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-[#1a1a1a]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-[#111]">
        <span className="text-xs text-green-400 font-mono">$ terminal</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono leading-relaxed">
        <span className="text-green-400 mr-2">$</span>
        <span className="text-[#e4e4e4]">{content}</span>
      </pre>
    </div>
  )
}

function PromptBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  return (
    <div className="relative rounded-lg border border-purple-500/20 bg-purple-500/5">
      <div className="flex items-center justify-between px-4 py-2 border-b border-purple-500/15">
        <span className="flex items-center gap-1.5 text-xs text-purple-400">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400" />
          AI Prompt
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className="p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  )
}

function NoteBlock({ content }: { content: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  )
}

function LinkBlock({ url }: { url: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <ExternalLink className="h-4 w-4 shrink-0 text-emerald-400" />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline truncate"
        >
          {url}
        </a>
      </div>
      <Button variant="outline" size="xs">
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
          Open <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  )
}

function ContentRenderer({ item }: { item: DashboardItem }) {
  const typeName = item.itemType.name.toLowerCase()

  if (typeName === 'link') {
    return item.url ? <LinkBlock url={item.url} /> : null
  }

  if (!item.content) return null

  switch (typeName) {
    case 'snippet':
      return <CodeBlock content={item.content} language={item.language} />
    case 'command':
      return <CommandBlock content={item.content} />
    case 'prompt':
      return <PromptBlock content={item.content} />
    case 'note':
      return <NoteBlock content={item.content} />
    default:
      return <CodeBlock content={item.content} language={item.language} />
  }
}

export function ItemDrawer({ item, open, onOpenChange, onEdit, onDelete }: ItemDrawerProps) {
  const [isFavorite, setIsFavorite] = useState(item?.isFavorite ?? false)
  const [isFavLoading, setIsFavLoading] = useState(false)

  // Sync favorite state when item changes
  if (item && isFavorite !== item.isFavorite && !isFavLoading) {
    setIsFavorite(item.isFavorite)
  }

  const handleToggleFavorite = async () => {
    if (!item || isFavLoading) return
    setIsFavLoading(true)
    // Optimistic update
    setIsFavorite((prev) => !prev)
    const result = await toggleFavoriteAction(item.id)
    if (result.error) {
      // Revert on error
      setIsFavorite(item.isFavorite)
    }
    setIsFavLoading(false)
  }

  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[600px] !gap-0 p-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${item.itemType.color}15`,
                  color: item.itemType.color,
                }}
              >
                {renderIcon(item.itemType.icon, { className: 'h-4 w-4' })}
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-lg font-semibold text-foreground truncate">
                  {item.title}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                  <span style={{ color: item.itemType.color }} className="font-medium">
                    {item.itemType.name}
                  </span>
                  {' · '}
                  Created {formatFullDate(item.createdAt)}
                  {' · '}
                  Updated {formatRelativeTime(item.updatedAt)}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleToggleFavorite}
                disabled={isFavLoading}
                className={cn(
                  'text-muted-foreground',
                  isFavorite ? 'hover:text-yellow-400' : 'hover:text-yellow-400'
                )}
              >
                <Star
                  className="h-4 w-4"
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(item)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </div>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-5">
          {/* Description */}
          {item.description && (
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Type-aware content */}
          <ContentRenderer item={item} />
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-3 flex items-center justify-between bg-muted/20">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}