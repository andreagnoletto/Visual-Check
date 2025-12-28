# AGENTE CURSOR — TV Visual Check (Nuxt 4 + Vuetify 3, multi-device) — v3.4

Você é um(a) engenheiro(a) sênior front-end especializado(a) em interfaces "10-foot UI" (TV) e UI responsiva.
Construa um MVP chamado **TV Visual Check**: app de **triagem básica/treino de acuidade visual** em qualquer tela (TV, monitor, notebook, tablet, celular).
NÃO é diagnóstico.

---

# PARTE 1 — CONTEXTO E ESCOPO

## Escopo técnico
- **Idioma fixo:** português brasileiro (sem i18n no MVP).
- **Orientação:** testes de acuidade forçam landscape ou exibem "Gire o dispositivo"; demais telas funcionam em ambas.
- **Offline:** não é requisito do MVP; pode exigir conexão inicial para carregar assets.

## Princípios inegociáveis
1. **NÃO é dispositivo médico.** Mostrar disclaimer (ver seção Disclaimer).
2. **Zero dados pessoais.** Somente preferências locais (Pinia persist/localStorage).
3. **Sem histórico individual.** No máximo contadores agregados locais (Phase 5).
4. **Multi-input obrigatório:** remoto/D-pad, teclado, toque. Mouse opcional.
5. **Foco sempre visível** — principalmente em TV/teclado.
6. **Menos é mais:** implementar mínimo por fase, sem engenharia excessiva.
7. **Nada fora do escopo da fase.**
8. **Vuetify-first:** layout/controles via Vuetify. CSS/JS custom apenas para:
   - (a) foco/TV
   - (b) optótipos
   - (c) roving tabindex/restore
9. **Acessibilidade mínima:** labels/aria, contraste adequado, foco visível.
10. **Justificar componentes novos** em 1 frase.

## Stack (assumir já instalado; você NÃO instala nada)
- Nuxt 4 (`app/`)
- TypeScript strict
- Vuetify 3 via `vuetify-nuxt-module`
- Pinia + persist (já configurado)
- Vitest + Playwright a partir da Phase 3

## Estrutura de Pastas Esperada
```
app/
├── assets/
│   ├── css/
│   │   └── optotype.css
│   └── fonts/
│       ├── OpticianSans.woff      ← formato web principal
│       └── Optician-Sans.otf      ← fallback
├── components/
│   ├── DisclaimerBox.vue
│   ├── RemoteHint.vue
│   └── optotypes/
├── composables/
│   ├── useRemoteNavigation.ts
│   ├── useUiMode.ts
│   └── useFontReady.ts
├── layouts/
│   └── default.vue
├── pages/
│   ├── index.vue
│   ├── setup.vue
│   ├── settings.vue
│   └── test/
│       ├── snellen.vue
│       ├── pediatric.vue
│       └── directional.vue
├── stores/
│   └── calibration.ts
├── utils/
│   ├── normalizeInput.ts
│   └── optotypeCalculations.ts
└── app.vue
```

## Convenções de Nomenclatura
- **Composables:** `use*` (ex: `useRemoteNavigation`)
- **Stores:** `use*Store` (ex: `useCalibrationStore`)
- **Componentes:** PascalCase (ex: `DisclaimerBox.vue`)
- **Utils/helpers:** camelCase (ex: `normalizeInput.ts`)
- **Constantes:** SCREAMING_SNAKE_CASE (ex: `OPTOTYPE_FONT_SCALE`)

## Política de instalação/CLI
- NÃO executar comandos.
- Se algo essencial estiver faltando:
  1) liste pacotes faltantes (nome exato)
  2) liste ajustes necessários no `nuxt.config.ts`
  3) pare.

## Alvos e dispositivos (você deve pensar assim)
- TV (10-foot): Android TV sticks/boxes, Tizen, webOS → remoto D-pad/OK/Back
- Desktop/Notebook: Windows/Mac/Linux → teclado e mouse
- Mobile/Tablet: iOS/Android → toque
O app deve se adaptar sem quebrar nenhum fluxo.

## Modos de UI (detecção objetiva + fallback manual)
Defina um `uiMode` com 3 opções:
- `tv`
- `desktop`
- `touch`

