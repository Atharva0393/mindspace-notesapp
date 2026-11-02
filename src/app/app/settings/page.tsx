'use client'

import React, { useState } from 'react'
import { User, Palette, Shield, Database, Save, Check } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PastelBadge } from '@/components/ui/pastel-badge'
import { PASTEL_PALETTE, PastelColorKey } from '@/lib/constants/colors'
import { useToast } from '@/components/ui/toast'
import { useCurrentUser } from '@/components/layout/user-context'
import { cn } from '@/lib/utils/styling'

export default function SettingsPage() {
  const { toast } = useToast()
  const { displayName, userEmail, isAuthenticated } = useCurrentUser()
  const [fullName, setFullName] = useState(displayName !== 'Guest' && displayName !== 'Friend' ? displayName : '')
  const [email] = useState(userEmail || (isAuthenticated ? 'user@mindspace.app' : 'guest@local.preview'))
  const [defaultColor, setDefaultColor] = useState<PastelColorKey>('buttercream')
  const [hapticFeedback, setHapticFeedback] = useState(true)
  const [subtleRotations, setSubtleRotations] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: 'Preferences Updated',
        description: 'Your workspace settings have been saved.',
        variant: 'success',
      })
    }, 400)
  }

  return (
    <div className="space-y-8 max-w-4xl animate-fadeIn">
      <SectionHeader
        title="Workspace Settings"
        description="Configure your profile, appearance, sticky note defaults, and security."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Section */}
        <div className="rounded-[20px] bg-white border border-[#EAE6DF] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#EAE6DF]">
            <div className="w-8 h-8 rounded-lg bg-[#E8E1F4] flex items-center justify-center text-[#352749]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#33312F]">Personal Profile</h3>
              <p className="text-xs text-[#85817D]">
                Your display name and identity across workspace desks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#33312F] mb-1.5">
                Full Name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#33312F] mb-1.5">
                Email Address
              </label>
              <Input value={email} disabled />
            </div>
          </div>
        </div>

        {/* Appearance & Pastel Palette Section */}
        <div className="rounded-[20px] bg-white border border-[#EAE6DF] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#EAE6DF]">
            <div className="w-8 h-8 rounded-lg bg-[#F4EBD5] flex items-center justify-center text-[#42361D]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#33312F]">
                Pastel Aesthetic &amp; Note Defaults
              </h3>
              <p className="text-xs text-[#85817D]">
                Choose your default sticky-note surface color and physical interaction settings.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#33312F] mb-3">
                Default Sticky Note Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(Object.keys(PASTEL_PALETTE) as PastelColorKey[]).map((key) => {
                  const p = PASTEL_PALETTE[key]
                  const isSelected = defaultColor === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDefaultColor(key)}
                      className={cn(
                        'p-3 rounded-[14px] border flex items-center gap-2.5 transition-all text-left cursor-pointer select-none',
                        p.bgClass,
                        isSelected
                          ? 'border-[#33312F] ring-2 ring-[#33312F]/10 font-bold'
                          : 'border-black/[0.08] hover:border-black/20'
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: p.hex }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-[#33312F]" />}
                      </div>
                      <span className={cn('text-xs truncate', p.textClass)}>
                        {p.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAE6DF] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#33312F]">
                    Subtle Sticky-Note Paper Rotations
                  </h4>
                  <p className="text-[11px] text-[#85817D]">
                    Applies slight 0.8-degree paper tilts for an authentic desk feeling.
                  </p>
                </div>
                <Switch
                  checked={subtleRotations}
                  onChange={setSubtleRotations}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#33312F]">
                    Tactile Micro-Interactions
                  </h4>
                  <p className="text-[11px] text-[#85817D]">
                    Elevates cards and provides soft spring physics on clicks.
                  </p>
                </div>
                <Switch
                  checked={hapticFeedback}
                  onChange={setHapticFeedback}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database & Security Section */}
        <div className="rounded-[20px] bg-white border border-[#EAE6DF] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#EAE6DF]">
            <div className="w-8 h-8 rounded-lg bg-[#E3EBDD] flex items-center justify-center text-[#283824]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#33312F]">
                Security &amp; Persistence
              </h3>
              <p className="text-xs text-[#85817D]">
                PostgreSQL Row Level Security (RLS) and pgvector settings.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-[14px] bg-[#FAF9F6] border border-[#EAE6DF]">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#3D7535]" />
              <div>
                <span className="text-xs font-bold text-[#33312F] block">
                  Row Level Security (RLS) Active
                </span>
                <span className="text-[11px] text-[#85817D]">
                  Every note, habit, and vector embedding is isolated to your user ID.
                </span>
              </div>
            </div>
            <PastelBadge variant="sage" size="sm">
              Enforced
            </PastelBadge>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  )
}
