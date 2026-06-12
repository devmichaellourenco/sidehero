# 105 — Formação: swap entre heróis e remover no topo

## Status: concluída

## Layout da equipe (Formação)

```
    [-]             [-]           [-]
 [char]  [⇄]  [char]  [⇄]  [char]
```

- **−** acima à direita de cada herói (remove para reserva).
- **⇄** entre pares adjacentes — um clique troca a ordem dos dois.

## Implementação

| Arquivo | Mudança |
|---------|---------|
| `HeroesPanelPresentation.ts` | Linha com slots + células de swap; remove no toolbar |
| `GameViewController.ts` | `data-party-swap` → `movePartyMember(i, i+1)` |
| `panel.css` | Estilos `.formation-swap-*`, `.formation-remove-btn` |

## Ajuste — swap centralizado

Botão ⇄ alinhado ao **centro vertical dos sprites** (toolbar de remover com `position: absolute` acima do char).

## Validação

Aba Formação (com pausa) → clicar ⇄ entre heróis troca ordem; − envia à reserva.
