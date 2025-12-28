// app/stores/__tests__/proMode.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProModeStore } from '../proMode'
import { CONFIG } from '~/utils/constants'

describe('useProModeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  describe('initial state', () => {
    it('should have correct default values', () => {
      const store = useProModeStore()

      expect(store.isProModeEnabled).toBe(false)
      expect(store.pin).toBe(CONFIG.DEFAULT_PRO_PIN)
      expect(store.failedAttempts).toBe(0)
      expect(store.lockedUntil).toBeNull()
      expect(store.testCount).toBe(0)
      expect(store.lastTestDate).toBeNull()
      expect(store.highContrastEnabled).toBe(false)
      expect(store.settingsLocked).toBe(false)
      expect(store.calibrationLocked).toBe(false)
    })
  })

  describe('Pro Mode toggle', () => {
    it('should enable Pro Mode', () => {
      const store = useProModeStore()

      store.enableProMode()

      expect(store.isProModeEnabled).toBe(true)
    })

    it('should disable Pro Mode and reset locks', () => {
      const store = useProModeStore()
      store.enableProMode()
      store.setSettingsLock(true)
      store.setCalibrationLock(true)

      store.disableProMode()

      expect(store.isProModeEnabled).toBe(false)
      expect(store.settingsLocked).toBe(false)
      expect(store.calibrationLocked).toBe(false)
    })
  })

  describe('PIN management', () => {
    it('should set a valid 4-digit PIN', () => {
      const store = useProModeStore()

      store.setPin('5678')

      expect(store.pin).toBe('5678')
    })

    it('should reject non-numeric PIN', () => {
      const store = useProModeStore()

      store.setPin('abcd')

      expect(store.pin).toBe(CONFIG.DEFAULT_PRO_PIN)
    })

    it('should reject PIN with wrong length', () => {
      const store = useProModeStore()

      store.setPin('123')
      expect(store.pin).toBe(CONFIG.DEFAULT_PRO_PIN)

      store.setPin('12345')
      expect(store.pin).toBe(CONFIG.DEFAULT_PRO_PIN)
    })

    it('should reset failed attempts when PIN is changed', () => {
      const store = useProModeStore()
      store.validatePin('wrong')
      store.validatePin('wrong')

      store.setPin('9999')

      expect(store.failedAttempts).toBe(0)
    })
  })

  describe('PIN validation', () => {
    it('should return true for correct PIN', () => {
      const store = useProModeStore()
      store.setPin('4321')

      const result = store.validatePin('4321')

      expect(result).toBe(true)
      expect(store.failedAttempts).toBe(0)
    })

    it('should return false for incorrect PIN', () => {
      const store = useProModeStore()

      const result = store.validatePin('wrong')

      expect(result).toBe(false)
      expect(store.failedAttempts).toBe(1)
    })

    it('should lock after max attempts', () => {
      const store = useProModeStore()

      for (let i = 0; i < CONFIG.MAX_PIN_ATTEMPTS; i++) {
        store.validatePin('wrong')
      }

      expect(store.isLocked()).toBe(true)
      expect(store.lockedUntil).not.toBeNull()
    })

    it('should not validate when locked', () => {
      const store = useProModeStore()
      for (let i = 0; i < CONFIG.MAX_PIN_ATTEMPTS; i++) {
        store.validatePin('wrong')
      }

      const result = store.validatePin(CONFIG.DEFAULT_PRO_PIN)

      expect(result).toBe(false)
    })

    it('should unlock after timeout', () => {
      const now = 1000000
      
      // Definir o tempo ANTES de bloquear
      vi.setSystemTime(now)
      
      const store = useProModeStore()
      
      for (let i = 0; i < CONFIG.MAX_PIN_ATTEMPTS; i++) {
        store.validatePin('wrong')
      }

      expect(store.isLocked()).toBe(true)
      expect(store.lockedUntil).toBe(now + CONFIG.PIN_LOCK_TIMEOUT)

      // Avançar o tempo além do timeout
      vi.setSystemTime(now + CONFIG.PIN_LOCK_TIMEOUT + 1)

      expect(store.isLocked()).toBe(false)
    })
  })

  describe('lock getters', () => {
    it('should return remaining time when locked', () => {
      const store = useProModeStore()
      for (let i = 0; i < CONFIG.MAX_PIN_ATTEMPTS; i++) {
        store.validatePin('wrong')
      }

      expect(store.lockRemainingMs).toBeGreaterThan(0)
      expect(store.lockRemainingFormatted).toMatch(/^\d+:\d{2}$/)
    })

    it('should return 0 when not locked', () => {
      const store = useProModeStore()

      expect(store.lockRemainingMs).toBe(0)
      expect(store.lockRemainingFormatted).toBe('')
    })
  })

  describe('access getters', () => {
    it('should allow access when Pro Mode is disabled', () => {
      const store = useProModeStore()
      store.setSettingsLock(true)
      store.setCalibrationLock(true)

      expect(store.canAccessSettings).toBe(true)
      expect(store.canAccessCalibration).toBe(true)
    })

    it('should check locks when Pro Mode is enabled', () => {
      const store = useProModeStore()
      store.enableProMode()
      store.setSettingsLock(true)
      store.setCalibrationLock(true)

      expect(store.canAccessSettings).toBe(false)
      expect(store.canAccessCalibration).toBe(false)
    })

    it('should allow access when locks are off', () => {
      const store = useProModeStore()
      store.enableProMode()

      expect(store.canAccessSettings).toBe(true)
      expect(store.canAccessCalibration).toBe(true)
    })
  })

  describe('test counter', () => {
    it('should increment test count', () => {
      const store = useProModeStore()

      store.incrementTestCount()

      expect(store.testCount).toBe(1)
      expect(store.lastTestDate).not.toBeNull()
    })

    it('should track multiple tests', () => {
      const store = useProModeStore()

      store.incrementTestCount()
      store.incrementTestCount()
      store.incrementTestCount()

      expect(store.testCount).toBe(3)
    })

    it('should reset test count', () => {
      const store = useProModeStore()
      store.incrementTestCount()
      store.incrementTestCount()

      store.resetTestCount()

      expect(store.testCount).toBe(0)
      expect(store.lastTestDate).toBeNull()
    })
  })

  describe('high contrast', () => {
    it('should enable high contrast', () => {
      const store = useProModeStore()

      store.setHighContrast(true)

      expect(store.highContrastEnabled).toBe(true)
    })

    it('should toggle high contrast', () => {
      const store = useProModeStore()

      store.toggleHighContrast()
      expect(store.highContrastEnabled).toBe(true)

      store.toggleHighContrast()
      expect(store.highContrastEnabled).toBe(false)
    })
  })

  describe('unlock with PIN', () => {
    it('should unlock all locks with correct PIN', () => {
      const store = useProModeStore()
      store.enableProMode()
      store.setSettingsLock(true)
      store.setCalibrationLock(true)

      const result = store.unlockWithPin(CONFIG.DEFAULT_PRO_PIN)

      expect(result).toBe(true)
      expect(store.settingsLocked).toBe(false)
      expect(store.calibrationLocked).toBe(false)
    })

    it('should not unlock with incorrect PIN', () => {
      const store = useProModeStore()
      store.enableProMode()
      store.setSettingsLock(true)

      const result = store.unlockWithPin('wrong')

      expect(result).toBe(false)
      expect(store.settingsLocked).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset to default state', () => {
      const store = useProModeStore()
      store.enableProMode()
      store.setPin('9999')
      store.incrementTestCount()
      store.setHighContrast(true)
      store.setSettingsLock(true)

      store.reset()

      expect(store.isProModeEnabled).toBe(false)
      expect(store.pin).toBe(CONFIG.DEFAULT_PRO_PIN)
      expect(store.testCount).toBe(0)
      expect(store.highContrastEnabled).toBe(false)
      expect(store.settingsLocked).toBe(false)
    })
  })
})
