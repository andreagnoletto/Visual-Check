<script setup lang="ts">
/**
 * Componente IshiharaPlate - Renderiza placas do teste de Ishihara
 * 
 * Gera placas pseudo-isocromáticas usando o método de círculos empacotados
 * similar às placas originais de Shinobu Ishihara (1917).
 * 
 * As cores são calibradas para serem confundíveis por pessoas com 
 * daltonismo vermelho-verde (protanopia e deuteranopia).
 */
import { computed } from 'vue'
import { ISHIHARA_PLATES, type IshiharaPlate } from '~/utils/ishiharaPlates'

const props = defineProps<{
  plateId: number
  size?: number
}>()

// Tamanho padrão da placa
const plateSize = computed(() => props.size || 320)

// Placa padrão para fallback
const defaultPlate: IshiharaPlate = ISHIHARA_PLATES[0]!

// Obtém os dados da placa
const plate = computed((): IshiharaPlate => {
  return ISHIHARA_PLATES.find(p => p.id === props.plateId) || defaultPlate
})

// Gerador de números pseudo-aleatórios com seed (para consistência)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

interface Circle {
  cx: number
  cy: number
  r: number
  fill: string
}

// Gera o design da placa usando circle packing
const plateCircles = computed(() => {
  const circles: Circle[] = []
  const size = plateSize.value
  const center = size / 2
  const radius = size / 2 - 8
  
  // Seed baseado no ID da placa para consistência
  let seed = props.plateId * 12345
  
  // Parâmetros de tamanho dos círculos (mais variação = mais autêntico)
  const minR = size * 0.018
  const maxR = size * 0.045
  
  // Densidade de pontos
  const targetCircles = 450
  
  // Grid jittered para distribuição uniforme
  const gridCells = 22
  const cellSize = size / gridCells
  
  for (let i = 0; i < targetCircles; i++) {
    seed++
    const attempts = 15
    
    for (let attempt = 0; attempt < attempts; attempt++) {
      seed++
      // Posição aleatória com tendência a grid
      const gridX = Math.floor(seededRandom(seed * 2) * gridCells)
      seed++
      const gridY = Math.floor(seededRandom(seed * 3) * gridCells)
      
      seed++
      const jitterX = (seededRandom(seed * 5) - 0.5) * cellSize
      seed++
      const jitterY = (seededRandom(seed * 7) - 0.5) * cellSize
      
      const cx = gridX * cellSize + cellSize / 2 + jitterX
      const cy = gridY * cellSize + cellSize / 2 + jitterY
      
      // Verifica se está dentro do círculo principal
      const distFromCenter = Math.sqrt((cx - center) ** 2 + (cy - center) ** 2)
      if (distFromCenter > radius - maxR) continue
      
      // Tamanho com variação
      seed++
      const rVariation = seededRandom(seed * 11)
      const r = minR + rVariation * (maxR - minR)
      
      // Verifica overlap com círculos existentes
      const hasOverlap = circles.some(c => {
        const dist = Math.sqrt((cx - c.cx) ** 2 + (cy - c.cy) ** 2)
        return dist < r + c.r + 0.5
      })
      
      if (!hasOverlap) {
        // Determina cor baseado na posição
        const isPartOfNumber = isInNumber(cx, cy, center)
        
        // Seleciona cor do array apropriado
        seed++
        const colorIndex = Math.floor(seededRandom(seed * 13) * 6)
        
        const currentPlate = plate.value
        const bgColors = currentPlate.backgroundColors
        const numColors = currentPlate.numberColors
        
        const fill = isPartOfNumber 
          ? numColors[colorIndex % numColors.length]!
          : bgColors[colorIndex % bgColors.length]!
        
        circles.push({ cx, cy, r, fill })
        break
      }
    }
  }
  
  // Segunda passada: preencher espaços vazios com círculos menores
  const smallCircles = 200
  for (let i = 0; i < smallCircles; i++) {
    seed++
    const angle = seededRandom(seed) * Math.PI * 2
    seed++
    const dist = seededRandom(seed) * (radius - minR * 2)
    
    const cx = center + Math.cos(angle) * dist
    const cy = center + Math.sin(angle) * dist
    
    seed++
    const r = minR * (0.5 + seededRandom(seed) * 0.5)
    
    // Verifica overlap
    const hasOverlap = circles.some(c => {
      const d = Math.sqrt((cx - c.cx) ** 2 + (cy - c.cy) ** 2)
      return d < r + c.r + 0.3
    })
    
    if (!hasOverlap) {
      const isPartOfNumber = isInNumber(cx, cy, center)
      seed++
      const colorIndex = Math.floor(seededRandom(seed) * 6)
      
      const currentPlate = plate.value
      const bgColors = currentPlate.backgroundColors
      const numColors = currentPlate.numberColors
      
      const fill = isPartOfNumber 
        ? numColors[colorIndex % numColors.length]!
        : bgColors[colorIndex % bgColors.length]!
      
      circles.push({ cx, cy, r, fill })
    }
  }
  
  return circles
})

