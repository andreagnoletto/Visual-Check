<script setup lang="ts">
import { SCREEN_PRESETS, CONFIG } from '~/utils/constants'
import { useCalibrationStore } from '~/stores/calibration'
import { useZoomWarning } from '~/composables/useZoomWarning'
import { useResetShortcut } from '~/composables/useResetShortcut'

definePageMeta({
  title: 'Calibração',
})

const router = useRouter()
const calibrationStore = useCalibrationStore()
const { hasZoomWarning } = useZoomWarning()

// Estado local do formulário
const distanceM = ref(calibrationStore.distanceM)
const selectedPreset = ref<number | null>(null)
const calibrationMethod = ref<'preset' | 'card'>('preset')
const cardWidthPx = ref(256) // Slider para calibração por cartão

// Computed para pxPerMm baseado no método
const pxPerMm = computed(() => {
  if (calibrationMethod.value === 'preset' && selectedPreset.value !== null) {
    return SCREEN_PRESETS[selectedPreset.value]!.pxPerMm
  }
  // Cartão de crédito: 85.6mm de largura
  return cardWidthPx.value / 85.6
})

// Warnings
const distanceWarning = computed(() => {
  if (distanceM.value < CONFIG.MIN_DISTANCE_M) {
    return `Mínimo recomendado: ${CONFIG.MIN_DISTANCE_M}m`
  }
  if (distanceM.value > CONFIG.MAX_DISTANCE_M) {
    return `Máximo recomendado: ${CONFIG.MAX_DISTANCE_M}m`
  }
  return null
})

const pxPerMmWarning = computed(() => {
  const val = pxPerMm.value
  if (val < CONFIG.MIN_PX_PER_MM) {
    return `Densidade muito baixa (${val.toFixed(1)} px/mm)`
  }
  if (val > CONFIG.MAX_PX_PER_MM) {
    return `Densidade muito alta (${val.toFixed(1)} px/mm)`
  }
  return null
})

// Navegação por teclado
type FocusSection = 'distance' | 'method' | 'preset' | 'card' | 'confirm'
const focusedSection = ref<FocusSection>('distance')

function moveFocus(direction: 'up' | 'down') {
  const sections: FocusSection[] = ['distance', 'method', calibrationMethod.value === 'preset' ? 'preset' : 'card', 'confirm']
  const currentIndex = sections.indexOf(focusedSection.value)
  const newIndex = direction === 'down' ? currentIndex + 1 : currentIndex - 1
  
  const nextSection = sections[newIndex]
  if (newIndex >= 0 && newIndex < sections.length && nextSection) {
    focusedSection.value = nextSection
  }
}

function adjustDistance(delta: number) {
  distanceM.value = Math.max(1, Math.min(15, distanceM.value + delta))
}

function adjustCardWidth(delta: number) {
  cardWidthPx.value = Math.max(100, Math.min(500, cardWidthPx.value + delta))
}

function selectPreset(index: number) {
  selectedPreset.value = index
}

function confirmCalibration() {
  calibrationStore.setDistance(distanceM.value)
  calibrationStore.setPxPerMm(pxPerMm.value)
  if (selectedPreset.value !== null) {
    calibrationStore.setAspectRatio(SCREEN_PRESETS[selectedPreset.value]!.aspectRatio)
  }
  calibrationStore.completeCalibration()
  router.push('/tests')
}

useRemoteNavigation({
  onUp: () => moveFocus('up'),
  onDown: () => moveFocus('down'),
  onLeft: () => {
    if (focusedSection.value === 'distance') adjustDistance(-0.5)
    else if (focusedSection.value === 'card') adjustCardWidth(-10)
    else if (focusedSection.value === 'preset' && selectedPreset.value !== null && selectedPreset.value > 0) {
      selectPreset(selectedPreset.value - 1)
    }
  },
  onRight: () => {
    if (focusedSection.value === 'distance') adjustDistance(0.5)
    else if (focusedSection.value === 'card') adjustCardWidth(10)
    else if (focusedSection.value === 'preset') {
      if (selectedPreset.value === null) selectPreset(0)
      else if (selectedPreset.value < SCREEN_PRESETS.length - 1) selectPreset(selectedPreset.value + 1)
    }
  },
  onConfirm: () => {
    if (focusedSection.value === 'method') {
      calibrationMethod.value = calibrationMethod.value === 'preset' ? 'card' : 'preset'
    } else if (focusedSection.value === 'confirm') {
      confirmCalibration()
    }
  },
})

// Reset shortcut
const { showResetModal, confirmReset, cancelReset } = useResetShortcut(() => {
  calibrationStore.reset()
  distanceM.value = calibrationStore.distanceM
  selectedPreset.value = null
  cardWidthPx.value = 256
})
</script>

