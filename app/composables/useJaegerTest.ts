// app/composables/useJaegerTest.ts
import { ref, computed } from 'vue'
import { useCalibrationStore } from '~/stores/calibration'
import {
  JAEGER_LINES,
  calculateJaegerFontSize,
  getRandomJaegerText,
  JAEGER_DISTANCE_CM,
  type JaegerLine,
} from '~/utils/jaegerCalculations'
import type { TestPhase } from '~/types/test'

export interface JaegerTestResult {
  line: JaegerLine
  passed: boolean
  correct: number
  total: number
}

export interface UseJaegerTestOptions {
  attemptsPerLine?: number
  requiredCorrect?: number
}

export function useJaegerTest(options: UseJaegerTestOptions = {}) {
  const calibration = useCalibrationStore()
  const { locale } = useI18n()

  // Estado do teste
  const phase = ref<TestPhase>('ready')
  const currentLineIndex = ref(0)
  const currentAttempt = ref(0)
  const correctCount = ref(0)
  const results = ref<JaegerTestResult[]>([])
  const currentText = ref('')
  const userInput = ref('')
  const showText = ref(true) // Para alternar entre mostrar texto e pedir resposta
  
  // Configurações
  const attemptsPerLine = options.attemptsPerLine ?? 3
  const requiredCorrect = options.requiredCorrect ?? 2

  // Computed
  const currentLine = computed((): JaegerLine => {
    return JAEGER_LINES[currentLineIndex.value]!
  })

  const fontSize = computed(() => {
    return calculateJaegerFontSize(
      currentLine.value.pointSize,
      calibration.pxPerMm,
      calibration.correctionFactor
    )
  })

  const progress = computed(() => ({
    line: currentLineIndex.value + 1,
    totalLines: JAEGER_LINES.length,
    attempt: currentAttempt.value + 1,
    attemptsInLine: attemptsPerLine,
  }))

  const isLastLine = computed(() => {
    return currentLineIndex.value >= JAEGER_LINES.length - 1
  })

  const bestResult = computed((): JaegerTestResult | null => {
    const passed = results.value.filter(r => r.passed)
    if (passed.length === 0) return null
    return passed.reduce((best, current) => 
      current.line.logMAR < best.line.logMAR ? current : best
    )
  })

  const distanceCm = computed(() => JAEGER_DISTANCE_CM)

  // Ações
  function generateNewText() {
    currentText.value = getRandomJaegerText(locale.value, currentText.value)
    showText.value = true
    userInput.value = ''
  }

  function startTest() {
    phase.value = 'testing'
    currentLineIndex.value = 0
    currentAttempt.value = 0
    correctCount.value = 0
    results.value = []
    generateNewText()
  }

  function hideTextAndAskForInput() {
    showText.value = false
  }

  function submitAnswer(answer: string) {
    if (phase.value !== 'testing') return

    // Normaliza as strings para comparação
    const normalizedAnswer = answer.toLowerCase().trim()
    const normalizedText = currentText.value.toLowerCase().trim()
    
    // Calcula similaridade (permite pequenos erros de digitação)
    const similarity = calculateSimilarity(normalizedAnswer, normalizedText)
    const isCorrect = similarity >= 0.8 // 80% de similaridade é considerado correto

    if (isCorrect) {
      correctCount.value++
    }

    currentAttempt.value++

    // Fim da linha atual
    if (currentAttempt.value >= attemptsPerLine) {
      const passed = correctCount.value >= requiredCorrect

      results.value.push({
        line: currentLine.value,
        passed,
        correct: correctCount.value,
        total: attemptsPerLine,
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

    generateNewText()
  }

  function confirmReading() {
    // Para modo simplificado: usuário confirma que conseguiu ler
    correctCount.value++
    currentAttempt.value++

    if (currentAttempt.value >= attemptsPerLine) {
      const passed = correctCount.value >= requiredCorrect

      results.value.push({
        line: currentLine.value,
        passed,
        correct: correctCount.value,
        total: attemptsPerLine,
      })

      if (!passed || isLastLine.value) {
        phase.value = 'finished'
        return
      }

      currentLineIndex.value++
      currentAttempt.value = 0
      correctCount.value = 0
    }

    generateNewText()
  }

  function cannotRead() {
    // Usuário não consegue ler
    currentAttempt.value++

    if (currentAttempt.value >= attemptsPerLine) {
      const passed = correctCount.value >= requiredCorrect

      results.value.push({
        line: currentLine.value,
        passed,
        correct: correctCount.value,
        total: attemptsPerLine,
      })

      if (!passed || isLastLine.value) {
        phase.value = 'finished'
        return
      }

      currentLineIndex.value++
      currentAttempt.value = 0
      correctCount.value = 0
    }

    generateNewText()
  }

  function restartTest() {
    phase.value = 'ready'
    currentLineIndex.value = 0
    currentAttempt.value = 0
    correctCount.value = 0
    results.value = []
    currentText.value = ''
    userInput.value = ''
    showText.value = true
  }

  return {
    // Estado
    phase,
    currentLine,
    currentText,
    userInput,
    showText,
    fontSize,
    progress,
    results,
    bestResult,
    distanceCm,
    
    // Ações
    startTest,
    hideTextAndAskForInput,
    submitAnswer,
    confirmReading,
    cannotRead,
    restartTest,
    generateNewText,
  }
}

/**
 * Calcula a similaridade entre duas strings (0-1)
 * Usa distância de Levenshtein normalizada
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Calcula a distância de Levenshtein entre duas strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i <= m; i++) dp[i]![0] = i
  for (let j = 0; j <= n; j++) dp[0]![j] = j
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!
      } else {
        dp[i]![j] = Math.min(
          dp[i - 1]![j]! + 1,    // deletion
          dp[i]![j - 1]! + 1,    // insertion
          dp[i - 1]![j - 1]! + 1 // substitution
        )
      }
    }
  }
  
  return dp[m]![n]!
}
