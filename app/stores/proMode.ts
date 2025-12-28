// app/stores/proMode.ts
import { defineStore } from 'pinia'
import { CONFIG } from '~/utils/constants'

export interface ProModeState {
  // Pro Mode
  isProModeEnabled: boolean
  pin: string
  failedAttempts: number
  lockedUntil: number | null

  // Contador de testes
  testCount: number
  lastTestDate: string | null

  // Aparência
  highContrastEnabled: boolean

  // Locks
  settingsLocked: boolean
  calibrationLocked: boolean
}

const DEFAULT_STATE: ProModeState = {
  isProModeEnabled: false,
  pin: CONFIG.DEFAULT_PRO_PIN,
  failedAttempts: 0,
  lockedUntil: null,
  testCount: 0,
  lastTestDate: null,
  highContrastEnabled: false,
  settingsLocked: false,
  calibrationLocked: false,
}

export const useProModeStore = defineStore('proMode', {
  state: (): ProModeState => ({ ...DEFAULT_STATE }),

  getters: {
    // Nota: isLocked não pode ser um getter computado porque Date.now() não é reativo
    // Use checkIfLocked() action para verificar o estado atual
    
    lockRemainingMs(): number {
      if (!this.$state.lockedUntil) return 0
      const remaining = this.$state.lockedUntil - Date.now()
      return Math.max(0, remaining)
    },

    lockRemainingFormatted(): string {
      const ms = this.lockRemainingMs
      if (ms === 0) return ''
      const minutes = Math.floor(ms / 60000)
      const seconds = Math.ceil((ms % 60000) / 1000)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },

    canAccessSettings(): boolean {
      if (!this.isProModeEnabled) return true
      return !this.$state.settingsLocked
    },

    canAccessCalibration(): boolean {
      if (!this.isProModeEnabled) return true
      return !this.$state.calibrationLocked
    },
  },

  actions: {
    // Método para verificar se está bloqueado (não pode ser getter pois Date.now() não é reativo)
    isLocked(): boolean {
      if (!this.lockedUntil) return false
      return Date.now() < this.lockedUntil
    },

    enableProMode() {
      this.isProModeEnabled = true
    },

    disableProMode() {
      this.isProModeEnabled = false
      this.settingsLocked = false
      this.calibrationLocked = false
    },

    setPin(newPin: string) {
      if (newPin.length === 4 && /^\d{4}$/.test(newPin)) {
        this.pin = newPin
        this.failedAttempts = 0
        this.lockedUntil = null
      }
    },

    validatePin(inputPin: string): boolean {
      // Verificar se está bloqueado
      if (this.isLocked()) {
        return false
      }

      if (inputPin === this.pin) {
        this.failedAttempts = 0
        return true
      }

      // PIN incorreto
      this.failedAttempts++

      if (this.failedAttempts >= CONFIG.MAX_PIN_ATTEMPTS) {
        this.lockedUntil = Date.now() + CONFIG.PIN_LOCK_TIMEOUT
      }

      return false
    },

    resetLock() {
      this.failedAttempts = 0
      this.lockedUntil = null
    },

    incrementTestCount() {
      this.testCount++
      this.lastTestDate = new Date().toISOString().split('T')[0]
    },

    resetTestCount() {
      this.testCount = 0
      this.lastTestDate = null
    },

    setHighContrast(enabled: boolean) {
      this.highContrastEnabled = enabled
    },

    toggleHighContrast() {
      this.highContrastEnabled = !this.highContrastEnabled
    },

    setSettingsLock(locked: boolean) {
      this.settingsLocked = locked
    },

    setCalibrationLock(locked: boolean) {
      this.calibrationLocked = locked
    },

    // Unlock temporário com PIN (sessão atual)
    unlockWithPin(inputPin: string): boolean {
      if (this.validatePin(inputPin)) {
        // Desbloqueia temporariamente para esta sessão
        this.settingsLocked = false
        this.calibrationLocked = false
        return true
      }
      return false
    },

    reset() {
      Object.assign(this, { ...DEFAULT_STATE })
    },
  },

  persist: {
    key: 'tv-visual-check-pro-mode',
    pick: [
      'isProModeEnabled',
      'pin',
      'failedAttempts',
      'lockedUntil',
      'testCount',
      'lastTestDate',
      'highContrastEnabled',
      'settingsLocked',
      'calibrationLocked',
    ],
  },
})
