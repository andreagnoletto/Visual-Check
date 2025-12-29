<script setup lang="ts">
const { t } = useI18n()

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
      <span v-if="!compact" class="text-subtitle-1 font-weight-bold">{{ t('disclaimer.title') }}</span>
    </template>
    <div :class="compact ? 'text-caption' : 'text-body-2'">
      {{ t('disclaimer.text') }}
      <template v-if="!compact">
        <br />
        {{ t('disclaimer.extended') }}
      </template>
    </div>
  </v-alert>
</template>
