<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAcuityTest } from '~/composables/useAcuityTest'
import { useFontReady } from '~/composables/useFontReady'
import { useCalibrationStore } from '~/stores/calibration'
import { useProModeStore } from '~/stores/proMode'
import { normalizeInput } from '~/utils/normalizeInput'
import { OPTOTYPE_POOLS } from '~/utils/optotypeCalculations'

const { t } = useI18n()

definePageMeta({
  title: 'Teste Snellen',
})

const router = useRouter()
const calibration = useCalibrationStore()
const proModeStore = useProModeStore()
const { isReady: fontReady, isLoading: fontLoading } = useFontReady()

const {
  phase,
  currentLine,
  currentChar,
  currentSequence,
  optotypeSize,
  progress,
  results,
  bestResult,
  startTest,
  recordAnswer,
  restartTest,
} = useAcuityTest({ optotypeType: 'snellen' })

// Botões de resposta
const charButtons = OPTOTYPE_POOLS.snellen

// Controle de foco para navegação TV
const focusedButtonIndex = ref(0)
const buttonRefs = ref<HTMLButtonElement[]>([])

function setButtonRef(el: unknown, index: number) {
  if (el instanceof HTMLButtonElement) {
    buttonRefs.value[index] = el
  }
}

function focusButton(index: number) {
  const clamped = Math.max(0, Math.min(index, charButtons.length - 1))
  focusedButtonIndex.value = clamped
  buttonRefs.value[clamped]?.focus()
}

function handleAnswer(char: string) {
  const expected = currentChar.value.toUpperCase()
  const received = char.toUpperCase()
  recordAnswer(expected === received)
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
    
    switch (action) {
      case 'left':
        focusButton(focusedButtonIndex.value - 1)
        break
      case 'right':
        focusButton(focusedButtonIndex.value + 1)
        break
      case 'up':
        focusButton(focusedButtonIndex.value - 3)
        break
      case 'down':
        focusButton(focusedButtonIndex.value + 3)
        break
      case 'confirm':
        handleAnswer(charButtons[focusedButtonIndex.value]!)
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
        <h1 class="text-h4 font-weight-bold">{{ $t('tests.snellen.title') }}</h1>
      </header>

      <v-card class="flex-grow-1 d-flex flex-column align-center justify-center pa-8">
        <v-icon icon="mdi-format-letter-case" size="80" color="primary" class="mb-6" />
        
        <h2 class="text-h5 mb-4 text-center">{{ $t('tests.instructions.title') }}</h2>
        
        <v-list class="bg-transparent mb-6" max-width="500">
          <v-list-item prepend-icon="mdi-numeric-1-circle">
            <v-list-item-title>{{ $t('tests.instructions.snellen.step1') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-2-circle">
            <v-list-item-title>{{ $t('tests.instructions.snellen.step2') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-3-circle">
            <v-list-item-title>{{ $t('tests.instructions.snellen.step3') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-4-circle">
            <v-list-item-title>{{ $t('tests.instructions.snellen.step4', { distance: calibration.distanceM }) }}</v-list-item-title>
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
          {{ $t('tests.attempt') }} {{ progress.char }}/{{ progress.charsInLine }}
        </v-chip>
      </div>

      <v-progress-linear
        :model-value="((progress.line - 1) / progress.totalLines) * 100"
        color="primary"
        class="mb-6"
      />

      <!-- Área do optótipo -->
      <div class="optotype-area flex-grow-1 d-flex align-center justify-center">
        <span
          class="optotype"
          data-testid="optotype"
          :style="{
            fontSize: `${optotypeSize.fontSizePx}px`,
          }"
        >
          {{ currentChar }}
        </span>
      </div>

      <!-- Botões de resposta -->
      <div class="answer-buttons d-flex flex-wrap justify-center gap-2 mt-6 mb-4">
        <v-btn
          v-for="(char, index) in charButtons"
          :key="char"
          :ref="(el) => setButtonRef(el, index)"
          variant="outlined"
          size="large"
          class="char-button"
          :class="{ 'focused': focusedButtonIndex === index }"
          :tabindex="focusedButtonIndex === index ? 0 : -1"
          @click="handleAnswer(char)"
        >
          {{ char }}
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

.optotype-area {
  min-height: 200px;
}

.char-button {
  min-width: 64px;
  font-size: 1.25rem;
  font-weight: bold;
}

.char-button.focused {
  outline: 3px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* TV mode: botões maiores */
.ui-mode-tv .char-button {
  min-width: 80px;
  min-height: 80px;
  font-size: 1.5rem;
}
</style>
