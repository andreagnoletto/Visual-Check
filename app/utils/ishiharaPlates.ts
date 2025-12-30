/**
 * Teste de Ishihara - Teste de Visão de Cores
 * 
 * O teste de Ishihara é usado para detectar deficiências na visão de cores,
 * especialmente daltonismo vermelho-verde (protanopia e deuteranopia).
 * 
 * Este teste foi criado por Dr. Shinobu Ishihara em 1917.
 * As placas consistem em círculos coloridos (dots) que formam números visíveis
 * para pessoas com visão normal, mas invisíveis ou diferentes para pessoas com daltonismo.
 */

/**
 * Tipos de deficiência de visão de cores
 */
export type ColorVisionDeficiency = 
  | 'normal'           // Visão normal
  | 'protanopia'       // Ausência de cones vermelhos
  | 'deuteranopia'     // Ausência de cones verdes
  | 'protanomaly'      // Deficiência de cones vermelhos (fraca)
  | 'deuteranomaly'    // Deficiência de cones verdes (fraca)
  | 'tritanopia'       // Ausência de cones azuis (raro)

/**
 * Tipo de placa Ishihara
 */
export type IshiharaPlateType = 
  | 'demonstration'    // Placa de demonstração (todos veem)
  | 'transformation'   // Número diferente para daltônicos
  | 'vanishing'        // Número invisível para daltônicos
  | 'hidden'           // Número visível apenas para daltônicos
  | 'diagnostic'       // Para distinguir tipo de daltonismo

/**
 * Definição de uma placa Ishihara
 */
export interface IshiharaPlate {
  id: number
  type: IshiharaPlateType
  normalAnswer: string        // O que pessoas com visão normal veem
  colorBlindAnswer: string    // O que pessoas com daltonismo veem
  protanAnswer?: string       // Específico para protanopia
  deutanAnswer?: string       // Específico para deuteranopia
  description: string
}

/**
 * Resposta do usuário a uma placa
 */
export interface IshiharaAnswer {
  plateId: number
  answer: string
  timestamp: number
}

/**
 * Resultado da análise do teste
 */
export interface IshiharaResult {
  diagnosis: ColorVisionDeficiency
  confidence: number
  description: string
  correctCount: number
  totalCount: number
}


/**
 * Placas de Ishihara - Teste original de 38 placas
 * 
 * Respostas baseadas nas placas originais de Shinobu Ishihara (1917)
 * Fonte: https://en.wikipedia.org/wiki/Ishihara_test
 * 
 * NOTA: Este é um teste de triagem, não substitui avaliação profissional
 */
