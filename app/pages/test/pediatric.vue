<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCalibrationStore } from '~/stores/calibration'
import { useProModeStore } from '~/stores/proMode'
import { normalizeInput } from '~/utils/normalizeInput'
import {
  ACUITY_LINES,
  calculateOptotypeSize,
  type AcuityLine,
} from '~/utils/optotypeCalculations'

const { t } = useI18n()

definePageMeta({
  title: 'Teste Pediátrico',
})

const router = useRouter()
const calibration = useCalibrationStore()
const proModeStore = useProModeStore()

// Formas pediátricas com SVG
const PEDIATRIC_SHAPES = [
  { id: 'circle', label: 'Círculo', icon: 'mdi-circle' },
  { id: 'square', label: 'Quadrado', icon: 'mdi-square' },
  { id: 'triangle', label: 'Triângulo', icon: 'mdi-triangle' },
  { id: 'heart', label: 'Coração', icon: 'mdi-heart' },
  { id: 'star', label: 'Estrela', icon: 'mdi-star' },
] as const

type ShapeId = (typeof PEDIATRIC_SHAPES)[number]['id']

// Estado do teste
type TestPhase = 'ready' | 'testing' | 'finished'

interface TestResult {
  line: AcuityLine
  correct: number
  total: number
  passed: boolean
}

const phase = ref<TestPhase>('ready')
const currentLineIndex = ref(0)
const currentAttempt = ref(0)
const correctCount = ref(0)
const results = ref<TestResult[]>([])
const currentShape = ref<ShapeId>('circle')

const attemptsPerLine = 5
const requiredCorrect = 3

// Computed
const currentLine = computed((): AcuityLine => {
  return ACUITY_LINES[currentLineIndex.value]!
})

const optotypeSize = computed(() => {
  return calculateOptotypeSize(
    calibration.distanceM,
    calibration.pxPerMm,
    currentLine.value.logMAR,
    calibration.correctionFactor
  )
})

const progress = computed(() => ({
  line: currentLineIndex.value + 1,
  totalLines: ACUITY_LINES.length,
  attempt: currentAttempt.value + 1,
  attemptsInLine: attemptsPerLine,
}))

const isLastLine = computed(() => {
  return currentLineIndex.value >= ACUITY_LINES.length - 1
})

const bestResult = computed((): TestResult | null => {
  const passed = results.value.filter(r => r.passed)
  if (passed.length === 0) return null
  return passed.reduce((best, current) => 
    current.line.logMAR < best.line.logMAR ? current : best
  )
})

const currentShapeData = computed(() => {
  return PEDIATRIC_SHAPES.find(s => s.id === currentShape.value)!
})

// Ações
function generateRandomShape() {
  const available = PEDIATRIC_SHAPES.filter(s => s.id !== currentShape.value)
  const randomIndex = Math.floor(Math.random() * available.length)
  currentShape.value = available[randomIndex]!.id
}

function startTest() {
  phase.value = 'testing'
  currentLineIndex.value = 0
  currentAttempt.value = 0
  correctCount.value = 0
  results.value = []
  generateRandomShape()
}

function handleAnswer(shapeId: ShapeId) {
  if (phase.value !== 'testing') return

  const isCorrect = shapeId === currentShape.value

  if (isCorrect) {
    correctCount.value++
  }

  currentAttempt.value++

  // Fim da linha atual
  if (currentAttempt.value >= attemptsPerLine) {
    const passed = correctCount.value >= requiredCorrect

    results.value.push({
      line: currentLine.value,
      correct: correctCount.value,
      total: attemptsPerLine,
      passed,
    })

    // Se não passou ou é a última linha, termina
    if (!passed || isLastLine.value) {
      phase.value = 'finished'
      return
    }

    // Próxima linha
    currentLineIndex.value++
    currentAttempt.value = 0
    correctCount.value = 0
  }

  generateRandomShape()
}

function restartTest() {
  phase.value = 'ready'
  currentLineIndex.value = 0
  currentAttempt.value = 0
  correctCount.value = 0
  results.value = []
}

// Controle de foco para navegação TV
const focusedButtonIndex = ref(0)
const buttonRefs = ref<HTMLButtonElement[]>([])

function setButtonRef(el: unknown, index: number) {
  if (el instanceof HTMLButtonElement) {
    buttonRefs.value[index] = el
  }
}

function focusButton(index: number) {
  const clamped = Math.max(0, Math.min(index, PEDIATRIC_SHAPES.length - 1))
  focusedButtonIndex.value = clamped
  buttonRefs.value[clamped]?.focus()
}

