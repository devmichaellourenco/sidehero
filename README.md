# sidehero

Extensão Chrome **Side Hero** — idle RPG no painel lateral do navegador.

## Desenvolvimento

```bash
npm install --cache ./.npm-cache
npm run build
```

Carregue a pasta `dist/` em `chrome://extensions` (modo desenvolvedor).

## Estrutura

- `src/domain` — regras de negócio (DDD)
- `src/application` — casos de uso
- `src/infrastructure` — storage, messaging
- `src/presentation` — UI, content script, service worker
- `step-by-step/` — histórico de desenvolvimento
