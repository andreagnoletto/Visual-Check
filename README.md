# 👁️ Visual Check

> Aplicativo de triagem básica e treino de acuidade visual para Smart TVs, desktops e dispositivos touch.

⚠️ **ATENÇÃO:** Este app é APENAS para triagem básica/treino. **NÃO substitui exame oftalmológico.** Não use para decisões críticas (ex.: dirigir).

---

## ✨ Funcionalidades

### Testes de Acuidade Visual
- **Snellen** — Letras clássicas (C, D, E, F, L, O, P, T, Z)
- **Pediátrico** — Formas geométricas para crianças (●, ■, ▲, ♥, ★)
- **Direcional (Tumbling E)** — Letra E em diferentes orientações

### Modos de Teste
| Modo | Descrição |
|------|-----------|
| **Assistido** | Guiado pelo app com botões de resposta |
| **Pro** | Manual com D-pad, múltiplos caracteres por linha |

### Escala de Acuidade
12 linhas de 20/400 a 20/10 (logMAR 1.3 a -0.3)

### Multi-Input
- 📺 Controle remoto de TV (D-pad)
- ⌨️ Teclado
- 👆 Touch/Mouse

---

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Abrir no navegador
open http://localhost:3000
```

---

## 📐 Calibração

O app requer calibração antes dos testes:

1. **Presets de TV** — Selecione o tamanho da sua tela (32" a 75")
2. **Distância** — Configure a distância do paciente (2-10m)
3. **Fator de Correção** — Ajuste fino (0.9x a 1.1x)

### Presets Disponíveis
| Tela | Resolução | px/mm |
|------|-----------|-------|
| 32" | 1080p | 2.9 |
| 40" | 1080p | 2.3 |
| 43" | 4K | 4.2 |
| 50" | 4K | 3.6 |
| 55" | 4K | 3.1 |
| 65" | 4K | 2.7 |
| 75" | 4K | 2.3 |
| 27" Monitor | 4K | 5.8 |

---

## 🎮 Controles

### Modo Assistido
| Ação | Controle TV | Teclado | Touch |
|------|-------------|---------|-------|
| Navegar | D-pad | Setas | — |
| Selecionar | OK | Enter/Espaço | Tap |
| Voltar | Back | Escape | Botão |

### Modo Pro
| Ação | Controle TV | Teclado |
|------|-------------|---------|
| Letra menor | ↓ | Seta baixo |
| Letra maior | ↑ | Seta cima |
| Novas letras | → | Seta direita |
| Sair | ← | Seta esquerda / Escape |

---

## 🛠️ Tech Stack

- **Nuxt 4** — Framework Vue.js
- **Vuetify 3** — UI Components
- **Pinia** — State Management
- **TypeScript** — Type Safety
- **Vitest** — Unit Tests (78 testes)
- **Playwright** — E2E Tests (7 cenários)

---

## 📁 Estrutura do Projeto

```
app/
├── components/          # Componentes Vue
├── composables/         # Lógica reutilizável
├── layouts/             # Layout padrão
├── pages/               # Rotas
│   ├── test/            # Páginas de teste
│   └── ...
├── stores/              # Pinia stores
└── utils/               # Utilitários
```

---

## 🧪 Testes

```bash
# Testes unitários
npm run test:run

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:coverage
```

---

## 📦 Build

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

---

## ⚙️ Configurações

As constantes do app estão em `app/utils/constants.ts`:

| Constante | Valor | Descrição |
|-----------|-------|-----------|
| `MIN_DISTANCE_M` | 0.3 | Distância mínima do paciente (metros) |
| `MAX_DISTANCE_M` | 6 | Distância máxima do paciente (metros) |
| `PRO_CONTROLS_HIDE_TIMEOUT` | 9000 | Tempo para ocultar setas laterais no modo Pro (ms) |
| `FONT_TIMEOUT` | 3000 | Timeout para carregamento de fonte (ms) |
| `PRO_START_LINE_INDEX` | 5 | Linha inicial no modo Pro (20/40) |
| `PIN_LOCK_TIMEOUT` | 300000 | Tempo de bloqueio após tentativas de PIN (5min) |

---

## 📄 Licença

MIT

---

## ⚠️ Disclaimer

Este aplicativo é fornecido "como está", sem garantias de qualquer tipo. Os resultados podem variar por:
- Iluminação ambiente
- Distância do observador
- Zoom do navegador
- Configuração da tela

**Sempre consulte um oftalmologista para diagnóstico profissional.**
