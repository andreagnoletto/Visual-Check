// app/utils/__tests__/normalizeInput.test.ts
import { describe, it, expect } from 'vitest'
import {
  normalizeInput,
  isNavigationKey,
  isConfirmKey,
  isBackKey,
} from '../normalizeInput'

function createKeyboardEvent(key: string, keyCode?: number): KeyboardEvent {
  return {
    key,
    keyCode: keyCode ?? 0,
    preventDefault: () => {},
  } as KeyboardEvent
}

describe('normalizeInput', () => {
  describe('arrow keys', () => {
    it('deve reconhecer ArrowUp', () => {
      expect(normalizeInput(createKeyboardEvent('ArrowUp'))).toBe('up')
    })

    it('deve reconhecer ArrowDown', () => {
      expect(normalizeInput(createKeyboardEvent('ArrowDown'))).toBe('down')
    })

    it('deve reconhecer ArrowLeft', () => {
      expect(normalizeInput(createKeyboardEvent('ArrowLeft'))).toBe('left')
    })

    it('deve reconhecer ArrowRight', () => {
      expect(normalizeInput(createKeyboardEvent('ArrowRight'))).toBe('right')
    })
  })

  describe('confirm keys', () => {
    it('deve reconhecer Enter', () => {
      expect(normalizeInput(createKeyboardEvent('Enter'))).toBe('confirm')
    })

    it('deve reconhecer NumpadEnter', () => {
      expect(normalizeInput(createKeyboardEvent('NumpadEnter'))).toBe('confirm')
    })

    it('deve reconhecer Space', () => {
      expect(normalizeInput(createKeyboardEvent(' '))).toBe('confirm')
    })
  })

  describe('back keys', () => {
    it('deve reconhecer Escape', () => {
      expect(normalizeInput(createKeyboardEvent('Escape'))).toBe('back')
    })

    it('deve reconhecer Backspace', () => {
      expect(normalizeInput(createKeyboardEvent('Backspace'))).toBe('back')
    })
  })

  describe('fallback keyCode (TV)', () => {
    it('deve reconhecer keyCode 13 como confirm', () => {
      expect(normalizeInput(createKeyboardEvent('', 13))).toBe('confirm')
    })

    it('deve reconhecer keyCode 4 como back (Android)', () => {
      expect(normalizeInput(createKeyboardEvent('', 4))).toBe('back')
    })

    it('deve reconhecer keyCode 10009 como back (Tizen)', () => {
      expect(normalizeInput(createKeyboardEvent('', 10009))).toBe('back')
    })
  })

  describe('unknown keys', () => {
    it('deve retornar null para tecla desconhecida', () => {
      expect(normalizeInput(createKeyboardEvent('a'))).toBe(null)
    })
  })
})

describe('helper functions', () => {
  describe('isNavigationKey', () => {
    it('deve retornar true para setas', () => {
      expect(isNavigationKey(createKeyboardEvent('ArrowUp'))).toBe(true)
      expect(isNavigationKey(createKeyboardEvent('ArrowDown'))).toBe(true)
      expect(isNavigationKey(createKeyboardEvent('ArrowLeft'))).toBe(true)
      expect(isNavigationKey(createKeyboardEvent('ArrowRight'))).toBe(true)
    })

    it('deve retornar false para outras teclas', () => {
      expect(isNavigationKey(createKeyboardEvent('Enter'))).toBe(false)
      expect(isNavigationKey(createKeyboardEvent('Escape'))).toBe(false)
    })
  })

  describe('isConfirmKey', () => {
    it('deve retornar true para Enter/Space', () => {
      expect(isConfirmKey(createKeyboardEvent('Enter'))).toBe(true)
      expect(isConfirmKey(createKeyboardEvent(' '))).toBe(true)
    })

    it('deve retornar false para outras teclas', () => {
      expect(isConfirmKey(createKeyboardEvent('ArrowUp'))).toBe(false)
    })
  })

  describe('isBackKey', () => {
    it('deve retornar true para Escape/Backspace', () => {
      expect(isBackKey(createKeyboardEvent('Escape'))).toBe(true)
      expect(isBackKey(createKeyboardEvent('Backspace'))).toBe(true)
    })

    it('deve retornar false para outras teclas', () => {
      expect(isBackKey(createKeyboardEvent('Enter'))).toBe(false)
    })
  })
})
