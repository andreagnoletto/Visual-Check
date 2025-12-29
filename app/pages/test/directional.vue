<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDirectionalTest } from '~/composables/useDirectionalTest'
import { useFontReady } from '~/composables/useFontReady'
import { useCalibrationStore } from '~/stores/calibration'
import { useProModeStore } from '~/stores/proMode'
import { normalizeInput } from '~/utils/normalizeInput'
import type { Direction } from '~/utils/optotypeCalculations'

const { t } = useI18n()

definePageMeta({
  title: 'Teste Direcional',
})

const router = useRouter()
const calibration = useCalibrationStore()
const proModeStore = useProModeStore()
const { isReady: fontReady, isLoading: fontLoading } = useFontReady()

const {
  phase,
  currentLine,
  currentDirection,
  currentRotation,
  optotypeSize,
  progress,
  results,
  bestResult,
  startTest,
  handleDirectionInput,
  restartTest,
} = useDirectionalTest()

// Botões de direção
const directionButtons: { direction: Direction; icon: string; label: string }[] = [
  { direction: 'up', icon: 'mdi-arrow-up', label: 'Cima' },
  { direction: 'right', icon: 'mdi-arrow-right', label: 'Direita' },
  { direction: 'down', icon: 'mdi-arrow-down', label: 'Baixo' },
  { direction: 'left', icon: 'mdi-arrow-left', label: 'Esquerda' },
]

// Controle de foco para navegação TV
const focusedButtonIndex = ref(0)
const buttonRefs = ref<HTMLButtonElement[]>([])

function setButtonRef(el: unknown, index: number) {
  if (el instanceof HTMLButtonElement) {
    buttonRefs.value[index] = el
  }
}

function focusButton(index: number) {
  const clamped = Math.max(0, Math.min(index, directionButtons.length - 1))
  focusedButtonIndex.value = clamped
  buttonRefs.value[clamped]?.focus()
}

