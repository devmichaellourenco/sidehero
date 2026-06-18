# 126 — Release Chrome Web Store v0.6.1

## Versão

- `manifest.json` → **0.6.1**
- `package.json` → **0.6.1** (sincronizado)

## Script de release

```bash
npm run release
```

Executa:
1. `npm test`
2. `npm run build`
3. Remove legado `dist/content/` (content scripts antigos)
4. Gera `releases/side-hero-v0.6.1.zip` (sem `.map`)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/pack-release.mjs` | Build + zip para Chrome Web Store |
| `releases/side-hero-v0.6.1.zip` | Pacote para upload |
| `releases/RELEASE_NOTES_v0.6.1.md` | Notas para a loja |

## Upload

Chrome Web Store → Pacote → Upload de `releases/side-hero-v0.6.1.zip`

## Destaques desta versão (0.6.0 → 0.6.1)

- Battle strip: sprites maiores, HP/skills no chão, badges de status
- Feedback visual de impacto em skills (dano/cura/buff/debuff)
- Correção do replay: avanço de fase com loot reduzido em fases já cleared
- Refatoração interna da battle strip (DTOs/mappers, card unificado)
