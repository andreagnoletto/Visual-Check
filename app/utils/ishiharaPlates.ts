// app/utils/ishiharaPlates.ts
/**
 * Teste de Ishihara - Teste de Visão de Cores
 * 
 * O teste de Ishihara é usado para detectar deficiências na visão de cores,
 * especialmente daltonismo vermelho-verde (protanopia e deuteranopia).
 * 
 * Este teste foi criado por Dr. Shinobu Ishihara em 1917 e está em domínio público.
 * As placas consistem em círculos coloridos (dots) que formam números visíveis
 * para pessoas com visão normal, mas invisíveis para pessoas com daltonismo.
 * 
 * Referência: https://en.wikipedia.org/wiki/Ishihara_test
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
 * Cores autênticas das placas de Ishihara
 * Baseadas nas placas originais de 1917
 */
export const ISHIHARA_COLORS = {
  // Cores de fundo (visíveis para todos)
  background: {
    tan: ['#D4A76A', '#C99B5E', '#BE8F52', '#B38346', '#D9B076', '#CEAA6F'],
    olive: ['#8B8B4B', '#7A7A42', '#6B6B38', '#9C9C55', '#8A8A48', '#7B7B40'],
    gray: ['#A0A090', '#909080', '#808070', '#B0B0A0', '#959585', '#858575'],
  },
  // Cores do número (confundíveis para daltônicos)
  number: {
    green: ['#5D9E47', '#4D8E37', '#3D7E27', '#6DAE57', '#559946', '#458935'],
    red: ['#C75050', '#B74343', '#A73636', '#D75D5D', '#C84848', '#B83B3B'],
    orange: ['#E07838', '#D0682C', '#C05820', '#EA8848', '#DB7233', '#CB6226'],
    purple: ['#8B6090', '#7B5080', '#6B4070', '#9B70A0', '#855A8A', '#754A7A'],
  },
}

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
  backgroundColors: string[]  // Cores do fundo
  numberColors: string[]      // Cores do número
}

/**
 * Placas de Ishihara baseadas no teste original de 38 placas
 * Usando um subconjunto representativo de 14 placas para triagem
 * 
 * Fontes:
 * - https://en.wikipedia.org/wiki/Ishihara_test
 * - https://www.color-blindness.com/ishihara-38-plates-cvd-test/
 * 
 * NOTA: Este é um teste de triagem, não substitui avaliação profissional
 */
