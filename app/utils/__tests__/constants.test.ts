// app/utils/__tests__/constants.test.ts
import { describe, it, expect } from 'vitest'
import { CONFIG, SCREEN_PRESETS } from '../constants'

describe('CONFIG', () => {
  describe('SAFE_MARGIN', () => {
    it('deve ter valores para TV, DESKTOP e TOUCH', () => {
      expect(CONFIG.SAFE_MARGIN.TV).toBeDefined()
      expect(CONFIG.SAFE_MARGIN.DESKTOP).toBeDefined()
      expect(CONFIG.SAFE_MARGIN.TOUCH).toBeDefined()
    })

    it('TV deve ter maior margem', () => {
      expect(CONFIG.SAFE_MARGIN.TV).toBeGreaterThan(CONFIG.SAFE_MARGIN.DESKTOP)
      expect(CONFIG.SAFE_MARGIN.DESKTOP).toBeGreaterThan(CONFIG.SAFE_MARGIN.TOUCH)
    })
  })

  describe('calibration limits', () => {
    it('deve ter limites de distância válidos', () => {
      expect(CONFIG.MIN_DISTANCE_M).toBeLessThan(CONFIG.MAX_DISTANCE_M)
      expect(CONFIG.MIN_DISTANCE_M).toBeGreaterThan(0)
    })

    it('deve ter limites de pxPerMm válidos', () => {
      expect(CONFIG.MIN_PX_PER_MM).toBeLessThan(CONFIG.MAX_PX_PER_MM)
      expect(CONFIG.MIN_PX_PER_MM).toBeGreaterThan(0)
    })
  })

  describe('SCHEMA_VERSION', () => {
    it('deve ser um número positivo', () => {
      expect(CONFIG.SCHEMA_VERSION).toBeGreaterThan(0)
    })
  })
})

describe('SCREEN_PRESETS', () => {
  it('deve ter pelo menos 5 presets', () => {
    expect(SCREEN_PRESETS.length).toBeGreaterThanOrEqual(5)
  })

  it('cada preset deve ter label, pxPerMm e aspectRatio', () => {
    SCREEN_PRESETS.forEach((preset) => {
      expect(preset.label).toBeDefined()
      expect(typeof preset.label).toBe('string')
      expect(preset.pxPerMm).toBeGreaterThan(0)
      expect(preset.aspectRatio).toBeDefined()
    })
  })

  it('pxPerMm deve estar dentro dos limites', () => {
    SCREEN_PRESETS.forEach((preset) => {
      expect(preset.pxPerMm).toBeGreaterThanOrEqual(CONFIG.MIN_PX_PER_MM)
      expect(preset.pxPerMm).toBeLessThanOrEqual(CONFIG.MAX_PX_PER_MM)
    })
  })
})