<template>
  <div class="setup-page d-flex flex-column fill-height">
    <header class="mb-6">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        to="/"
        class="mb-4"
      >
        Voltar
      </v-btn>
      <h1 class="text-h4 font-weight-bold">
        <v-icon icon="mdi-tune" class="mr-2" />
        Calibração
      </h1>
      <p class="text-body-1 text-medium-emphasis mt-2">
        Configure a distância e resolução da tela
      </p>
    </header>

    <!-- Avisos -->
    <div v-if="hasZoomWarning" class="mb-4">
      <v-alert type="warning" variant="tonal" density="compact">
        Zoom do navegador pode invalidar a calibração. Use 100%.
      </v-alert>
    </div>

    <!-- Formulário -->
    <div class="flex-grow-1 d-flex flex-column ga-4">
      <!-- Distância -->
      <v-card
        variant="outlined"
        :class="{ 'border-primary': focusedSection === 'distance' }"
        @click="focusedSection = 'distance'"
      >
        <v-card-title class="text-subtitle-1">
          1. Distância do observador
        </v-card-title>
        <v-card-text>
          <div class="d-flex align-center ga-4">
            <v-btn
              icon="mdi-minus"
              variant="tonal"
              @click="adjustDistance(-0.5)"
            />
            <div class="text-center flex-grow-1">
              <div class="text-h3 font-weight-bold">{{ distanceM.toFixed(1) }}m</div>
              <div class="text-caption text-medium-emphasis">
                Distância até a tela
              </div>
            </div>
            <v-btn
              icon="mdi-plus"
              variant="tonal"
              @click="adjustDistance(0.5)"
            />
          </div>
          <v-slider
            v-model="distanceM"
            :min="1"
            :max="10"
            :step="0.5"
            hide-details
            class="mt-4"
            color="primary"
          />
          <v-alert
            v-if="distanceWarning"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ distanceWarning }}
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Método de calibração -->
      <v-card
        variant="outlined"
        :class="{ 'border-primary': focusedSection === 'method' }"
        @click="focusedSection = 'method'"
      >
        <v-card-title class="text-subtitle-1">
          2. Método de calibração
        </v-card-title>
        <v-card-text>
          <v-btn-toggle
            v-model="calibrationMethod"
            mandatory
            divided
            variant="outlined"
            class="w-100"
          >
            <v-btn value="preset" class="flex-grow-1">
              <v-icon start icon="mdi-television" />
              Preset de Tela
            </v-btn>
            <v-btn value="card" class="flex-grow-1">
              <v-icon start icon="mdi-credit-card-outline" />
              Cartão de Crédito
            </v-btn>
          </v-btn-toggle>
        </v-card-text>
      </v-card>

      <!-- Presets -->
      <v-card
        v-if="calibrationMethod === 'preset'"
        variant="outlined"
        :class="{ 'border-primary': focusedSection === 'preset' }"
        @click="focusedSection = 'preset'"
      >
        <v-card-title class="text-subtitle-1">
          3. Tamanho da tela
        </v-card-title>
        <v-card-text>
          <v-chip-group
            v-model="selectedPreset"
            mandatory
            selected-class="bg-primary"
          >
            <v-chip
              v-for="(preset, index) in SCREEN_PRESETS"
              :key="preset.label"
              :value="index"
              variant="outlined"
              filter
            >
              {{ preset.label }}
            </v-chip>
          </v-chip-group>
          <div v-if="selectedPreset !== null" class="mt-3 text-body-2">
            <strong>Densidade:</strong> {{ SCREEN_PRESETS[selectedPreset]?.pxPerMm }} px/mm
          </div>
        </v-card-text>
      </v-card>

      <!-- Calibração por cartão -->
      <v-card
        v-else
        variant="outlined"
        :class="{ 'border-primary': focusedSection === 'card' }"
        @click="focusedSection = 'card'"
      >
        <v-card-title class="text-subtitle-1">
          3. Ajuste com cartão de crédito
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-4">
            Coloque um cartão de crédito na tela e ajuste até que a barra
            azul tenha exatamente a mesma largura (85.6mm).
          </p>
          <div
            class="card-reference bg-primary rounded mx-auto mb-4"
            :style="{ width: `${cardWidthPx}px`, height: '40px' }"
          />
          <v-slider
            v-model="cardWidthPx"
            :min="100"
            :max="500"
            :step="1"
            hide-details
            color="primary"
          />
          <div class="text-center mt-2 text-body-2">
            <strong>Densidade calculada:</strong> {{ pxPerMm.toFixed(2) }} px/mm
          </div>
          <v-alert
            v-if="pxPerMmWarning"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ pxPerMmWarning }}
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Botão confirmar -->
      <v-btn
        color="primary"
        size="x-large"
        block
        :class="{ 'border-primary': focusedSection === 'confirm' }"
        :disabled="calibrationMethod === 'preset' && selectedPreset === null"
        @click="confirmCalibration"
        @focus="focusedSection = 'confirm'"
      >
        <v-icon start icon="mdi-check" />
        Confirmar Calibração
      </v-btn>
    </div>

    <!-- Remote Hint -->
    <footer class="mt-4 d-flex justify-center">
      <RemoteHint />
    </footer>

    <!-- Reset Modal -->
    <v-dialog v-model="showResetModal" max-width="400">
      <v-card>
        <v-card-title>Resetar Calibração?</v-card-title>
        <v-card-text>
          Isso irá apagar todas as configurações de calibração.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelReset">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="confirmReset">Resetar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.setup-page {
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.card-reference {
  transition: width 0.1s ease-out;
}

.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}
</style>
