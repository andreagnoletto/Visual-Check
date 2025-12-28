// app/utils/__tests__/optotypeCalculations.test.ts
import { describe, it, expect } from 'vitest'
import {
  calculateOptotypeHeightMm,
  calculateOptotypeSize,
  calculateBaseOptotypeSize,
  generateRandomSequence,
  generateRandomDirection,
  calculateCharsPerLine,
  findClosestAcuityLine,
  isOptotypeSizeValid,
  ACUITY_LINES,
  OPTOTYPE_POOLS,
  DIRECTIONS,
} from '../optotypeCalculations'

describe('optotypeCalculations', () => {
  describe('calculateOptotypeHeightMm', () => {
    it('deve calcular altura correta para 20/20 a 3m', () => {
      // Para 20/20 (logMAR 0) a 3m, altura ≈ 4.36mm
      const height = calculateOptotypeHeightMm(3, 0)
      expect(height).toBeCloseTo(4.36, 1)
    })

    it('deve calcular altura correta para 20/200 a 3m', () => {
      // Para 20/200 (logMAR 1.0) a 3m, altura ≈ 43.6mm
      const height = calculateOptotypeHeightMm(3, 1.0)
      expect(height).toBeCloseTo(43.6, 0)
    })

    it('deve escalar proporcionalmente com a distância', () => {
      const height3m = calculateOptotypeHeightMm(3, 0)
      const height6m = calculateOptotypeHeightMm(6, 0)
      expect(height6m / height3m).toBeCloseTo(2, 1)
    })

    it('deve aumentar altura com logMAR maior', () => {
      const height20_20 = calculateOptotypeHeightMm(3, 0)
      const height20_40 = calculateOptotypeHeightMm(3, 0.3)
      expect(height20_40).toBeGreaterThan(height20_20)
    })
  })

  describe('calculateOptotypeSize', () => {
    it('deve retornar heightMm, heightPx e fontSizePx', () => {
      const result = calculateOptotypeSize(3, 3.0, 0)
      expect(result).toHaveProperty('heightMm')
      expect(result).toHaveProperty('heightPx')
      expect(result).toHaveProperty('fontSizePx')
    })

    it('deve converter mm para px corretamente', () => {
      const pxPerMm = 3.0
      const result = calculateOptotypeSize(3, pxPerMm, 0)
      expect(result.heightPx).toBeCloseTo(result.heightMm * pxPerMm, 1)
    })

    it('deve aplicar fator de correção', () => {
      const base = calculateOptotypeSize(3, 3.0, 0, 1.0)
      const corrected = calculateOptotypeSize(3, 3.0, 0, 1.1)
      expect(corrected.fontSizePx / base.fontSizePx).toBeCloseTo(1.1, 2)
    })
  })

  describe('calculateBaseOptotypeSize', () => {
    it('deve usar logMAR 0 (20/20)', () => {
      const base = calculateBaseOptotypeSize(3, 3.0)
      const explicit = calculateOptotypeSize(3, 3.0, 0)
      expect(base.heightMm).toBe(explicit.heightMm)
    })
  })

  describe('generateRandomSequence', () => {
    it('deve gerar sequência do tamanho correto', () => {
      const sequence = generateRandomSequence(OPTOTYPE_POOLS.snellen, 5)
      expect(sequence).toHaveLength(5)
    })

    it('deve usar apenas caracteres do pool', () => {
      const pool = OPTOTYPE_POOLS.snellen
      const sequence = generateRandomSequence(pool, 10)
      sequence.forEach((char) => {
        expect(pool).toContain(char)
      })
    })

    it('não deve ter caracteres consecutivos iguais', () => {
      const sequence = generateRandomSequence(OPTOTYPE_POOLS.snellen, 20)
      for (let i = 1; i < sequence.length; i++) {
        expect(sequence[i]).not.toBe(sequence[i - 1])
      }
    })

    it('deve evitar o último caractere especificado', () => {
      const pool = ['A', 'B', 'C']
      const sequence = generateRandomSequence(pool, 1, 'A')
      expect(sequence[0]).not.toBe('A')
    })
  })

  describe('generateRandomDirection', () => {
    it('deve retornar uma direção válida', () => {
      const direction = generateRandomDirection()
      expect(DIRECTIONS).toContain(direction)
    })

    it('deve evitar a última direção especificada', () => {
      // Testa 50 vezes para garantir
      for (let i = 0; i < 50; i++) {
        const direction = generateRandomDirection('up')
        expect(direction).not.toBe('up')
      }
    })
  })

  describe('calculateCharsPerLine', () => {
    it('deve respeitar mínimo de 3 caracteres', () => {
      const chars = calculateCharsPerLine(100, 50) // Espaço insuficiente
      expect(chars).toBeGreaterThanOrEqual(3)
    })

    it('deve respeitar máximo de 5 caracteres', () => {
      const chars = calculateCharsPerLine(10000, 10) // Muito espaço
      expect(chars).toBeLessThanOrEqual(5)
    })

    it('deve calcular baseado no espaço disponível', () => {
      const charsSmall = calculateCharsPerLine(300, 50)
      const charsLarge = calculateCharsPerLine(600, 50)
      expect(charsLarge).toBeGreaterThanOrEqual(charsSmall)
    })
  })

  describe('findClosestAcuityLine', () => {
    it('deve encontrar linha exata', () => {
      const line = findClosestAcuityLine(0.3)
      expect(line.snellen).toBe('20/40')
    })

    it('deve encontrar linha mais próxima', () => {
      const line = findClosestAcuityLine(0.25)
      // 0.25 está entre 0.2 e 0.3, mas mais perto de 0.3 (diff 0.05 vs 0.05)
      // O algoritmo retorna o primeiro encontrado, que pode ser 0.3
      expect([0.2, 0.3]).toContain(line.logMAR)
    })

    it('deve retornar 20/20 para logMAR 0', () => {
      const line = findClosestAcuityLine(0)
      expect(line.snellen).toBe('20/20')
    })
  })

  describe('isOptotypeSizeValid', () => {
    it('deve rejeitar tamanho muito pequeno', () => {
      const result = isOptotypeSizeValid(5, 1000)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('pequeno')
    })

    it('deve rejeitar tamanho muito grande', () => {
      const result = isOptotypeSizeValid(900, 1000)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('excede')
    })

    it('deve aceitar tamanho válido', () => {
      const result = isOptotypeSizeValid(50, 1000)
      expect(result.valid).toBe(true)
    })
  })

  describe('ACUITY_LINES', () => {
    it('deve ter 12 linhas (20/400 até 20/10)', () => {
      expect(ACUITY_LINES).toHaveLength(12)
    })

    it('deve estar ordenado por logMAR decrescente', () => {
      for (let i = 1; i < ACUITY_LINES.length; i++) {
        const current = ACUITY_LINES[i]!
        const previous = ACUITY_LINES[i - 1]!
        expect(current.logMAR).toBeLessThan(previous.logMAR)
      }
    })

    it('deve ter valores de decimalVA crescentes', () => {
      for (let i = 1; i < ACUITY_LINES.length; i++) {
        const current = ACUITY_LINES[i]!
        const previous = ACUITY_LINES[i - 1]!
        expect(current.decimalVA).toBeGreaterThan(previous.decimalVA)
      }
    })
  })
})
