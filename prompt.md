# TV Visual Check — Especificação Técnica (Nuxt 4 + Vuetify 3)

> **Agente:** Engenheiro(a) sênior front-end especializado(a) em "10-foot UI" (TV) e UI responsiva.  
> **Produto:** App de triagem básica/treino de acuidade visual em qualquer tela.  
> **⚠️ NÃO é dispositivo médico.**

---

## 1. ESCOPO E PRINCÍPIOS

### 1.1 Escopo Técnico
| Item | Valor |
|------|-------|
| Idioma | Português brasileiro (sem i18n no MVP) |
| Orientação | Testes forçam landscape; demais telas funcionam em ambas |
| Offline | Não é requisito; pode exigir conexão inicial |

### 1.2 Princípios Inegociáveis
1. **NÃO é dispositivo médico** — disclaimer obrigatório
2. **Zero dados pessoais** — apenas preferências locais (Pinia persist)
3. **Sem histórico individual** — só contadores agregados (Phase 5)
4. **Multi-input obrigatório** — remoto/D-pad, teclado, toque
5. **Foco sempre visível** — principalmente em TV/teclado
6. **Menos é mais** — mínimo por fase, sem over-engineering
7. **Vuetify-first** — CSS/JS custom apenas para foco, optótipos, roving tabindex
8. **Acessibilidade mínima** — labels/aria, contraste adequado

### 1.3 Stack
| Tecnologia | Status |
|------------|--------|
| Nuxt 4 (`app/`) | ✅ Instalado |
| TypeScript strict | ✅ Configurado |
| Vuetify 3 (`vuetify-nuxt-module`) | ⚠️ Configurar |
| Pinia + persist | ⚠️ Configurar |
| Vitest + Playwright | Phase 3+ |

---

## 2. CONSTANTES E CONFIGURAÇÃO

### 2.1 Constantes do Sistema
```typescript
// app/utils/constants.ts
export const CONFIG = {
  // Layout
  SAFE_MARGIN: { TV: 48, DESKTOP: 24, TOUCH: 16 }, // px
  
  // Optótipos
  OPTOTYPE_FONT_SCALE: 1.75,
  FONT_TIMEOUT: 3000, // ms
  
  // Calibração
  MIN_DISTANCE_M: 2,
  MAX_DISTANCE_M: 10,
  MIN_PX_PER_MM: 2.0,
  MAX_PX_PER_MM: 6.0,
  DEFAULT_ASPECT_RATIO: '16:9',
  
  // UX
  RESET_BACK_THRESHOLD: 4,
  RESET_BACK_WINDOW: 1500, // ms
  
  // Persistência
  SCHEMA_VERSION: 1,
} as const
```

### 2.2 Presets de Tela (px/mm)
| Polegadas | Resolução | pxPerMm | Aspect Ratio |
|-----------|-----------|---------|--------------|
| 32" | 1080p | ~2.9 | 16:9 |
| 40" | 1080p | ~2.3 | 16:9 |
| 43" | 4K | ~4.2 | 16:9 |
| 50" | 4K | ~3.6 | 16:9 |
| 55" | 4K | ~3.1 | 16:9 |
| 65" | 4K | ~2.7 | 16:9 |
| 75" | 4K | ~2.3 | 16:9 |
| 27" Monitor | 4K | ~5.8 | 16:9 |

### 2.3 Linhas de Acuidade (Snellen)
| Linha | logMAR | Snellen | height_mm @3m |
|-------|--------|---------|---------------|
| 1 | 1.0 | 20/200 | ~43.6 |
| 2 | 0.9 | 20/160 | ~34.6 |
| 3 | 0.7 | 20/100 | ~21.8 |
| 4 | 0.5 | 20/63 | ~13.7 |
| 5 | 0.3 | 20/40 | ~8.7 |
| 6 | 0.2 | 20/32 | ~6.9 |
| 7 | 0.1 | 20/25 | ~5.5 |
| 8 | 0.0 | 20/20 | ~4.4 |

---

## 3. ESTRUTURA DO PROJETO

```
app/
├── assets/
│   ├── css/optotype.css
│   └── fonts/
│       ├── OpticianSans.woff
│       └── Optician-Sans.otf
├── components/
│   ├── DisclaimerBox.vue
│   ├── RemoteHint.vue
│   └── optotypes/
├── composables/
│   ├── useRemoteNavigation.ts
│   ├── useUiMode.ts
│   └── useFontReady.ts
├── layouts/default.vue
├── pages/
│   ├── index.vue
│   ├── setup.vue
│   ├── settings.vue
│   └── test/{snellen,pediatric,directional}.vue
├── stores/calibration.ts
├── utils/
│   ├── constants.ts
│   ├── normalizeInput.ts
│   └── optotypeCalculations.ts
└── app.vue
```

