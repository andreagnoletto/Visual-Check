// app/utils/constants.ts
export const CONFIG = {
  // Layout
  SAFE_MARGIN: { TV: 48, DESKTOP: 24, TOUCH: 16 }, // px

  // Optótipos
  OPTOTYPE_FONT_SCALE: 1.75,
  FONT_TIMEOUT: 3000, // ms

  // Calibração
  MIN_DISTANCE_M: 2,
  MAX_DISTANCE_M: 10,
  MIN_PX_PER_MM: 2.0,
  MAX_PX_PER_MM: 6.0,
  DEFAULT_ASPECT_RATIO: '16:9',
  MIN_CORRECTION_FACTOR: 0.9,
  MAX_CORRECTION_FACTOR: 1.1,

  // UX
  RESET_BACK_THRESHOLD: 4,
  RESET_BACK_WINDOW: 1500, // ms

  // Pro Mode
  DEFAULT_PRO_PIN: '1234',
  MAX_PIN_ATTEMPTS: 5,
  PIN_LOCK_TIMEOUT: 300000, // 5 minutos em ms

  // Pro Test Mode
  PRO_START_LINE_INDEX: 5, // 20/40 (logMAR 0.3)
  PRO_MIN_CHARS: 1,
  PRO_MAX_CHARS: 5,
  PRO_CHAR_SPACING: 1.5, // espaçamento entre caracteres (em unidades de fontSize)

  // Persistência
  SCHEMA_VERSION: 2, // Incrementado para Phase 5
} as const

export type ProTestTheme = 'day' | 'night'

export type UiMode = 'tv' | 'desktop' | 'touch'

export const SCREEN_PRESETS = [
  { label: '32" 1080p', pxPerMm: 2.9, aspectRatio: '16:9' },
  { label: '40" 1080p', pxPerMm: 2.3, aspectRatio: '16:9' },
  { label: '43" 4K', pxPerMm: 4.2, aspectRatio: '16:9' },
  { label: '50" 4K', pxPerMm: 3.6, aspectRatio: '16:9' },
  { label: '55" 4K', pxPerMm: 3.1, aspectRatio: '16:9' },
  { label: '65" 4K', pxPerMm: 2.7, aspectRatio: '16:9' },
  { label: '75" 4K', pxPerMm: 2.3, aspectRatio: '16:9' },
  { label: '27" Monitor 4K', pxPerMm: 5.8, aspectRatio: '16:9' },
] as const
