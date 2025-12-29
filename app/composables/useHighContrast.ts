// app/composables/useHighContrast.ts
import { useTheme } from 'vuetify'

export function useHighContrast() {
  const proModeStore = useProModeStore()
  const theme = useTheme()

  // Sync theme with store state
  const syncTheme = () => {
    if (proModeStore.highContrastEnabled) {
      theme.global.name.value = 'highContrast'
    } else {
      theme.global.name.value = 'light'
    }
  }

  // Watch for changes and sync
  watch(
    () => proModeStore.highContrastEnabled,
    () => syncTheme(),
    { immediate: true }
  )

  return {
    isHighContrast: computed(() => proModeStore.highContrastEnabled),
    toggle: () => proModeStore.toggleHighContrast(),
    enable: () => proModeStore.setHighContrast(true),
    disable: () => proModeStore.setHighContrast(false),
  }
}
