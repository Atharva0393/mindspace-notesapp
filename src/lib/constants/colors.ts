export type PastelColorKey =
  | 'ivory'
  | 'white'
  | 'peach'
  | 'lavender'
  | 'sage'
  | 'buttercream'
  | 'powder'
  | 'pink'

export interface PastelColorDefinition {
  key: PastelColorKey
  name: string
  hex: string
  borderHex: string
  bgClass: string
  borderClass: string
  hoverClass: string
  textClass: string
  badgeBg: string
}

export const PASTEL_PALETTE: Record<PastelColorKey, PastelColorDefinition> = {
  ivory: {
    key: 'ivory',
    name: 'Warm Ivory',
    hex: '#FAF9F6',
    borderHex: '#EAE6DF',
    bgClass: 'bg-[#FAF9F6]',
    borderClass: 'border-[#EAE6DF]',
    hoverClass: 'hover:bg-[#F3EFE7]',
    textClass: 'text-[#33312F]',
    badgeBg: 'bg-[#F2ECE2]',
  },
  white: {
    key: 'white',
    name: 'Paper White',
    hex: '#FFFFFF',
    borderHex: '#EAE6DF',
    bgClass: 'bg-[#FFFFFF]',
    borderClass: 'border-[#EAE6DF]',
    hoverClass: 'hover:bg-[#FBF9F6]',
    textClass: 'text-[#33312F]',
    badgeBg: 'bg-[#F5F2EB]',
  },
  peach: {
    key: 'peach',
    name: 'Peach Blush',
    hex: '#F4E4DC',
    borderHex: '#E8D4CA',
    bgClass: 'bg-[#F4E4DC]',
    borderClass: 'border-[#E8D4CA]',
    hoverClass: 'hover:bg-[#EED9CE]',
    textClass: 'text-[#442A20]',
    badgeBg: 'bg-[#EACFC3]',
  },
  lavender: {
    key: 'lavender',
    name: 'Lavender',
    hex: '#E8E1F4',
    borderHex: '#D8CEE8',
    bgClass: 'bg-[#E8E1F4]',
    borderClass: 'border-[#D8CEE8]',
    hoverClass: 'hover:bg-[#DDD3EE]',
    textClass: 'text-[#352749]',
    badgeBg: 'bg-[#D7C9EC]',
  },
  sage: {
    key: 'sage',
    name: 'Sage',
    hex: '#E3EBDD',
    borderHex: '#D0DEC8',
    bgClass: 'bg-[#E3EBDD]',
    borderClass: 'border-[#D0DEC8]',
    hoverClass: 'hover:bg-[#D7E3D0]',
    textClass: 'text-[#283824]',
    badgeBg: 'bg-[#C9D9C0]',
  },
  buttercream: {
    key: 'buttercream',
    name: 'Buttercream',
    hex: '#F4EBD5',
    borderHex: '#E7DCBE',
    bgClass: 'bg-[#F4EBD5]',
    borderClass: 'border-[#E7DCBE]',
    hoverClass: 'hover:bg-[#ECE1C6]',
    textClass: 'text-[#42361D]',
    badgeBg: 'bg-[#E6D7B2]',
  },
  powder: {
    key: 'powder',
    name: 'Powder Blue',
    hex: '#DFEAF2',
    borderHex: '#CBDDE9',
    bgClass: 'bg-[#DFEAF2]',
    borderClass: 'border-[#CBDDE9]',
    hoverClass: 'hover:bg-[#D1E2ED]',
    textClass: 'text-[#1E3345]',
    badgeBg: 'bg-[#C4DAE7]',
  },
  pink: {
    key: 'pink',
    name: 'Dusty Pink',
    hex: '#F0DFE8',
    borderHex: '#DECCD5',
    bgClass: 'bg-[#F0DFE8]',
    borderClass: 'border-[#DECCD5]',
    hoverClass: 'hover:bg-[#E7D1DC]',
    textClass: 'text-[#442637]',
    badgeBg: 'bg-[#E1C2D2]',
  },
}

export const PASTEL_COLOR_KEYS: PastelColorKey[] = [
  'ivory',
  'white',
  'peach',
  'lavender',
  'sage',
  'buttercream',
  'powder',
  'pink',
]

/**
 * Semantic Design Tokens
 */
export const SEMANTIC_COLORS = {
  background: '#FAF9F6',
  foreground: '#33312F',
  surface: '#FFFFFF',
  mutedSurface: '#F5F2EB',
  border: '#EAE6DF',
  borderCard: '#E5E0D8',
  textPrimary: '#33312F',
  textSecondary: '#85817D',
  primaryAction: '#33312F',
  primaryActionHover: '#1F1E1D',
  primaryActionText: '#FAF9F6',
  secondaryAction: '#F5F2EB',
  secondaryActionHover: '#EAE6DF',
  secondaryActionText: '#33312F',
  focusRing: '#C8BEDE',
  successBg: '#E3EBDD',
  successText: '#283824',
  successBorder: '#D0DEC8',
  warningBg: '#F4EBD5',
  warningText: '#42361D',
  warningBorder: '#E7DCBE',
  destructiveBg: '#F7DFD8',
  destructiveText: '#7A281E',
  destructiveBorder: '#E8C2B8',
  aiBg: '#E8E1F4',
  aiText: '#352749',
  aiBorder: '#D8CEE8',
} as const
