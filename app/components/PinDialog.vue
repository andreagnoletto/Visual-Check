<script setup lang="ts">
import { CONFIG } from '~/utils/constants'

interface Props {
  modelValue: boolean
  mode?: 'validate' | 'set'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'validate',
  title: 'Digite o PIN',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': [pin: string]
  'cancel': []
}>()

const proModeStore = useProModeStore()

const pin = ref('')
const confirmPin = ref('')
const step = ref<'enter' | 'confirm'>('enter')
const error = ref('')
const shake = ref(false)

const isSetMode = computed(() => props.mode === 'set')
const displayTitle = computed(() => {
  if (isSetMode.value) {
    return step.value === 'enter' ? 'Novo PIN' : 'Confirmar PIN'
  }
  return props.title
})

const maskedPin = computed(() => '●'.repeat(pin.value.length) + '○'.repeat(4 - pin.value.length))
const maskedConfirmPin = computed(() => '●'.repeat(confirmPin.value.length) + '○'.repeat(4 - confirmPin.value.length))

const currentMask = computed(() => {
  if (isSetMode.value && step.value === 'confirm') {
    return maskedConfirmPin.value
  }
  return maskedPin.value
})

const numpadButtons = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['clear', '0', 'back'],
]

function getCurrentPin(): string {
  if (isSetMode.value && step.value === 'confirm') {
    return confirmPin.value
  }
  return pin.value
}

function setCurrentPin(value: string) {
  if (isSetMode.value && step.value === 'confirm') {
    confirmPin.value = value
  } else {
    pin.value = value
  }
}

function appendDigit(digit: string) {
  const current = getCurrentPin()
  if (current.length < 4) {
    error.value = ''
    setCurrentPin(current + digit)

    // Auto-submit quando completo
    if (getCurrentPin().length === 4) {
      setTimeout(() => handleSubmit(), 150)
    }
  }
}

function deleteDigit() {
  const current = getCurrentPin()
  if (current.length > 0) {
    setCurrentPin(current.slice(0, -1))
  }
}

function clearPin() {
  setCurrentPin('')
  error.value = ''
}

function triggerShake() {
  shake.value = true
  setTimeout(() => {
    shake.value = false
  }, 500)
}

function handleSubmit() {
  if (isSetMode.value) {
    if (step.value === 'enter') {
      // Primeiro passo: pedir confirmação
      step.value = 'confirm'
    } else {
      // Segundo passo: validar confirmação
      if (pin.value === confirmPin.value) {
        emit('success', pin.value)
        close()
      } else {
        error.value = 'PINs não conferem'
        confirmPin.value = ''
        triggerShake()
      }
    }
  } else {
    // Modo validação
    if (proModeStore.isLocked()) {
      error.value = `Bloqueado. Aguarde ${proModeStore.lockRemainingFormatted}`
      triggerShake()
      return
    }

    if (proModeStore.validatePin(pin.value)) {
      emit('success', pin.value)
      close()
    } else {
      const remaining = CONFIG.MAX_PIN_ATTEMPTS - proModeStore.failedAttempts
      if (proModeStore.isLocked()) {
        error.value = `Muitas tentativas. Bloqueado por 5 minutos.`
      } else {
        error.value = `PIN incorreto. ${remaining} tentativa${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`
      }
      pin.value = ''
      triggerShake()
    }
  }
}

function close() {
  pin.value = ''
  confirmPin.value = ''
  step.value = 'enter'
  error.value = ''
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  close()
}

// Keyboard support
function handleKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return

  if (/^\d$/.test(event.key)) {
    appendDigit(event.key)
  } else if (event.key === 'Backspace') {
    deleteDigit()
  } else if (event.key === 'Escape') {
    handleCancel()
  } else if (event.key === 'Enter' && getCurrentPin().length === 4) {
    handleSubmit()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Roving tabindex para numpad
const focusedRow = ref(1)
const focusedCol = ref(1)

function moveFocus(direction: 'up' | 'down' | 'left' | 'right') {
  switch (direction) {
    case 'up':
      focusedRow.value = Math.max(0, focusedRow.value - 1)
      break
    case 'down':
      focusedRow.value = Math.min(3, focusedRow.value + 1)
      break
    case 'left':
      focusedCol.value = Math.max(0, focusedCol.value - 1)
      break
    case 'right':
      focusedCol.value = Math.min(2, focusedCol.value + 1)
      break
  }
  nextTick(() => {
    const btn = document.querySelector(`.numpad-btn[data-row="${focusedRow.value}"][data-col="${focusedCol.value}"]`) as HTMLElement
    btn?.focus()
  })
}

function handleButtonClick(value: string) {
  if (value === 'clear') {
    clearPin()
  } else if (value === 'back') {
    deleteDigit()
  } else {
    appendDigit(value)
  }
}

useRemoteNavigation({
  onUp: () => moveFocus('up'),
  onDown: () => moveFocus('down'),
  onLeft: () => moveFocus('left'),
  onRight: () => moveFocus('right'),
})
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="360"
    persistent
    @update:model-value="(val) => !val && handleCancel()"
  >
    <v-card class="pin-dialog">
      <v-card-title class="text-center py-4">
        {{ displayTitle }}
      </v-card-title>

      <v-card-text class="text-center">
        <!-- PIN Display -->
        <div
          class="pin-display text-h3 font-weight-bold mb-4"
          :class="{ shake }"
        >
          {{ currentMask }}
        </div>

        <!-- Error Message -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <!-- Lock Message -->
        <v-alert
          v-if="proModeStore.isLocked()"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          Bloqueado por {{ proModeStore.lockRemainingFormatted }}
        </v-alert>

        <!-- Numpad -->
        <div class="numpad">
          <div
            v-for="(row, rowIndex) in numpadButtons"
            :key="rowIndex"
            class="numpad-row d-flex justify-center gap-2"
          >
            <v-btn
              v-for="(btn, colIndex) in row"
              :key="btn"
              :data-row="rowIndex"
              :data-col="colIndex"
              :tabindex="rowIndex === focusedRow && colIndex === focusedCol ? 0 : -1"
              :color="btn === 'clear' ? 'error' : btn === 'back' ? 'warning' : 'primary'"
              :variant="isNaN(Number(btn)) ? 'tonal' : 'elevated'"
              size="large"
              class="numpad-btn ma-1"
              min-width="72"
              min-height="56"
              :disabled="proModeStore.isLocked() && mode === 'validate'"
              @click="handleButtonClick(btn)"
              @focus="focusedRow = rowIndex; focusedCol = colIndex"
            >
              <template v-if="btn === 'clear'">
                <v-icon icon="mdi-close" />
              </template>
              <template v-else-if="btn === 'back'">
                <v-icon icon="mdi-backspace-outline" />
              </template>
              <template v-else>
                {{ btn }}
              </template>
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn
          variant="text"
          @click="handleCancel"
        >
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.pin-dialog {
  overflow: hidden;
}

.pin-display {
  letter-spacing: 0.5em;
  font-family: monospace;
  user-select: none;
}

.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-8px); }
  80% { transform: translateX(8px); }
}

.numpad {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.numpad-btn:focus-visible {
  outline: 3px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
