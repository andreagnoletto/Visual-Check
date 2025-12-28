// app/composables/useUiMode.ts
import { CONFIG, type UiMode } from '~/utils/constants'

const TV_USER_AGENTS = [
  'Android TV',
  'Tizen',
  'Web0S',
  'webOS',
  'SMART-TV',
  'SmartTV',
  'GoogleTV',
  'BRAVIA',
  'AFT', // Amazon Fire TV
]

function detectInitialMode(): UiMode {
  if (import.meta.server) return 'desktop'

  const ua = navigator.userAgent

  // Check TV user agents
  if (TV_USER_AGENTS.some((tv) => ua.includes(tv))) {
    return 'tv'
  }

  // Check pointer type and viewport
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  const isLargeViewport = window.innerWidth >= 960

  if (isCoarsePointer && isLargeViewport) {
    return 'tv'
  }

  if (isCoarsePointer) {
    return 'touch'
  }

  return 'desktop'
}

// Estado global para o override (será sincronizado com a store)
const globalOverride = ref<UiMode | null>(null)

export function useUiMode() {
  const detectedMode = ref<UiMode>('desktop')
  const sessionPromotedMode = useState<UiMode | null>('sessionPromotedMode', () => null)

  const uiMode = computed<UiMode>(() => {
    // Override persistido sempre vence
    if (globalOverride.value) return globalOverride.value
    // Promoção por interação na sessão
    if (sessionPromotedMode.value) return sessionPromotedMode.value
    // Detecção automática
    return detectedMode.value
  })

  const overrideMode = computed(() => globalOverride.value)

  const safeMargin = computed(() => {
    const mode = uiMode.value.toUpperCase() as keyof typeof CONFIG.SAFE_MARGIN
    return CONFIG.SAFE_MARGIN[mode]
  })

  const isTv = computed(() => uiMode.value === 'tv')
  const isTouch = computed(() => uiMode.value === 'touch')
  const isDesktop = computed(() => uiMode.value === 'desktop')

  function setOverride(mode: UiMode | null) {
    globalOverride.value = mode
  }

  function promoteToTv() {
    if (!globalOverride.value && sessionPromotedMode.value !== 'tv') {
      sessionPromotedMode.value = 'tv'
    }
  }

  function promoteToTouch() {
    if (!globalOverride.value && sessionPromotedMode.value !== 'touch') {
      sessionPromotedMode.value = 'touch'
    }
  }

  onMounted(() => {
    detectedMode.value = detectInitialMode()
  })

  return {
    uiMode,
    detectedMode: readonly(detectedMode),
    overrideMode,
    safeMargin,
    isTv,
    isTouch,
    isDesktop,
    setOverride,
    promoteToTv,
    promoteToTouch,
  }
}

// Função para sincronizar com a store (chamada pelo store)
export function syncUiModeOverride(mode: UiMode | null) {
  globalOverride.value = mode
}
