// app/composables/useAcuityTest.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCalibrationStore } from '~/stores/calibration'
import {
  ACUITY_LINES,
  calculateOptotypeSize,
  generateRandomSequence,
  calculateCharsPerLine,
  type AcuityLine,
  type OptotypeType,
  OPTOTYPE_POOLS,
} from '~/utils/optotypeCalculations'
import { normalizeInput } from '~/utils/normalizeInput'
import type { TestPhase, TestResult } from '~/types/test'

export interface UseAcuityTestOptions {
  optotypeType: OptotypeType
  charsPerLine?: number
  requiredCorrect?: number // Quantos acertos para passar a linha
}

export function useAcuityTest(options: UseAcuityTestOptions) {
  const calibration = useCalibrationStore()

  // Estado do teste
  const phase = ref<TestPhase>('ready')
  const currentLineIndex = ref(0)
  const currentCharIndex = ref(0)
  const correctCount = ref(0)
  const results = ref<TestResult[]>([])
  const currentSequence = ref<string[]>([])
  
  // Configurações
  const charsPerLine = options.charsPerLine ?? 5
  const requiredCorrect = options.requiredCorrect ?? 3 // 3 de 5 para passar
  const pool = OPTOTYPE_POOLS[options.optotypeType]

  // Computed
  const currentLine = computed((): AcuityLine => {
    return ACUITY_LINES[currentLineIndex.value]!
  })

  const currentChar = computed((): string => {
    return currentSequence.value[currentCharIndex.value] ?? ''
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
    char: currentCharIndex.value + 1,
    charsInLine: charsPerLine,
  }))

  const isLastLine = computed(() => {
    return currentLineIndex.value >= ACUITY_LINES.length - 1
  })

  const bestResult = computed((): TestResult | null => {
    const passed = results.value.filter(r => r.passed)
    if (passed.length === 0) return null
    // Retorna a linha com maior acuidade (menor logMAR)
    return passed.reduce((best, current) => 
      current.line.logMAR < best.line.logMAR ? current : best
    )
  })

  // Ações
  function generateNewSequence() {
    const lastChar = currentSequence.value[currentSequence.value.length - 1]
    currentSequence.value = generateRandomSequence(pool, charsPerLine, lastChar)
  }

  function startTest() {
    phase.value = 'testing'
    currentLineIndex.value = 0
    currentCharIndex.value = 0
    correctCount.value = 0
    results.value = []
    generateNewSequence()
  }

  function recordAnswer(isCorrect: boolean) {
    if (phase.value !== 'testing') return

    if (isCorrect) {
      correctCount.value++
    }

    currentCharIndex.value++

    // Fim da linha atual
    if (currentCharIndex.value >= charsPerLine) {
      const passed = correctCount.value >= requiredCorrect

      results.value.push({
        line: currentLine.value,
        correct: correctCount.value,
        total: charsPerLine,
        passed,
      })

      // Se não passou ou é a última linha, termina
      if (!passed || isLastLine.value) {
        phase.value = 'finished'
        return
      }

      // Próxima linha
      currentLineIndex.value++
      currentCharIndex.value = 0
      correctCount.value = 0
      generateNewSequence()
    }
  }

  function restartTest() {
    phase.value = 'ready'
    currentLineIndex.value = 0
    currentCharIndex.value = 0
    correctCount.value = 0
    results.value = []
    currentSequence.value = []
  }

  // Adaptado para chars em pool (não direcional)
  function handleCharInput(inputChar: string) {
    if (phase.value !== 'testing') return
    
    const expected = currentChar.value.toUpperCase()
    const received = inputChar.toUpperCase()
    recordAnswer(expected === received)
  }

  return {
    // Estado
    phase,
    currentLine,
    currentChar,
    currentCharIndex,
    currentSequence,
    optotypeSize,
    progress,
    results,
    bestResult,
    
    // Ações
    startTest,
    recordAnswer,
    restartTest,
    handleCharInput,
    generateNewSequence,
  }
}