function handleKeyDown(event: KeyboardEvent) {
  const action = normalizeInput(event)
  
  if (!action) return
  
  if (phase.value === 'ready') {
    if (action === 'confirm') {
      event.preventDefault()
      startTest()
    }
    return
  }

  if (phase.value === 'testing') {
    event.preventDefault()
    
    // Navegação por setas também serve como resposta direta
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right') {
      handleDirectionInput(action as Direction)
      return
    }
    
    switch (action) {
      case 'confirm':
        handleDirectionInput(directionButtons[focusedButtonIndex.value]!.direction)
        break
      case 'back':
        router.push('/tests')
        break
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function handleExit() {
  router.push('/tests')
}

function handleRestart() {
  restartTest()
}

// Incrementar contador quando teste termina
watch(phase, (newPhase) => {
  if (newPhase === 'finished') {
    proModeStore.incrementTestCount()
  }
})
</script>

<template>
  <div class="test-page d-flex flex-column fill-height">
    <!-- Loading fonte -->
    <div v-if="fontLoading" class="d-flex flex-column align-center justify-center fill-height">
      <v-progress-circular indeterminate size="64" color="primary" />
      <p class="mt-4 text-medium-emphasis">{{ $t('common.loadingFont') }}</p>
    </div>

    <!-- Tela inicial -->
    <template v-else-if="phase === 'ready'">
      <header class="mb-6">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          to="/tests"
          class="mb-4"
        >
          {{ $t('nav.back') }}
        </v-btn>
        <h1 class="text-h4 font-weight-bold">{{ $t('tests.directional.title') }}</h1>
      </header>

      <v-card class="flex-grow-1 d-flex flex-column align-center justify-center pa-8">
        <div class="tumbling-e-demo mb-6">
          <TumblingE :size="80" direction="right" />
        </div>
        
        <h2 class="text-h5 mb-4 text-center">{{ $t('tests.instructions.title') }}</h2>
        
        <v-list class="bg-transparent mb-6" max-width="500">
          <v-list-item prepend-icon="mdi-numeric-1-circle">
            <v-list-item-title>{{ $t('tests.instructions.directional.step1') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-2-circle">
            <v-list-item-title>{{ $t('tests.instructions.directional.step2') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-3-circle">
            <v-list-item-title>{{ $t('tests.instructions.directional.step3') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-4-circle">
            <v-list-item-title>{{ $t('tests.instructions.directional.step4', { distance: calibration.distanceM }) }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-btn
          color="primary"
          size="x-large"
          prepend-icon="mdi-play"
          @click="startTest"
        >
          {{ $t('tests.startTest') }}
        </v-btn>
      </v-card>

      <footer class="mt-4 d-flex justify-center">
        <RemoteHint />
      </footer>
    </template>

    <!-- Teste em andamento -->
    <template v-else-if="phase === 'testing'">
      <!-- Progress bar -->
      <div class="test-header d-flex align-center justify-space-between mb-4">
        <v-chip variant="outlined" size="small">
          {{ $t('tests.line') }} {{ progress.line }}/{{ progress.totalLines }}
        </v-chip>
        <v-chip variant="outlined" size="small">
          {{ currentLine.snellen }}
        </v-chip>
        <v-chip variant="outlined" size="small">
          {{ $t('tests.attempt') }} {{ progress.attempt }}/{{ progress.attemptsInLine }}
        </v-chip>
      </div>

      <v-progress-linear
        :model-value="((progress.line - 1) / progress.totalLines) * 100"
        color="primary"
        class="mb-6"
      />

      <!-- Área do optótipo -->
      <div class="optotype-area flex-grow-1 d-flex align-center justify-center">
        <TumblingE
          data-testid="optotype"
          :size="optotypeSize.fontSizePx"
          :direction="currentDirection"
        />
      </div>

      <!-- Botões de direção em cruz -->
      <div class="direction-pad mt-6 mb-4">
        <!-- Cima -->
        <v-btn
          :ref="(el) => setButtonRef(el, 0)"
          variant="outlined"
          size="large"
          icon
          class="direction-button up"
          :class="{ 'focused': focusedButtonIndex === 0 }"
          :tabindex="focusedButtonIndex === 0 ? 0 : -1"
          @click="handleDirectionInput('up')"
        >
          <v-icon icon="mdi-arrow-up" />
        </v-btn>
        
        <!-- Esquerda e Direita -->
        <div class="direction-row">
          <v-btn
            :ref="(el) => setButtonRef(el, 3)"
            variant="outlined"
            size="large"
            icon
            class="direction-button"
            :class="{ 'focused': focusedButtonIndex === 3 }"
            :tabindex="focusedButtonIndex === 3 ? 0 : -1"
            @click="handleDirectionInput('left')"
          >
            <v-icon icon="mdi-arrow-left" />
          </v-btn>
          
          <div class="direction-spacer" />
          
          <v-btn
            :ref="(el) => setButtonRef(el, 1)"
            variant="outlined"
            size="large"
            icon
            class="direction-button"
            :class="{ 'focused': focusedButtonIndex === 1 }"
            :tabindex="focusedButtonIndex === 1 ? 0 : -1"
            @click="handleDirectionInput('right')"
          >
            <v-icon icon="mdi-arrow-right" />
          </v-btn>
        </div>
        
        <!-- Baixo -->
        <v-btn
          :ref="(el) => setButtonRef(el, 2)"
          variant="outlined"
          size="large"
          icon
          class="direction-button down"
          :class="{ 'focused': focusedButtonIndex === 2 }"
          :tabindex="focusedButtonIndex === 2 ? 0 : -1"
          @click="handleDirectionInput('down')"
        >
          <v-icon icon="mdi-arrow-down" />
        </v-btn>
      </div>

      <footer class="d-flex justify-center">
        <RemoteHint />
      </footer>
    </template>

    <!-- Resultados -->
    <template v-else-if="phase === 'finished'">
      <TestResults
        :results="results"
        :best-result="bestResult"
        @restart="handleRestart"
        @exit="handleExit"
      />
    </template>
  </div>
</template>

<style scoped>
.test-page {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.tumbling-e-demo {
  display: flex;
  gap: 1rem;
}

.optotype-area {
  min-height: 200px;
}

.direction-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.direction-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.direction-spacer {
  width: 64px;
  height: 64px;
}

.direction-button {
  width: 64px;
  height: 64px;
}

.direction-button.focused {
  outline: 3px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* TV mode: botões maiores */
.ui-mode-tv .direction-button {
  width: 80px;
  height: 80px;
}

.ui-mode-tv .direction-spacer {
  width: 80px;
  height: 80px;
}
</style>
