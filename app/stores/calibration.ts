// app/stores/calibration.ts
import { defineStore } from 'pinia'
import { CONFIG, type UiMode } from '~/utils/constants'
import { syncUiModeOverride } from '~/composables/useUiMode'

export interface CalibrationState {
  schemaVersion: number
  distanceM: number
  pxPerMm: number
  aspectRatio: string
  correctionFactor: number
  uiModeOverride: UiMode | null
  isCalibrated: boolean
}

const DEFAULT_STATE: CalibrationState = {
  schemaVersion: CONFIG.SCHEMA_VERSION,
  distanceM: 3,
  pxPerMm: 3.0,
  aspectRatio: CONFIG.DEFAULT_ASPECT_RATIO,
  correctionFactor: 1.0,
  uiModeOverride: null,
  isCalibrated: false,
}

function migrateState(oldState: unknown, oldVersion: number): CalibrationState {
  if (oldVersion < CONFIG.SCHEMA_VERSION) {
    // Preservar dados da calibração se possível
    const old = oldState as Partial<CalibrationState>
    return {
      ...DEFAULT_STATE,
      distanceM: old.distanceM ?? DEFAULT_STATE.distanceM,
      pxPerMm: old.pxPerMm ?? DEFAULT_STATE.pxPerMm,
      aspectRatio: old.aspectRatio ?? DEFAULT_STATE.aspectRatio,
      uiModeOverride: old.uiModeOverride ?? null,
      isCalibrated: old.isCalibrated ?? false,
    }
  }
  return oldState as CalibrationState
}

export const useCalibrationStore = defineStore('calibration', {
  state: (): CalibrationState => ({ ...DEFAULT_STATE }),

  getters: {
    isDistanceValid: (state): boolean => {
      return state.distanceM >= CONFIG.MIN_DISTANCE_M && state.distanceM <= CONFIG.MAX_DISTANCE_M
    },

    isPxPerMmValid: (state): boolean => {
      return state.pxPerMm >= CONFIG.MIN_PX_PER_MM && state.pxPerMm <= CONFIG.MAX_PX_PER_MM
    },

    distanceWarning: (state): string | null => {
      if (state.distanceM < CONFIG.MIN_DISTANCE_M) {
        return `Distância muito curta. Mínimo recomendado: ${CONFIG.MIN_DISTANCE_M}m`
      }
      if (state.distanceM > CONFIG.MAX_DISTANCE_M) {
        return `Distância muito longa. Máximo recomendado: ${CONFIG.MAX_DISTANCE_M}m`
      }
      return null
    },

    pxPerMmWarning: (state): string | null => {
      if (state.pxPerMm < CONFIG.MIN_PX_PER_MM) {
        return `Densidade muito baixa. Mínimo: ${CONFIG.MIN_PX_PER_MM} px/mm`
      }
      if (state.pxPerMm > CONFIG.MAX_PX_PER_MM) {
        return `Densidade muito alta. Máximo: ${CONFIG.MAX_PX_PER_MM} px/mm`
      }
      return null
    },

    canStartTest(): boolean {
      return this.isCalibrated
    },
  },

  actions: {
    setDistance(distanceM: number) {
      this.distanceM = Math.max(1, Math.min(15, distanceM))
    },

    setPxPerMm(pxPerMm: number) {
      this.pxPerMm = Math.max(1, Math.min(10, pxPerMm))
    },

    setAspectRatio(aspectRatio: string) {
      this.aspectRatio = aspectRatio
    },

    setCorrectionFactor(factor: number) {
      this.correctionFactor = Math.max(
        CONFIG.MIN_CORRECTION_FACTOR,
        Math.min(CONFIG.MAX_CORRECTION_FACTOR, factor)
      )
    },

    setUiModeOverride(mode: UiMode | null) {
      this.uiModeOverride = mode
      syncUiModeOverride(mode)
    },

    applyPreset(pxPerMm: number, aspectRatio: string) {
      this.pxPerMm = pxPerMm
      this.aspectRatio = aspectRatio
    },

    completeCalibration() {
      this.isCalibrated = true
    },

    reset() {
      const uiOverride = this.uiModeOverride
      Object.assign(this, { ...DEFAULT_STATE, uiModeOverride: uiOverride })
    },

    fullReset() {
      Object.assign(this, { ...DEFAULT_STATE })
      syncUiModeOverride(null)
    },

    // Chamado ao hidratar o estado persistido
    syncAfterHydration() {
      if (this.uiModeOverride) {
        syncUiModeOverride(this.uiModeOverride)
      }
    },
  },

  persist: {
    key: 'tv-visual-check-calibration',
    pick: [
      'schemaVersion',
      'distanceM',
      'pxPerMm',
      'aspectRatio',
      'correctionFactor',
      'uiModeOverride',
      'isCalibrated',
    ],
    afterHydrate: (ctx) => {
      // Sincroniza o UI mode override após restaurar do storage
      const state = ctx.store.$state
      if (state.uiModeOverride) {
        syncUiModeOverride(state.uiModeOverride)
      }
    },
  },
})
