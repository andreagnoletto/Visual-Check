<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJaegerTest } from '~/composables/useJaegerTest'
import { useCalibrationStore } from '~/stores/calibration'
import { useProModeStore } from '~/stores/proMode'
import { normalizeInput } from '~/utils/normalizeInput'

const { t } = useI18n()

definePageMeta({
  title: 'Teste Jaeger',
})

const router = useRouter()
const calibration = useCalibrationStore()
const proModeStore = useProModeStore()

const {
  phase,
  currentLine,
  currentText,
  fontSize,
  progress,
  results,
  bestResult,
  distanceCm,
  startTest,
  confirmReading,
  cannotRead,
  restartTest,
  generateNewText,
} = useJaegerTest()

// Controle de foco para navegação TV
const focusedButtonIndex = ref(0)

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
      case 'confirm':
      case 'right':
        confirmReading()
        break
      case 'back':
      case 'left':
        cannotRead()
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
    <!-- Tela inicial -->
    <template v-if="phase === 'ready'">
      <header class="mb-6">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          to="/tests"
          class="mb-4"
        >
          {{ $t('nav.back') }}
        </v-btn>
        <h1 class="text-h4 font-weight-bold">{{ $t('tests.jaeger.title') }}</h1>
      </header>

      <v-card class="flex-grow-1 d-flex flex-column align-center justify-center pa-8">
        <v-icon icon="mdi-book-open-page-variant" size="80" class="mb-6 text-primary" />
        
        <h2 class="text-h5 mb-4 text-center">{{ $t('tests.instructions.title') }}</h2>
        
        <v-list class="bg-transparent mb-6" max-width="500">
          <v-list-item prepend-icon="mdi-numeric-1-circle">
            <v-list-item-title>{{ $t('tests.instructions.jaeger.step1') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-2-circle">
            <v-list-item-title>{{ $t('tests.instructions.jaeger.step2') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-3-circle">
            <v-list-item-title>{{ $t('tests.instructions.jaeger.step3') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-4-circle">
            <v-list-item-title>{{ $t('tests.instructions.jaeger.step4', { distance: distanceCm }) }}</v-list-item-title>
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
          {{ currentLine.jaeger }} ({{ currentLine.snellenNear }})
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

      <!-- Área do texto -->
      <div class="text-area flex-grow-1 d-flex align-center justify-center">
        <p 
          class="reading-text text-center px-4"
          :style="{ fontSize: `${fontSize}px`, lineHeight: 1.4 }"
        >
          {{ currentText }}
        </p>
      </div>

      <!-- Botões de resposta -->
      <div class="response-buttons d-flex justify-center gap-4 mt-6 mb-4">
        <v-btn
          color="error"
          size="large"
          variant="outlined"
          prepend-icon="mdi-eye-off"
          :class="{ 'focused': focusedButtonIndex === 0 }"
          @click="cannotRead"
        >
          {{ $t('tests.jaeger.cannotRead') }}
        </v-btn>
        
        <v-btn
          color="success"
          size="large"
          variant="flat"
          prepend-icon="mdi-check"
          :class="{ 'focused': focusedButtonIndex === 1 }"
          @click="confirmReading"
        >
          {{ $t('tests.jaeger.canRead') }}
        </v-btn>
      </div>

      <!-- Distância recomendada -->
      <div class="text-center text-medium-emphasis mb-4">
        <v-icon icon="mdi-ruler" size="small" class="mr-1" />
        {{ $t('tests.jaeger.holdAt', { distance: distanceCm }) }}
      </div>

      <footer class="d-flex justify-center">
        <RemoteHint />
      </footer>
    </template>

    <!-- Resultados -->
    <template v-else-if="phase === 'finished'">
      <JaegerResults
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

.text-area {
  min-height: 200px;
}

.reading-text {
  max-width: 90%;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.response-buttons .v-btn.focused {
  outline: 3px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* TV mode: botões maiores */
.ui-mode-tv .response-buttons .v-btn {
  min-width: 180px;
  height: 64px;
}
</style>
