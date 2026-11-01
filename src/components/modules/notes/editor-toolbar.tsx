'use client'

import React from 'react'
import { type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  FileCode,
  Link as LinkIcon,
  Minus,
  Undo2,
  Redo2,
} from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/styling'

export interface EditorToolbarProps {
  editor: Editor | null
  className?: string
}

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  if (!editor) return null

  function setLink() {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter link URL (e.g. https://example.com):', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const items = [
    {
      label: 'Bold (⌘B)',
      icon: <Bold className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      label: 'Italic (⌘I)',
      icon: <Italic className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      label: 'Underline (⌘U)',
      icon: <UnderlineIcon className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      label: 'Strikethrough',
      icon: <Strikethrough className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
    },
    { isDivider: true },
    {
      label: 'Heading 1',
      icon: <Heading1 className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
    },
    {
      label: 'Heading 2',
      icon: <Heading2 className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'Heading 3',
      icon: <Heading3 className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
    },
    { isDivider: true },
    {
      label: 'Checklist',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: editor.isActive('taskList'),
    },
    {
      label: 'Bullet List',
      icon: <List className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      label: 'Numbered List',
      icon: <ListOrdered className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    { isDivider: true },
    {
      label: 'Quote',
      icon: <Quote className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
    },
    {
      label: 'Inline Code',
      icon: <Code className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
    },
    {
      label: 'Code Block',
      icon: <FileCode className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
    },
    {
      label: 'Link',
      icon: <LinkIcon className="w-3.5 h-3.5" />,
      action: setLink,
      isActive: editor.isActive('link'),
    },
    {
      label: 'Horizontal Rule',
      icon: <Minus className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: false,
    },
    { isDivider: true },
    {
      label: 'Undo (⌘Z)',
      icon: <Undo2 className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      label: 'Redo (⌘⇧Z)',
      icon: <Redo2 className="w-3.5 h-3.5" />,
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
  ]

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-0.5 p-1.5 bg-white/90 backdrop-blur-md border border-[#EAE6DF] rounded-[14px] shadow-xs select-none',
        className
      )}
    >
      {items.map((item, index) => {
        if ('isDivider' in item && item.isDivider) {
          return (
            <div
              key={`div-${index}`}
              className="w-[1px] h-4 bg-[#EAE6DF] mx-1 shrink-0 self-center"
            />
          )
        }

        const isAct = 'isActive' in item ? item.isActive : false
        const isDis = 'disabled' in item ? item.disabled : false

        return (
          <Tooltip key={item.label} content={item.label} position="top">
            <button
              type="button"
              disabled={isDis}
              onClick={item.action}
              className={cn(
                'w-7 h-7 rounded-[7px] flex items-center justify-center transition-colors cursor-pointer select-none',
                isAct
                  ? 'bg-[#33312F] text-[#FAF9F6]'
                  : 'text-[#85817D] hover:text-[#33312F] hover:bg-[#F5F2EB]',
                isDis && 'opacity-30 cursor-not-allowed pointer-events-none'
              )}
            >
              {item.icon}
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}

