<script setup lang="ts">
import { CONFIG, type UiMode } from '~/utils/constants'

const { t, locale, locales, setLocale } = useI18n()

definePageMeta({
  title: 'Configurações',
})

const calibrationStore = useCalibrationStore()
const proModeStore = useProModeStore()
const { uiMode, detectedMode, overrideMode, setOverride } = useUiMode()

// Language options
const browserLanguage = computed(() => {
  if (!import.meta.client) return ''
  return navigator.language
})

const languageOptions = computed(() => [
  { code: 'auto', name: `${t('settings.language.auto')} [${browserLanguage.value}]` },
  ...locales.value.map(l => ({ code: l.code, name: l.name })),
])

const selectedLanguage = ref<string>(locale.value)

async function changeLanguage(code: string) {
  if (code === 'auto') {
    const browserLang = navigator.language
    const supported = locales.value.map(l => l.code)
    // Try exact match first (e.g., pt-BR), then partial match (e.g., pt)
    const exactMatch = supported.find(s => s.toLowerCase() === browserLang.toLowerCase())
    const partialMatch = supported.find(s => 
      browserLang.toLowerCase().startsWith(s.split('-')[0].toLowerCase()) ||
      s.toLowerCase().startsWith(browserLang.split('-')[0].toLowerCase())
    )
    const newLocale = exactMatch || partialMatch || 'en'
    await setLocale(newLocale)
  } else {
    await setLocale(code)
  }
  selectedLanguage.value = code
}

// UI Mode options
const uiModeOptions = computed(() => [
  { value: 'auto' as const, title: t('settings.uiMode.auto'), subtitle: t('settings.uiMode.autoSubtitle') },
  { value: 'tv' as UiMode, title: t('settings.uiMode.tv'), subtitle: t('settings.uiMode.tvSubtitle') },
  { value: 'desktop' as UiMode, title: t('settings.uiMode.desktop'), subtitle: t('settings.uiMode.desktopSubtitle') },
  { value: 'touch' as UiMode, title: t('settings.uiMode.touch'), subtitle: t('settings.uiMode.touchSubtitle') },
])

const selectedUiMode = computed({
  get: () => overrideMode.value ?? 'auto',
  set: (value: UiMode | 'auto') => {
    setOverride(value === 'auto' ? null : value)
  },
})

// Correction Factor
const correctionFactor = computed({
  get: () => calibrationStore.correctionFactor,
  set: (value: number) => calibrationStore.setCorrectionFactor(value),
})

const correctionFactorPercent = computed(() =>
  `${correctionFactor.value >= 1 ? '+' : ''}${Math.round((correctionFactor.value - 1) * 100)}%`
)

// High Contrast
const highContrastEnabled = computed({
  get: () => proModeStore.highContrastEnabled,
  set: (value: boolean) => proModeStore.setHighContrast(value),
})

// Pro Mode
const proModeEnabled = computed({
  get: () => proModeStore.isProModeEnabled,
  set: (value: boolean) => {
    if (value) {
      proModeStore.enableProMode()
    } else {
      proModeStore.disableProMode()
    }
  },
})

const settingsLocked = computed({
  get: () => proModeStore.settingsLocked,
  set: (value: boolean) => proModeStore.setSettingsLock(value),
})

const calibrationLocked = computed({
  get: () => proModeStore.calibrationLocked,
  set: (value: boolean) => proModeStore.setCalibrationLock(value),
})

// PIN Dialog
const showPinDialog = ref(false)
const pinDialogMode = ref<'validate' | 'set'>('validate')
const pinDialogTitle = ref('Digite o PIN')
const pendingAction = ref<(() => void) | null>(null)

function openChangePinDialog() {
  pinDialogMode.value = 'set'
  pinDialogTitle.value = 'Alterar PIN'
  pendingAction.value = null
  showPinDialog.value = true
}

function handlePinSuccess(pin: string) {
  if (pinDialogMode.value === 'set') {
    proModeStore.setPin(pin)
  } else if (pendingAction.value) {
    pendingAction.value()
    pendingAction.value = null
  }
}

function resetTestCount() {
  proModeStore.resetTestCount()
}