export const ISHIHARA_PLATES: IshiharaPlate[] = [
  // Placa 1: Demonstração - TODOS devem ver
  {
    id: 1,
    type: 'demonstration',
    normalAnswer: '12',
    colorBlindAnswer: '12',
    description: 'Placa de demonstração - todos devem ver o número 12',
  },
  
  // Placa 2
  {
    id: 2,
    type: 'vanishing',
    normalAnswer: '8',
    colorBlindAnswer: '',
    description: 'Número 8 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 3
  {
    id: 3,
    type: 'vanishing',
    normalAnswer: '6',
    colorBlindAnswer: '',
    description: 'Número 6 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 4
  {
    id: 4,
    type: 'vanishing',
    normalAnswer: '29',
    colorBlindAnswer: '',
    description: 'Número 29 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 5
  {
    id: 5,
    type: 'vanishing',
    normalAnswer: '57',
    colorBlindAnswer: '',
    description: 'Número 57 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 6
  {
    id: 6,
    type: 'vanishing',
    normalAnswer: '5',
    colorBlindAnswer: '',
    description: 'Número 5 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 7
  {
    id: 7,
    type: 'vanishing',
    normalAnswer: '3',
    colorBlindAnswer: '',
    description: 'Número 3 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 8
  {
    id: 8,
    type: 'vanishing',
    normalAnswer: '15',
    colorBlindAnswer: '',
    description: 'Número 15 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 9
  {
    id: 9,
    type: 'vanishing',
    normalAnswer: '74',
    colorBlindAnswer: '',
    description: 'Número 74 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 10
  {
    id: 10,
    type: 'transformation',
    normalAnswer: '2',
    colorBlindAnswer: '',
    protanAnswer: '',
    deutanAnswer: '6',
    description: 'Número 2 normal; invisível protanopia, 6 para deuteranopia',
  },
  
  // Placa 11
  {
    id: 11,
    type: 'transformation',
    normalAnswer: '6',
    colorBlindAnswer: '',
    protanAnswer: '5',
    deutanAnswer: '',
    description: 'Número 6 normal; 5 para protanopia, invisível deuteranopia',
  },
  
  // Placa 12
  {
    id: 12,
    type: 'vanishing',
    normalAnswer: '97',
    colorBlindAnswer: '',
    description: 'Número 97 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 13
  {
    id: 13,
    type: 'transformation',
    normalAnswer: '45',
    colorBlindAnswer: '',
    description: 'Número 45 normal; invisível para daltonismo',
  },
  
  // Placa 14
  {
    id: 14,
    type: 'transformation',
    normalAnswer: '5',
    colorBlindAnswer: '',
    description: 'Número 5 normal; invisível para daltonismo',
  },
  
  // Placa 15
  {
    id: 15,
    type: 'vanishing',
    normalAnswer: '7',
    colorBlindAnswer: '',
    description: 'Número 7 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 16
  {
    id: 16,
    type: 'vanishing',
    normalAnswer: '16',
    colorBlindAnswer: '',
    description: 'Número 16 - invisível para daltonismo vermelho-verde',
  },
  
  // Placa 17
  {
    id: 17,
    type: 'hidden',
    normalAnswer: '',
    colorBlindAnswer: '5',
    description: 'Invisível para visão normal; 5 para daltonismo vermelho-verde',
  },
  
  // Placa 18
  {
    id: 18,
    type: 'transformation',
    normalAnswer: '73',
    colorBlindAnswer: '',
    description: 'Número 73 normal; invisível para daltonismo',
  },
  
  // Placa 19
  {
    id: 19,
    type: 'diagnostic',
    normalAnswer: '',
    colorBlindAnswer: '',
    protanAnswer: '2',
    deutanAnswer: '',
    description: 'Invisível normal e deuteranopia; 2 para protanopia',
  },
  
  // Placa 20
  {
    id: 20,
    type: 'diagnostic',
    normalAnswer: '',
    colorBlindAnswer: '',
    protanAnswer: '',
    deutanAnswer: '2',
    description: 'Invisível normal e protanopia; 2 para deuteranopia',
  },
  
  // Placa 21
  {
    id: 21,
    type: 'transformation',
    normalAnswer: '45',
    colorBlindAnswer: '',
    description: 'Número 45 normal; invisível para daltonismo',
  },
  
  // Placa 22
  {
    id: 22,
    type: 'diagnostic',
    normalAnswer: '26',
    colorBlindAnswer: '6',
    protanAnswer: '2',
    deutanAnswer: '6',
    description: 'Número 26 normal; 6 daltonismo; 2 protanopia, 6 deuteranopia',
  },
  
  // Placa 23
  {
    id: 23,
    type: 'diagnostic',
    normalAnswer: '42',
    colorBlindAnswer: '2',
    protanAnswer: '4',
    deutanAnswer: '2',
    description: 'Número 42 normal; 2 daltonismo; 4 protanopia, 2 deuteranopia',
  },
  
  // Placa 24
  {
    id: 24,
    type: 'diagnostic',
    normalAnswer: '35',
    colorBlindAnswer: '5',
    protanAnswer: '3',
    deutanAnswer: '5',
    description: 'Número 35 normal; 5 daltonismo; 3 protanopia, 5 deuteranopia',
  },
  
  // Placa 25
  {
    id: 25,
    type: 'diagnostic',
    normalAnswer: '96',
    colorBlindAnswer: '6',
    protanAnswer: '9',
    deutanAnswer: '6',
    description: 'Número 96 normal; 6 daltonismo; 9 protanopia, 6 deuteranopia',
  },
  
  // Placas 26-31: Tracejados (traçar linha entre pontos)
  {
    id: 26,
    type: 'diagnostic',
    normalAnswer: 'purple-line',
    colorBlindAnswer: 'red-line',
    description: 'Tracejado roxo (normal) ou vermelho (daltonismo)',
  },
  
  {
    id: 27,
    type: 'diagnostic',
    normalAnswer: 'purple-line',
    colorBlindAnswer: 'red-line',
    description: 'Tracejado roxo (normal) ou vermelho (daltonismo)',
  },
  
  {
    id: 28,
    type: 'diagnostic',
    normalAnswer: 'orange-line',
    colorBlindAnswer: 'blue-line',
    description: 'Tracejado laranja (normal) ou azul (daltonismo)',
  },
  
  {
    id: 29,
    type: 'diagnostic',
    normalAnswer: 'orange-line',
    colorBlindAnswer: 'blue-line',
    description: 'Tracejado laranja (normal) ou azul (daltonismo)',
  },
  
  {
    id: 30,
    type: 'diagnostic',
    normalAnswer: 'orange-line',
    colorBlindAnswer: 'blue-line',
    description: 'Tracejado laranja (normal) ou azul (daltonismo)',
  },
  
  {
    id: 31,
    type: 'diagnostic',
    normalAnswer: 'orange-line',
    colorBlindAnswer: 'blue-line',
    description: 'Tracejado laranja (normal) ou azul (daltonismo)',
  },
]

/**
 * Opções de resposta para uma placa (para exibir no UI)
 */
export function getPlateOptions(plateId: number): string[] {
  const plate = ISHIHARA_PLATES.find(p => p.id === plateId)
  if (!plate) return ['']
  
  // Placas de tracejado não têm números
  if (plate.normalAnswer.includes('-line')) {
    return ['traçar linha']
  }
  
  const options = new Set<string>()
  
  // Adiciona resposta normal
  if (plate.normalAnswer) options.add(plate.normalAnswer)
  
  // Adiciona resposta de daltônico
  if (plate.colorBlindAnswer) options.add(plate.colorBlindAnswer)
  
  // Adiciona respostas específicas
  if (plate.protanAnswer) options.add(plate.protanAnswer)
  if (plate.deutanAnswer) options.add(plate.deutanAnswer)
  
  // Adiciona opção "nada" se a placa puder ser invisível
  if (plate.type === 'vanishing' || plate.type === 'hidden' || plate.colorBlindAnswer === '') {
    options.add('')
  }
  
  // Adiciona opções distrataoras baseadas nos dígitos da resposta correta
  if (plate.normalAnswer && !plate.normalAnswer.includes('-line')) {
    const digits = plate.normalAnswer.split('')
    // Inverte os dígitos
    if (digits.length === 2) {
      options.add(digits[1] + digits[0])
    }
    // Adiciona variações com ±1
    digits.forEach(digit => {
      const num = parseInt(digit)
      if (!isNaN(num)) {
        if (num > 0) options.add(String(num - 1))
        if (num < 9) options.add(String(num + 1))
      }
    })
  }
  
  return Array.from(options).slice(0, 8) // Máximo 8 opções
}

/**
 * Verifica se a resposta do usuário está correta
 */
export function checkAnswer(plateId: number, userAnswer: string): boolean {
  const plate = ISHIHARA_PLATES.find(p => p.id === plateId)
  if (!plate) return false
  
  // Placa de demonstração - aceita qualquer resposta correta
  if (plate.type === 'demonstration') {
    return userAnswer === plate.normalAnswer
  }
  
  // Para outras placas, considera correto se for qualquer resposta válida
  // (visão normal ou deficiência de cor)
  const validAnswers = [
    plate.normalAnswer,
    plate.colorBlindAnswer,
    plate.protanAnswer,
    plate.deutanAnswer,
  ].filter(Boolean)
  
  return validAnswers.includes(userAnswer)
}

/**
 * Alias para compatibilidade
 */
export function checkIshiharaAnswer(plate: IshiharaPlate, userAnswer: string): {
  isCorrect: boolean
  expectedAnswer: string
} {
  const isCorrect = checkAnswer(plate.id, userAnswer)
  return {
    isCorrect,
    expectedAnswer: plate.normalAnswer,
  }
}


/**
 * Retorna o nome da deficiência de visão de cores
 */
export function getDeficiencyName(deficiency: ColorVisionDeficiency): string {
  const names: Record<ColorVisionDeficiency, string> = {
    normal: 'Visão normal',
    protanopia: 'Protanopia',
    deuteranopia: 'Deuteranopia',
    protanomaly: 'Protanomalia',
    deuteranomaly: 'Deuteranomalia',
    tritanopia: 'Tritanopia',
  }
  return names[deficiency]
}

/**
 * Analisa os resultados do teste e retorna um diagnóstico
 */
export function analyzeResults(answers: { plateId: number; answer: string }[]): {
  diagnosis: ColorVisionDeficiency
  confidence: number
  description: string
} {
  let normalCount = 0
  let colorBlindCount = 0
  let protanCount = 0
  let deutanCount = 0
  
  answers.forEach(({ plateId, answer }) => {
    const plate = ISHIHARA_PLATES.find(p => p.id === plateId)
    if (!plate) return
    
    if (answer === plate.normalAnswer) normalCount++
    if (answer === plate.colorBlindAnswer) colorBlindCount++
    if (answer === plate.protanAnswer) protanCount++
    if (answer === plate.deutanAnswer) deutanCount++
  })
  
  const total = answers.length
  
  // Análise básica
  if (normalCount / total > 0.8) {
    return {
      diagnosis: 'normal',
      confidence: normalCount / total,
      description: 'Visão de cores normal',
    }
  }
  
  if (protanCount > deutanCount && protanCount / total > 0.3) {
    return {
      diagnosis: 'protanopia',
      confidence: protanCount / total,
      description: 'Possível protanopia (deficiência de cones vermelhos)',
    }
  }
  
  if (deutanCount > protanCount && deutanCount / total > 0.3) {
    return {
      diagnosis: 'deuteranopia',
      confidence: deutanCount / total,
      description: 'Possível deuteranopia (deficiência de cones verdes)',
    }
  }
  
  if (colorBlindCount / total > 0.4) {
    return {
      diagnosis: 'deuteranomaly',
      confidence: colorBlindCount / total,
      description: 'Possível daltonismo vermelho-verde (não específico)',
    }
  }
  
  return {
    diagnosis: 'normal',
    confidence: 0.5,
    description: 'Resultados inconclusivos - recomenda-se avaliação profissional',
  }
}

/**
 * Alias para compatibilidade com interface IshiharaAnswer
 */
export function analyzeIshiharaResults(answers: IshiharaAnswer[]): IshiharaResult {
  const simpleAnswers = answers.map(a => ({ plateId: a.plateId, answer: a.answer }))
  const analysis = analyzeResults(simpleAnswers)
  
  const correctCount = answers.filter(a => checkAnswer(a.plateId, a.answer)).length
  
  return {
    ...analysis,
    correctCount,
    totalCount: answers.length,
  }
}