Detecção (em ordem de prioridade; simples e robusta):
1) **Override persistido** do usuário (Settings) sempre vence.
2) Heurística por user agent (best-effort): se detectar Android TV / Tizen / webOS → `tv`.
3) `matchMedia('(pointer: coarse)')` + viewport width >= 960px → `tv`; caso contrário → `touch`.
4) Default `desktop`.

Promoção por primeira interação (importante):
- Se o app receber primeiro um evento típico de remoto/teclado (setas/OK/Back), pode promover para `tv`.
- Se o app receber primeiro toque/pointer coarse, pode promover para `touch`.
- **A promoção só ocorre uma vez por sessão** (até refresh/reload).
- Após promovido, o modo só muda via Settings ou refresh.

Regras:
- Se a detecção for incerta, default `desktop`.
- Sempre permitir override em Settings (“Modo de interface: TV / Desktop / Touch”), persistido localmente.
- O modo só muda automaticamente se o usuário NÃO tiver setado override.

---

# PARTE 2 — LAYOUT E RESPONSIVIDADE

## Layout responsivo + safe areas + overscan
- Usar Vuetify breakpoints (xs/sm/md/lg/xl).
- Definir constantes de padding por modo:
  - `SAFE_MARGIN_TV` (ex.: 48px ou baseado em vw/vh) aplicado no layout para overscan.
  - `SAFE_MARGIN_DESKTOP` (moderado)
  - `SAFE_MARGIN_TOUCH` (touch-friendly)
- Em modo TV:
  - padding/overscan maior, textos e botões maiores, densidade baixa.
- Em mobile:
  - controles grandes e com espaçamento (touch-friendly).
- Em desktop:
  - densidade moderada, com teclado funcionando 100%.
- Respeitar notch/safe-area (CSS env) quando aplicável.

## Constantes do Sistema
```typescript
// Reunir em app/utils/constants.ts
const OPTOTYPE_FONT_SCALE = 1.75
const SAFE_MARGIN_TV = 48        // px
const SAFE_MARGIN_DESKTOP = 24  // px
const SAFE_MARGIN_TOUCH = 16    // px
const RESET_BACK_THRESHOLD = 4  // pressionamentos
const RESET_BACK_WINDOW = 1500  // ms
const FONT_TIMEOUT = 3000       // ms
const SCHEMA_VERSION = 1
const MIN_DISTANCE_M = 2
const MAX_DISTANCE_M = 10
const MIN_PX_PER_MM = 2.0
const MAX_PX_PER_MM = 6.0
```

---

# PARTE 3 — UX E DOMÍNIO

## Disclaimer
**Exibir em:** Home, todas as telas de teste, Settings.

**Texto:**
> ⚠️ ATENÇÃO: Este app é APENAS para triagem básica/treino. NÃO substitui exame oftalmológico.
> Não use para decisões críticas (ex.: dirigir). Resultados variam por iluminação, distância, zoom do navegador e configuração da tela.

## Tipografia dos Optótipos
- **Fonte:** `OpticianSans.woff` em `app/assets/fonts/` (+ fallback `.otf`)
- **CSS:** `@font-face` com `font-display: block` (bloqueia render até carregar)
- **Classe:** `.optotype` SOMENTE em optótipos; UI geral usa Vuetify

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

### FontReady (composable `useFontReady`)
```typescript
// Aguardar fonte antes de iniciar testes
await Promise.race([
  document.fonts.ready,
  new Promise(resolve => setTimeout(resolve, 3000)) // timeout 3s
])
const isReady = document.fonts.check('1em OpticianSans')
// Se !isReady após timeout → mostrar warning e prosseguir
```

### Fallback de Fonte (se timeout)
1. Mostrar warning inline: "Fonte de optótipos pode não estar carregada corretamente"
2. Permitir prosseguir (não bloquear teste)
3. Registrar estado `fontFailed: true` no store para diagnóstico
4. Nunca usar `console.log` em produção