export const ISHIHARA_PLATES: IshiharaPlate[] = [
  // Placa 1: Demonstração - TODOS devem ver (valida se o teste está funcionando)
  {
    id: 1,
    type: 'demonstration',
    normalAnswer: '12',
    colorBlindAnswer: '12',
    description: 'Placa de demonstração - todos devem ver o número 12',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.green,
  },
  
  // Placas 2-9: Vanishing (desaparecem para daltônicos)
  {
    id: 2,
    type: 'vanishing',
    normalAnswer: '8',
    colorBlindAnswer: '',
    description: 'Número 8 - invisível para daltonismo vermelho-verde',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.red,
  },
  {
    id: 3,
    type: 'vanishing',
    normalAnswer: '6',
    colorBlindAnswer: '',
    description: 'Número 6 - invisível para daltonismo vermelho-verde',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.green,
  },
  {
    id: 4,
    type: 'vanishing',
    normalAnswer: '29',
    colorBlindAnswer: '',
    description: 'Número 29 - invisível para daltonismo vermelho-verde',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.red,
  },
  {
    id: 5,
    type: 'vanishing',
    normalAnswer: '57',
    colorBlindAnswer: '',
    description: 'Número 57 - invisível para daltonismo vermelho-verde',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.green,
  },
  {
    id: 6,
    type: 'vanishing',
    normalAnswer: '5',
    colorBlindAnswer: '',
    description: 'Número 5 - invisível para daltonismo vermelho-verde',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.orange,
  },
  {
    id: 7,
    type: 'vanishing',
    normalAnswer: '3',
    colorBlindAnswer: '',
    description: 'Número 3 - invisível para daltonismo vermelho-verde',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.red,
  },
  {
    id: 8,
    type: 'vanishing',
    normalAnswer: '15',
    colorBlindAnswer: '',
    description: 'Número 15 - invisível para daltonismo vermelho-verde',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.green,
  },
  {
    id: 9,
    type: 'vanishing',
    normalAnswer: '74',
    colorBlindAnswer: '21',
    description: 'Número 74 - daltônicos podem ver 21',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.red,
  },
  
  // Placas 10-11: Transformation (número diferente para daltônicos)
  {
    id: 10,
    type: 'transformation',
    normalAnswer: '45',
    colorBlindAnswer: '',
    description: 'Normal vê 45, daltônicos não veem nada',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.green,
  },
  {
    id: 11,
    type: 'transformation',
    normalAnswer: '97',
    colorBlindAnswer: '',
    description: 'Normal vê 97, daltônicos não veem nada',
    backgroundColors: ISHIHARA_COLORS.background.olive,
    numberColors: ISHIHARA_COLORS.number.orange,
  },
  
  // Placas 12-14: Diagnostic (diferenciam protanopia de deuteranopia)
  {
    id: 12,
    type: 'diagnostic',
    normalAnswer: '26',
    colorBlindAnswer: '',
    protanAnswer: '6',
    deutanAnswer: '2',
    description: 'Diferencia protanopia (6) de deuteranopia (2)',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.red,
  },
  {
    id: 13,
    type: 'diagnostic',
    normalAnswer: '42',
    colorBlindAnswer: '',
    protanAnswer: '2',
    deutanAnswer: '4',
    description: 'Diferencia protanopia (2) de deuteranopia (4)',
    backgroundColors: ISHIHARA_COLORS.background.tan,
    numberColors: ISHIHARA_COLORS.number.green,
  },
  {
    id: 14,
    type: 'diagnostic',
    normalAnswer: '16',
    colorBlindAnswer: '',
    protanAnswer: '1',
    deutanAnswer: '6',
    description: 'Diferencia protanopia (1) de deuteranopia (6)',
    backgroundColors: ISHIHARA_COLORS.background.olive,
    numberColors: ISHIHARA_COLORS.number.purple,
  },
]

/**
 * Resultado de uma resposta no teste
 */
export interface IshiharaAnswer {
  plateId: number
  userAnswer: string
  isCorrect: boolean
  plate: IshiharaPlate
}

/**
 * Resultado final do teste Ishihara
 */
export interface IshiharaResult {
  totalPlates: number
  correctAnswers: number
  incorrectAnswers: number
  possibleDeficiency: ColorVisionDeficiency
  confidence: 'high' | 'medium' | 'low'
  details: IshiharaAnswer[]
}

/**
 * Verifica se a resposta do usuário está correta
 */
export function checkIshiharaAnswer(
  plate: IshiharaPlate,
  userAnswer: string
): { isCorrect: boolean; interpretation: string } {
  const normalizedAnswer = userAnswer.trim().toLowerCase()
  const normalizedExpected = plate.normalAnswer.toLowerCase()
  
  // Placa de demonstração - sempre deve acertar
  if (plate.type === 'demonstration') {
    return {
      isCorrect: normalizedAnswer === normalizedExpected,
      interpretation: 'Placa de demonstração'
    }
  }
  
  // Verifica se resposta está correta (visão normal)
  const isCorrect = normalizedAnswer === normalizedExpected
  
  // Verifica se pode ser resposta de daltonismo
  const isColorBlindAnswer = plate.colorBlindAnswer && 
    normalizedAnswer === plate.colorBlindAnswer.toLowerCase()
  
  const isProtanAnswer = plate.protanAnswer && 
    normalizedAnswer === plate.protanAnswer.toLowerCase()
  
  const isDeutanAnswer = plate.deutanAnswer && 
    normalizedAnswer === plate.deutanAnswer.toLowerCase()
  
  let interpretation = ''
  if (isCorrect) {
    interpretation = 'Resposta de visão normal'
  } else if (isColorBlindAnswer) {
    interpretation = 'Possível daltonismo vermelho-verde'
  } else if (isProtanAnswer) {
    interpretation = 'Possível protanopia'
  } else if (isDeutanAnswer) {
    interpretation = 'Possível deuteranopia'
  } else if (normalizedAnswer === '' || normalizedAnswer === 'nada' || normalizedAnswer === 'nothing') {
    interpretation = 'Não conseguiu ver o número'
  } else {
    interpretation = 'Resposta incorreta'
  }
  
  return { isCorrect, interpretation }
}

