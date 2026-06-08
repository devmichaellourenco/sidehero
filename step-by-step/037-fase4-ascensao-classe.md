# 037 — Fase 4: Ascensão de classe

## Status: concluída

## Arquitetura (SOLID / Clean Architecture)

```
ClassAscensionCatalog (dados de especialização)
        ↓
ClassAscensionService (regras de ascensão)
        ↓
AscendClassUseCase / GetHeroAscensionTreeUseCase / SpendAscensionPointUseCase
        ↓
Message Bus → Service Worker → GameApplication
        ↓
HeroClassTabRenderer (aba Classe)
```

### Separação de responsabilidades

| Módulo | SRP |
|--------|-----|
| `ClassAscensionCatalog` | Definição de especializações e requisitos |
| `ClassAscensionService` | Validação e execução de ascensão |
| `SkillCatalog` (ascension) | Skills exclusivas da sub-árvore |
| `SkillService.buildAscensionTree` | Árvore separada de skills de aprimoramento |
| Use cases | Orquestração application layer |

### DIP / OCP
- `ProgressionRequirementEvaluator` reutilizado para requisitos de ascensão e skills
- Nova ascensão = entrada no catálogo + skills com `pointType: 'ascension'` — sem alterar use cases

## Comportamento

1. **Level 10** + requisitos de atributos para ascender
2. **2 caminhos** por classe base (6 especializações no total)
3. Ascensão **irreversível** — `Hero.ascend()` lança se já ascendido
4. Ao ascender: **+2 pontos de ascensão** (`pointsGranted` no catálogo)
5. Pontos gastos apenas em skills `pointType: 'ascension'` da sub-árvore
6. Skills de ascensão equipáveis com mesmo fluxo de ouro (activate/deactivate)

## Especializações

| Classe | Caminhos |
|--------|----------|
| Knight | Guardião · Devastador |
| Sorcerer | Piromante · Arcanista |
| Priest | Oráculo · Inquisidor |

## Mensagens novas

- `ASCEND_CLASS` — realiza ascensão
- `GET_HERO_ASCENSION_TREE` — opções + sub-árvore
- `SPEND_ASCENSION_POINT` — investe rank em skill de ascensão

## Testes

- `ClassAscensionService.test.ts`
- `SkillService.ascension.test.ts`

## Arquivos

| Novo | Função |
|------|--------|
| `domain/progression/ClassAscension.ts` | Entidade de dados de ascensão |
| `domain/progression/ClassAscensionCatalog.ts` | Catálogo de 6 especializações |
| `domain/progression/ClassAscensionService.ts` | Serviço de domínio |
| `application/dto/AscensionOptionDto.ts` | DTO para UI |
| `application/mappers/AscensionMapper.ts` | Mapper domain → DTO |
| `application/use-cases/AscendClassUseCase.ts` | Caso de uso ascender |
| `application/use-cases/GetHeroAscensionTreeUseCase.ts` | Caso de uso árvore |
| `application/use-cases/SpendAscensionPointUseCase.ts` | Caso de uso gastar ponto |

| Alterado | Motivo |
|----------|--------|
| `Hero.ts` | `ascend()`, `spendAscensionPointOnSkill()` |
| `SkillCatalog.ts` | 12 skills de ascensão + filtro correto |
| `SkillService.ts` | `buildAscensionTree`, `allocateAscension` |
| `SkillCombatCatalog.ts` | Perfis de combate das skills de ascensão |
| `HeroClassTabRenderer.ts` | UI funcional da aba Classe |
| `GameViewController.ts` | Handlers e carregamento da árvore |

## Análise de manutenibilidade

A ascensão segue o mesmo padrão de progressão já estabelecido (catálogo declarativo + evaluator + use case fino). Separar `buildTree` e `buildAscensionTree` evita misturar pools de pontos diferentes na UI e nas regras de alocação. Respec futuro pode introduzir `Hero.respecAscension()` sem reescrever catálogos.

Próximo passo natural: **Fase 5** (polish) ou passivas de combate (`iron_skin`, `mana_shield`, `blessing`).
