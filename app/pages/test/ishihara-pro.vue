<script setup lang="ts">
/**
 * Ishihara Pro - Versão profissional do teste de cores
 * 
 * Interface minimalista para uso profissional com:
 * - Navegação por D-pad/teclado
 * - Controles touch discretos
 * - Modo escuro/claro
 * - Sem distrações visuais
 */
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useIshiharaTest } from '~/composables/useIshiharaTest'
import { CONFIG } from '~/utils/constants'
import { normalizeInput } from '~/utils/normalizeInput'

const { t } = useI18n()

definePageMeta({
  title: 'Ishihara Pro',
  layout: false,
})

const router = useRouter()

const {
  phase,
  currentPlate,
  progress,
  result,
  plates,
  startTest,
  submitAnswer,
  cannotSee,
  restartTest,
} = useIshiharaTest()

// Tema
const theme = ref<'day' | 'night'>('day')
const themeStyles = computed(() => ({
  background: theme.value === 'night' ? '#121212' : '#f5f5f5',
  color: theme.value === 'night' ? '#ffffff' : '#212121',
  surface: theme.value === 'night' ? '#1e1e1e' : '#ffffff',
}))

// Tamanho da placa responsivo
const plateSize = ref(320)

function updatePlateSize() {
  plateSize.value = Math.min(360, Math.min(window.innerWidth, window.innerHeight) * 0.55)
}

// Controles touch
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
  showControlsTemporarily()
}

// Input de resposta
const userInput = ref('')
const showKeypad = ref(true)

// Navegação
function handleKeyDown(event: KeyboardEvent) {
  const action = normalizeInput(event)
  
  if (!action) return
  
  showControlsTemporarily()
  
  // Números diretos
  if (event.key >= '0' && event.key <= '9') {
    event.preventDefault()
    userInput.value += event.key
    return
  }
  
  // Backspace
  if (event.key === 'Backspace') {
    event.preventDefault()
    userInput.value = userInput.value.slice(0, -1)
    return
  }
  
  // Enter/OK para confirmar
  if (action === 'confirm' && userInput.value) {
    event.preventDefault()
    handleSubmit()
    return
  }
  
  // Escape/Back para sair
  if (action === 'back') {
    event.preventDefault()
    exit()
    return
  }
  
  // Setas para navegação rápida
  if (action === 'left') {
    event.preventDefault()
    // Placa anterior (se possível)
    goToPreviousPlate()
    return
  }
  
  if (action === 'right') {
    event.preventDefault()
    // Próxima placa (pula)
    cannotSee()
    return
  }
}

// Navegação entre placas
const canGoPrevious = computed(() => progress.value.current > 1)

function goToPreviousPlate() {
  // Não implementado para o teste (sem voltar)
}

// Ações
function handleNumberClick(num: string) {
  userInput.value += num
}

function handleClear() {
  userInput.value = ''
}

function handleSubmit() {
  if (userInput.value) {
    submitAnswer(userInput.value)
    userInput.value = ''
  }
}

function handleCannotSee() {
  cannotSee()
  userInput.value = ''
}

function toggleTheme() {
  theme.value = theme.value === 'day' ? 'night' : 'day'
}

function exit() {
  router.push('/tests-pro')
}

function restart() {
  restartTest()
  userInput.value = ''
}

