// app/composables/useJaegerProTest.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCalibrationStore } from '~/stores/calibration'
import {
  JAEGER_LINES,
  calculateJaegerFontSize,
  getRandomJaegerText,
  JAEGER_DISTANCE_CM,
  type JaegerLine,
} from '~/utils/jaegerCalculations'
import { normalizeInput } from '~/utils/normalizeInput'
import { type ProTestTheme } from '~/utils/constants'

export function useJaegerProTest() {
  const router = useRouter()
  const calibration = useCalibrationStore()
  const { locale } = useI18n()

  // Estado
  const isActive = ref(false)
  const currentLineIndex = ref(6) // Começa no J6 (meio da escala)
  const currentText = ref('')
  const theme = ref<ProTestTheme>('day')

  // Computed
  const currentLine = computed((): JaegerLine => {
    return JAEGER_LINES[currentLineIndex.value] ?? JAEGER_LINES[0]!
  })

  const fontSize = computed(() => {
    return calculateJaegerFontSize(
      currentLine.value.pointSize,
      calibration.pxPerMm,
      calibration.correctionFactor
    )
  })

  const distanceCm = computed(() => JAEGER_DISTANCE_CM)

  const canGoSmaller = computed(() => {
    return currentLineIndex.value > 0 // J1 é menor (melhor acuidade)
  })

  const canGoLarger = computed(() => {
    return currentLineIndex.value < JAEGER_LINES.length - 1 // J12 é maior
  })

  // Tema
  const themeStyles = computed(() => {
    if (theme.value === 'day') {
      return {
        background: '#FFFFFF',
        color: '#000000',
      }
    }
    return {
      background: '#000000',
      color: '#FFFFFF',
    }
  })

  // Ações
  function generateNewText() {
    currentText.value = getRandomJaegerText(locale.value, currentText.value)
  }

  function start() {
    isActive.value = true
    currentLineIndex.value = 6 // Começa no J6
    generateNewText()
  }

  function exit() {
    isActive.value = false
    router.push('/tests-pro')
  }

  function goSmaller() {
    if (canGoSmaller.value) {
      currentLineIndex.value--
      generateNewText()
    }
  }

  function goLarger() {
    if (canGoLarger.value) {
      currentLineIndex.value++
      generateNewText()
    }
  }

  function randomize() {
    generateNewText()
  }

  function toggleTheme() {
    theme.value = theme.value === 'day' ? 'night' : 'day'
  }

  function goToLine(index: number) {
    if (index >= 0 && index < JAEGER_LINES.length) {
      currentLineIndex.value = index
      generateNewText()
    }
  }

  // Navegação por teclado
  function handleKeyDown(event: KeyboardEvent) {
    if (!isActive.value) return

    const action = normalizeInput(event)
    if (!action) return

    event.preventDefault()

    switch (action) {
      case 'up':
        goLarger() // Aumenta o texto (vai para linhas maiores)
        break
      case 'down':
        goSmaller() // Diminui o texto (vai para linhas menores)
        break
      case 'right':
        randomize()
        break
      case 'left':
      case 'back':
        exit()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    // Estado
    isActive,
    currentLine,
    currentText,
    fontSize,
    distanceCm,
    theme,
    themeStyles,
    canGoSmaller,
    canGoLarger,
    
    // Ações
    start,
    exit,
    goSmaller,
    goLarger,
    randomize,
    toggleTheme,
    goToLine,
  }
}
