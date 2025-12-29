<script setup lang="ts">
// Landolt C - Anel de Landolt (optotipo padrão ISO 8596)
// O anel tem uma abertura em uma das 4 direções cardinais
// Proporções ISO: diâmetro externo 5 unidades, espessura 1 unidade, abertura 1 unidade
// Similar ao TumblingE, usa rotação para as diferentes direções

interface Props {
  size: number // Tamanho em pixels
  direction: 'up' | 'down' | 'left' | 'right'
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'currentColor'
})

// Rotação baseada na direção da abertura
// A abertura padrão está à direita (3 horas), rotacionamos para outras posições
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
    class="landolt-c"
  >
    <!-- 
      Anel de Landolt padrão ISO 8596 - Grade 5x5
      - Diâmetro externo: 5 unidades (50 no viewBox)
      - Diâmetro interno: 3 unidades (30 no viewBox) 
      - Espessura do anel: 1 unidade (10 no viewBox)
      - Abertura: 1 unidade (10 no viewBox) - equivalente à espessura
      
      Desenhado como um path de arco para evitar problemas com máscaras.
      A abertura está à direita (será rotacionada conforme direção).
      
      O C é desenhado usando dois arcos:
      - Arco externo (raio 25) de cima até embaixo, passando pela esquerda
      - Arco interno (raio 15) de baixo até cima, passando pela esquerda
    -->
    
    <!-- Anel C usando path -->
    <path
      :fill="color"
      d="
        M 50 20
        L 40 20
        A 15 15 0 1 0 40 30
        L 50 30
        A 25 25 0 1 1 50 20
        Z
      "
    />
  </svg>
</template>

<style scoped>
.landolt-c {
  display: inline-block;
  vertical-align: middle;
}
</style>