// Iniciar teste automaticamente
onMounted(() => {
  updatePlateSize()
  window.addEventListener('resize', updatePlateSize)
  startTest()
  showControlsTemporarily()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', updatePlateSize)
  if (controlsTimeout) clearTimeout(controlsTimeout)
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
    <template v-if="phase === 'testing'">
      <!-- Indicadores superiores -->
      <div class="top-indicators">
        <span class="indicator">{{ $t('tests.ishihara.plate') }} {{ progress.current }}/{{ progress.total }}</span>
      </div>

      <!-- Progress bar sutil -->
      <div class="progress-bar-container">
        <div 
          class="progress-bar-fill"
          :style="{ width: `${progress.percentage}%` }"
        />
      </div>

      <!-- Placa central -->
      <div class="plate-area">
        <IshiharaPlate 
          :plate-id="currentPlate.id" 
          :size="plateSize"
          class="plate"
        />
      </div>

      <!-- Input de resposta -->
      <div class="input-area">
        <div 
          class="number-display"
          :style="{ 
            backgroundColor: themeStyles.surface,
            color: themeStyles.color,
            borderColor: themeStyles.color
          }"
        >
          {{ userInput || '?' }}
        </div>
      </div>

      <!-- Teclado numérico -->
      <div class="keypad" :class="{ 'visible': showControls }">
        <div class="keypad-row">
          <button 
            v-for="num in ['1', '2', '3']" 
            :key="num" 
            class="keypad-btn"
            :style="{ backgroundColor: themeStyles.surface, color: themeStyles.color }"
            @click.stop="handleNumberClick(num)"
          >
            {{ num }}
          </button>
        </div>
        <div class="keypad-row">
          <button 
            v-for="num in ['4', '5', '6']" 
            :key="num" 
            class="keypad-btn"
            :style="{ backgroundColor: themeStyles.surface, color: themeStyles.color }"
            @click.stop="handleNumberClick(num)"
          >
            {{ num }}
          </button>
        </div>
        <div class="keypad-row">
          <button 
            v-for="num in ['7', '8', '9']" 
            :key="num" 
            class="keypad-btn"
            :style="{ backgroundColor: themeStyles.surface, color: themeStyles.color }"
            @click.stop="handleNumberClick(num)"
          >
            {{ num }}
          </button>
        </div>
        <div class="keypad-row">
          <button 
            class="keypad-btn action"
            :style="{ backgroundColor: '#ef5350', color: '#fff' }"
            @click.stop="handleClear"
          >
            ⌫
          </button>
          <button 
            class="keypad-btn"
            :style="{ backgroundColor: themeStyles.surface, color: themeStyles.color }"
            @click.stop="handleNumberClick('0')"
          >
            0
          </button>
          <button 
            class="keypad-btn action"
            :style="{ backgroundColor: '#66bb6a', color: '#fff' }"
            :disabled="!userInput"
            @click.stop="handleSubmit"
          >
            ✓
          </button>
        </div>
      </div>

      <!-- Controles discretos -->
      <div class="touch-controls" :class="{ 'visible': showControls }">
        <!-- Sair -->
        <button 
          class="control-btn top-left"
          @click.stop="exit"
          :aria-label="$t('pro.exit')"
        >
          <v-icon icon="mdi-arrow-left" :color="themeStyles.color" />
        </button>

        <!-- Tema -->
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

        <!-- Não vejo -->
        <button 
          class="control-btn bottom-left cannot-see"
          @click.stop="handleCannotSee"
          :style="{ color: themeStyles.color }"
        >
          <v-icon icon="mdi-eye-off" :color="themeStyles.color" size="small" class="mr-1" />
          <span class="btn-text">{{ $t('tests.ishihara.cannotSee') }}</span>
        </button>
      </div>
    </template>

    <!-- Resultados -->
    <template v-else-if="phase === 'finished' && result">
      <div class="results-container">
        <div 
          class="results-card"
          :style="{ backgroundColor: themeStyles.surface }"
        >
          <h2 class="text-h5 mb-4">{{ $t('results.title') }}</h2>
          
          <div class="score-display mb-4">
            <span class="score">{{ result.correctAnswers }}</span>
            <span class="separator">/</span>
            <span class="total">{{ result.totalPlates }}</span>
          </div>

          <p class="diagnosis mb-2">
            {{ $t(`results.ishihara.deficiency.${result.possibleDeficiency}`) }}
          </p>
          
          <p class="confidence mb-6" :class="result.confidence">
            {{ $t(`results.confidence.${result.confidence}`) }}
          </p>

          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-6"
          >
            {{ $t('results.disclaimer') }}
          </v-alert>

          <div class="action-buttons">
            <v-btn
              variant="outlined"
              @click="restart"
            >
              {{ $t('tests.restart') }}
            </v-btn>
            <v-btn
              color="primary"
              @click="exit"
            >
              {{ $t('nav.back') }}
            </v-btn>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pro-test-container {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

/* Indicadores superiores */
.top-indicators {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  z-index: 10;
}

.indicator {
  font-size: 14px;
  opacity: 0.7;
  font-weight: 500;
}

/* Progress bar */
.progress-bar-container {
  position: absolute;
  top: 48px;
  left: 24px;
  right: 24px;
  height: 4px;
  background: rgba(128, 128, 128, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s ease;
}

/* Área da placa */
.plate-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px 120px;
}

.plate {
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.15));
}

/* Input de resposta */
.input-area {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
}

.number-display {
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  min-width: 100px;
  padding: 12px 24px;
  border-radius: 12px;
  border: 2px solid;
}

/* Teclado numérico */
.keypad {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.keypad:not(.visible) {
  opacity: 0.3;
}

.keypad-row {
  display: flex;
  gap: 8px;
}

.keypad-btn {
  width: 60px;
  height: 50px;
  border: none;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.keypad-btn:active {
  transform: scale(0.95);
}

.keypad-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.keypad-btn.action {
  font-size: 20px;
}

/* Controles touch */
.touch-controls {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.touch-controls.visible {
  opacity: 1;
}

.control-btn {
  position: fixed;
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 100;
}

.control-btn:hover {
  background: rgba(128, 128, 128, 0.2);
}

.control-btn.top-left {
  top: 16px;
  left: 16px;
}

.control-btn.top-right {
  top: 16px;
  right: 16px;
}

.control-btn.bottom-left {
  bottom: 200px;
  left: 16px;
  width: auto;
  border-radius: 24px;
  padding: 8px 16px;
  font-size: 12px;
}

.control-btn.cannot-see {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-text {
  white-space: nowrap;
}

/* Resultados */
.results-container {
  width: 100%;
  max-width: 500px;
  padding: 24px;
}

.results-card {
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.score {
  font-size: 64px;
  font-weight: bold;
  color: #4caf50;
}

.separator {
  font-size: 32px;
  opacity: 0.5;
}

.total {
  font-size: 32px;
  opacity: 0.7;
}

.diagnosis {
  font-size: 18px;
  font-weight: 500;
}

.confidence {
  font-size: 14px;
  opacity: 0.7;
}

.confidence.high {
  color: #4caf50;
}

.confidence.medium {
  color: #ff9800;
}

.confidence.low {
  color: #f44336;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Responsivo */
@media (max-width: 400px) {
  .keypad-btn {
    width: 52px;
    height: 44px;
    font-size: 20px;
  }
  
  .number-display {
    font-size: 36px;
    padding: 8px 20px;
  }
  
  .input-area {
    bottom: 180px;
  }
}
</style>
