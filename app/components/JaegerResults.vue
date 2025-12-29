<script setup lang="ts">
import type { JaegerTestResult } from '~/composables/useJaegerTest'
import type { JaegerLine } from '~/utils/jaegerCalculations'

interface Props {
  results: JaegerTestResult[]
  bestResult: JaegerTestResult | null
}

defineProps<Props>()

const emit = defineEmits<{
  restart: []
  exit: []
}>()
</script>

<template>
  <div class="results-page d-flex flex-column fill-height">
    <header class="mb-6 text-center">
      <v-icon icon="mdi-book-check" size="64" class="mb-4 text-success" />
      <h1 class="text-h4 font-weight-bold">{{ $t('results.title') }}</h1>
    </header>

    <v-card class="flex-grow-1 pa-6">
      <!-- Melhor resultado -->
      <div v-if="bestResult" class="text-center mb-8">
        <p class="text-body-1 text-medium-emphasis mb-2">
          {{ $t('results.bestAcuity') }}
        </p>
        <div class="d-flex justify-center align-center gap-6 flex-wrap">
          <div>
            <p class="text-h2 font-weight-bold text-primary">{{ bestResult.line.jaeger }}</p>
            <p class="text-body-2 text-medium-emphasis">Jaeger</p>
          </div>
          <div>
            <p class="text-h4 font-weight-medium">{{ bestResult.line.snellenNear }}</p>
            <p class="text-body-2 text-medium-emphasis">Snellen</p>
          </div>
          <div>
            <p class="text-h4 font-weight-medium">{{ bestResult.line.logMAR.toFixed(1) }}</p>
            <p class="text-body-2 text-medium-emphasis">{{ $t('results.logMAR') }}</p>
          </div>
        </div>
        <p class="text-body-1 mt-4 text-medium-emphasis">
          {{ bestResult.line.description }}
        </p>
      </div>

      <!-- Nenhuma linha completada -->
      <div v-else class="text-center mb-8">
        <v-icon icon="mdi-alert-circle-outline" size="48" class="mb-4 text-warning" />
        <p class="text-h6">{{ $t('results.noLineCompleted') }}</p>
        <p class="text-body-2 text-medium-emphasis">{{ $t('results.adjustSuggestion') }}</p>
      </div>

      <!-- Detalhes por linha -->
      <v-expansion-panels v-if="results.length > 0" variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>
            {{ $t('results.detailsByLine') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list density="compact">
              <v-list-item
                v-for="result in results"
                :key="result.line.line"
              >
                <template #prepend>
                  <v-icon
                    :icon="result.passed ? 'mdi-check-circle' : 'mdi-close-circle'"
                    :color="result.passed ? 'success' : 'error'"
                  />
                </template>
                <v-list-item-title>
                  {{ result.line.jaeger }} ({{ result.line.snellenNear }})
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ result.correct }}/{{ result.total }} - {{ result.line.description }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <!-- Ações -->
    <div class="d-flex justify-center gap-4 mt-6">
      <v-btn
        variant="outlined"
        size="large"
        prepend-icon="mdi-refresh"
        @click="emit('restart')"
      >
        {{ $t('results.restart') }}
      </v-btn>
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-home"
        @click="emit('exit')"
      >
        {{ $t('results.exit') }}
      </v-btn>
    </div>

    <footer class="mt-4 d-flex justify-center">
      <RemoteHint />
    </footer>
  </div>
</template>

<style scoped>
.results-page {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}
</style>
