// app/utils/deviceDetection.ts
import { SCREEN_PRESETS, type ScreenPresetCategory } from './constants'

export interface DeviceDetectionResult {
  presetIndex: number | null
  category: ScreenPresetCategory | null
  confidence: 'high' | 'medium' | 'low'
  detectedDevice: string | null
}

interface DevicePattern {
  pattern: RegExp
  category: ScreenPresetCategory
  presetLabel?: string
}

// Padrões de UserAgent para identificar dispositivos
const DEVICE_PATTERNS: DevicePattern[] = [
  // iPhones
  { pattern: /iPhone15,\d.*Pro Max|iPhone 15 Pro Max/i, category: 'phone', presetLabel: 'iPhone 15 Pro Max' },
  { pattern: /iPhone15,\d.*Pro|iPhone 15 Pro/i, category: 'phone', presetLabel: 'iPhone 15 Pro' },
  { pattern: /iPhone15,\d|iPhone 15|iPhone14,\d/i, category: 'phone', presetLabel: 'iPhone 14/15' },
  { pattern: /iPhone13,\d.*Pro|iPhone 13 Pro|iPhone14.*Pro/i, category: 'phone', presetLabel: 'iPhone 13/14 Pro' },
  { pattern: /iPhone SE|iPhone.*Mini/i, category: 'phone', presetLabel: 'iPhone SE/Mini' },
  { pattern: /iPhone/i, category: 'phone' },
  
  // iPads
  { pattern: /iPad.*Pro.*12[.,]9|iPad Pro 12\.9/i, category: 'tablet', presetLabel: 'iPad Pro 12.9"' },
  { pattern: /iPad.*Pro.*11|iPad Pro 11/i, category: 'tablet', presetLabel: 'iPad Pro 11"' },
  { pattern: /iPad.*Mini/i, category: 'tablet', presetLabel: 'iPad Mini' },
  { pattern: /iPad/i, category: 'tablet', presetLabel: 'iPad 10.9"' },
  
  // Samsung Galaxy
  { pattern: /SM-S92\d|Galaxy S24 Ultra/i, category: 'phone', presetLabel: 'Samsung Galaxy S24 Ultra' },
  { pattern: /SM-S91\d|SM-S90\d|Galaxy S24|Galaxy S23/i, category: 'phone', presetLabel: 'Samsung Galaxy S24/S23' },
  { pattern: /SM-X91\d|Galaxy Tab S9/i, category: 'tablet', presetLabel: 'Samsung Galaxy Tab S9+' },
  { pattern: /SM-|Galaxy/i, category: 'phone' },
  
  // Google Pixel
  { pattern: /Pixel 8 Pro/i, category: 'phone', presetLabel: 'Google Pixel 8 Pro' },
  { pattern: /Pixel 8/i, category: 'phone', presetLabel: 'Google Pixel 8' },
  { pattern: /Pixel/i, category: 'phone' },
  
  // Genéricos
  { pattern: /Mobile|Android.*Mobile/i, category: 'phone' },
  { pattern: /Tablet|Android(?!.*Mobile)/i, category: 'tablet' },
]

/**
 * Detecta o dispositivo baseado no UserAgent e características da tela
 */
