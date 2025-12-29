// app/utils/optotypeCalculations.ts
import { CONFIG } from './constants'

/**
 * Linhas de acuidade visual (Snellen)
 * logMAR = logaritmo do Minimum Angle of Resolution
 */
export const ACUITY_LINES = [
  { line: 1, logMAR: 1.3, snellen: '20/400', decimalVA: 0.05 },
  { line: 2, logMAR: 1.0, snellen: '20/200', decimalVA: 0.1 },
  { line: 3, logMAR: 0.9, snellen: '20/160', decimalVA: 0.125 },
  { line: 4, logMAR: 0.7, snellen: '20/100', decimalVA: 0.2 },
  { line: 5, logMAR: 0.5, snellen: '20/63', decimalVA: 0.32 },
  { line: 6, logMAR: 0.3, snellen: '20/40', decimalVA: 0.5 },
  { line: 7, logMAR: 0.2, snellen: '20/32', decimalVA: 0.63 },
  { line: 8, logMAR: 0.1, snellen: '20/25', decimalVA: 0.8 },
  { line: 9, logMAR: 0.0, snellen: '20/20', decimalVA: 1.0 },
  { line: 10, logMAR: -0.1, snellen: '20/16', decimalVA: 1.25 },
  { line: 11, logMAR: -0.2, snellen: '20/12', decimalVA: 1.6 },
  { line: 12, logMAR: -0.3, snellen: '20/10', decimalVA: 2.0 },
] as const

export type AcuityLine = (typeof ACUITY_LINES)[number]

/**
 * Pools de caracteres para diferentes tipos de teste
 */
export const OPTOTYPE_POOLS = {
  snellen: ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z'],
  directional: ['E'], // Usado com rotações
  pediatric: ['●', '■', '▲', '♥', '★'],
  landolt: ['C'], // Anel de Landolt - usado com rotações
} as const

export type OptotypeType = keyof typeof OPTOTYPE_POOLS

/**
 * Direções para o teste direcional (Tumbling E)
 */
export const DIRECTIONS = ['right', 'down', 'left', 'up'] as const
export type Direction = (typeof DIRECTIONS)[number]

export const DIRECTION_TO_ROTATION: Record<Direction, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
}

/**
 * Calcula a altura do optótipo em mm para uma dada linha de acuidade e distância
 * 
 * Fórmula: height = distance * tan(5' * 10^logMAR)
 * Onde 5' (5 minutos de arco) é o ângulo padrão para um optótipo 20/20
 */
export function calculateOptotypeHeightMm(
  distanceM: number,
  logMAR: number
): number {
  // 5 minutos de arco em radianos
  const fiveMinutesRad = (5 / 60) * (Math.PI / 180)
  // Ângulo ajustado pelo logMAR
  const angleRad = fiveMinutesRad * Math.pow(10, logMAR)
  // Altura em mm
  return distanceM * Math.tan(angleRad) * 1000
}

/**
 * Calcula o tamanho do optótipo em pixels
 */
export function calculateOptotypeSize(
  distanceM: number,
  pxPerMm: number,
  logMAR: number,
  correctionFactor: number = 1.0
): {
  heightMm: number
  heightPx: number
  fontSizePx: number
} {
  const heightMm = calculateOptotypeHeightMm(distanceM, logMAR)
  const heightPx = heightMm * pxPerMm
  // O font-size precisa de um fator de escala porque a altura da letra
  // não é igual ao font-size em CSS
  const fontSizePx = heightPx * CONFIG.OPTOTYPE_FONT_SCALE * correctionFactor

  return {
    heightMm,
    heightPx,
    fontSizePx,
  }
}

/**
 * Calcula o tamanho para a linha padrão 20/20 (logMAR 0)
 */
export function calculateBaseOptotypeSize(
  distanceM: number,
  pxPerMm: number,
  correctionFactor: number = 1.0
) {
  return calculateOptotypeSize(distanceM, pxPerMm, 0, correctionFactor)
}

/**
 * Gera uma sequência aleatória de caracteres para um teste
 * Evita repetições consecutivas
 */
export function generateRandomSequence(
  pool: readonly string[],
  length: number,
  avoidLast?: string
): string[] {
  const result: string[] = []
  let lastChar = avoidLast

  for (let i = 0; i < length; i++) {
    const available = pool.filter((c) => c !== lastChar)
    const randomIndex = Math.floor(Math.random() * available.length)
    const char = available[randomIndex]!
    result.push(char)
    lastChar = char
  }

  return result
}

/**
 * Gera uma direção aleatória para o teste direcional
 */
export function generateRandomDirection(avoidLast?: Direction): Direction {
  const available = DIRECTIONS.filter((d) => d !== avoidLast)
  const randomIndex = Math.floor(Math.random() * available.length)
  return available[randomIndex]!
}

/**
 * Calcula quantos caracteres cabem em uma linha baseado na largura disponível
 */
export function calculateCharsPerLine(
  availableWidthPx: number,
  fontSizePx: number,
  minChars: number = 3,
  maxChars: number = 5
): number {
  // Estimativa: cada caractere ocupa aproximadamente 1.2x o font-size (com espaçamento)
  const charWidth = fontSizePx * 1.2
  const maxPossible = Math.floor(availableWidthPx / charWidth)
  return Math.max(minChars, Math.min(maxChars, maxPossible))
}

/**
 * Encontra a linha de acuidade mais próxima de um logMAR dado
 */
export function findClosestAcuityLine(logMAR: number): AcuityLine {
  let closest: AcuityLine = ACUITY_LINES[0]!
  let minDiff = Math.abs(logMAR - closest.logMAR)

  for (const line of ACUITY_LINES) {
    const diff = Math.abs(logMAR - line.logMAR)
    if (diff < minDiff) {
      minDiff = diff
      closest = line
    }
  }

  return closest
}

/**
 * Verifica se o tamanho calculado é viável para a tela
 */
export function isOptotypeSizeValid(
  fontSizePx: number,
  viewportHeight: number,
  minFontSize: number = 10,
  maxPercentOfScreen: number = 0.8
): { valid: boolean; reason?: string } {
  if (fontSizePx < minFontSize) {
    return { valid: false, reason: 'Tamanho muito pequeno para exibição' }
  }

  if (fontSizePx > viewportHeight * maxPercentOfScreen) {
    return { valid: false, reason: 'Tamanho excede a altura da tela' }
  }

  return { valid: true }
}
