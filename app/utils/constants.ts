// app/utils/constants.ts
export const CONFIG = {
  // Layout
  SAFE_MARGIN: { TV: 48, DESKTOP: 24, TOUCH: 16 }, // px

  // Optótipos
  OPTOTYPE_FONT_SCALE: 1.75,
  FONT_TIMEOUT: 3000, // ms

  // Calibração
  MIN_DISTANCE_M: 0.3,
  MAX_DISTANCE_M: 6,

  // Pro Mode - Controles
  PRO_CONTROLS_HIDE_TIMEOUT: 36000, // ms (tempo para ocultar setas laterais)
  MIN_PX_PER_MM: 2.0,
  MAX_PX_PER_MM: 20.0, // Atualizado para suportar smartphones de alta densidade
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
  // TVs e monitores
  { label: '32" 1080p', pxPerMm: 2.9, aspectRatio: '16:9', category: 'tv' },
  { label: '40" 1080p', pxPerMm: 2.3, aspectRatio: '16:9', category: 'tv' },
  { label: '43" 4K', pxPerMm: 4.2, aspectRatio: '16:9', category: 'tv' },
  { label: '50" 4K', pxPerMm: 3.6, aspectRatio: '16:9', category: 'tv' },
  { label: '55" 4K', pxPerMm: 3.1, aspectRatio: '16:9', category: 'tv' },
  { label: '65" 4K', pxPerMm: 2.7, aspectRatio: '16:9', category: 'tv' },
  { label: '75" 4K', pxPerMm: 2.3, aspectRatio: '16:9', category: 'tv' },
  { label: '27" Monitor 4K', pxPerMm: 5.8, aspectRatio: '16:9', category: 'monitor' },
  // Tablets
  { label: 'iPad Pro 12.9"', pxPerMm: 10.4, aspectRatio: '4:3', category: 'tablet' },
  { label: 'iPad Pro 11"', pxPerMm: 10.5, aspectRatio: '4:3', category: 'tablet' },
  { label: 'iPad 10.9"', pxPerMm: 10.4, aspectRatio: '4:3', category: 'tablet' },
  { label: 'iPad Mini', pxPerMm: 10.8, aspectRatio: '4:3', category: 'tablet' },
  { label: 'Samsung Galaxy Tab S9+', pxPerMm: 11.2, aspectRatio: '16:10', category: 'tablet' },
  // Smartphones
  { label: 'iPhone 15 Pro Max', pxPerMm: 18.0, aspectRatio: '19.5:9', category: 'phone' },
  { label: 'iPhone 15 Pro', pxPerMm: 18.1, aspectRatio: '19.5:9', category: 'phone' },
  { label: 'iPhone 14/15', pxPerMm: 17.5, aspectRatio: '19.5:9', category: 'phone' },
  { label: 'iPhone 13/14 Pro', pxPerMm: 18.0, aspectRatio: '19.5:9', category: 'phone' },
  { label: 'iPhone SE/Mini', pxPerMm: 16.2, aspectRatio: '19.5:9', category: 'phone' },
  { label: 'Samsung Galaxy S24 Ultra', pxPerMm: 17.2, aspectRatio: '19.3:9', category: 'phone' },
  { label: 'Samsung Galaxy S24/S23', pxPerMm: 17.0, aspectRatio: '19.5:9', category: 'phone' },
  { label: 'Google Pixel 8 Pro', pxPerMm: 16.8, aspectRatio: '20:9', category: 'phone' },
  { label: 'Google Pixel 8', pxPerMm: 17.2, aspectRatio: '20:9', category: 'phone' },
] as const

export type ScreenPresetCategory = 'tv' | 'monitor' | 'tablet' | 'phone'

export type ScreenPreset = (typeof SCREEN_PRESETS)[number]