export function detectDevice(): DeviceDetectionResult {
  // Verificar se estamos no navegador
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      presetIndex: null,
      category: null,
      confidence: 'low',
      detectedDevice: null,
    }
  }

  const userAgent = navigator.userAgent
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height
  const devicePixelRatio = window.devicePixelRatio || 1

  // Tentar identificar por UserAgent
  for (const device of DEVICE_PATTERNS) {
    if (device.pattern.test(userAgent)) {
      // Se temos um preset específico, encontrar o índice
      if (device.presetLabel) {
        const presetIndex = SCREEN_PRESETS.findIndex(p => p.label === device.presetLabel)
        if (presetIndex !== -1) {
          return {
            presetIndex,
            category: device.category,
            confidence: 'high',
            detectedDevice: device.presetLabel,
          }
        }
      }
      
      // Encontrar o melhor preset da categoria
      const categoryPresets = SCREEN_PRESETS
        .map((preset, index) => ({ preset, index }))
        .filter(({ preset }) => preset.category === device.category)
      
      if (categoryPresets.length > 0) {
        // Escolher o primeiro preset da categoria como fallback
        return {
          presetIndex: categoryPresets[0]!.index,
          category: device.category,
          confidence: 'medium',
          detectedDevice: categoryPresets[0]!.preset.label,
        }
      }
    }
  }

  // Detectar por características da tela
  const category = detectCategoryByScreen(screenWidth, screenHeight, devicePixelRatio)
  
  if (category) {
    const categoryPresets = SCREEN_PRESETS
      .map((preset, index) => ({ preset, index }))
      .filter(({ preset }) => preset.category === category)
    
    if (categoryPresets.length > 0) {
      // Tentar encontrar o melhor match baseado em pixel density
      const estimatedPxPerMm = estimatePixelDensity(screenWidth, screenHeight, devicePixelRatio, category)
      
      let bestMatch = categoryPresets[0]!
      let smallestDiff = Math.abs(categoryPresets[0]!.preset.pxPerMm - estimatedPxPerMm)
      
      for (const item of categoryPresets) {
        const diff = Math.abs(item.preset.pxPerMm - estimatedPxPerMm)
        if (diff < smallestDiff) {
          smallestDiff = diff
          bestMatch = item
        }
      }
      
      return {
        presetIndex: bestMatch.index,
        category,
        confidence: 'medium',
        detectedDevice: bestMatch.preset.label,
      }
    }
  }

  // Não conseguiu detectar
  return {
    presetIndex: null,
    category: null,
    confidence: 'low',
    detectedDevice: null,
  }
}

/**
 * Detecta a categoria do dispositivo baseado nas dimensões da tela
 */
function detectCategoryByScreen(
  width: number,
  height: number,
  devicePixelRatio: number
): ScreenPresetCategory | null {
  // Dimensões físicas aproximadas (considerando pixel ratio)
  const physicalWidth = Math.max(width, height)
  const physicalHeight = Math.min(width, height)
  
  // Smartphones: tela pequena, alto DPR
  if (physicalWidth <= 450 && devicePixelRatio >= 2) {
    return 'phone'
  }
  
  // Tablets: tela média, DPR variado
  if (physicalWidth > 450 && physicalWidth <= 1400 && devicePixelRatio >= 1.5) {
    return 'tablet'
  }
  
  // Monitores/TVs: tela grande
  if (physicalWidth > 1400) {
    // Tentar diferenciar monitor de TV pelo aspect ratio
    const ratio = physicalWidth / physicalHeight
    if (ratio > 1.7) {
      return 'tv'
    }
    return 'monitor'
  }
  
  return null
}

/**
 * Estima a densidade de pixels baseado no tipo de dispositivo
 */
function estimatePixelDensity(
  screenWidth: number,
  screenHeight: number,
  devicePixelRatio: number,
  category: ScreenPresetCategory
): number {
  // Valores aproximados baseados em médias de mercado
  switch (category) {
    case 'phone':
      // Smartphones típicos: 400-450 PPI, que dá ~16-18 px/mm
      return 17 * (devicePixelRatio / 3)
    case 'tablet':
      // Tablets típicos: 260-330 PPI, que dá ~10-13 px/mm
      return 10.5 * (devicePixelRatio / 2)
    case 'monitor':
      // Monitores típicos: 100-160 PPI
      return 5.5
    case 'tv':
      // TVs típicas: 40-80 PPI
      return 3.0
    default:
      return 3.0
  }
}

/**
 * Verifica se o dispositivo é móvel (phone ou tablet)
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  
  const userAgent = navigator.userAgent
  return /Mobile|Android|iPhone|iPad|iPod|Tablet/i.test(userAgent)
}

/**
 * Verifica se o dispositivo é um smartphone
 */
export function isPhoneDevice(): boolean {
  const result = detectDevice()
  return result.category === 'phone'
}

/**
 * Verifica se o dispositivo é um tablet
 */
export function isTabletDevice(): boolean {
  const result = detectDevice()
  return result.category === 'tablet'
}
