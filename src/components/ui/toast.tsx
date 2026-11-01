'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils/styling'

export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'pastel'

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastItem = { id, title, description, variant, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }
    },
    [dismiss]
  )

  const variantStyles: Record<
    ToastVariant,
    { bg: string; border: string; text: string; icon: React.ReactNode }
  > = {
    default: {
      bg: 'bg-white',
      border: 'border-[#EAE6DF]',
      text: 'text-[#33312F]',
      icon: <Info className="w-4 h-4 text-[#85817D] shrink-0" />,
    },
    success: {
      bg: 'bg-[#E3EBDD]',
      border: 'border-[#D0DEC8]',
      text: 'text-[#283824]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#3D7535] shrink-0" />,
    },
    warning: {
      bg: 'bg-[#F4EBD5]',
      border: 'border-[#E7DCBE]',
      text: 'text-[#42361D]',
      icon: <AlertTriangle className="w-4 h-4 text-[#B58525] shrink-0" />,
    },
    error: {
      bg: 'bg-[#F7DFD8]',
      border: 'border-[#E8C2B8]',
      text: 'text-[#7A281E]',
      icon: <AlertCircle className="w-4 h-4 text-[#C95D4A] shrink-0" />,
    },
    pastel: {
      bg: 'bg-[#E8E1F4]',
      border: 'border-[#D8CEE8]',
      text: 'text-[#352749]',
      icon: <Info className="w-4 h-4 text-[#5B3E8C] shrink-0" />,
    },
  }

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4 sm:p-0">
        <AnimatePresence>
          {toasts.map((t) => {
            const style = variantStyles[t.variant || 'default']
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
                className={cn(
                  'pointer-events-auto p-4 rounded-[14px] border shadow-lg flex items-start gap-3 select-none',
                  style.bg,
                  style.border
                )}
                role="status"
              >
                <div className="mt-0.5">{style.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn('text-xs sm:text-sm font-semibold tracking-tight', style.text)}>
                    {t.title}
                  </h4>
                  {t.description && (
                    <p className="text-xs text-[#5C5956] mt-0.5 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="p-1 rounded-[6px] text-[#85817D] hover:text-[#33312F] transition-colors cursor-pointer"
                  aria-label="Dismiss toast"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

