// app/composables/useIshiharaTest.ts
import { ref, computed } from 'vue'
import {
  ISHIHARA_PLATES,
  checkIshiharaAnswer,
  analyzeIshiharaResults,
  type IshiharaPlate,
  type IshiharaAnswer,
  type IshiharaResult,
} from '~/utils/ishiharaPlates'
import type { TestPhase } from '~/types/test'

export interface UseIshiharaTestOptions {
  plateCount?: number // Número de placas a usar (padrão: todas)
}

export function useIshiharaTest(options: UseIshiharaTestOptions = {}) {
  // Estado do teste
  const phase = ref<TestPhase>('ready')
  const currentPlateIndex = ref(0)
  const answers = ref<IshiharaAnswer[]>([])
  const userInput = ref('')
  const showResult = ref(false)
  
  // Placas a usar (pode ser um subconjunto)
  const plateCount = options.plateCount ?? ISHIHARA_PLATES.length
  const plates = computed(() => ISHIHARA_PLATES.slice(0, plateCount))

  // Computed
  const currentPlate = computed((): IshiharaPlate => {
    return plates.value[currentPlateIndex.value]!
  })

  const progress = computed(() => ({
    current: currentPlateIndex.value + 1,
    total: plates.value.length,
    percentage: ((currentPlateIndex.value + 1) / plates.value.length) * 100,
  }))

  const isLastPlate = computed(() => {
    return currentPlateIndex.value >= plates.value.length - 1
  })

  const result = computed((): IshiharaResult | null => {
    if (phase.value !== 'finished') return null
    return analyzeIshiharaResults(answers.value)
  })

  // Ações
  function startTest() {
    phase.value = 'testing'
    currentPlateIndex.value = 0
    answers.value = []
    userInput.value = ''
    showResult.value = false
  }

  function submitAnswer(answer: string) {
    if (phase.value !== 'testing') return

    const plate = currentPlate.value
    const { isCorrect } = checkIshiharaAnswer(plate, answer)

    answers.value.push({
      plateId: plate.id,
      userAnswer: answer,
      isCorrect,
      plate,
    })

    // Mostra feedback brevemente
    showResult.value = true

    // Avança para próxima placa após delay
    setTimeout(() => {
      showResult.value = false
      
      if (isLastPlate.value) {
        phase.value = 'finished'
      } else {
        currentPlateIndex.value++
        userInput.value = ''
      }
    }, 500)
  }

  function cannotSee() {
    // Usuário não consegue ver nenhum número
    submitAnswer('')
  }

  function restartTest() {
    phase.value = 'ready'
    currentPlateIndex.value = 0
    answers.value = []
    userInput.value = ''
    showResult.value = false
  }

  function skipPlate() {
    // Pula a placa atual (conta como não viu)
    submitAnswer('')
  }

  return {
    // Estado
    phase,
    currentPlate,
    currentPlateIndex,
    userInput,
    showResult,
    progress,
    plates,
    answers,
    result,
    
    // Ações
    startTest,
    submitAnswer,
    cannotSee,
    skipPlate,
    restartTest,
  }
}
