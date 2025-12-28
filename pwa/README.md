# PWA Implementation Plan

## Status: ✅ Implementado

---

## Checklist

### Fase 1: Assets e Estrutura
- [x] Gerar ícones (SVG escalável)
- [x] Ícone maskable para Android
- [x] Apple touch icon para iOS

### Fase 2: Configuração Nuxt
- [x] Instalar `@vite-pwa/nuxt`
- [x] Configurar `nuxt.config.ts`
- [x] Adicionar meta tags PWA
- [x] Manifest automático via módulo

### Fase 3: Service Worker
- [x] Configurar cache strategies
- [x] Cache de fontes
- [x] Cache de assets estáticos
- [ ] Testar instalação no Chrome
- [ ] Testar instalação no Safari/iOS
- [ ] Testar modo offline

### Fase 4: Testes
- [ ] Lighthouse PWA audit > 90
- [ ] Testar em Android
- [ ] Testar em iOS
- [ ] Testar em Desktop

---

## Configurações Planejadas

### Cores do Tema
```
Primary: #1976D2 (Azul)
Background: #121212 (Dark mode)
```

### Ícones Necessários
| Tamanho | Uso |
|---------|-----|
| 72x72 | Android legacy |
| 96x96 | Android legacy |
| 128x128 | Chrome Web Store |
| 144x144 | Windows tile |
| 152x152 | iOS |
| 192x192 | Android (required) |
| 384x384 | Android splash |
| 512x512 | Android (required) |
| 512x512 maskable | Android adaptive |

### Cache Strategy
| Recurso | Estratégia |
|---------|------------|
| HTML/JS/CSS | StaleWhileRevalidate |
| Fontes | CacheFirst (1 ano) |
| Imagens | CacheFirst |
| API calls | NetworkFirst |

---

## Dependências a Instalar

```bash
npm install -D @vite-pwa/nuxt
```

---

## Manifest Preview

```json
{
  "name": "TV Visual Check",
  "short_name": "Visual Check",
  "description": "Triagem básica de acuidade visual para TVs e dispositivos",
  "theme_color": "#1976D2",
  "background_color": "#121212",
  "display": "standalone",
  "orientation": "any",
  "scope": "/",
  "start_url": "/",
  "icons": [...]
}
```

---

## Referências
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Nuxt PWA Module](https://vite-pwa-org.netlify.app/frameworks/nuxt.html)
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse PWA Checklist](https://web.dev/pwa-checklist/)
