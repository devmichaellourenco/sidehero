# 031 — Skills, Atributos e Progressão de Classes (plano)

## Status: **aprovado** — implementação em andamento

---

## Decisões de produto (respostas do usuário)

| Tema | Decisão |
|------|---------|
| **Pontos por level** | **1 ponto de aprimoramento** por level — o jogador escolhe gastar em **+STR, +DEX, +INT** ou em **rank de skill** |
| **Dois tipos de pontos** | **Aprimoramento básico** (1/level) + **pontos de ascensão** (pool separado, estilo PoE 2 — ganhos ao ascender e na sub-árvore) |
| **Skills universais vs classe** | Skills **padrão** disponíveis para **todas** as classes; skills **de classe** são exclusivas e diferenciam cada classe |
| **Requisitos de skill** | Level mínimo + atributos mínimos (nem sempre exige classe); **poder escala com atributo** (ex.: magias com INT) |
| **Trade-off de build** | Curandeiro que investe em DEX para skill ágil enfraquece magias baseadas em INT — decisão consciente |
| **Distribuição** | A qualquer momento, sem pausar o jogo — modal do herói |
| **Troca de skills** | **Custo em ouro** para **adicionar/ativar** skill (evita swap constante); remover é livre; **respec futuro** deixado aberto na arquitetura |
| **Árvore** | Média (~20 nós), por **classe base** + sub-árvore de ascensão |
| **Combate** | Skills **automáticas** conforme regras de cada skill |
| **Ascensão** | Especialização **irreversível** na v1; arquitetura preparada para respec futuro |
| **Saves antigos** | **Ignorar** — desenvolvimento do zero |
| **Pontos retroativos** | **Não** — saves novos |
| **UI** | Abas: **Ficha \| Atributos \| Skills \| Classe** |

---

## Modelo de pontos (revisado)

### Ponto de aprimoramento básico
- Ganho: **+1** a cada level-up do herói
- Gastos possíveis:
  - `+1 STR`, `+1 DEX` ou `+1 INT` (atributo alocado permanente até respec futuro)
  - `+1 rank` em skill (se requisitos de level + atributos + pré-requisitos de skill forem atendidos)

### Ponto de ascensão
- Ganho: ao **realizar ascensão** (quantidade definida no catálogo, ex. 2 pontos) + possíveis nós da sub-árvore
- Gasto: apenas em skills/nós da **sub-árvore de ascensão**
- Pool separado em `Hero.unspentAscensionPoints`

### Ativação de skill (anti-swap)
- Desbloquear rank ≠ ativar no combate
- `equippedSkillIds`: skills **ativas** (automáticas no tick)
- **Ativar** skill já desbloqueada: custo em **ouro** (`SkillActivationRules`)
- **Desativar**: gratuito; rank permanece investido

---

## Modelo de dados (revisado)

### `Attributes` — base + alocados
```ts
// Base fixa por classe (BASE_ATTRIBUTES)
// Alocados via pontos de aprimoramento
allocatedAttributes: { str: number; dex: number; int: number };
// totalStr = base.str + allocated.str
```

### `HeroProps` (campos novos)
```ts
allocatedAttributes: Attributes;
unspentImprovementPoints: number;
unspentAscensionPoints: number;
skillRanks: Record<SkillId, number>;
equippedSkillIds: SkillId[];
ascensionId: AscensionId | null;
```

### `SkillDefinition` (campos chave)
```ts
{
  id: 'fireball',
  scope: 'universal' | 'class',      // universal = todos; class = só heroClass
  heroClass?: HeroClass,              // quando scope === 'class'
  branch: 'offense' | 'defense' | 'utility',
  name: string,
  maxRank: number,
  requirements: SkillRequirement[],
  effect: SkillEffect,               // scaling: 'str' | 'dex' | 'int'
  combatRule: CombatSkillRule,       // prioridade, condição (ally < 70% HP, etc.)
}
```

### `GearProps` — requisitos
```ts
requirements: { minLevel: number; str?: number; dex?: number; int?: number };
```

---

## Skills — duas camadas

### Universais (~8 nós)
Disponíveis para knight, sorcerer e priest. Exemplos:
| ID | Nome | Scaling | Notas |
|----|------|---------|-------|
| `power_attack` | Ataque Poderoso | STR | Dano físico |
| `evasion` | Esquiva | DEX | +DEF |
| `arcane_touch` | Toque Arcano | INT | Dano mágico leve |
| `vitality` | Vitalidade | STR | +HP |
| `precision` | Precisão | DEX | +ATK |
| `meditation` | Meditação | INT | Regeneração / suporte |

### Por classe (~12 nós cada)
| Classe | Exclusivas |
|--------|------------|
| knight | `shield_bash`, `iron_skin`, `taunt`, `power_strike`… |
| sorcerer | `arcane_bolt`, `fireball`, `frost_nova`, `mana_shield`… |
| priest | `minor_heal`, `blessing`, `smite`, `renew`… |

---

## Fases de implementação

### Fase 0 — Fundação ✅ concluída (ver `032-fase0-progressao-fundacao.md`)
- [x] Plano aprovado
- [x] `Attributes`, base por classe, alocados em `Hero`
- [x] `unspentImprovementPoints`, `unspentAscensionPoints`
- [x] `skillRanks`, `equippedSkillIds`, `ascensionId`
- [x] Level-up concede +1 ponto de aprimoramento
- [x] Persistência + DTOs + migração com defaults
- [x] Constantes: `SkillActivationRules` (custo ouro)

### Fase 1 — Atributos + gear reqs
- [ ] `GearRequirements` + geração em `LootService`
- [ ] `Hero.meetsGearRequirements()` + gates em equip
- [ ] `SpendImprovementPointUseCase` (stat: str|dex|int)
- [ ] UI aba **Atributos**

### Fase 2 — Árvore de skills
- [ ] `SkillCatalog` (universal + 3 classes)
- [ ] `SkillService`, `SkillEvaluator`
- [ ] `SpendImprovementPointOnSkillUseCase`, `ActivateSkillUseCase` (ouro), `DeactivateSkillUseCase`
- [ ] UI aba **Skills** + badge de pontos

### Fase 3 — Combate
- [ ] `CombatSkillResolver` — automático por `combatRule`
- [ ] Magia (sorcerer), cura (priest), modificadores (knight)
- [ ] Stats derivados de atributos alocados

### Fase 4 — Ascensão
- [ ] `ClassAscensionCatalog` + `AscendClassUseCase`
- [ ] Sub-árvore + pontos de ascensão
- [ ] UI aba **Classe**

### Fase 5 — Polish
- [ ] Message bus, `LoadoutPlanner`, doc `032`

---

## Arquitetura

```
src/domain/progression/
  Attributes.ts
  BaseAttributes.ts
  SkillId.ts
  SkillActivationRules.ts
  SkillDefinition.ts          # Fase 2
  SkillCatalog.ts             # Fase 2
  SkillRequirement.ts         # Fase 2
  SkillEvaluator.ts           # Fase 2
  SkillService.ts             # Fase 2
  ClassAscension.ts           # Fase 4
  ClassAscensionCatalog.ts    # Fase 4
  GearRequirements.ts         # Fase 1
  CombatSkillResolver.ts      # Fase 3
```

**Separação:** `domain/upgrades/` = QoL global (ouro) · `domain/progression/` = build por herói.

---

## Próximo passo

Implementar **Fase 0** → **Fase 1** sequencialmente.
