# 147 — Release Chrome Web Store v0.8.3

## Versão

- `manifest.json` → **0.8.3**
- `package.json` → **0.8.3** (sincronizado)

## Script de release

```bash
npm run release
```

Executa:
1. `npm test`
2. `npm run build`
3. Remove legado `dist/content/` (content scripts antigos)
4. Gera `releases/side-hero-v0.8.3.zip` (sem `.map`)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/pack-release.mjs` | Build + zip para Chrome Web Store |
| `releases/side-hero-v0.8.3.zip` | Pacote para upload |
| `releases/RELEASE_NOTES_v0.8.3.md` | Notas para a loja |

## Upload

Chrome Web Store → Pacote → Upload de `releases/side-hero-v0.8.3.zip`

## Destaques desta versão (0.8.2 → 0.8.3)

- Recompensas por kill (ouro, XP, loot com tabela por mundo/monstro)
- Gear elemental e stats flat/% (ASPD, CDR, dano físico)
- Árvore de melhorias com raiz única (Otimizar Equipe I) e Slot de skill corrigido
- Tooltips de gear com um stat por linha
- Balanceamento: DOT, gelo, XP por inimigo, loja por tier
