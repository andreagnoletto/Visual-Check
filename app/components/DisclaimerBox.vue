<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()
</script>

<template>
  <v-alert
    type="warning"
    variant="tonal"
    :class="compact ? 'py-2' : 'py-4'"
    icon="mdi-alert"
    border="start"
  >
    <template #title>
      <span v-if="!compact" class="text-subtitle-1 font-weight-bold">⚠️ ATENÇÃO</span>
    </template>
    <div :class="compact ? 'text-caption' : 'text-body-2'">
      Este app é <strong>APENAS</strong> para triagem básica/treino.
      <strong>NÃO</strong> substitui exame oftalmológico.
      <template v-if="!compact">
        <br />
        Não use para decisões críticas (ex.: dirigir). Resultados variam por iluminação,
        distância, zoom do navegador e configuração da tela.
      </template>
    </div>
  </v-alert>
</template>
