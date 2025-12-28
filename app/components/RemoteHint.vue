<script setup lang="ts">
const { isTv, isDesktop } = useUiMode()

const showHint = computed(() => isTv.value || isDesktop.value)
</script>

<template>
  <v-fade-transition>
    <div v-if="showHint" class="remote-hint d-flex align-center ga-4 text-medium-emphasis">
      <div class="d-flex align-center ga-1">
        <v-icon size="small" icon="mdi-arrow-up-down" />
        <v-icon size="small" icon="mdi-arrow-left-right" />
        <span class="text-caption">Navegar</span>
      </div>
      <div class="d-flex align-center ga-1">
        <v-kbd>Enter</v-kbd>
        <span class="text-caption">Confirmar</span>
      </div>
      <div class="d-flex align-center ga-1">
        <v-kbd>Esc</v-kbd>
        <span class="text-caption">Voltar</span>
      </div>
    </div>
  </v-fade-transition>
</template>

<style scoped>
.remote-hint {
  opacity: 0.7;
}
</style>