### 3.1 Convenções
| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Composables | `use*` | `useRemoteNavigation` |
| Stores | `use*Store` | `useCalibrationStore` |
| Componentes | PascalCase | `DisclaimerBox.vue` |
| Utils | camelCase | `normalizeInput.ts` |
| Constantes | SCREAMING_SNAKE | `SCHEMA_VERSION` |

---

## 4. UI MODE E RESPONSIVIDADE

### 4.1 Modos de Interface
```typescript
type UiMode = 'tv' | 'desktop' | 'touch'
```

**Detecção (ordem de prioridade):**
1. Override persistido do usuário (Settings) — sempre vence
2. User Agent: Android TV / Tizen / webOS → `tv`
3. `matchMedia('(pointer: coarse)')` + viewport ≥ 960px → `tv`; senão → `touch`
4. Default: `desktop`

**Promoção por interação (uma vez por sessão):**
- Primeiro evento Arrow/Enter/Escape → promove para `tv`
- Primeiro evento touch/pointer coarse → promove para `touch`

### 4.2 Safe Areas por Modo
```typescript
const getSafeMargin = (mode: UiMode): number => CONFIG.SAFE_MARGIN[mode.toUpperCase()]
```

---

## 5. MULTI-INPUT

### 5.1 Mapeamento de Teclas
```typescript
// app/utils/normalizeInput.ts
type NormalizedAction = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back' | null

const KEY_MAP: Record<string, NormalizedAction> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  Enter: 'confirm', NumpadEnter: 'confirm', ' ': 'confirm',
  Escape: 'back', Backspace: 'back',
}

// Fallback keyCode (Android TV, Tizen, webOS)
const KEYCODE_MAP: Record<number, NormalizedAction> = {
  13: 'confirm', 66: 'confirm', 23: 'confirm', // OK
  4: 'back', 10009: 'back', 461: 'back',       // BACK
}
```

### 5.2 Roving Tabindex (Modo TV/Teclado)
- Apenas 1 item com `tabindex="0"`, demais `-1`
- Setas movem foco de forma previsível
- Confirm ativa item focado
- Back fecha modal ou volta rota
- Persistir/restaurar foco por rota

### 5.3 Sliders e Toggles em TV
- **Slider:** ←→ ajusta; Enter confirma; Back cancela
- **Toggle:** Enter alterna; Back volta

---

## 6. CALIBRAÇÃO

### 6.1 Parâmetros
| Campo | Tipo | Range | Default |
|-------|------|-------|---------|
| `distanceM` | number | 2–10 | 3 |
| `pxPerMm` | number | 2.0–6.0 | 3.0 |
| `aspectRatio` | string | 16:9, 16:10, 21:9, 4:3 | 16:9 |
| `correctionFactor` | number | 0.90–1.10 | 1.00 |

### 6.2 Métodos de Calibração
1. **Presets por polegadas** — rápido para TV/monitor
2. **Referência física** — cartão 85.6mm com slider

### 6.3 Validações e Avisos
| Condição | Ação |
|----------|------|
| Distância < 2m ou > 10m | Warning "fora do recomendado" |
| pxPerMm < 2.0 ou > 6.0 | Warning (não bloqueia) |
| Zoom ≠ 100% | Warning "pode invalidar calibração" |

### 6.4 Gate
Rotas `/test/*` exigem calibração completa. Sem calibração → redirect para Setup.

### 6.5 Reset Rápido
- **TV/Teclado:** `R` ou Back 4× em < 1.5s → modal confirmar
- **Touch:** botão explícito em Settings

---

## 7. OPTÓTIPOS

### 7.1 CSS da Fonte
```css
/* app/assets/css/optotype.css */
@font-face {
  font-family: 'OpticianSans';
  src: url('~/assets/fonts/OpticianSans.woff') format('woff'),
       url('~/assets/fonts/Optician-Sans.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.optotype {
  font-family: 'OpticianSans', sans-serif;
  line-height: 1;
  letter-spacing: 0.1em;
}
```

### 7.2 Cálculo de Tamanho
```typescript
// app/utils/optotypeCalculations.ts
export const calculateOptotypeSize = (
  distanceM: number,
  pxPerMm: number,
  correctionFactor: number = 1.0
) => {
  const heightMm = distanceM * Math.tan((5 / 60) * (Math.PI / 180)) * 1000
  const heightPx = heightMm * pxPerMm
  const fontSizePx = heightPx * CONFIG.OPTOTYPE_FONT_SCALE * correctionFactor
  return { heightMm, heightPx, fontSizePx }
}
```

