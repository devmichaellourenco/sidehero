# 134 — Forja Divina

Sistema inspirado no cubo do Task Bar Hero: fundir itens ou destruí-los por ouro.

## Regras (v1)

| Modo | Entrada | Saída |
|------|---------|-------|
| **Criar item** | 9 itens da mesma raridade no inventário | 1 item aleatório de raridade superior (slot aleatório, stats pelo stage atual) |
| **Destruir por ouro** | 1 item do inventário | Ouro (tabela por raridade + bônus de stage) |

- Apenas itens do **inventário** (não equipados, não no baú).
- Raridade **mítica** não pode ser fundida (não há raridade superior).
- Destruir no inventário/baú continua **sem ouro**; ouro só na Forja Divina.
- Desbloqueio: melhoria **Forja Divina** (ramo Equipamento, stage 4+, Otimizar equipe I).

## Arquitetura

```
domain/
  gear/GearRarityProgression.ts     — ordem de raridades, FORGE_FUSE_REQUIRED_COUNT = 9
  forge/ForgeSalvageGoldCatalog.ts  — ouro por raridade + stage
  forge/DivineForgePolicy.ts        — checagem de unlock
  services/DivineForgeService.ts    — fuse() e salvage()

application/
  use-cases/FuseGearInForgeUseCase.ts
  use-cases/SalvageGearInForgeUseCase.ts

presentation/
  components/DivineForgePresentation.ts
  components/DivineForgeModalRenderer.ts
  flows/DivineForgeFlow.ts
```

Mensagens SW: `FORGE_FUSE_GEAR`, `FORGE_SALVAGE_GEAR`.

## UI

- Botão na action bar (`#open-forge-btn`, ícone cristal épico).
- Modal com abas **Criar item** e **Destruir por ouro**.
- Grid do inventário com seleção múltipla (9) ou única (salvage).

## Ouro por raridade (base)

| Raridade | Ouro base |
|----------|-----------|
| Comum | 10 |
| Incomum | 25 |
| Raro | 60 |
| Épico | 150 |
| Lendário | 400 |
| Mítico | 1000 |

Bônus: `+15%` a cada 10 stages (`floor(stage/10) * 0.15`).

## Teste manual sugerido

1. Comprar melhoria Forja Divina em Melhorias.
2. Ver botão cristal na barra de ações.
3. Colocar 9 itens comuns no inventário → Criar item → verificar item incomum.
4. Selecionar 1 item → Destruir por ouro → confirmar e ver ouro no HUD.
5. Tentar fundir itens de raridades mistas → botão desabilitado / erro.
6. Destruir item no inventário normal → sem ouro.
