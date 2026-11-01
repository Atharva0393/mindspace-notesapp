'use client'

import React from 'react'
import {
  BookOpen,
  Sun,
  Moon,
  Heart,
  Calendar,
  Target,
  Feather,
  Lightbulb,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { JournalTemplate } from '@/types/journal'
import { JOURNAL_TEMPLATES } from '@/lib/journal/templates'
import { PASTEL_PALETTE } from '@/lib/constants/colors'
import { cn } from '@/lib/utils'

export interface JournalTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: JournalTemplate) => void
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  book: <BookOpen className="w-4 h-4" />,
  sun: <Sun className="w-4 h-4" />,
  moon: <Moon className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4" />,
  calendar: <Calendar className="w-4 h-4" />,
  target: <Target className="w-4 h-4" />,
  feather: <Feather className="w-4 h-4" />,
  lightbulb: <Lightbulb className="w-4 h-4" />,
}

export function JournalTemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: JournalTemplateModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E8E1F4] border border-[#D5CBE5] flex items-center justify-center text-[#4B3968]">
            <BookOpen className="w-4 h-4" />
          </div>
          <span>Choose a Journal Template</span>
        </div>
      }
      description="Select an intentional framework for your thoughts, reflections, or strategic synthesis."
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
        {JOURNAL_TEMPLATES.map((tmpl) => {
          const palette = PASTEL_PALETTE[tmpl.colorTheme] || PASTEL_PALETTE.peach
          const iconNode = TEMPLATE_ICONS[tmpl.icon] || <BookOpen className="w-4 h-4" />

          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => {
                onSelectTemplate(tmpl)
                onClose()
              }}
              className={cn(
                'text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:scale-102 flex flex-col justify-between space-y-2',
                palette.bgClass,
                palette.borderClass
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-white/70 border border-black/5 flex items-center justify-center text-[#33312F]">
                    {iconNode}
                  </div>
                  <span className="text-sm font-bold text-[#33312F]">
                    {tmpl.title}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#605D58] line-clamp-2 leading-relaxed">
                {tmpl.description}
              </p>

              {tmpl.promptQuestion && (
                <div className="pt-1 border-t border-black/5 text-[11px] text-[#7A6332] italic line-clamp-1">
                  &ldquo;{tmpl.promptQuestion}&rdquo;
                </div>
              )}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