## Multi-input (obrigatório)
### 1) Teclado/Remoto (TV/desktop)
- Direções: ArrowUp/Down/Left/Right
- Confirma: Enter, NumpadEnter, Space, "OK", "Select"
- Voltar: Escape, Backspace
Fallback keyCode (se `key` vazio):
- Android TV: OK=13/66/23, BACK=4
- Samsung Tizen: OK=13, BACK=10009
- LG webOS: OK=13, BACK=461

### 2) Toque/Mouse (touch/desktop)
- Tudo navegável via toque/click, mas **não** substituir atalhos de teclado/remoto.
- Não depender de hover para mostrar ações.
- Sempre oferecer ação equivalente via UI clicável (botões) nos testes (modo assistido).

### 3) Gamepad (MVP: não implementar)
> Estrutura `normalizeInput()` deve suportar extensão futura:
> - Reservar mapeamento: D-pad → Arrow, A → Enter, B → Escape
> - Não bloquear eventos de gamepad, apenas não processar
> - Comentário `// TODO: Gamepad support` no código

## Padrão de navegação em modo TV/teclado (Vuetify-aware)
Implementar **roving tabindex**:
- Só 1 item interativo “ativo” com `tabindex=0`; os demais `-1`.
- Setas movem foco de forma previsível (grid/lista).
- Confirm ativa item focado.
- Back fecha modal/retorna rota.

Vuetify (regra para evitar foco “perdido”):
- O foco visual deve estar no **elemento clicável principal** (ex.: card/list-item), não apenas em elementos internos.
- Evitar `autofocus` espalhado; foco é sempre controlado pelo roving tabindex.

Robustez:
- Persistir e restaurar foco por rota.
- Best-effort restore em resize/orientation.
- Centralizar em `normalizeInput()` + `useRemoteNavigation()` (sem duplicar lógica).

Sliders/toggles em modo TV:
- Slider: ←→ ajusta valor; Enter confirma; Back cancela/volta.
- Toggle: Enter alterna; Back volta.

## Calibração (pilares, funciona em qualquer dispositivo)
- Distância: opções 3–6m + custom
- px/cm (duas opções):
  - Presets por polegadas — rápido para TV/monitor
    - `aspectRatio` persistido no store (default: `16:9`)
    - Opções: 16:9 / 16:10 / 21:9 / 4:3
    - Usado para calcular largura física a partir da diagonal nos presets.

#### Tabela de Presets (referência)
| Polegadas | Resolução Típica | pxPerMm Aprox. |
|-----------|------------------|----------------|
| 32        | 1080p            | ~2.9           |
| 40        | 1080p            | ~2.3           |
| 43        | 4K               | ~4.2           |
| 50        | 4K               | ~3.6           |
| 55        | 4K               | ~3.1           |
| 65        | 4K               | ~2.7           |
| 75        | 4K               | ~2.3           |

  - Referência física (cartão 85,6mm): ajustar retângulo com ←→ ou slider (touch) e confirmar

### Unidades (evitar bug)
- Use `pxPerMm` como padrão interno (pixels por milímetro)
- Se expor `pxPerCm` na UI, converter: `pxPerCm = pxPerMm * 10`

### Ajuste Fino
- `correctionFactor`: default 1.00, range 0.90–1.10
- Salvar em Pinia persist

### Validações
| Condição | Ação |
|----------|------|
| Distância < 2m ou > 10m | Aviso "fora do recomendado" |
| pxPerMm < 2.0 ou > 6.0 | Warning (não bloqueia) |
| Zoom ≠ 100% | Aviso "pode invalidar calibração" |

### Detecção de Zoom (best-effort)
```typescript
// Não 100% confiável em todos os browsers
const detectZoom = (): number => {
  // Método 1: devicePixelRatio (afetado por scale do sistema)
  const dpr = window.devicePixelRatio
  // Método 2: outerWidth/innerWidth (menos preciso)
  const ratio = window.outerWidth / window.innerWidth
  // Usar heurística: se ambos sugerem != 1, avisar
  return Math.round(Math.max(dpr, ratio) * 100)
}
// Mostrar warning se detectZoom() !== 100
```

**Referência pxPerMm:**
- TV 40" 1080p → ~2.3 px/mm
- TV 55" 4K → ~3.1 px/mm
- TV 75" 4K → ~2.3 px/mm
- Monitor 27" 4K → ~5.8 px/mm

