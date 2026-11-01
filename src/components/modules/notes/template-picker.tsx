'use client'

import React from 'react'
import { Sparkles, FileText } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { NOTE_TEMPLATES, NoteTemplate } from '@/lib/notes/templates'
import { PASTEL_PALETTE } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/styling'

export interface TemplatePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: NoteTemplate) => void
}

export function TemplatePicker({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatePickerProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E8E1F4] flex items-center justify-center text-[#352749]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>Create Note from Template</span>
        </div>
      }
      description="Choose a structured starting point for meetings, journals, studies, or projects."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
        {NOTE_TEMPLATES.map((tpl) => {
          const palette = PASTEL_PALETTE[tpl.defaultColor]
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                onSelectTemplate(tpl)
                onClose()
              }}
              className={cn(
                'p-4 rounded-[16px] border text-left transition-all cursor-pointer flex flex-col justify-between group',
                palette.bgClass,
                palette.borderClass,
                'hover:paper-shadow-md hover:-translate-y-0.5'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#85817D] group-hover:text-[#33312F]" />
                    <h4 className="font-bold text-sm text-[#33312F]">
                      {tpl.name}
                    </h4>
                  </div>
                  <PastelBadge variant={tpl.defaultColor} size="sm">
                    {palette.name}
                  </PastelBadge>
                </div>
                <p className="text-xs text-[#5C5956] leading-relaxed mb-3">
                  {tpl.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 border-t border-black/[0.04]">
                {tpl.defaultTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-[#706E6B] bg-white/70 px-1.5 py-0.5 rounded-[4px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

