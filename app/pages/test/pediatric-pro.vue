<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCalibrationStore } from '~/stores/calibration'
import { useProModeStore } from '~/stores/proMode'
import { normalizeInput } from '~/utils/normalizeInput'
import { CONFIG, type ProTestTheme } from '~/utils/constants'
import {
  ACUITY_LINES,
  calculateOptotypeSize,
  type AcuityLine,
} from '~/utils/optotypeCalculations'

const { t } = useI18n()

definePageMeta({
  title: 'Pediátrico Pro',
  layout: false,
})

const router = useRouter()
const calibration = useCalibrationStore()
const proModeStore = useProModeStore()

// Formas pediátricas
const PEDIATRIC_SHAPES = [
  { id: 'circle', icon: 'mdi-circle' },
  { id: 'square', icon: 'mdi-square' },
  { id: 'triangle', icon: 'mdi-triangle' },
  { id: 'heart', icon: 'mdi-heart' },
  { id: 'star', icon: 'mdi-star' },
] as const

type ShapeId = (typeof PEDIATRIC_SHAPES)[number]['id']

// Estado
const isActive = ref(false)
const currentLineIndex = ref(CONFIG.PRO_START_LINE_INDEX)
const currentShapes = ref<ShapeId[]>([])
const theme = ref<ProTestTheme>('day')

// Computed
const currentLine = computed((): AcuityLine => {
  return ACUITY_LINES[currentLineIndex.value] ?? ACUITY_LINES[0]!
})

const optotypeSize = computed(() => {
  return calculateOptotypeSize(
    calibration.distanceM,
    calibration.pxPerMm,
    currentLine.value.logMAR,
    calibration.correctionFactor
  )
})

// Sempre 5 formas por linha no modo Pro
const shapesPerLine = computed(() => CONFIG.PRO_MAX_CHARS)

const canGoSmaller = computed(() => currentLineIndex.value < ACUITY_LINES.length - 1)
const canGoLarger = computed(() => currentLineIndex.value > 0)

const themeStyles = computed(() => {
  if (theme.value === 'day') {
    return { background: '#FFFFFF', color: '#000000' }
  }
  return { background: '#000000', color: '#FFFFFF' }
})

// Ações
function generateShapes() {
  const count = shapesPerLine.value
  const shapes: ShapeId[] = []
  let lastShape: ShapeId | undefined

  for (let i = 0; i < count; i++) {
    const available = PEDIATRIC_SHAPES.filter(s => s.id !== lastShape)
    const randomIndex = Math.floor(Math.random() * available.length)
    const shape = available[randomIndex]!
    shapes.push(shape.id)
    lastShape = shape.id
  }

  currentShapes.value = shapes
}

function start() {
  isActive.value = true
  currentLineIndex.value = CONFIG.PRO_START_LINE_INDEX
  generateShapes()
}

function exit() {
  isActive.value = false
  proModeStore.incrementTestCount()
  router.push('/tests')
}

function goSmaller() {
  if (canGoSmaller.value) {
    currentLineIndex.value++
    generateShapes()
  }
}

function goLarger() {
  if (canGoLarger.value) {
    currentLineIndex.value--
    generateShapes()
  }
}

function randomize() {
  generateShapes()
}

function toggleTheme() {
  theme.value = theme.value === 'night' ? 'day' : 'night'
}

function goToLine(index: number) {
  if (index >= 0 && index < ACUITY_LINES.length) {
    currentLineIndex.value = index
    generateShapes()
  }
}

function getShapeIcon(id: ShapeId): string {
  return PEDIATRIC_SHAPES.find(s => s.id === id)?.icon ?? 'mdi-circle'
}

// Navegação por teclado
function handleKeyDown(event: KeyboardEvent) {
  if (!isActive.value) return

  const action = normalizeInput(event)
  if (!action) return

  event.preventDefault()

  switch (action) {
    case 'down':
      goSmaller()
      break
    case 'up':
      goLarger()
      break
    case 'right':
    case 'confirm':
      randomize()
      break
    case 'left':
    case 'back':
      exit()
      break
  }
}

// Mostrar/ocultar controles touch
const showControls = ref(true)
let controlsTimeout: ReturnType<typeof setTimeout> | null = null

function showControlsTemporarily() {
  showControls.value = true
  if (controlsTimeout) clearTimeout(controlsTimeout)
  controlsTimeout = setTimeout(() => {
    showControls.value = false
  }, 3000)
}

function handleScreenTap() {
  if (!isActive.value) return
  showControlsTemporarily()
}

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  start()
  showControlsTemporarily()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
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
        <span class="indicator acuity">{{ currentLine.snellen }}</span>
        <span class="indicator">{{ calibration.distanceM }}m</span>
        <span class="indicator">logMAR {{ currentLine.logMAR }}</span>
      </div>

      <!-- Área central com formas -->
      <div class="optotype-area">
        <div 
          class="optotype-line"
          :style="{ gap: `${optotypeSize.fontSizePx * CONFIG.PRO_CHAR_SPACING}px` }"
        >
          <v-icon
            v-for="(shapeId, index) in currentShapes"
            :key="index"
            :icon="getShapeIcon(shapeId)"
            :size="optotypeSize.fontSizePx"
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

      <!-- Hint D-pad -->
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

/* Área das formas */
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