Gate:
- `/test/*` exige calibração pronta (mostrar instrução + CTA para Setup).

### Reset Rápido
- **TV/teclado:** tecla `R` ou `Back` 4× em < 1.5s → modal "Resetar calibração?"
- **Touch:** botão explícito em Settings (não atalho oculto)

> ⚠️ Exigir confirmação visual para evitar reset acidental.

## Optótipos e tamanho (guia)

### Linhas padrão (8 linhas)
| Linha | logMAR | Snellen |
|-------|--------|----------|
| 1     | 1.0    | 20/200   |
| 2     | 0.9    | 20/160   |
| 3     | 0.7    | 20/100   |
| 4     | 0.5    | 20/63    |
| 5     | 0.3    | 20/40    |
| 6     | 0.2    | 20/32    |
| 7     | 0.1    | 20/25    |
| 8     | 0.0    | 20/20    |

### Pools de caracteres
- **Snellen:** C D E F L O P T Z
- **Pediátrico:** ● ■ ▲ ♥ ★ (5 símbolos high-contrast)
  - ⚠️ **Recomendado:** usar SVG inline ou componentes Vue para consistência cross-platform
  - Fallback: Unicode apenas se SVG não disponível
- **Direcional:** "E" nas rotações 0° / 90° / 180° / 270°
- **Caracteres por linha:** mínimo 3, máximo 5 (ajustar por largura disponível).

### Cálculo de Tamanho
```typescript
// D = distância em metros
const height_mm = D * Math.tan((5 / 60) * (Math.PI / 180)) * 1000
const height_px = height_mm * pxPerMm

// OPTOTYPE_FONT_SCALE = 1.75
// Fator empírico para compensar ascender/descender da OpticianSans
const fontSize_px = height_px * OPTOTYPE_FONT_SCALE * correctionFactor
```

Randomização:
- Evitar sequência idêntica em linhas consecutivas
- Limitar repetições de caracteres parecidos (regra simples)

## Persistência (versionada)
- Incluir `schemaVersion` no estado persistido.
- Se mudar `schemaVersion`, resetar calibração e avisar claramente o usuário.

### Estratégia de Migração
```typescript
// Em useCalibrationStore
const migrateState = (oldState: unknown, oldVersion: number): CalibrationState => {
  if (oldVersion < SCHEMA_VERSION) {
    // Tentar migração campo a campo
    // Se impossível: retornar estado inicial + flag needsRecalibration
    return { ...DEFAULT_STATE, needsRecalibration: true }
  }
  return oldState as CalibrationState
}
```
- Nunca perder dados silenciosamente — sempre notificar usuário

## Pro Mode (SOMENTE Phase 5)
- **PIN 4 dígitos** (default "1234")
  - Armazenado em texto plano no localStorage
  - > ⚠️ Isso NÃO é segurança — é apenas barreira UX para evitar alterações acidentais
- **Locks:** travar calibração, esconder settings avançados
- **Contador local de sessões**
- **Tema alto contraste** via Vuetify theme

---

# PARTE 4 — QUALIDADE E ERROS

## Tratamento de Erros
- **Erros de UI:** toast Vuetify (snackbar), nunca crashar
- **Erros de calibração:** warning inline, não bloquear
- **Erros de fonte:** graceful degradation com warning
- **Erros de navegação:** fallback para Home

## ❌ Anti-Patterns (não fazer)
- Não usar `any` — usar `unknown` se tipo incerto
- Não criar componentes wrapper sem valor (ex: `MyButton` que só repassa props)
- Não usar `ref()` para valores constantes — usar `const`
- Não misturar lógica de negócio em componentes — extrair para composables
- Não usar `@click` sozinho — sempre ter equivalente teclado
- Não usar `console.log` — remover antes de commit
- Não esquecer cleanup de listeners em `onUnmounted`
- Não depender de hover para revelar ações

## Cobertura de Testes (a partir Phase 3)
- **Unit (Vitest):** funções de cálculo, stores, composables
- **E2E (Playwright):** fluxos críticos listados na Phase 4
- **Mínimo:** cada função de cálculo de optótipo deve ter teste

---

# PARTE 5 — PROTOCOLO DE IMPLEMENTAÇÃO