/**
 * Analisa os resultados do teste e determina possível deficiência
 */
export function analyzeIshiharaResults(answers: IshiharaAnswer[]): IshiharaResult {
  const correctCount = answers.filter(a => a.isCorrect).length
  const incorrectCount = answers.length - correctCount
  
  // Conta padrões específicos
  let protanCount = 0
  let deutanCount = 0
  let vanishingErrors = 0
  
  for (const answer of answers) {
    if (!answer.isCorrect) {
      if (answer.plate.type === 'vanishing') {
        vanishingErrors++
      }
      if (answer.plate.type === 'diagnostic') {
        if (answer.userAnswer === answer.plate.protanAnswer) {
          protanCount++
        } else if (answer.userAnswer === answer.plate.deutanAnswer) {
          deutanCount++
        }
      }
    }
  }
  
  // Determina possível deficiência
  let possibleDeficiency: ColorVisionDeficiency = 'normal'
  let confidence: 'high' | 'medium' | 'low' = 'high'
  
  // Se errou a placa de demonstração, o teste pode não ser válido
  const demonstrationPlate = answers.find(a => a.plate.type === 'demonstration')
  if (demonstrationPlate && !demonstrationPlate.isCorrect) {
    confidence = 'low'
  }
  
  // Análise baseada em erros
  const errorRate = incorrectCount / answers.length
  
  if (errorRate <= 0.1) {
    possibleDeficiency = 'normal'
    confidence = 'high'
  } else if (errorRate <= 0.3) {
    // Poucos erros - pode ser anomalia leve
    if (protanCount > deutanCount) {
      possibleDeficiency = 'protanomaly'
    } else if (deutanCount > protanCount) {
      possibleDeficiency = 'deuteranomaly'
    } else {
      possibleDeficiency = 'normal'
    }
    confidence = 'medium'
  } else {
    // Muitos erros - provável daltonismo
    if (protanCount > deutanCount) {
      possibleDeficiency = 'protanopia'
    } else if (deutanCount > protanCount) {
      possibleDeficiency = 'deuteranopia'
    } else {
      // Não conseguiu diferenciar, mas tem muitos erros
      possibleDeficiency = vanishingErrors > 3 ? 'deuteranopia' : 'protanopia'
    }
    confidence = incorrectCount >= 5 ? 'high' : 'medium'
  }
  
  return {
    totalPlates: answers.length,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    possibleDeficiency,
    confidence,
    details: answers
  }
}

/**
 * Retorna o nome da deficiência em português
 */
export function getDeficiencyName(deficiency: ColorVisionDeficiency): string {
  const names: Record<ColorVisionDeficiency, string> = {
    normal: 'Visão de cores normal',
    protanopia: 'Protanopia (daltonismo vermelho)',
    deuteranopia: 'Deuteranopia (daltonismo verde)',
    protanomaly: 'Protanomalia (deficiência leve de vermelho)',
    deuteranomaly: 'Deuteranomalia (deficiência leve de verde)',
    tritanopia: 'Tritanopia (daltonismo azul)',
  }
  return names[deficiency]
}

/**
 * Obtém a lista de opções de resposta para uma placa (modo assistido)
 */
export function getPlateOptions(plate: IshiharaPlate): string[] {
  // Opções sempre incluem a resposta correta e distratores
  const baseOptions = ['12', '8', '6', '29', '57', '5', '3', '15', '74', '45', '97', '26', '42', '16', '21']
  
  // Garante que a resposta correta está nas opções
  let options = [plate.normalAnswer]
  
  // Adiciona a resposta de daltonismo se existir
  if (plate.colorBlindAnswer && plate.colorBlindAnswer !== plate.normalAnswer) {
    options.push(plate.colorBlindAnswer)
  }
  
  // Adiciona distratores até ter 4-5 opções
  const distractors = baseOptions.filter(o => 
    o !== plate.normalAnswer && 
    o !== plate.colorBlindAnswer
  )
  
  // Embaralha e pega alguns distratores
  const shuffled = distractors.sort(() => Math.random() - 0.5)
  options = [...options, ...shuffled.slice(0, 3)]
  
  // Adiciona opção "Não vejo nenhum número"
  options.push('')
  
  // Embaralha as opções finais
  return options.sort(() => Math.random() - 0.5)
}
