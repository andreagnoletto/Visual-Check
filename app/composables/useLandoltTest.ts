// app/composables/useLandoltTest.ts
import { ref, computed } from 'vue'
import { useCalibrationStore } from '~/stores/calibration'
import {
  ACUITY_LINES,
  calculateOptotypeSize,
  type AcuityLine,
} from '~/utils/optotypeCalculations'
import type { TestPhase, TestResult } from '~/types/test'

// Direções do anel de Landolt (4 cardinais)
export type LandoltDirection = 'up' | 'down' | 'left' | 'right'

export const LANDOLT_DIRECTIONS: LandoltDirection[] = ['up', 'down', 'left', 'right']

// Mapeamento de direção para rotação
export const LANDOLT_DIRECTION_TO_ROTATION: Record<LandoltDirection, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
}

export function generateRandomLandoltDirection(exclude?: LandoltDirection): LandoltDirection {
  const available = LANDOLT_DIRECTIONS.filter(d => d !== exclude)
  return available[Math.floor(Math.random() * available.length)]!
}

export interface UseLandoltTestOptions {
  attemptsPerLine?: number
  requiredCorrect?: number
}

export function useLandoltTest(options: UseLandoltTestOptions = {}) {
  const calibration = useCalibrationStore()

  // Estado do teste
  const phase = ref<TestPhase>('ready')
  const currentLineIndex = ref(0)
  const currentAttempt = ref(0)
  const correctCount = ref(0)
  const results = ref<TestResult[]>([])
  const currentDirection = ref<LandoltDirection>('right')
  
  // Configurações
  const attemptsPerLine = options.attemptsPerLine ?? 5
  const requiredCorrect = options.requiredCorrect ?? 3

  // Computed
  const currentLine = computed((): AcuityLine => {
    return ACUITY_LINES[currentLineIndex.value]!
  })

  const currentRotation = computed((): number => {
    return LANDOLT_DIRECTION_TO_ROTATION[currentDirection.value]
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

  // Ações
  function generateNewDirection() {
    currentDirection.value = generateRandomLandoltDirection(currentDirection.value)
  }

  function startTest() {
    phase.value = 'testing'
    currentLineIndex.value = 0
    currentAttempt.value = 0
    correctCount.value = 0
    results.value = []
    generateNewDirection()
  }

  function handleDirectionInput(inputDirection: LandoltDirection) {
    if (phase.value !== 'testing') return

    const isCorrect = inputDirection === currentDirection.value

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

    generateNewDirection()
  }

  function restartTest() {
    phase.value = 'ready'
    currentLineIndex.value = 0
    currentAttempt.value = 0
    correctCount.value = 0
    results.value = []
  }

  return {
    // Estado
    phase,
    currentLine,
    currentDirection,
    currentRotation,
    currentAttempt,
    optotypeSize,
    progress,
    results,
    bestResult,
    
    // Ações
    startTest,
    handleDirectionInput,
    restartTest,
  }
}
