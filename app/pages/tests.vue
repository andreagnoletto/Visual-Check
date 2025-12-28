<script setup lang="ts">
definePageMeta({
  title: 'Testes de Visão',
})

const testItems = [
  {
    title: 'Snellen (Assistido)',
    subtitle: 'Letras clássicas com botões de resposta',
    icon: 'mdi-format-letter-case',
    to: '/test/snellen',
  },
  {
    title: 'Snellen (Pro)',
    subtitle: 'Múltiplas letras, controle manual',
    icon: 'mdi-format-letter-case',
    to: '/test/snellen-pro',
    pro: true,
  },
  {
    title: 'Pediátrico (Assistido)',
    subtitle: 'Formas para crianças com botões',
    icon: 'mdi-baby-face-outline',
    to: '/test/pediatric',
  },
  {
    title: 'Pediátrico (Pro)',
    subtitle: 'Múltiplas formas, controle manual',
    icon: 'mdi-baby-face-outline',
    to: '/test/pediatric-pro',
    pro: true,
  },
  {
    title: 'Direcional (Assistido)',
    subtitle: 'Letra E em diferentes direções',
    icon: 'mdi-arrow-all',
    to: '/test/directional',
  },
  {
    title: 'Direcional (Pro)',
    subtitle: 'Múltiplos E, controle manual',
    icon: 'mdi-arrow-all',
    to: '/test/directional-pro',
    pro: true,
  },
]

const focusedIndex = ref(0)

function moveFocus(delta: number) {
  const newIndex = focusedIndex.value + delta
  if (newIndex >= 0 && newIndex < testItems.length) {
    focusedIndex.value = newIndex
    nextTick(() => {
      const items = document.querySelectorAll('.test-item')
      const item = items[focusedIndex.value] as HTMLElement
      item?.focus()
    })
  }
}

useRemoteNavigation({
  onUp: () => moveFocus(-1),
  onDown: () => moveFocus(1),
})

onMounted(() => {
  nextTick(() => {
    const items = document.querySelectorAll('.test-item')
    const item = items[0] as HTMLElement
    item?.focus()
  })
})
</script>

<template>
  <div class="tests-page d-flex flex-column fill-height">
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
        <v-icon icon="mdi-eye-outline" class="mr-2" />
        Testes de Visão
      </h1>
      <p class="text-body-1 text-medium-emphasis mt-2">
        Escolha um tipo de teste
      </p>
    </header>

    <v-card variant="outlined" class="flex-grow-1">
      <v-list nav class="py-0">
        <v-list-item
          v-for="(item, index) in testItems"
          :key="item.to"
          :to="item.to"
          :tabindex="index === focusedIndex ? 0 : -1"
          class="test-item py-4"
          lines="two"
          @focus="focusedIndex = index"
        >
          <template #prepend>
            <v-avatar :color="item.pro ? 'primary' : 'secondary'" variant="tonal" size="48">
              <v-icon :icon="item.icon" />
            </v-avatar>
          </template>
          <v-list-item-title class="text-h6 d-flex align-center gap-2">
            {{ item.title }}
            <v-chip v-if="item.pro" size="x-small" color="primary" variant="flat">
              PRO
            </v-chip>
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ item.subtitle }}
          </v-list-item-subtitle>
          <template #append>
            <v-icon icon="mdi-chevron-right" />
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <footer class="mt-4 d-flex justify-center">
      <RemoteHint />
    </footer>
  </div>
</template>

<style scoped>
.tests-page {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.test-item:focus-visible {
  background-color: rgba(var(--v-theme-secondary), 0.12);
}
</style>
