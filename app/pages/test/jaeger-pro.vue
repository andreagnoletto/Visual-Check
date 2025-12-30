<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useJaegerProTest } from '~/composables/useJaegerProTest'
import { useCalibrationStore } from '~/stores/calibration'
import { JAEGER_LINES } from '~/utils/jaegerCalculations'
import { CONFIG } from '~/utils/constants'

const { t } = useI18n()

definePageMeta({
  title: 'Jaeger Pro',
  layout: false,
})

const calibration = useCalibrationStore()

const {
  isActive,
  currentLine,
  currentText,
  fontSize,
  distanceCm,
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
} = useJaegerProTest()

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
    <!-- Teste ativo -->
    <template v-if="isActive">
      <!-- Indicadores de acuidade (sempre visíveis) -->
      <div class="top-indicators">
        <span class="indicator acuity">{{ currentLine.jaeger }}</span>
        <span class="indicator">{{ currentLine.snellenNear }}</span>
        <span class="indicator">logMAR {{ currentLine.logMAR }}</span>
      </div>

      <!-- Área central com texto -->
      <div class="text-area">
        <p 
          class="reading-text"
          :style="{ fontSize: `${fontSize}px`, lineHeight: 1.5 }"
        >
          {{ currentText }}
        </p>
      </div>

      <!-- Distância recomendada (discreto) -->
      <div class="distance-indicator" :class="{ 'visible': showControls }">
        <v-icon icon="mdi-ruler" size="small" class="mr-1" />
        {{ distanceCm }}cm
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

        <!-- Centro esquerdo: Maior (aumenta texto) -->
        <button 
          class="control-btn center-left"
          :disabled="!canGoLarger"
          @click.stop="goLarger"
          :aria-label="$t('pro.larger')"
        >
          <v-icon icon="mdi-arrow-up" :color="themeStyles.color" />
        </button>

        <!-- Centro direito: Menor (diminui texto) -->
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
            :value="JAEGER_LINES.indexOf(currentLine)"
            :style="{ color: themeStyles.color }"
            @change="goToLine(Number(($event.target as HTMLSelectElement).value))"
            @click.stop
          >
            <option 
              v-for="(line, index) in JAEGER_LINES" 
              :key="line.jaeger"
              :value="index"
              :style="{ color: '#000' }"
            >
              {{ line.jaeger }}
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

/* Área do texto */
.text-area {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  padding: 20px;
  max-width: 90%;
}

.reading-text {
  font-family: 'Georgia', 'Times New Roman', serif;
  text-align: center;
  margin: 0;
}

/* Indicador de distância */
.distance-indicator {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-family: system-ui, sans-serif;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
}

.distance-indicator.visible {
  opacity: 0.5;
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