// Verifica se um ponto está dentro do número da placa
function isInNumber(x: number, y: number, center: number): boolean {
  // Normaliza coordenadas para -1 a 1
  const nx = (x - center) / (center * 0.55)
  const ny = (y - center) / (center * 0.55)
  
  const id = props.plateId
  
  switch (id) {
    case 1: return isInNumberShape('12', nx, ny)
    case 2: return isInNumberShape('8', nx, ny)
    case 3: return isInNumberShape('6', nx, ny)
    case 4: return isInNumberShape('29', nx, ny)
    case 5: return isInNumberShape('57', nx, ny)
    case 6: return isInNumberShape('5', nx, ny)
    case 7: return isInNumberShape('3', nx, ny)
    case 8: return isInNumberShape('15', nx, ny)
    case 9: return isInNumberShape('74', nx, ny)
    case 10: return isInNumberShape('45', nx, ny)
    case 11: return isInNumberShape('97', nx, ny)
    case 12: return isInNumberShape('26', nx, ny)
    case 13: return isInNumberShape('42', nx, ny)
    case 14: return isInNumberShape('16', nx, ny)
    default: return false
  }
}

// Renderiza número composto
function isInNumberShape(num: string, nx: number, ny: number): boolean {
  if (num.length === 1) {
    return isDigit(num, nx, ny)
  }
  // Dois dígitos
  const spacing = 0.4
  return isDigit(num[0]!, nx + spacing, ny) || isDigit(num[1]!, nx - spacing, ny)
}

