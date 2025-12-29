import { test, expect } from '@playwright/test'

/**
 * Helper para calibrar a tela antes de testes
 */
async function calibrateScreen(page: import('@playwright/test').Page) {
  await page.goto('/setup')
  
  // Aguardar carregamento
  await expect(page.getByRole('heading', { name: /calibração/i })).toBeVisible()
  
  // Clicar no chip do preset 32" 1080p
  await page.locator('.v-chip').filter({ hasText: '32" 1080p' }).click()
  
  // Aguardar botão ficar habilitado e clicar
  await expect(page.getByRole('button', { name: /confirmar/i })).toBeEnabled()
  await page.getByRole('button', { name: /confirmar/i }).click()
  
  // Aguardar navegação
  await expect(page).toHaveURL('/tests')
}

test.describe('Calibration Gate', () => {
  test('deve redirecionar /test/* para /setup se não calibrado', async ({ page }) => {
    // Limpar localStorage para garantir estado não-calibrado
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    
    // Tentar acessar diretamente uma página de teste
    await page.goto('/test/snellen')
    
    // Deve ser redirecionado para setup
    await expect(page).toHaveURL('/setup')
  })

  test('deve permitir acesso a /test/* após calibração', async ({ page }) => {
    await calibrateScreen(page)
    
    // Clicar no teste Snellen Assistido (é um link, não button)
    await page.getByRole('link', { name: /snellen \(assistido\)/i }).click()
    
    // Deve estar na página de teste
    await expect(page).toHaveURL('/test/snellen')
  })
})

test.describe('Navigation', () => {
  test('deve navegar pelo menu principal', async ({ page }) => {
    await page.goto('/')
    
    // Aguardar carregamento
    await expect(page.getByRole('heading', { name: /visual check/i })).toBeVisible()
    
    // Verificar se os links principais estão visíveis (são links, não buttons)
    await expect(page.getByRole('link', { name: /calibrar/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /testes/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /configurações/i })).toBeVisible()
    
    // Clicar no primeiro link
    await page.getByRole('link', { name: /calibrar/i }).click()
    
    // Deve ir para setup
    await expect(page).toHaveURL('/setup')
  })

  test('deve voltar com botão Back', async ({ page }) => {
    await page.goto('/setup')
    
    // Aguardar carregamento
    await expect(page.getByRole('heading', { name: /calibração/i })).toBeVisible()
    
    // Clicar em voltar (é um link, não um button)
    await page.getByRole('link', { name: /voltar/i }).click()
    
    // Deve voltar para home
    await expect(page).toHaveURL('/')
  })
})

test.describe('Snellen Test', () => {
  test.beforeEach(async ({ page }) => {
    await calibrateScreen(page)
  })

  test('deve iniciar e exibir optótipos', async ({ page }) => {
    await page.goto('/test/snellen')
    
    // Verificar tela inicial
    await expect(page.getByRole('heading', { name: /teste snellen/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /iniciar/i })).toBeVisible()
    
    // Iniciar teste
    await page.getByRole('button', { name: /iniciar/i }).click()
    
    // Deve mostrar botões de resposta (C, D, E, F, L, O, P, T, Z)
    // Usar exact: true para evitar match com botões do DevTools (Close, Component Inspector)
    await expect(page.getByRole('button', { name: 'C', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'D', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'E', exact: true })).toBeVisible()
    
    // Verificar que mostra informações de progresso
    await expect(page.getByText(/linha 1/i)).toBeVisible()
    await expect(page.getByText(/20\/200/i)).toBeVisible()
  })

  test('deve concluir teste e mostrar resultados', async ({ page }) => {
    await page.goto('/test/snellen')
    await page.getByRole('button', { name: /iniciar/i }).click()
    
    // Responder errado várias vezes para falhar rápido
    for (let i = 0; i < 5; i++) {
      // Clicar em qualquer letra (pode errar)
      await page.getByRole('button', { name: 'Z', exact: true }).click()
      await page.waitForTimeout(100)
    }
    
    // Deve mostrar resultados
    await expect(page.getByText(/teste concluído/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Directional Test', () => {
  test.beforeEach(async ({ page }) => {
    await calibrateScreen(page)
  })

  test('deve responder com teclas de seta', async ({ page }) => {
    await page.goto('/test/directional')
    
    // Iniciar teste
    await page.getByRole('button', { name: /iniciar/i }).click()
    
    // Verificar que o E está visível
    await expect(page.getByTestId('optotype')).toBeVisible()
    
    // Responder com setas (vai errar mas deve avançar)
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowRight')
    
    // Deve ter avançado (passado ou falhado a linha)
    await expect(page.getByText(/teste concluído|linha 2/i)).toBeVisible({ timeout: 10000 })
  })
})
