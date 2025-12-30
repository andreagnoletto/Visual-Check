<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProAcuityTest } from '~/composables/useProAcuityTest'
import { useFontReady } from '~/composables/useFontReady'
import { useCalibrationStore } from '~/stores/calibration'
import { CONFIG } from '~/utils/constants'
import { ACUITY_LINES } from '~/utils/optotypeCalculations'

const { t } = useI18n()

definePageMeta({
  title: 'Landolt Pro',
  layout: false,
})

const calibration = useCalibrationStore()
const { isLoading: fontLoading } = useFontReady()

const {
  isActive,
  currentLine,
  currentSequence,
  currentDirections,
  optotypeSize,
  charsPerLine,
  theme,
  themeStyles,
  canGoSmaller,
  canGoLarger,
  start,
  exit,
  goSmaller,
  goLarger,
  randomize,
  toggleTheme,
  goToLine,
} = useProAcuityTest({ optotypeType: 'landolt' })

// Mostrar/ocultar controles touch
const showControls = ref(true)
let controlsTimeout: ReturnType<typeof setTimeout> | null = null

function showControlsTemporarily() {
  showControls.value = true
  if (controlsTimeout) clearTimeout(controlsTimeout)
  controlsTimeout = setTimeout(() => {
    showControls.value = false
  }, CONFIG.PRO_CONTROLS_HIDE_TIMEOUT)
}

function handleScreenTap() {
  if (!isActive.value) return
  showControlsTemporarily()
}

// Iniciar teste automaticamente ao montar
onMounted(() => {
  start()
  showControlsTemporarily()
})
</script>

<template>
  <div 
    class="pro-test-container"
    :style="{ 
      backgroundColor: themeStyles.background, 
      color: themeStyles.color 
    }"
    @click="handleScreenTap"
  >
    <!-- Loading fonte -->
    <div v-if="fontLoading" class="loading-overlay">
      <v-progress-circular indeterminate size="64" :color="themeStyles.color" />
    </div>

    <!-- Teste ativo -->
    <template v-else-if="isActive">
      <!-- Indicadores de acuidade (sempre visíveis) -->
      <div class="top-indicators">
        <span class="indicator acuity">{{ currentLine.snellen }}</span>
        <span class="indicator">{{ calibration.distanceM }}m</span>
        <span class="indicator">logMAR {{ currentLine.logMAR }}</span>
      </div>

      <!-- Área central com optótipos -->
      <div class="optotype-area">
        <div 
          class="optotype-line"
          :style="{ gap: `${optotypeSize.fontSizePx * CONFIG.PRO_CHAR_SPACING}px` }"
        >
          <LandoltC
            v-for="(direction, index) in currentDirections"
            :key="index"
            :size="optotypeSize.fontSizePx"
            :direction="direction"
            :color="themeStyles.color"
          />
        </div>
      </div>

      <!-- Controles touch discretos -->
      <div class="touch-controls" :class="{ 'visible': showControls }">
        <!-- Canto superior esquerdo: Sair -->
        <button 
          class="control-btn top-left"
          @click.stop="exit"
          :aria-label="$t('pro.exit')"
        >
          <v-icon icon="mdi-arrow-left" :color="themeStyles.color" />
        </button>

        <!-- Canto superior direito: Tema -->
        <button 
          class="control-btn top-right"
          @click.stop="toggleTheme"
          :aria-label="$t('pro.toggleTheme')"
        >
          <v-icon 
            :icon="theme === 'night' ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'" 
            :color="themeStyles.color" 
          />
        </button>

        <!-- Centro esquerdo: Maior -->
        <button 
          class="control-btn center-left"
          :disabled="!canGoLarger"
          @click.stop="goLarger"
          :aria-label="$t('pro.larger')"
        >
          <v-icon icon="mdi-arrow-up" :color="themeStyles.color" />
        </button>

        <!-- Centro direito: Menor -->
        <button 
          class="control-btn center-right"
          :disabled="!canGoSmaller"
          @click.stop="goSmaller"
          :aria-label="$t('pro.smaller')"
        >
          <v-icon icon="mdi-arrow-down" :color="themeStyles.color" />
        </button>

        <!-- Canto inferior direito: Randomizar -->
        <button 
          class="control-btn bottom-right"
          @click.stop="randomize"
          :aria-label="$t('pro.newLetters')"
        >
          <v-icon icon="mdi-refresh" :color="themeStyles.color" />
        </button>

        <!-- Canto inferior esquerdo: Linha específica -->
        <div class="control-btn bottom-left line-selector">
          <select 
            :value="currentLine.line - 1"
            :style="{ color: themeStyles.color }"
            @change="goToLine(Number(($event.target as HTMLSelectElement).value))"
            @click.stop
          >
            <option 
              v-for="(line, index) in ACUITY_LINES" 
              :key="line.line"
              :value="index"
              :style="{ color: '#000' }"
            >
              {{ line.snellen }}
            </option>
          </select>
        </div>
      </div>

      <!-- Hint D-pad (apenas quando controles visíveis) -->
      <div class="dpad-hint" :class="{ 'visible': showControls }">
        <span>{{ $t('pro.hints.up') }}</span>
        <span>{{ $t('pro.hints.down') }}</span>
        <span>{{ $t('pro.hints.right') }}</span>
        <span>{{ $t('pro.hints.left') }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pro-test-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow: hidden;
  user-select: none;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Indicadores de acuidade */
.top-indicators {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  transition: opacity 0.3s ease;
}

.indicator {
  font-size: 14px;
  font-family: system-ui, sans-serif;
  opacity: 0.5;
}

.indicator.acuity {
  font-size: 18px;
  font-weight: bold;
  opacity: 0.9;
}

/* Área dos optótipos */
.optotype-area {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
}

.optotype-line {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Controles touch */
.touch-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.touch-controls.visible {
  opacity: 1;
}

.control-btn {
  position: absolute;
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(128, 128, 128, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.control-btn:hover {
  background: rgba(128, 128, 128, 0.5);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn.top-left {
  top: 16px;
  left: 16px;
}

.control-btn.top-right {
  top: 16px;
  right: 16px;
}

.control-btn.center-left {
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
}

.control-btn.center-right {
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
}

.control-btn.bottom-left {
  bottom: 16px;
  left: 16px;
}

.control-btn.bottom-right {
  bottom: 16px;
  right: 16px;
}

/* Seletor de linha */
.line-selector {
  width: auto;
  border-radius: 8px;
  padding: 0 8px;
}

.line-selector select {
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

/* Hint D-pad */
.dpad-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  font-size: 12px;
  font-family: system-ui, sans-serif;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dpad-hint.visible {
  opacity: 0.4;
}
</style>
