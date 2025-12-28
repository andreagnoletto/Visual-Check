// app/composables/useZoomWarning.ts
export function useZoomWarning() {
  const zoomLevel = ref(100)
  const hasZoomWarning = computed(() => Math.abs(zoomLevel.value - 100) > 5)

  function detectZoom() {
    if (import.meta.server) return

    // Método mais confiável para detectar zoom
    const ratio = window.devicePixelRatio || 1
    // Isso não é perfeito, mas dá uma indicação
    zoomLevel.value = Math.round(ratio * 100)
  }

  onMounted(() => {
    detectZoom()
    window.addEventListener('resize', detectZoom)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', detectZoom)
  })

  return {
    zoomLevel: readonly(zoomLevel),
    hasZoomWarning,
  }
}
