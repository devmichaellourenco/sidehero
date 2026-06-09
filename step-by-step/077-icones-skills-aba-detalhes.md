# 077 — Ícones de skills na aba Skills (detalhes do herói)

## Objetivo

Exibir ícones e informações compactas nos cards da aba **Skills** do modal de detalhes do personagem.

## Layout (horizontal)

```
[ ícone 128px ]  Nome · rank
                 badges: ramo, escopo, scaling, status, ativa/inativa
                 descrição
                 stats de combate (grid)
                 requisitos (chips)
                 ações (+rank, ativar, desativar)
```

- Ícone: **128px de largura**, altura automática (`object-fit: contain`)
- Moldura por branch (ofensivo / defensivo / utilidade)
- Borda lateral colorida por branch no card

## Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `SkillCardPresentation.ts` | Layout horizontal + badges + stats inline |
| `panel.css` | Estilos `.skill-card-layout`, `.skill-card-icon` (128px), badges e stats |

## Validação

```bash
npm test
npm run build
```

Recarregar extensão → abrir herói → aba Skills.
