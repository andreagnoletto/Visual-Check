// app/utils/jaegerCalculations.ts
/**
 * Teste de Jaeger - Acuidade Visual para Perto
 * 
 * A escala Jaeger é usada para medir visão de perto.
 * Os tamanhos variam de J1 (menor/melhor) a J10+ (maior/pior).
 * 
 * Distância padrão: 30-40 cm do olho
 */

/**
 * Linhas de Jaeger com equivalências
 * Fonte de referência: padrão oftalmológico internacional
 */
export const JAEGER_LINES = [
  { line: 1, jaeger: 'J1', pointSize: 3, snellenNear: '20/20', logMAR: 0.0, description: 'Texto muito pequeno' },
  { line: 2, jaeger: 'J2', pointSize: 4, snellenNear: '20/25', logMAR: 0.1, description: 'Texto pequeno' },
  { line: 3, jaeger: 'J3', pointSize: 5, snellenNear: '20/32', logMAR: 0.2, description: 'Texto de jornal' },
  { line: 4, jaeger: 'J4', pointSize: 6, snellenNear: '20/40', logMAR: 0.3, description: 'Texto de livro' },
  { line: 5, jaeger: 'J5', pointSize: 7, snellenNear: '20/50', logMAR: 0.4, description: 'Texto de revista' },
  { line: 6, jaeger: 'J6', pointSize: 8, snellenNear: '20/63', logMAR: 0.5, description: 'Texto médio' },
  { line: 7, jaeger: 'J7', pointSize: 10, snellenNear: '20/80', logMAR: 0.6, description: 'Texto grande' },
  { line: 8, jaeger: 'J8', pointSize: 12, snellenNear: '20/100', logMAR: 0.7, description: 'Texto muito grande' },
  { line: 9, jaeger: 'J10', pointSize: 14, snellenNear: '20/125', logMAR: 0.8, description: 'Título' },
  { line: 10, jaeger: 'J12', pointSize: 18, snellenNear: '20/160', logMAR: 0.9, description: 'Manchete' },
] as const

export type JaegerLine = (typeof JAEGER_LINES)[number]

/**
 * Textos para leitura no teste de Jaeger
 * Cada texto tem aproximadamente o mesmo número de caracteres
 * Evitamos palavras ambíguas ou difíceis
 */
export const JAEGER_TEXTS = [
  'O sol nasce no horizonte trazendo um novo dia cheio de esperança.',
  'A lua brilha no céu noturno enquanto as estrelas cintilam ao redor.',
  'O pássaro voa alto sobre as montanhas cobertas de neve branca.',
  'O rio corre calmo entre as pedras levando folhas em seu caminho.',
  'A chuva cai suave sobre o telhado fazendo um som tranquilo.',
  'O vento sopra forte balançando as árvores do jardim florido.',
  'O gato dorme preguiçoso no sofá aquecido pelo sol da tarde.',
  'O cachorro corre feliz pelo parque brincando com sua bola.',
  'A flor desabrocha na primavera mostrando suas cores vibrantes.',
  'O mar azul reflete o céu criando um espetáculo de beleza.',
] as const

/**
 * Textos em inglês para o teste
 */
export const JAEGER_TEXTS_EN = [
  'The sun rises on the horizon bringing a new day full of hope.',
  'The moon shines in the night sky while the stars twinkle around.',
  'The bird flies high over the mountains covered with white snow.',
  'The river runs calm between the rocks carrying leaves on its way.',
  'The rain falls softly on the roof making a peaceful sound.',
  'The wind blows strong swaying the trees in the flowering garden.',
  'The cat sleeps lazily on the couch warmed by the afternoon sun.',
  'The dog runs happily through the park playing with its ball.',
  'The flower blooms in spring showing its vibrant colors.',
  'The blue sea reflects the sky creating a spectacle of beauty.',
] as const

/**
 * Calcula o tamanho do texto em pixels para uma linha Jaeger
 * 
 * @param jaegerLine - Linha de Jaeger
 * @param pxPerMm - Pixels por milímetro da tela
 * @param correctionFactor - Fator de correção (opcional)
 * @returns Tamanho da fonte em pixels
 */
export function calculateJaegerFontSize(
  pointSize: number,
  pxPerMm: number,
  correctionFactor: number = 1.0
): number {
  // 1 ponto tipográfico = 0.3528 mm
  const mmSize = pointSize * 0.3528
  const pxSize = mmSize * pxPerMm * correctionFactor
  return pxSize
}

/**
 * Gera um texto aleatório para o teste
 */
export function getRandomJaegerText(
  locale: string = 'pt-BR',
  avoidLast?: string
): string {
  const texts = locale.startsWith('pt') ? JAEGER_TEXTS : JAEGER_TEXTS_EN
  const available = texts.filter(t => t !== avoidLast)
  const randomIndex = Math.floor(Math.random() * available.length)
  return available[randomIndex]!
}

/**
 * Distância padrão para teste de Jaeger em metros
 */
export const JAEGER_DISTANCE_M = 0.4 // 40 cm

/**
 * Distância padrão para teste de Jaeger em centímetros
 */
export const JAEGER_DISTANCE_CM = 40
