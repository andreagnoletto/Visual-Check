<script setup lang="ts">
const { uiMode, safeMargin } = useUiMode()

const layoutClass = computed(() => `ui-mode-${uiMode.value}`)

const safeAreaStyle = computed(() => ({
  '--safe-margin': `${safeMargin.value}px`,
}))
</script>

<template>
  <v-app :class="layoutClass">
    <v-main>
      <div class="safe-area fill-height" :style="safeAreaStyle">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.safe-area {
  padding: var(--safe-margin, 24px);
  display: flex;
  flex-direction: column;
}
</style>