## Handshake
SÓ faça a fase solicitada.

**Ao final de cada fase:**
1. Resumo da Implementação
2. Checklist DoD ✅/❌
3. Responder: `Phase [N] Complete`
4. Aguardar: `Proceed to Phase [N+1]`

## Checklist DoD (Definition of Done)

| Item | Descrição |
|------|-----------|
| TS Strict | Sem `any`, sem warnings |
| Clean Code | Sem `console.log`, sem TODOs |
| Memory Safe | Cleanup de listeners em `onUnmounted` |
| SSR-Safe | Rotas funcionam em reload direto |
| Multi-Input | Funciona com remoto/teclado + toque/click |
| Foco Visível | Óbvio em TV/teclado, aceitável em touch |
| Disclaimer | Presente onde exigido (ver seção) |
| Input Centralizado | Via `normalizeInput()` |
| Sem Hover | Ações não dependem de hover |
| Vuetify TV-friendly | tabindex/roving correto |
| Persistência | Com `schemaVersion` |
| Zoom Warning | Aviso se ≠ 100% (best-effort) |
| Perf Budget | Nenhum componente > 100ms render inicial |

---

## Phase 1 — Bootstrap multi-device + base UI + navegação

**Entregas:**
- [ ] Layout default com Vuetify e safe-areas (TV/desktop/touch)
- [ ] `useUiMode` composable + override em Settings
- [ ] `DisclaimerBox.vue`, `RemoteHint.vue`
- [ ] `useRemoteNavigation` + `normalizeInput`
- [ ] Menu principal (Setup / Tests / Settings)

**DoD extra:**
- Navegação completa por teclado
- Em “modo TV”, roving tabindex funciona e foco é óbvio

## Phase 2 — State + calibração + gate

**Entregas:**
- [ ] `useCalibrationStore` + helpers + `schemaVersion`
- [ ] Página Setup: distância + px/mm (presets + cartão) + aspect ratio
- [ ] Avisos: distância/pxPerMm/zoom
- [ ] Middleware gate em `/test/*`
- [ ] Reset rápido (modal + atalho)

## Phase 3 — Domínio + tipografia + unit tests

**Entregas:**
- [ ] CSS `@font-face` + classe `.optotype`
- [ ] `useFontReady` composable
- [ ] `optotypeCalculations.ts` (sizing/lines testável)
- [ ] Gerador de optótipos desacoplado
- [ ] Vitest configurado + testes para cálculos

## Phase 4 — Testes (Snellen / Pediátrico / Direcional) + e2e mínimo

**Entregas:**
- [ ] `/test/snellen.vue` — fluxo com teclado/remoto + botões assistidos
- [ ] `/test/pediatric.vue` — símbolos infantis
- [ ] `/test/directional.vue` — E direcional

**Playwright — cenários obrigatórios:**
1. Fluxo completo: Home → Setup → Teste Snellen → Home
2. Gate: `/test/snellen` sem calibração → redirect Setup
3. Navegação TV: fluxo completo com Arrow + Enter + Escape
4. Touch: fluxo com cliques nos botões assistidos

## Phase 5 — Settings + Pro + polimento

**Entregas:**
- [ ] Slider `correctionFactor` (TV-friendly com ←→)
- [ ] Tema alto contraste via Vuetify
- [ ] Pro Mode: PIN + locks + contador de sessões
- [ ] Polimento: foco, overscan, performance

---

# PARTE 6 — REGRAS DE SAÍDA

## Para o Agente (Cursor)
- Só código necessário da fase
- **Arquivo novo:** conteúdo completo
- **Arquivo alterado:** conteúdo completo somente se fizer parte da fase
- Não reescrever boilerplate sem necessidade
- Se precisar ajustar estrutura: justificar em 1 frase e manter mínimo

## Formato de Resposta
```markdown
## Phase [N] — [Nome]

### Arquivos Criados
- `path/to/file.vue` — descrição

### Arquivos Alterados
- `path/to/file.ts` — o que mudou

### Checklist DoD
- [x] Item completo
- [ ] Item pendente (justificativa)

### Notas
- Observações relevantes

---
Phase [N] Complete
```
