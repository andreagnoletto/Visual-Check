<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useIshiharaTest } from '~/composables/useIshiharaTest'
import { useProModeStore } from '~/stores/proMode'
import { normalizeInput } from '~/utils/normalizeInput'

const { t } = useI18n()

definePageMeta({
  title: 'Teste Ishihara',
})

const router = useRouter()
const proModeStore = useProModeStore()

const {
  phase,
  currentPlate,
  userInput,
  showResult,
  progress,
  result,
  startTest,
  submitAnswer,
  cannotSee,
  restartTest,
} = useIshiharaTest()

// Opções de resposta numéricas
const numberOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

// Controle de foco para navegação
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
    // Números diretos do teclado
    if (event.key >= '0' && event.key <= '9') {
      event.preventDefault()
      userInput.value += event.key
      return
    }
    
    // Backspace para apagar
    if (event.key === 'Backspace') {
      event.preventDefault()
      userInput.value = userInput.value.slice(0, -1)
      return
    }
    
    // Enter para confirmar
    if (action === 'confirm' && userInput.value) {
      event.preventDefault()
      submitAnswer(userInput.value)
      return
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

function handleNumberClick(num: string) {
  userInput.value += num
}

function handleClear() {
  userInput.value = ''
}

function handleSubmit() {
  if (userInput.value) {
    submitAnswer(userInput.value)
  }
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
        <h1 class="text-h4 font-weight-bold">{{ $t('tests.ishihara.title') }}</h1>
      </header>

      <v-card class="flex-grow-1 d-flex flex-column align-center justify-center pa-8">
        <v-icon icon="mdi-palette" size="80" class="mb-6 text-primary" />
        
        <h2 class="text-h5 mb-4 text-center">{{ $t('tests.instructions.title') }}</h2>
        
        <v-list class="bg-transparent mb-6" max-width="500">
          <v-list-item prepend-icon="mdi-numeric-1-circle">
            <v-list-item-title>{{ $t('tests.instructions.ishihara.step1') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-2-circle">
            <v-list-item-title>{{ $t('tests.instructions.ishihara.step2') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-3-circle">
            <v-list-item-title>{{ $t('tests.instructions.ishihara.step3') }}</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-numeric-4-circle">
            <v-list-item-title>{{ $t('tests.instructions.ishihara.step4') }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-6"
          max-width="500"
        >
          {{ $t('tests.ishihara.lightingTip') }}
        </v-alert>

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
          {{ $t('tests.ishihara.plate') }} {{ progress.current }}/{{ progress.total }}
        </v-chip>
      </div>

      <v-progress-linear
        :model-value="progress.percentage"
        color="primary"
        class="mb-6"
      />

      <!-- Placa Ishihara -->
      <div class="plate-area flex-grow-1 d-flex flex-column align-center justify-center">
        <IshiharaPlate 
          :plate-id="currentPlate.id" 
          :size="280"
          class="mb-6"
        />

        <!-- Input de resposta -->
        <div class="input-area text-center mb-4">
          <v-text-field
            v-model="userInput"
            :label="$t('tests.ishihara.whatNumber')"
            variant="outlined"
            class="number-input mx-auto"
            style="max-width: 200px"
            hide-details
            readonly
            :placeholder="$t('tests.ishihara.typeNumber')"
          />
        </div>

        <!-- Teclado numérico -->
        <div class="number-pad mb-4">
          <div class="d-flex flex-wrap justify-center gap-2" style="max-width: 240px">
            <v-btn
              v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
              :key="num"
              variant="tonal"
              size="large"
              min-width="60"
              @click="handleNumberClick(num)"
            >
              {{ num }}
            </v-btn>
            <v-btn
              variant="tonal"
              size="large"
              min-width="60"
              color="error"
              @click="handleClear"
            >
              <v-icon icon="mdi-backspace" />
            </v-btn>
            <v-btn
              variant="tonal"
              size="large"
              min-width="60"
              @click="handleNumberClick('0')"
            >
              0
            </v-btn>
            <v-btn
              variant="flat"
              size="large"
              min-width="60"
              color="primary"
              :disabled="!userInput"
              @click="handleSubmit"
            >
              <v-icon icon="mdi-check" />
            </v-btn>
          </div>
        </div>

        <!-- Botão "Não vejo número" -->
        <v-btn
          variant="text"
          color="secondary"
          prepend-icon="mdi-eye-off"
          @click="cannotSee"
        >
          {{ $t('tests.ishihara.cannotSee') }}
        </v-btn>
      </div>

      <footer class="d-flex justify-center mt-4">
        <RemoteHint />
      </footer>
    </template>

    <!-- Resultados -->
    <template v-else-if="phase === 'finished' && result">
      <IshiharaResults
        :result="result"
        @restart="handleRestart"
        @exit="handleExit"
      />
    </template>
  </div>
</template>

<style scoped>
.test-page {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.plate-area {
  min-height: 400px;
}

.number-input :deep(input) {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}

.number-pad {
  display: flex;
  justify-content: center;
}
</style>
