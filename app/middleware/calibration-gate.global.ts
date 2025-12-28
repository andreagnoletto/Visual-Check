// app/middleware/calibration-gate.ts
import { useCalibrationStore } from '~/stores/calibration'

export default defineNuxtRouteMiddleware((to) => {
  // Só executar no client
  if (import.meta.server) return

  // Verificar se a rota exige calibração
  if (!to.path.startsWith('/test/')) return

  const calibrationStore = useCalibrationStore()

  if (!calibrationStore.canStartTest) {
    return navigateTo('/setup', {
      replace: true,
      redirectCode: 302,
    })
  }
})