// Reset calibração
function resetCalibration() {
  if (proModeEnabled.value && calibrationLocked.value) {
    pinDialogMode.value = 'validate'
    pinDialogTitle.value = 'PIN para Resetar'
    pendingAction.value = () => {
      calibrationStore.reset()
    }
    showPinDialog.value = true
  } else {
    calibrationStore.reset()
  }
}

// Focus management
const focusedSection = ref(0)
const focusedIndex = ref(0)

const sections = computed(() => [
  { id: 'ui-mode', items: uiModeOptions.length },
  { id: 'calibration', items: 3 }, // slider, reset btn, correction label
  { id: 'appearance', items: 1 }, // high contrast toggle
  { id: 'pro-mode', items: proModeEnabled.value ? 5 : 1 }, // toggle + locks + pin + counter + reset
])

function moveFocusVertical(delta: number) {
  const currentSection = sections.value[focusedSection.value]
  const newIndex = focusedIndex.value + delta

  if (newIndex >= 0 && newIndex < currentSection.items) {
    focusedIndex.value = newIndex
  } else if (delta > 0 && focusedSection.value < sections.value.length - 1) {
    focusedSection.value++
    focusedIndex.value = 0
  } else if (delta < 0 && focusedSection.value > 0) {
    focusedSection.value--
    focusedIndex.value = sections.value[focusedSection.value].items - 1
  }

  nextTick(() => {
    const item = document.querySelector(
      `[data-section="${focusedSection.value}"][data-index="${focusedIndex.value}"]`
    ) as HTMLElement
    item?.focus()
  })
}

useRemoteNavigation({
  onUp: () => moveFocusVertical(-1),
  onDown: () => moveFocusVertical(1),
  onLeft: () => {
    if (focusedSection.value === 1 && focusedIndex.value === 0) {
      correctionFactor.value = Math.max(CONFIG.MIN_CORRECTION_FACTOR, correctionFactor.value - 0.01)
    }
  },
  onRight: () => {
    if (focusedSection.value === 1 && focusedIndex.value === 0) {
      correctionFactor.value = Math.min(CONFIG.MAX_CORRECTION_FACTOR, correctionFactor.value + 0.01)
    }
  },
})

onMounted(() => {
  nextTick(() => {
    const item = document.querySelector('[data-section="0"][data-index="0"]') as HTMLElement
    item?.focus()
  })
})
</script>

