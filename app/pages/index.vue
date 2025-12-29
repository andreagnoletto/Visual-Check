<script setup lang="ts">
const { t } = useI18n()

const menuItems = computed(() => [
  {
    title: t('home.calibrate.title'),
    subtitle: t('home.calibrate.subtitle'),
    icon: 'mdi-tune',
    to: '/setup',
  },
  {
    title: t('home.tests.title'),
    subtitle: t('home.tests.subtitle'),
    icon: 'mdi-eye-outline',
    to: '/tests',
  },
  {
    title: t('home.testsPro.title'),
    subtitle: t('home.testsPro.subtitle'),
    icon: 'mdi-eye-check',
    to: '/tests-pro',
    pro: true,
  },
  {
    title: t('home.settings.title'),
    subtitle: t('home.settings.subtitle'),
    icon: 'mdi-cog-outline',
    to: '/settings',
  },
])

const focusedIndex = ref(0)

function moveFocus(delta: number) {
  const newIndex = focusedIndex.value + delta
  if (newIndex >= 0 && newIndex < menuItems.length) {
    focusedIndex.value = newIndex
    nextTick(() => {
      const items = document.querySelectorAll('.menu-item')
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
    const items = document.querySelectorAll('.menu-item')
    const item = items[0] as HTMLElement
    item?.focus()
  })
})
</script>

<template>
  <div class="home-page d-flex flex-column fill-height">
    <!-- Header -->
    <header class="text-center mb-6">
      <h1 class="text-h4 text-md-h3 font-weight-bold mb-2">
        <v-icon icon="mdi-eye" class="mr-2" />
        {{ $t('app.name') }}
      </h1>
      <p class="text-body-1 text-medium-emphasis">
        {{ $t('app.tagline') }}
      </p>
    </header>

    <!-- Menu Principal -->
    <v-card class="flex-grow-1" variant="outlined">
      <v-list nav class="py-0">
        <v-list-item
          v-for="(item, index) in menuItems"
          :key="item.to"
          :to="item.to"
          :tabindex="index === focusedIndex ? 0 : -1"
          class="menu-item py-4"
          lines="two"
          @focus="focusedIndex = index"
        >
          <template #prepend>
            <v-avatar :color="item.pro ? 'primary' : 'primary'" variant="tonal" size="48">
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

    <!-- Remote Hint -->
    <footer class="mt-4 d-flex justify-center">
      <RemoteHint />
    </footer>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.menu-item:focus-visible {
  background-color: rgba(var(--v-theme-primary), 0.12);
}
</style>
