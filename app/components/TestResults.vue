<script setup lang="ts">
import type { AcuityLine } from '~/utils/optotypeCalculations'

interface TestResult {
  line: AcuityLine
  correct: number
  total: number
  passed: boolean
}

defineProps<{
  results: TestResult[]
  bestResult: TestResult | null
}>()

const emit = defineEmits<{
  restart: []
  exit: []
}>()
</script>

<template>
  <v-card class="test-results mx-auto" max-width="600">
    <v-card-title class="text-h5 text-center py-6">
      <v-icon
        :icon="bestResult ? 'mdi-check-circle' : 'mdi-alert-circle'"
        :color="bestResult ? 'success' : 'warning'"
        size="48"
        class="mb-2"
      />
      <div>Teste Concluído</div>
    </v-card-title>

    <v-card-text>
      <!-- Melhor resultado -->
      <v-alert
        v-if="bestResult"
        type="success"
        variant="tonal"
        class="mb-4"
      >
        <div class="text-h6 mb-1">Melhor acuidade alcançada:</div>
        <div class="text-h4 font-weight-bold">{{ bestResult.line.snellen }}</div>
        <div class="text-body-2 mt-1">
          Decimal: {{ bestResult.line.decimalVA }} | 
          LogMAR: {{ bestResult.line.logMAR }}
        </div>
      </v-alert>

      <v-alert
        v-else
        type="warning"
        variant="tonal"
        class="mb-4"
      >
        <div class="text-body-1">
          Nenhuma linha foi completada com sucesso.
        </div>
        <div class="text-body-2 mt-1">
          Considere ajustar a distância ou calibração.
        </div>
      </v-alert>

      <!-- Detalhes por linha -->
      <div class="text-subtitle-2 mb-2">Detalhes por linha:</div>
      <v-list density="compact" class="bg-transparent">
        <v-list-item
          v-for="result in results"
          :key="result.line.line"
          :class="result.passed ? 'text-success' : 'text-error'"
        >
          <template #prepend>
            <v-icon
              :icon="result.passed ? 'mdi-check' : 'mdi-close'"
              :color="result.passed ? 'success' : 'error'"
              size="small"
            />
          </template>
          <v-list-item-title>
            {{ result.line.snellen }} — {{ result.correct }}/{{ result.total }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Disclaimer -->
      <v-alert
        type="info"
        variant="outlined"
        density="compact"
        class="mt-4"
        icon="mdi-information"
      >
        <div class="text-caption">
          ⚠️ Este é apenas um teste de triagem. Consulte um oftalmologista para avaliação profissional.
        </div>
      </v-alert>
    </v-card-text>

    <v-card-actions class="justify-center pb-6">
      <v-btn
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        @click="emit('exit')"
      >
        Voltar
      </v-btn>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-refresh"
        @click="emit('restart')"
      >
        Refazer Teste
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.test-results {
  margin-top: 2rem;
}
</style>
