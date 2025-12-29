<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'Testes Pro',
})

const testItems = computed(() => [
  {
    title: t('tests.snellen.name'),
    subtitle: t('tests.snellen.proSubtitle'),
    icon: 'mdi-format-letter-case',
    to: '/test/snellen-pro',
  },
  {
    title: t('tests.pediatric.name'),
    subtitle: t('tests.pediatric.proSubtitle'),
    icon: 'mdi-baby-face-outline',
    to: '/test/pediatric-pro',
  },
  {
    title: t('tests.directional.name'),
    subtitle: t('tests.directional.proSubtitle'),
    icon: 'mdi-arrow-all',
    to: '/test/directional-pro',
  },
  {
    title: t('tests.landolt.name'),
    subtitle: t('tests.landolt.proSubtitle'),
    icon: 'mdi-circle-outline',
    to: '/test/landolt-pro',
  },
])

const focusedIndex = ref(0)

function moveFocus(delta: number) {
  const newIndex = focusedIndex.value + delta
  if (newIndex >= 0 && newIndex < testItems.value.length) {
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
        {{ $t('nav.back') }}
      </v-btn>
      <h1 class="text-h4 font-weight-bold d-flex align-center">
        <v-icon icon="mdi-eye-check" class="mr-2" />
        {{ $t('home.testsPro.title') }}
        <v-chip size="small" color="primary" variant="flat" class="ml-2">
          PRO
        </v-chip>
      </h1>
      <p class="text-body-2 text-medium-emphasis mt-2">
        {{ $t('home.testsPro.subtitle') }}
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
            <v-avatar color="primary" variant="tonal" size="48">
              <v-icon :icon="item.icon" />
            </v-avatar>
          </template>
          <v-list-item-title class="text-h6">
            {{ item.title }}
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
  background-color: rgba(var(--v-theme-primary), 0.12);
}
</style>
