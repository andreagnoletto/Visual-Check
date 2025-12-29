<script setup lang="ts">
// Tumbling E - Snellen optotype com proporções 5x5 simétricas
// O E é desenhado numa grade 5x5 onde cada célula tem tamanho igual

interface Props {
  size: number // Tamanho em pixels
  direction: 'right' | 'left' | 'up' | 'down'
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'currentColor'
})

// Rotação baseada na direção
const rotation = computed(() => {
  switch (props.direction) {
    case 'right': return 0
    case 'down': return 90
    case 'left': return 180
    case 'up': return 270
    default: return 0
  }
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 50 50"
    :style="{ transform: `rotate(${rotation}deg)` }"
    class="tumbling-e"
  >
    <!-- 
      Grade 5x5, cada célula = 10 unidades
      O E padrão Snellen tem:
      - Barra vertical à esquerda (coluna 0, todas as linhas)
      - 3 barras horizontais simétricas (linhas 0, 2, 4)
      
      Estrutura:
      ■ ■ ■ ■ ■  (linha 0)
      ■ □ □ □ □  (linha 1)
      ■ ■ ■ ■ ■  (linha 2)
      ■ □ □ □ □  (linha 3)
      ■ ■ ■ ■ ■  (linha 4)
    -->
    
    <!-- Barra vertical esquerda (toda a altura) -->
    <rect x="0" y="0" width="10" height="50" :fill="color" />
    
    <!-- Barra horizontal superior -->
    <rect x="10" y="0" width="40" height="10" :fill="color" />
    
    <!-- Barra horizontal central -->
    <rect x="10" y="20" width="40" height="10" :fill="color" />
    
    <!-- Barra horizontal inferior -->
    <rect x="10" y="40" width="40" height="10" :fill="color" />
  </svg>
</template>

<style scoped>
.tumbling-e {
  display: inline-block;
  vertical-align: middle;
}
</style>
