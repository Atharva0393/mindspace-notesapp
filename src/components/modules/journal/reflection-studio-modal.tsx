'use client'

import React, { useState } from 'react'
import {
  Sun,
  Moon,
  Heart,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { JournalEntryCreateInput } from '@/types/journal'
import { cn } from '@/lib/utils'

export interface ReflectionStudioModalProps {
  isOpen: boolean
  onClose: () => void
  onCompleteReflection: (input: JournalEntryCreateInput) => void
  currentDateStr: string
}

type StudioTab = 'morning' | 'evening' | 'gratitude' | 'prompts'

const PROMPT_LIBRARY = [
  'What is currently occupying the most space in your mind?',
  'Where did you feel the greatest sense of calm or ease recently?',
  'What decision or conversation are you avoiding, and why?',
  'If today had a quiet theme song or weather pattern, what would it be?',
  'What habit or pattern no longer serves who you are becoming?',
  'Describe a small ordinary beauty you noticed in the last 24 hours.',
]

export function ReflectionStudioModal({
  isOpen,
  onClose,
  onCompleteReflection,
  currentDateStr,
}: ReflectionStudioModalProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('morning')

  // Morning fields
  const [lookingForward, setLookingForward] = useState('')
  const [mainPriority, setMainPriority] = useState('')
  const [desiredFeeling, setDesiredFeeling] = useState('')
  const [successMetric, setSuccessMetric] = useState('')

  // Evening fields
  const [wentWell, setWentWell] = useState('')
  const [accomplished, setAccomplished] = useState('')
  const [challenged, setChallenged] = useState('')
  const [learned, setLearned] = useState('')
  const [improveTomorrow, setImproveTomorrow] = useState('')

  // Gratitude fields
  const [grace1, setGrace1] = useState('')
  const [grace2, setGrace2] = useState('')
  const [grace3, setGrace3] = useState('')

  // Custom prompt fields
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPT_LIBRARY[0])
  const [promptResponse, setPromptResponse] = useState('')

  function handleSubmit() {
    let title = ''
    let contentHtml = ''
    let emotions: string[] = []
    let colorTheme: 'buttercream' | 'lavender' | 'pink' | 'peach' = 'peach'
    let templateId = ''
    let promptQuestion: string | null = null
    let gratitudeItems: string[] = []

    if (activeTab === 'morning') {
      title = 'Morning Alignment & Intentions'
      colorTheme = 'buttercream'
      templateId = 'morning-reflection'
      emotions = ['Focused', 'Motivated', 'Calm']
      contentHtml = `
        <h3>1. What am I looking forward to today?</h3>
        <p>${lookingForward.trim() || 'A day of focused progress and steady presence.'}</p>
        <h3>2. What is my main priority?</h3>
        <p>${mainPriority.trim() || 'Protect focus time and eliminate context switching.'}</p>
        <h3>3. How do I want to feel today?</h3>
        <p>${desiredFeeling.trim() || 'Grounded, unhurried, and clear.'}</p>
        <h3>4. What would make today successful?</h3>
        <p>${successMetric.trim() || 'Completing key objectives with mindful execution.'}</p>
      `
    } else if (activeTab === 'evening') {
      title = 'Evening Review & Mindful Closure'
      colorTheme = 'lavender'
      templateId = 'evening-reflection'
      emotions = ['Peaceful', 'Reflective', 'Grateful']
      contentHtml = `
        <h3>1. What went well today?</h3>
        <p>${wentWell.trim() || 'Protected deep work hours and maintained calm focus.'}</p>
        <h3>2. What did I accomplish?</h3>
        <p>${accomplished.trim() || 'Moved core milestones forward without friction.'}</p>
        <h3>3. What challenged me or caused friction?</h3>
        <p>${challenged.trim() || 'Navigated brief distractions with patience.'}</p>
        <h3>4. What did I learn?</h3>
        <p>${learned.trim() || 'Simplicity in planning creates spaciousness in execution.'}</p>
        <h3>5. What can I improve tomorrow?</h3>
        <p>${improveTomorrow.trim() || 'Start with the most decisive priority first.'}</p>
      `
    } else if (activeTab === 'gratitude') {
      title = 'Three Graces of the Day'
      colorTheme = 'pink'
      templateId = 'gratitude-journal'
      emotions = ['Grateful', 'Happy', 'Peaceful']
      gratitudeItems = [grace1.trim(), grace2.trim(), grace3.trim()].filter(Boolean)
      contentHtml = `
        <p>Pausing to acknowledge the quiet abundance present in ordinary life:</p>
        <h3>1. First Grace</h3>
        <p>${grace1.trim() || 'The quiet stillness of the morning.'}</p>
        <h3>2. Second Grace</h3>
        <p>${grace2.trim() || 'Health, energy, and purposeful work.'}</p>
        <h3>3. Third Grace</h3>
        <p>${grace3.trim() || 'Kindness received from someone unexpected.'}</p>
      `
    } else {
      title = 'Prompted Reflection'
      colorTheme = 'peach'
      promptQuestion = selectedPrompt
      emotions = ['Reflective']
      contentHtml = `
        <p><strong>Prompt:</strong> <em>&ldquo;${selectedPrompt}&rdquo;</em></p>
        <p>${promptResponse.trim() || 'Free writing on this thought...'}</p>
      `
    }

    onCompleteReflection({
      entryDate: currentDateStr,
      title,
      content: contentHtml,
      colorTheme,
      templateId,
      emotions,
      promptQuestion,
      gratitudeItems,
      isFavorite: false,
    })

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F4E4DC] border border-[#E7D0C4] flex items-center justify-center text-[#7A281E]">
            <BookOpen className="w-4 h-4" />
          </div>
          <span>Reflection Studio</span>
        </div>
      }
      description="Guided mindful prompts to center your morning, review your evening, or cultivate gratitude."
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Save as Journal Entry
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF9F6] border border-[#E8E6DF]">
          <button
            type="button"
            onClick={() => setActiveTab('morning')}
            className={cn(
              'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
              activeTab === 'morning'
                ? 'bg-white text-[#42361D] shadow-xs border border-[#E5D7B7]'
                : 'text-[#85817D] hover:text-[#33312F]'
            )}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>Morning</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evening')}
            className={cn(
              'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
              activeTab === 'evening'
                ? 'bg-white text-[#4B3968] shadow-xs border border-[#D5CBE5]'
                : 'text-[#85817D] hover:text-[#33312F]'
            )}
          >
            <Moon className="w-3.5 h-3.5 text-purple-600" />
            <span>Evening</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gratitude')}
            className={cn(
              'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
              activeTab === 'gratitude'
                ? 'bg-white text-[#552744] shadow-xs border border-[#DFC6D4]'
                : 'text-[#85817D] hover:text-[#33312F]'
            )}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Gratitude</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prompts')}
            className={cn(
              'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
              activeTab === 'prompts'
                ? 'bg-white text-[#442A20] shadow-xs border border-[#E7D0C4]'
                : 'text-[#85817D] hover:text-[#33312F]'
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Library</span>
          </button>
        </div>

        {/* Tab 1: Morning Reflection */}
        {activeTab === 'morning' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#F4EBD5]/40 border border-[#E5D7B7] space-y-1">
              <label className="text-xs font-semibold text-[#42361D] block">
                1. What am I looking forward to today?
              </label>
              <Textarea
                value={lookingForward}
                onChange={(e) => setLookingForward(e.target.value)}
                placeholder="A conversation, a creative sprint, quiet coffee..."
                rows={2}
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F4EBD5]/40 border border-[#E5D7B7] space-y-1">
              <label className="text-xs font-semibold text-[#42361D] block">
                2. What is my main priority?
              </label>
              <Textarea
                value={mainPriority}
                onChange={(e) => setMainPriority(e.target.value)}
                placeholder="The single thing that will move the needle..."
                rows={2}
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F4EBD5]/40 border border-[#E5D7B7] space-y-1">
              <label className="text-xs font-semibold text-[#42361D] block">
                3. How do I want to feel today?
              </label>
              <input
                type="text"
                value={desiredFeeling}
                onChange={(e) => setDesiredFeeling(e.target.value)}
                placeholder="e.g. Grounded, focused, peaceful, playful"
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#E5D7B7] text-[#33312F] outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F4EBD5]/40 border border-[#E5D7B7] space-y-1">
              <label className="text-xs font-semibold text-[#42361D] block">
                4. What would make today successful?
              </label>
              <Textarea
                value={successMetric}
                onChange={(e) => setSuccessMetric(e.target.value)}
                placeholder="Showing up with integrity and presence..."
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Evening Reflection */}
        {activeTab === 'evening' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#E8E1F4]/40 border border-[#D5CBE5] space-y-1">
              <label className="text-xs font-semibold text-[#4B3968] block">
                1. What went well today?
              </label>
              <Textarea
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                placeholder="Wins, flow state moments, calm clarity..."
                rows={2}
              />
            </div>

            <div className="p-3 rounded-xl bg-[#E8E1F4]/40 border border-[#D5CBE5] space-y-1">
              <label className="text-xs font-semibold text-[#4B3968] block">
                2. What did I accomplish?
              </label>
              <Textarea
                value={accomplished}
                onChange={(e) => setAccomplished(e.target.value)}
                placeholder="Completed milestones and actions..."
                rows={2}
              />
            </div>

            <div className="p-3 rounded-xl bg-[#E8E1F4]/40 border border-[#D5CBE5] space-y-1">
              <label className="text-xs font-semibold text-[#4B3968] block">
                3. What challenged me or caused friction?
              </label>
              <Textarea
                value={challenged}
                onChange={(e) => setChallenged(e.target.value)}
                placeholder="Friction points, resistance, or fatigue..."
                rows={2}
              />
            </div>

            <div className="p-3 rounded-xl bg-[#E8E1F4]/40 border border-[#D5CBE5] space-y-1">
              <label className="text-xs font-semibold text-[#4B3968] block">
                4. What did I learn?
              </label>
              <Textarea
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                placeholder="Key insights, paradigm shifts, or realizations..."
                rows={2}
              />
            </div>

            <div className="p-3 rounded-xl bg-[#E8E1F4]/40 border border-[#D5CBE5] space-y-1">
              <label className="text-xs font-semibold text-[#4B3968] block">
                5. What can I improve tomorrow?
              </label>
              <Textarea
                value={improveTomorrow}
                onChange={(e) => setImproveTomorrow(e.target.value)}
                placeholder="Adjustments to make tomorrow even smoother..."
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Gratitude Journal */}
        {activeTab === 'gratitude' && (
          <div className="space-y-3">
            <p className="text-xs text-[#85817D]">
              Notice the subtle joys that often slip past our attention. Write three distinct things you appreciate:
            </p>

            <div className="p-3.5 rounded-xl bg-[#F0DFE8]/40 border border-[#DFC6D4] space-y-1">
              <label className="text-xs font-bold text-[#552744] flex items-center gap-1.5">
                <span>1. First Grace</span>
              </label>
              <input
                type="text"
                value={grace1}
                onChange={(e) => setGrace1(e.target.value)}
                placeholder="e.g. Warm sunlight streaming across my desk"
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#DFC6D4] text-[#33312F] outline-none"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0DFE8]/40 border border-[#DFC6D4] space-y-1">
              <label className="text-xs font-bold text-[#552744] flex items-center gap-1.5">
                <span>2. Second Grace</span>
              </label>
              <input
                type="text"
                value={grace2}
                onChange={(e) => setGrace2(e.target.value)}
                placeholder="e.g. A kind message from an old friend"
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#DFC6D4] text-[#33312F] outline-none"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0DFE8]/40 border border-[#DFC6D4] space-y-1">
              <label className="text-xs font-bold text-[#552744] flex items-center gap-1.5">
                <span>3. Third Grace</span>
              </label>
              <input
                type="text"
                value={grace3}
                onChange={(e) => setGrace3(e.target.value)}
                placeholder="e.g. Having the time and space to create thoughtfully"
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#DFC6D4] text-[#33312F] outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Prompts Library */}
        {activeTab === 'prompts' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#85817D] uppercase tracking-wider mb-1.5">
                Select a Mindful Prompt
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {PROMPT_LIBRARY.map((prompt) => {
                  const isSelected = selectedPrompt === prompt
                  return (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setSelectedPrompt(prompt)}
                      className={cn(
                        'w-full text-left p-2.5 rounded-xl text-xs transition-all border cursor-pointer',
                        isSelected
                          ? 'bg-[#F4E4DC] border-[#E7D0C4] text-[#442A20] font-semibold shadow-2xs'
                          : 'bg-[#FAF9F6] border-[#E8E6DF] text-[#605D58] hover:bg-white'
                      )}
                    >
                      &ldquo;{prompt}&rdquo;
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#33312F]">
                Your Reflection
              </label>
              <Textarea
                value={promptResponse}
                onChange={(e) => setPromptResponse(e.target.value)}
                placeholder="Free write your thoughts in response to this prompt..."
                rows={3}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
