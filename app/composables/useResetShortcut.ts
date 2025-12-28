// app/composables/useResetShortcut.ts
import { CONFIG } from '~/utils/constants'
import { normalizeInput } from '~/utils/normalizeInput'

export function useResetShortcut(onReset: () => void) {
  const backPresses = ref<number[]>([])
  const showResetModal = ref(false)

  function handleKeyDown(event: KeyboardEvent) {
    // R key para reset rápido
    if (event.key === 'r' || event.key === 'R') {
      showResetModal.value = true
      return
    }

    // Back 4x em < 1.5s
    const action = normalizeInput(event)
    if (action === 'back') {
      const now = Date.now()
      backPresses.value = backPresses.value.filter(
        (t) => now - t < CONFIG.RESET_BACK_WINDOW
      )
      backPresses.value.push(now)

      if (backPresses.value.length >= CONFIG.RESET_BACK_THRESHOLD) {
        showResetModal.value = true
        backPresses.value = []
      }
    }
  }

  function confirmReset() {
    showResetModal.value = false
    onReset()
  }

  function cancelReset() {
    showResetModal.value = false
  }

  onMounted(() => {
    if (import.meta.server) return
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    if (import.meta.server) return
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    showResetModal,
    confirmReset,
    cancelReset,
  }
}
