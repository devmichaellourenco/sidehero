# 109 — Sprite dedicado `mana_shield`

## Problema

O ícone de `mana_shield` não aparecia na extensão após adicionar o PNG manualmente.

## Causa

O pipeline de skills exige **4 passos**. O usuário completou apenas 2:

| Passo | Arquivo | Status antes |
|-------|---------|--------------|
| 1. PNG fonte | `public/sprites/skills/mana_shield.png` | ✓ |
| 2. Mapeamento skillId → chave | `SkillIconCatalog.ts` → `mana_shield: 'mana_shield'` | ✓ |
| 3. Caminho do asset | `AssetCatalog.ts` → `mana_shield: 'skills/mana_shield.png'` | ✗ (não salvo no disco) |
| 4. Cópia no build | `copy-assets.mjs` → `['mana_shield.png', 'skills/mana_shield.png']` | ✗ (não salvo no disco) |

Sem o passo 3, `getSkillIconPath('mana_shield')` apontava para uma chave inexistente em `ASSETS.skills`.

Sem o passo 4, o arquivo nunca ia para `dist/panel/assets/skills/` — a extensão carrega assets de `dist/`, não de `public/`.

## Correção

- `AssetCatalog.ts`: entrada `mana_shield: 'skills/mana_shield.png'` (**obrigatório salvar o arquivo** — sem isso o bundle gera URL `panel/assets/undefined`)
- `copy-assets.mjs`: entrada no `SKILL_SPRITE_MAP`
- `SkillIconCatalog.test.ts`: assert para `mana_shield`

## Diagnóstico (2ª tentativa)

Sintoma: ícone quebrado nas skills da Nix mesmo com PNG em `dist/`.

Causa confirmada: `SkillIconCatalog.ts` mapeava `mana_shield → 'mana_shield'`, mas `AssetCatalog.ts` **não estava salvo no disco** (só no buffer do editor). O `dist/panel/panel.js` compilado não continha `ASSETS.skills.mana_shield`, então `getSkillIconPath('mana_shield')` retornava `undefined`.

Verificação:
```bash
grep mana_shield dist/panel/panel.js   # deve mostrar skills/mana_shield.png
ls dist/panel/assets/skills/mana_shield.png
```

Após `npm run build`, recarregar a extensão no Chrome.

## Função de cada arquivo

| Arquivo | Função |
|---------|--------|
| `public/sprites/skills/mana_shield.png` | Arte fonte do ícone |
| `scripts/copy-assets.mjs` | Copia sprites para `dist/panel/assets/` no build |
| `AssetCatalog.ts` | Define caminhos relativos de todos os assets |
| `SkillIconCatalog.ts` | Mapeia `skillId` → chave em `ASSETS.skills` |
| `SkillIconCatalog.test.ts` | Garante que o mapeamento resolve para o path correto |
