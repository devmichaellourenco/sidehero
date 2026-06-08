# 067 — Marcos handcrafted + abas bloqueadas

## Marcos handcrafted (fases X-50)

`MilestonePhaseBlueprints.ts` define composições únicas para as **10 fases de capítulo** (1-50 … 10-50):

| Fase | Nome | Tier |
|------|------|------|
| 1-50 | Guardião das Esgotos | 50 |
| 2-50 | Capitão da Mina | 100 |
| 5-50 | Colosso do Céu Quebrado | 250 |
| 10-50 | Soberano do Vazio | 500 |

Marcos 50/100/250/500 têm `statMultiplier` elevado e waves extras.

`HandcraftedPhaseCatalog.ts` aplica o blueprint ao gerar fases `milestoneBoss`.

## Abas de mapa bloqueadas

- `CampaignMapDto.unlocked` — true se alguma fase do mapa está desbloqueada/concluída
- Aba com `disabled`, ícone 🔒 e tooltip explicativo
- `CampaignFlow` ignora clique em abas bloqueadas
- Painel do mapa bloqueado mostra mensagem em vez do grid

## Testes

- `MilestonePhaseBlueprints.test.ts`
- `CampaignModalRenderer.test.ts` (abas disabled + painel locked)

## Validação

```bash
npm test
npm run build
```
