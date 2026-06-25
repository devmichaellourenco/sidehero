# 136 — Release Chrome Web Store v0.7.2

## Versão

- `manifest.json` → **0.7.2**
- `package.json` → **0.7.2** (sincronizado)

## Script de release

```bash
npm run release
```

Executa:
1. `npm test`
2. `npm run build`
3. Remove legado `dist/content/` (content scripts antigos)
4. Gera `releases/side-hero-v0.7.2.zip` (sem `.map`)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/pack-release.mjs` | Build + zip para Chrome Web Store |
| `releases/side-hero-v0.7.2.zip` | Pacote para upload |
| `releases/RELEASE_NOTES_v0.7.2.md` | Notas para a loja |

## Upload

Chrome Web Store → Pacote → Upload de `releases/side-hero-v0.7.2.zip`

## Destaques desta versão (0.7.0 → 0.7.2)

- Evoluções de classe (Galneon, Nix, Elara) com sprites e skills por caminho
- Sprite individual por equipamento (`templateId` + catálogo de ícones)
- Correção de ícones piscando no HUD e menu principal
- Rebalance de cadência de combate e prioridade de alvo probabilística
- Waves com até 3 inimigos; ícones de campanha, loja e forja divina
