// app/composables/useRemoteNavigation.ts
import { normalizeInput, type NormalizedAction } from '~/utils/normalizeInput'

interface UseRemoteNavigationOptions {
  onUp?: () => void
  onDown?: () => void
  onLeft?: () => void
  onRight?: () => void
  onConfirm?: () => void
  onBack?: () => void
  enabled?: Ref<boolean> | boolean
}

export function useRemoteNavigation(options: UseRemoteNavigationOptions = {}) {
  const { promoteToTv, promoteToTouch } = useUiMode()
  const router = useRouter()

  const enabled = computed(() => {
    if (typeof options.enabled === 'boolean') return options.enabled
    if (options.enabled) return options.enabled.value
    return true
  })

  function handleKeyDown(event: KeyboardEvent) {
    if (!enabled.value) return

    const action = normalizeInput(event)
    if (!action) return

    // Promoção para modo TV na primeira interação com teclado/remoto
    if (['up', 'down', 'left', 'right', 'confirm', 'back'].includes(action)) {
      promoteToTv()
    }

    // Previne scroll padrão das setas
    if (['up', 'down', 'left', 'right'].includes(action)) {
      event.preventDefault()
    }

    const handlers: Record<NormalizedAction & string, (() => void) | undefined> = {
      up: options.onUp,
      down: options.onDown,
      left: options.onLeft,
      right: options.onRight,
      confirm: options.onConfirm,
      back: options.onBack ?? (() => router.back()),
    }

    const handler = handlers[action]
    if (handler) {
      handler()
    }
  }

  function handleTouchStart() {
    promoteToTouch()
  }

  onMounted(() => {
    if (import.meta.server) return

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { once: true, passive: true })
  })

  onUnmounted(() => {
    if (import.meta.server) return

    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('touchstart', handleTouchStart)
  })

  return {
    enabled,
  }
}