// Formas dos dígitos (0-9) com contornos mais suaves
function isDigit(d: string, x: number, y: number): boolean {
  const strokeWidth = 0.22
  
  switch (d) {
    case '0': {
      const dist = Math.sqrt((x * 0.8) ** 2 + y ** 2)
      return dist > 0.35 - strokeWidth && dist < 0.35 + strokeWidth
    }
    
    case '1': {
      // Linha vertical
      if (Math.abs(x) < strokeWidth * 0.8 && y > -0.5 && y < 0.5) return true
      // Serifa superior
      if (y > 0.35 && y < 0.5 && x > -0.2 && x < 0.05) {
        if (Math.abs(y - (0.5 - (x + 0.15) * 0.8)) < strokeWidth) return true
      }
      // Base
      if (y > -0.55 && y < -0.4 && Math.abs(x) < 0.2) return true
      return false
    }
    
    case '2': {
      // Curva superior
      if (y > 0.1) {
        const dist = Math.sqrt(x ** 2 + (y - 0.3) ** 2)
        if (dist > 0.2 - strokeWidth && dist < 0.2 + strokeWidth && x > -0.25) return true
      }
      // Diagonal
      if (y > -0.35 && y < 0.25) {
        const targetX = 0.2 - (y + 0.35) * 0.7
        if (Math.abs(x - targetX) < strokeWidth) return true
      }
      // Base horizontal
      if (y > -0.55 && y < -0.35 && x > -0.3 && x < 0.3) return true
      return false
    }
    
    case '3': {
      // Curva superior
      if (y > 0.05) {
        const dist = Math.sqrt(x ** 2 + (y - 0.28) ** 2)
        if (dist > 0.18 - strokeWidth && dist < 0.18 + strokeWidth && x > -0.1) return true
      }
      // Curva inferior
      if (y < 0.1) {
        const dist = Math.sqrt(x ** 2 + (y + 0.22) ** 2)
        if (dist > 0.22 - strokeWidth && dist < 0.22 + strokeWidth && x > -0.1) return true
      }
      return false
    }
    
    case '4': {
      // Linha vertical direita
      if (Math.abs(x - 0.12) < strokeWidth && y > -0.5 && y < 0.5) return true
      // Linha horizontal
      if (Math.abs(y + 0.08) < strokeWidth && x > -0.3 && x < 0.2) return true
      // Diagonal esquerda
      if (x < 0.15 && y > -0.08) {
        const targetX = -0.3 + (y + 0.08) * 0.7
        if (Math.abs(x - targetX) < strokeWidth) return true
      }
      return false
    }
    
    case '5': {
      // Topo horizontal
      if (y > 0.35 && y < 0.5 && x > -0.25 && x < 0.2) return true
      // Linha vertical esquerda
      if (Math.abs(x + 0.2) < strokeWidth && y > 0.05 && y < 0.45) return true
      // Curva inferior
      if (y < 0.15) {
        const dist = Math.sqrt((x + 0.05) ** 2 + (y + 0.18) ** 2)
        if (dist > 0.25 - strokeWidth && dist < 0.25 + strokeWidth && (x > -0.2 || y < -0.1)) return true
      }
      return false
    }
    
    case '6': {
      // Círculo inferior
      const distLower = Math.sqrt(x ** 2 + (y + 0.15) ** 2)
      if (distLower > 0.25 - strokeWidth && distLower < 0.25 + strokeWidth) return true
      // Curva superior (cauda)
      if (y > 0.1 && x < 0.1) {
        const dist = Math.sqrt((x + 0.15) ** 2 + (y - 0.25) ** 2)
        if (dist > 0.2 - strokeWidth && dist < 0.2 + strokeWidth && x < 0.02) return true
      }
      return false
    }
    
    case '7': {
      // Topo horizontal
      if (y > 0.35 && y < 0.5 && x > -0.25 && x < 0.25) return true
      // Linha diagonal
      if (y < 0.4) {
        const targetX = 0.2 - (0.4 - y) * 0.35
        if (Math.abs(x - targetX) < strokeWidth) return true
      }
      return false
    }
    
    case '8': {
      // Círculo superior (menor)
      const distUpper = Math.sqrt(x ** 2 + (y - 0.22) ** 2)
      if (distUpper > 0.18 - strokeWidth && distUpper < 0.18 + strokeWidth) return true
      // Círculo inferior (maior)
      const distLower = Math.sqrt(x ** 2 + (y + 0.2) ** 2)
      if (distLower > 0.22 - strokeWidth && distLower < 0.22 + strokeWidth) return true
      return false
    }
    
    case '9': {
      // Círculo superior
      const distUpper = Math.sqrt(x ** 2 + (y - 0.18) ** 2)
      if (distUpper > 0.25 - strokeWidth && distUpper < 0.25 + strokeWidth) return true
      // Linha/curva inferior (cauda)
      if (y < 0 && x > -0.05) {
        const dist = Math.sqrt((x - 0.15) ** 2 + (y + 0.2) ** 2)
        if (dist > 0.2 - strokeWidth && dist < 0.2 + strokeWidth && x > 0) return true
      }
      return false
    }
    
    default:
      return false
  }
}

// Cor de fundo da placa
const backgroundColor = computed(() => '#F5ECD7')
</script>

<template>
  <svg 
    :width="plateSize" 
    :height="plateSize" 
    :viewBox="`0 0 ${plateSize} ${plateSize}`"
    class="ishihara-plate"
    role="img"
    :aria-label="`Placa ${plateId} do teste de Ishihara`"
  >
    <!-- Definições -->
    <defs>
      <!-- Máscara circular -->
      <clipPath :id="`plate-clip-${plateId}`">
        <circle 
          :cx="plateSize / 2" 
          :cy="plateSize / 2" 
          :r="plateSize / 2 - 4"
        />
      </clipPath>
      
      <!-- Sombra -->
      <filter :id="`plate-shadow-${plateId}`" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/>
      </filter>
    </defs>
    
    <!-- Círculo de fundo com sombra -->
    <circle 
      :cx="plateSize / 2" 
      :cy="plateSize / 2" 
      :r="plateSize / 2 - 4"
      :fill="backgroundColor"
      :filter="`url(#plate-shadow-${plateId})`"
    />
    
    <!-- Grupo com clipping circular -->
    <g :clip-path="`url(#plate-clip-${plateId})`">
      <!-- Círculos coloridos -->
      <circle
        v-for="(circle, index) in plateCircles"
        :key="index"
        :cx="circle.cx"
        :cy="circle.cy"
        :r="circle.r"
        :fill="circle.fill"
      />
    </g>
    
    <!-- Borda sutil -->
    <circle 
      :cx="plateSize / 2" 
      :cy="plateSize / 2" 
      :r="plateSize / 2 - 4" 
      fill="none"
      stroke="#D0C9B8"
      stroke-width="1.5"
    />
  </svg>
</template>

<style scoped>
.ishihara-plate {
  display: block;
  border-radius: 50%;
  user-select: none;
}
</style>
