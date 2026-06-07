# Step-by-Step — MVP Taskbar Hero (Extensão Chrome)

## Objetivo

Criar um MVP de jogo idle RPG inspirado em **Task Bar Hero**, funcionando como extensão Chrome. O jogador acompanha heróis batalhando em uma "taskbar" pixel enquanto navega na web.

## Arquitetura (DDD + SOLID)

### Camadas

| Camada | Pasta | Responsabilidade |
|--------|-------|------------------|
| **Domain** | `src/domain/` | Regras de negócio puras (entidades, VOs, serviços, contratos) |
| **Application** | `src/application/` | Casos de uso e DTOs — orquestra o domínio |
| **Infrastructure** | `src/infrastructure/` | Persistência Chrome Storage, DI, messaging |
| **Presentation** | `src/presentation/` | UI popup, service worker, renderers |

### Princípios SOLID aplicados

- **S** — Cada classe tem uma responsabilidade (`CombatService`, `LootService`, renderers separados)
- **O** — Novos casos de uso podem ser adicionados sem alterar domínio (`TickGameUseCase`, `OpenChestUseCase`)
- **L** — `ChromeStorageGameRepository` implementa `IGameStateRepository` de forma substituível
- **I** — Repositório expõe apenas `load/save`
- **D** — Use cases dependem de `IGameStateRepository`, não de Chrome APIs

## Arquivos criados

### Configuração
- `package.json` — dependências e scripts de build
- `tsconfig.json` — TypeScript strict mode
- `manifest.json` — Chrome Extension MV3
- `scripts/build.mjs` — bundle com esbuild
- `scripts/generate-icons.mjs` — gera ícones PNG

### Domain
- `entities/Hero.ts` — herói com stats, XP, equipamentos
- `entities/Enemy.ts` — inimigo escalado por stage
- `entities/Gear.ts` — equipamento com raridade
- `entities/Chest.ts` — baús de loot
- `entities/GameState.ts` — estado agregado do jogo
- `value-objects/Stats.ts`, `Gold.ts`, `Experience.ts`
- `services/CombatService.ts` — loop de combate auto-battle
- `services/LootService.ts` — geração procedural de loot
- `repositories/IGameStateRepository.ts` — contrato de persistência

### Application
- `use-cases/TickGameUseCase.ts` — avança batalha
- `use-cases/GetGameStateUseCase.ts` — lê estado
- `use-cases/OpenChestUseCase.ts` — abre baú
- `use-cases/EquipGearUseCase.ts` — equipa item
- `dto/GameStateDto.ts` — serialização para UI
- `GameApplication.ts` — composição dos use cases

### Infrastructure
- `storage/ChromeStorageGameRepository.ts` — persistência local
- `messaging/GameMessageBus.ts` — comunicação popup ↔ background
- `di/createGameApplication.ts` — factory/DI simples

### Presentation
- `background/service-worker.ts` — alarmes idle + message handler
- `popup/popup.html/css/ts` — interface principal
- `components/BattleStripRenderer.ts` — faixa de batalha estilo taskbar
- `components/HeroPanelRenderer.ts` — painel de heróis
- `components/InventoryRenderer.ts` — inventário e equipar
- `components/GameViewController.ts` — orquestra UI

## Mecânicas do MVP

1. **Party de 3 heróis** (Knight, Sorcerer, Priest) marcham na strip
2. **Auto-combate** — heróis atacam inimigo; inimigo contra-ataca
3. **Progressão** — stages, ouro, XP e level up
4. **Baús** — drop a cada 3 vitórias
5. **Loot** — abrir baú gera gear (common/rare/epic)
6. **Equipar** — itens melhoram stats dos heróis
7. **Idle** — service worker avança batalhas via `chrome.alarms` (~6s)

## Como instalar

```bash
cd cbh
npm install --cache ./.npm-cache
npm run build
```

> **Nota:** O projeto foi inicialmente criado em `dev/afiliado-extensao`, mas foi movido para a raiz `cbh/`.

No Chrome: `chrome://extensions` → Modo desenvolvedor → Carregar sem compactação → selecionar pasta `dist/`

## Próximos passos sugeridos

- Overlay na barra de ferramentas do SO (requer native messaging)
- Sistema de runas e automação (como TBH original)
- Sprites pixel art reais
- Sons e animações de combate
- Testes unitários para `CombatService` e `LootService`

## Status

✅ MVP funcional implementado em 06/06/2025
