// app/composables/useFontReady.ts
import { CONFIG } from '~/utils/constants'

export function useFontReady(fontFamily: string = 'OpticianSans') {
  const isReady = ref(false)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  async function checkFont(): Promise<boolean> {
    if (import.meta.server) return false

    try {
      // Usa a Font Loading API se disponível
      if ('fonts' in document) {
        await document.fonts.load(`16px "${fontFamily}"`)
        const ready = document.fonts.check(`16px "${fontFamily}"`)
        return ready
      }
      // Fallback: assume que está pronto após um delay
      return true
    } catch {
      return false
    }
  }

  async function loadFont() {
    if (import.meta.server) return

    isLoading.value = true
    error.value = null

    try {
      // Tenta carregar com timeout
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Font load timeout')), CONFIG.FONT_TIMEOUT)
      })

      const loadPromise = checkFont()

      const ready = await Promise.race([loadPromise, timeoutPromise])
      isReady.value = ready as boolean
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar fonte'
      // Mesmo com erro, permite continuar (fallback para sans-serif)
      isReady.value = true
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    loadFont()
  })

  return {
    isReady: readonly(isReady),
    isLoading: readonly(isLoading),
    error: readonly(error),
    reload: loadFont,
  }
}