<template>
  <div class="settings-page d-flex flex-column fill-height">
    <header class="mb-6">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        to="/"
        class="mb-4"
      >
        {{ $t('nav.back') }}
      </v-btn>
      <h1 class="text-h4 font-weight-bold">
        <v-icon icon="mdi-cog-outline" class="mr-2" />
        {{ $t('settings.title') }}
      </h1>
    </header>

    <!-- Language -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1">
        <v-icon icon="mdi-translate" class="mr-2" />
        {{ $t('settings.language.title') }}
      </v-card-title>

      <v-divider />

      <v-list class="py-0">
        <v-list-item
          v-for="option in languageOptions"
          :key="option.code"
          class="settings-item"
          lines="one"
          @click="changeLanguage(option.code)"
        >
          <template #prepend>
            <v-radio
              :model-value="selectedLanguage"
              :value="option.code"
              hide-details
              density="compact"
              @click.stop
            />
          </template>
          <v-list-item-title>{{ option.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- UI Mode -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1">
        {{ $t('settings.uiMode.title') }}
      </v-card-title>
      <v-card-subtitle class="pb-2">
        {{ $t('settings.uiMode.detected') }}: <strong>{{ detectedMode }}</strong> |
        {{ $t('settings.uiMode.current') }}: <strong>{{ uiMode }}</strong>
      </v-card-subtitle>

      <v-divider />

      <v-list class="py-0">
        <v-list-item
          v-for="(option, index) in uiModeOptions"
          :key="option.value"
          :data-section="0"
          :data-index="index"
          :tabindex="focusedSection === 0 && focusedIndex === index ? 0 : -1"
          class="settings-item"
          lines="two"
          @click="selectedUiMode = option.value"
          @focus="focusedSection = 0; focusedIndex = index"
          @keydown.enter.prevent="selectedUiMode = option.value"
        >
          <template #prepend>
            <v-radio
              :model-value="selectedUiMode"
              :value="option.value"
              hide-details
              density="compact"
              @click.stop
            />
          </template>
          <v-list-item-title>{{ option.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ option.subtitle }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Calibração -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1">
        <v-icon icon="mdi-tune-vertical" class="mr-2" />
        {{ $t('settings.calibration.title') }}
      </v-card-title>

      <v-card-text>
        <!-- Correction Factor Slider -->
        <div class="mb-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">{{ $t('settings.calibration.correctionFactor') }}</span>
            <v-chip size="small" color="primary" variant="tonal">
              {{ correctionFactorPercent }}
            </v-chip>
          </div>
          <v-slider
            v-model="correctionFactor"
            :data-section="1"
            :data-index="0"
            :tabindex="focusedSection === 1 && focusedIndex === 0 ? 0 : -1"
            :min="CONFIG.MIN_CORRECTION_FACTOR"
            :max="CONFIG.MAX_CORRECTION_FACTOR"
            :step="0.01"
            thumb-label
            hide-details
            color="primary"
            class="settings-item"
            @focus="focusedSection = 1; focusedIndex = 0"
          >
            <template #thumb-label="{ modelValue }">
              {{ (modelValue as number).toFixed(2) }}
            </template>
          </v-slider>
          <p class="text-caption text-medium-emphasis mt-1">
            {{ $t('settings.calibration.description') }}
          </p>
        </div>

        <!-- Calibration Info -->
        <v-alert
          v-if="calibrationStore.isCalibrated"
          type="success"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          {{ $t('settings.calibration.calibrated') }}: {{ calibrationStore.distanceM }}m @ {{ calibrationStore.pxPerMm.toFixed(1) }} px/mm
        </v-alert>
        <v-alert
          v-else
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          {{ $t('settings.calibration.notCalibrated') }}
        </v-alert>

        <!-- Reset Calibration -->
        <v-btn
          :data-section="1"
          :data-index="1"
          :tabindex="focusedSection === 1 && focusedIndex === 1 ? 0 : -1"
          variant="outlined"
          color="warning"
          prepend-icon="mdi-refresh"
          class="settings-item"
          :disabled="!calibrationStore.isCalibrated"
          @click="resetCalibration"
          @focus="focusedSection = 1; focusedIndex = 1"
        >
          {{ $t('settings.calibration.reset') }}
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Aparência -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1">
        <v-icon icon="mdi-palette-outline" class="mr-2" />
        {{ $t('settings.appearance.title') }}
      </v-card-title>

      <v-list class="py-0">
        <v-list-item
          :data-section="2"
          :data-index="0"
          :tabindex="focusedSection === 2 && focusedIndex === 0 ? 0 : -1"
          class="settings-item"
          @click="highContrastEnabled = !highContrastEnabled"
          @focus="focusedSection = 2; focusedIndex = 0"
          @keydown.enter.prevent="highContrastEnabled = !highContrastEnabled"
        >
          <template #prepend>
            <v-icon icon="mdi-contrast-circle" class="mr-3" />
          </template>
          <v-list-item-title>{{ $t('settings.appearance.highContrast') }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ $t('settings.appearance.highContrastDescription') }}
          </v-list-item-subtitle>
          <template #append>
            <v-switch
              v-model="highContrastEnabled"
              hide-details
              density="compact"
              color="primary"
              @click.stop
            />
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Pro Mode -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1">
        <v-icon icon="mdi-shield-lock-outline" class="mr-2" />
        {{ $t('settings.proMode.title') }}
      </v-card-title>

      <v-list class="py-0">
        <!-- Enable Pro Mode -->
        <v-list-item
          :data-section="3"
          :data-index="0"
          :tabindex="focusedSection === 3 && focusedIndex === 0 ? 0 : -1"
          class="settings-item"
          @click="proModeEnabled = !proModeEnabled"
          @focus="focusedSection = 3; focusedIndex = 0"
          @keydown.enter.prevent="proModeEnabled = !proModeEnabled"
        >
          <v-list-item-title>{{ $t('settings.proMode.enable') }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ $t('settings.proMode.enableDescription') }}
          </v-list-item-subtitle>
          <template #append>
            <v-switch
              v-model="proModeEnabled"
              hide-details
              density="compact"
              color="primary"
              @click.stop
            />
          </template>
        </v-list-item>

        <template v-if="proModeEnabled">
          <v-divider />

          <!-- Lock Settings -->
          <v-list-item
            :data-section="3"
            :data-index="1"
            :tabindex="focusedSection === 3 && focusedIndex === 1 ? 0 : -1"
            class="settings-item"
            @click="settingsLocked = !settingsLocked"
            @focus="focusedSection = 3; focusedIndex = 1"
            @keydown.enter.prevent="settingsLocked = !settingsLocked"
          >
            <template #prepend>
              <v-icon :icon="settingsLocked ? 'mdi-lock' : 'mdi-lock-open-outline'" class="mr-3" />
            </template>
            <v-list-item-title>{{ $t('settings.proMode.lockSettings') }}</v-list-item-title>
            <v-list-item-subtitle>{{ $t('settings.proMode.lockSettingsDescription') }}</v-list-item-subtitle>
            <template #append>
              <v-switch
                v-model="settingsLocked"
                hide-details
                density="compact"
                color="warning"
                @click.stop
              />
            </template>
          </v-list-item>

          <!-- Lock Calibration -->
          <v-list-item
            :data-section="3"
            :data-index="2"
            :tabindex="focusedSection === 3 && focusedIndex === 2 ? 0 : -1"
            class="settings-item"
            @click="calibrationLocked = !calibrationLocked"
            @focus="focusedSection = 3; focusedIndex = 2"
            @keydown.enter.prevent="calibrationLocked = !calibrationLocked"
          >
            <template #prepend>
              <v-icon :icon="calibrationLocked ? 'mdi-lock' : 'mdi-lock-open-outline'" class="mr-3" />
            </template>
            <v-list-item-title>{{ $t('settings.proMode.lockCalibration') }}</v-list-item-title>
            <v-list-item-subtitle>{{ $t('settings.proMode.lockCalibrationDescription') }}</v-list-item-subtitle>
            <template #append>
              <v-switch
                v-model="calibrationLocked"
                hide-details
                density="compact"
                color="warning"
                @click.stop
              />
            </template>
          </v-list-item>

          <v-divider />

          <!-- Change PIN -->
          <v-list-item
            :data-section="3"
            :data-index="3"
            :tabindex="focusedSection === 3 && focusedIndex === 3 ? 0 : -1"
            class="settings-item"
            @click="openChangePinDialog"
            @focus="focusedSection = 3; focusedIndex = 3"
            @keydown.enter.prevent="openChangePinDialog"
          >
            <template #prepend>
              <v-icon icon="mdi-form-textbox-password" class="mr-3" />
            </template>
            <v-list-item-title>{{ $t('settings.proMode.changePin') }}</v-list-item-title>
            <v-list-item-subtitle>{{ $t('settings.proMode.currentPin') }}: ****</v-list-item-subtitle>
            <template #append>
              <v-icon icon="mdi-chevron-right" />
            </template>
          </v-list-item>

          <v-divider />

          <!-- Test Counter -->
          <v-list-item
            :data-section="3"
            :data-index="4"
            :tabindex="focusedSection === 3 && focusedIndex === 4 ? 0 : -1"
            class="settings-item"
            @focus="focusedSection = 3; focusedIndex = 4"
          >
            <template #prepend>
              <v-icon icon="mdi-counter" class="mr-3" />
            </template>
            <v-list-item-title>{{ $t('settings.proMode.testCounter') }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ $t('settings.proMode.testsCompleted', { count: proModeStore.testCount }) }}
              <template v-if="proModeStore.lastTestDate">
                • {{ $t('settings.proMode.lastTest') }}: {{ proModeStore.lastTestDate }}
              </template>
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                variant="text"
                color="error"
                size="small"
                icon="mdi-delete-outline"
                @click.stop="resetTestCount"
              />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <footer class="mt-auto d-flex justify-center">
      <RemoteHint />
    </footer>

    <!-- PIN Dialog -->
    <PinDialog
      v-model="showPinDialog"
      :mode="pinDialogMode"
      :title="pinDialogTitle"
      @success="handlePinSuccess"
    />
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.settings-item:focus-visible {
  background-color: rgba(var(--v-theme-primary), 0.12);
}
</style>
