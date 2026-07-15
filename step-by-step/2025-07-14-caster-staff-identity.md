# Step-by-step — Identidade individual dos cajados

**Data:** 2025-07-14  
**Objetivo:** Cada cajado/vara/orbe tem stats e requisitos próprios no catálogo. Sem família de arma nem inferência por nome.

## Removido

- `GearWeaponFamily.ts` / teste
- Fallback `casterWeapon` em `GearRequirementChecker` (voltou ao fallback genérico por slot)

## Fonte da verdade

`src/domain/gear/data/gear-items.catalog.json` — cada item declara o próprio pacote.

### Linha arcana

| ID | Identidade |
|----|------------|
| `birch_staff` | Madeira viva: ATK baixo, gelo flat + elemental leve |
| `apprentice_staff` | Pirromancia inicial: fogo %/flat, INT 1 |
| `arcanist_staff` | Arcano clássico: cast + all elemental, INT 3 |
| `watchtower_staff` | Torre defensiva: DEF/HP/resist/CDR (quebra glass-cannon) |
| `oracle_staff` | Suporte/clérigo: CDR alto + vida %, ATK menor |
| `archmage_staff` | Glass cannon: cast alto, elemental, pen fogo, DEF baixa |

### Linha raio

| ID | Identidade |
|----|------------|
| `rain_rod` | Clima: raio leve + frio flat |
| `wind_rod` | Velocidade: cast alto, dano médio |
| `thunder_rod` | Burst: lightning alto, cast baixo |
| `tempest_staff` | Tempestade: ATK% + lightning |
| `wandering_orb` | Crítico: crit/crit dmg + cast |
| `sky_king_staff` | Apex raio: ATK alto + lightning flat |

## Testes

- Catálogo: identidades distintas por item
- Checker: requisitos vêm do JSON (`arcanist_staff` → INT)