### 7.3 Pools de Caracteres
| Tipo | Caracteres |
|------|------------|
| Snellen | C D E F L O P T Z |
| Pediátrico | ● ■ ▲ ♥ ★ (SVG recomendado) |
| Direcional | E em 0° / 90° / 180° / 270° |

- **Caracteres por linha:** 3–5 (ajustar por largura)
- **Randomização:** evitar sequências idênticas

---

## 8. PERSISTÊNCIA

### 8.1 Schema Versionado
```typescript
interface CalibrationState {
  schemaVersion: number
  distanceM: number
  pxPerMm: number
  aspectRatio: string
  correctionFactor: number
  uiModeOverride: UiMode | null
  needsRecalibration: boolean
}
```

### 8.2 Migração
```typescript
const migrateState = (oldState: unknown, oldVersion: number): CalibrationState => {
  if (oldVersion < SCHEMA_VERSION) {
    return { ...DEFAULT_STATE, needsRecalibration: true }
  }
  return oldState as CalibrationState
}
```

---

## 9. DISCLAIMER

**Exibir em:** Home, todas as telas `/test/*`, Settings.

> ⚠️ **ATENÇÃO:** Este app é APENAS para triagem básica/treino. NÃO substitui exame oftalmológico.  
> Não use para decisões críticas (ex.: dirigir). Resultados variam por iluminação, distância, zoom do navegador e configuração da tela.

---

## 10. QUALIDADE

### 10.1 DoD (Definition of Done)
| Item | Descrição |
|------|-----------|
| TS Strict | Sem `any`, sem warnings |
| Clean Code | Sem `console.log`, sem TODOs |
| Memory Safe | Cleanup de listeners em `onUnmounted` |
| SSR-Safe | Rotas funcionam em reload direto |
| Multi-Input | Remoto/teclado + toque/click |
| Foco Visível | Óbvio em TV, aceitável em touch |
| Input Centralizado | Via `normalizeInput()` |
| Sem Hover | Ações não dependem de hover |
| Persistência | Com `schemaVersion` |

### 10.2 Anti-Patterns ❌
- `any` → usar `unknown`
- Wrapper components sem valor
- `ref()` para valores constantes
- Lógica de negócio em componentes
- `@click` sem equivalente teclado
- `console.log` em produção
- Depender de hover

---

## 11. FASES DE IMPLEMENTAÇÃO

### Phase 1 — Bootstrap + Base UI + Navegação
- [ ] Layout default com safe-areas (TV/desktop/touch)
- [ ] `useUiMode` composable + override em Settings
- [ ] `DisclaimerBox.vue`, `RemoteHint.vue`
- [ ] `useRemoteNavigation` + `normalizeInput`
- [ ] Menu principal (Setup / Tests / Settings)

### Phase 2 — State + Calibração + Gate
- [ ] `useCalibrationStore` + `schemaVersion`
- [ ] Página Setup: distância + px/mm (presets + cartão)
- [ ] Avisos: distância/pxPerMm/zoom
- [ ] Middleware gate em `/test/*`
- [ ] Reset rápido

### Phase 3 — Optótipos + Unit Tests
- [ ] CSS `@font-face` + classe `.optotype`
- [ ] `useFontReady` composable
- [ ] `optotypeCalculations.ts`
- [ ] Vitest configurado + testes

### Phase 4 — Testes de Acuidade + E2E
- [ ] `/test/snellen.vue`
- [ ] `/test/pediatric.vue`
- [ ] `/test/directional.vue`
- [ ] Playwright: 4 cenários obrigatórios

### Phase 5 — Settings + Pro Mode + Polimento
- [ ] Slider `correctionFactor`
- [ ] Tema alto contraste
- [ ] Pro Mode: PIN + locks + contador
- [ ] Polimento final

---

## 12. PROTOCOLO

### 12.1 Regras do Agente
- Só código da fase solicitada
- Arquivo novo: conteúdo completo
- Não reescrever boilerplate sem necessidade
- Se precisar ajustar estrutura: justificar em 1 frase

### 12.2 Formato de Resposta
```markdown
## Phase [N] — [Nome]

### Arquivos Criados
- `path/file.vue` — descrição

### Arquivos Alterados  
- `path/file.ts` — o que mudou

### Checklist DoD
- [x] Item completo
- [ ] Item pendente (justificativa)

---
Phase [N] Complete
```

### 12.3 Política de Instalação
NÃO executar comandos. Se algo essencial faltar:
1. Listar pacotes faltantes (nome exato)
2. Listar ajustes no `nuxt.config.ts`
3. Parar e aguardar confirmação
