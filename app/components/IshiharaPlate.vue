<script setup lang="ts">
/**
 * Componente IshiharaPlate - Renderiza placas do teste de Ishihara
 * 
 * Usa imagens reais das placas originais de Shinobu Ishihara (1917).
 * Imagens quadradas 512x512 exibidas em formato circular.
 */
import { computed } from 'vue'

const props = defineProps<{
  plateId: number
  size?: number
}>()

// Tamanho padrão da placa
const plateSize = computed(() => props.size || 400)

// Caminho para a imagem da placa
const imagePath = computed(() => `/ishihara/plate_${String(props.plateId).padStart(2, '0')}.png`)
</script>

<template>
  <div
    :style="{
      width: `${plateSize}px`,
      height: `${plateSize}px`,
      position: 'relative',
      borderRadius: '50%',
      overflow: 'hidden',
      margin: '0 auto',
    }"
  >
    <img
      :src="imagePath"
      :alt="`Ishihara plate ${plateId}`"
      :style="{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }"
    />
  </div>
</template>

<style scoped>
img {
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