function handleKeyDown(event: KeyboardEvent) {
  const action = normalizeInput(event)
  
  if (!action) return
  
  if (phase.value === 'ready') {
    if (action === 'confirm') {
      event.preventDefault()
      startTest()
    }
    return
  }

  if (phase.value === 'testing') {
    event.preventDefault()
    
    switch (action) {
      case 'left':
        focusButton(focusedButtonIndex.value - 1)
        break
      case 'right':
        focusButton(focusedButtonIndex.value + 1)
        break
      case 'confirm':
        handleAnswer(PEDIATRIC_SHAPES[focusedButtonIndex.value]!.id)
        break
      case 'back':
        router.push('/tests')
        break
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function handleExit() {
  router.push('/tests')
}

function handleRestart() {
  restartTest()
}

// Incrementar contador quando teste termina
watch(phase, (newPhase) => {
  if (newPhase === 'finished') {
    proModeStore.incrementTestCount()
  }
})
</script>

<template>
  <div class="test-page d-flex flex-column fill-height">
    <!-- Tela inicial -->
    <template v-if="phase === 'ready'">
      <header class="mb-6">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          to="/tests"
          class="mb-4"
        >
          {{ $t('nav.back') }}
        </v-btn>
        <h1 class="text-h4 font-weight-bold">{{ $t('tests.pediatric.title') }}</h1>
      </header>

      <v-card class="flex-grow-1 d-flex flex-column align-center justify-center pa-8">
        <div class="shapes-demo d-flex gap-4 mb-6">
          <v-icon
            v-for="shape in PEDIATRIC_SHAPES"
            :key="shape.id"
            :icon="shape.icon"
            size="48"
            color="primary"
          />
        </div>
        
        <h2 class="text-h5 mb-4 text-center">{{ $t('tests.instructions.title') }}</h2>
        
        <v-list class="bg-transparent mb-6" max-width="500">
          <v-list-item prepend-icon="mdi-numeric-1-circle">
            <v-list-item-title>{{ $t('tests.instructions.pediatric.step1') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-2-circle">
            <v-list-item-title>{{ $t('tests.instructions.pediatric.step2') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-3-circle">
            <v-list-item-title>{{ $t('tests.instructions.pediatric.step3') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-4-circle">
            <v-list-item-title>{{ $t('tests.instructions.pediatric.step4', { distance: calibration.distanceM }) }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-btn
          color="primary"
          size="x-large"
          prepend-icon="mdi-play"
          @click="startTest"
        >
          {{ $t('tests.startTest') }}
        </v-btn>
      </v-card>

      <footer class="mt-4 d-flex justify-center">
        <RemoteHint />
      </footer>
    </template>

    <!-- Teste em andamento -->
    <template v-else-if="phase === 'testing'">
      <!-- Progress bar -->
      <div class="test-header d-flex align-center justify-space-between mb-4">
        <v-chip variant="outlined" size="small">
          {{ $t('tests.line') }} {{ progress.line }}/{{ progress.totalLines }}
        </v-chip>
        <v-chip variant="outlined" size="small">
          {{ currentLine.snellen }}
        </v-chip>
        <v-chip variant="outlined" size="small">
          {{ $t('tests.attempt') }} {{ progress.attempt }}/{{ progress.attemptsInLine }}
        </v-chip>
      </div>

      <v-progress-linear
        :model-value="((progress.line - 1) / progress.totalLines) * 100"
        color="primary"
        class="mb-6"
      />

      <!-- Área do optótipo -->
      <div class="optotype-area flex-grow-1 d-flex align-center justify-center">
        <v-icon
          :icon="currentShapeData.icon"
          :size="optotypeSize.fontSizePx"
          color="on-surface"
        />
      </div>

      <!-- Botões de resposta -->
      <div class="answer-buttons d-flex flex-wrap justify-center gap-3 mt-6 mb-4">
        <v-btn
          v-for="(shape, index) in PEDIATRIC_SHAPES"
          :key="shape.id"
          :ref="(el) => setButtonRef(el, index)"
          variant="outlined"
          size="large"
          class="shape-button"
          :class="{ 'focused': focusedButtonIndex === index }"
          :tabindex="focusedButtonIndex === index ? 0 : -1"
          @click="handleAnswer(shape.id)"
        >
          <v-icon :icon="shape.icon" size="32" />
        </v-btn>
      </div>

      <footer class="d-flex justify-center">
        <RemoteHint />
      </footer>
    </template>

    <!-- Resultados -->
    <template v-else-if="phase === 'finished'">
      <TestResults
        :results="results"
        :best-result="bestResult"
        @restart="handleRestart"
        @exit="handleExit"
      />
    </template>
  </div>
</template>

<style scoped>
.test-page {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.optotype-area {
  min-height: 200px;
}

.shape-button {
  min-width: 80px;
  min-height: 80px;
}

.shape-button.focused {
  outline: 3px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* TV mode: botões maiores */
.ui-mode-tv .shape-button {
  min-width: 100px;
  min-height: 100px;
}
</style>
