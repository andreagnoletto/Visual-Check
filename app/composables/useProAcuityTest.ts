// app/composables/useProAcuityTest.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCalibrationStore } from '~/stores/calibration'
import { useProModeStore } from '~/stores/proMode'
import {
  ACUITY_LINES,
  calculateOptotypeSize,
  generateRandomSequence,
  generateRandomDirection,
  DIRECTION_TO_ROTATION,
  type AcuityLine,
  type OptotypeType,
  type Direction,
  OPTOTYPE_POOLS,
} from '~/utils/optotypeCalculations'
import { normalizeInput } from '~/utils/normalizeInput'
import { CONFIG, type ProTestTheme } from '~/utils/constants'

export interface UseProAcuityTestOptions {
  optotypeType: OptotypeType
}

export function useProAcuityTest(options: UseProAcuityTestOptions) {
  const router = useRouter()
  const calibration = useCalibrationStore()
  const proModeStore = useProModeStore()

  // Estado
  const isActive = ref(false)
  const currentLineIndex = ref(CONFIG.PRO_START_LINE_INDEX)
  const currentSequence = ref<string[]>([])
  const currentDirections = ref<Direction[]>([])
  const theme = ref<ProTestTheme>('day')
  
  const pool = OPTOTYPE_POOLS[options.optotypeType]

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

  // Sempre 5 caracteres por linha no modo Pro
  const charsPerLine = computed(() => CONFIG.PRO_MAX_CHARS)

  const rotations = computed(() => {
    return currentDirections.value.map(d => DIRECTION_TO_ROTATION[d])
  })

  const canGoSmaller = computed(() => {
    return currentLineIndex.value < ACUITY_LINES.length - 1
  })

  const canGoLarger = computed(() => {
    return currentLineIndex.value > 0
  })

  const isMinLine = computed(() => currentLineIndex.value === 0)
  const isMaxLine = computed(() => currentLineIndex.value === ACUITY_LINES.length - 1)

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
  function generateSequence() {
    const count = charsPerLine.value
    const lastChar = currentSequence.value[currentSequence.value.length - 1]
    currentSequence.value = generateRandomSequence(pool, count, lastChar)
    
    // Para teste direcional, gerar direções também
    if (options.optotypeType === 'directional') {
      const newDirections: Direction[] = []
      let lastDirection: Direction | undefined
      for (let i = 0; i < count; i++) {
        const dir = generateRandomDirection(lastDirection)
        newDirections.push(dir)
        lastDirection = dir
      }
      currentDirections.value = newDirections
    }
  }

  function start() {
    isActive.value = true
    currentLineIndex.value = CONFIG.PRO_START_LINE_INDEX
    generateSequence()
  }

  function exit() {
    isActive.value = false
    proModeStore.incrementTestCount()
    router.push('/tests')
  }

  function goSmaller() {
    if (canGoSmaller.value) {
      currentLineIndex.value++
      generateSequence()
    }
  }

  function goLarger() {
    if (canGoLarger.value) {
      currentLineIndex.value--
      generateSequence()
    }
  }

  function randomize() {
    generateSequence()
  }

  function toggleTheme() {
    theme.value = theme.value === 'night' ? 'day' : 'night'
  }

  function goToLine(index: number) {
    if (index >= 0 && index < ACUITY_LINES.length) {
      currentLineIndex.value = index
      generateSequence()
    }
  }

  // Navegação por teclado/controle
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

  // Lifecycle
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
    currentSequence,
    currentDirections,
    rotations,
    optotypeSize,
    charsPerLine,
    theme,
    themeStyles,
    
    // Flags
    canGoSmaller,
    canGoLarger,
    isMinLine,
    isMaxLine,
    
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
