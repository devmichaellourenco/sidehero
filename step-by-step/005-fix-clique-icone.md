# Step-by-Step — Fix clique no ícone da extensão

## Data: 06/06/2025

## Problema

Clique no ícone do Taskbar Hero não alternava o painel, enquanto afiliado-extensao funcionava.

## Causas

1. Content script ausente em abas abertas antes de recarregar a extensão
2. `sendMessage` falhava silenciosamente no `catch` vazio
3. `toggleVisibility` checava só `this.root`, ignorando sidebar já no DOM

## Correções

| Arquivo | Alteração |
|---------|-----------|
| `ContentScriptBridge.ts` | Injeta script via `chrome.scripting` antes de enviar mensagem |
| `service-worker.ts` | Usa bridge no clique + injeta em abas no `onInstalled` |
| `sidebar-host.ts` | Singleton global evita listeners duplicados |
| `SidebarHost.ts` | `isMounted()` verifica DOM + reutiliza sidebar existente |
| `manifest.json` | Permissões `scripting` e `activeTab` |

## Como testar

```bash
npm run build
```

Recarregar extensão → abrir qualquer site → clicar no ícone ⚔️

## Status

✅ Corrigido
