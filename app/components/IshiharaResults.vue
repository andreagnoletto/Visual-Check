<script setup lang="ts">
import type { IshiharaResult, ColorVisionDeficiency } from '~/utils/ishiharaPlates'
import { getDeficiencyName } from '~/utils/ishiharaPlates'

const props = defineProps<{
  result: IshiharaResult
}>()

const emit = defineEmits<{
  restart: []
  exit: []
}>()

const { t } = useI18n()

// Cor do resultado baseado na deficiência
const resultColor = computed(() => {
  if (props.result.possibleDeficiency === 'normal') {
    return 'success'
  }
  if (props.result.confidence === 'low') {
    return 'warning'
  }
  return 'error'
})

// Ícone baseado no resultado
const resultIcon = computed(() => {
  if (props.result.possibleDeficiency === 'normal') {
    return 'mdi-check-circle'
  }
  return 'mdi-alert-circle'
})

// Porcentagem de acertos
const correctPercentage = computed(() => {
  return Math.round((props.result.correctAnswers / props.result.totalPlates) * 100)
})

// Nome traduzido da deficiência
const deficiencyName = computed(() => {
  return getDeficiencyName(props.result.possibleDeficiency)
})
</script>

<template>
  <div class="results-container d-flex flex-column fill-height">
    <header class="mb-6">
      <h1 class="text-h4 font-weight-bold">{{ $t('results.title') }}</h1>
    </header>

    <v-card class="flex-grow-1 d-flex flex-column">
      <v-card-text class="flex-grow-1 d-flex flex-column align-center justify-center">
        <!-- Resultado principal -->
        <v-icon 
          :icon="resultIcon" 
          :color="resultColor" 
          size="80" 
          class="mb-4" 
        />

        <h2 class="text-h5 mb-2 text-center">
          {{ $t('results.ishihara.title') }}
        </h2>

        <div class="text-h4 font-weight-bold mb-4" :class="`text-${resultColor}`">
          {{ deficiencyName }}
        </div>

        <!-- Estatísticas -->
        <v-row class="mb-6" justify="center">
          <v-col cols="auto">
            <v-card variant="tonal" class="pa-4 text-center">
              <div class="text-h4 font-weight-bold text-primary">
                {{ result.correctAnswers }}/{{ result.totalPlates }}
              </div>
              <div class="text-caption">{{ $t('results.ishihara.correctAnswers') }}</div>
            </v-card>
          </v-col>
          <v-col cols="auto">
            <v-card variant="tonal" class="pa-4 text-center">
              <div class="text-h4 font-weight-bold" :class="`text-${resultColor}`">
                {{ correctPercentage }}%
              </div>
              <div class="text-caption">{{ $t('results.ishihara.accuracy') }}</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Confiança -->
        <v-chip 
          :color="result.confidence === 'high' ? 'success' : result.confidence === 'medium' ? 'warning' : 'error'"
          variant="tonal"
          class="mb-4"
        >
          <v-icon start icon="mdi-information" />
          {{ $t(`results.ishihara.confidence.${result.confidence}`) }}
        </v-chip>

        <!-- Aviso -->
        <v-alert
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4 mx-4"
          max-width="500"
        >
          <template #prepend>
            <v-icon icon="mdi-alert" />
          </template>
          {{ $t('results.ishihara.disclaimer') }}
        </v-alert>

        <!-- Detalhes por placa -->
        <v-expansion-panels variant="accordion" class="w-100" max-width="500">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
              {{ $t('results.detailsByLine') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list density="compact">
                <v-list-item
                  v-for="answer in result.details"
                  :key="answer.plateId"
                  :class="answer.isCorrect ? 'text-success' : 'text-error'"
                >
                  <template #prepend>
                    <v-icon 
                      :icon="answer.isCorrect ? 'mdi-check' : 'mdi-close'" 
                      :color="answer.isCorrect ? 'success' : 'error'"
                      size="small"
                    />
                  </template>
                  <v-list-item-title>
                    {{ $t('tests.ishihara.plate') }} {{ answer.plateId }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t('tests.ishihara.expected') }}: {{ answer.plate.normalAnswer || '-' }} | 
                    {{ $t('tests.ishihara.answered') }}: {{ answer.userAnswer || $t('tests.ishihara.nothing') }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-exit-to-app"
          @click="emit('exit')"
        >
          {{ $t('results.exit') }}
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-refresh"
          @click="emit('restart')"
        >
          {{ $t('results.restart') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.results-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}
</style>
