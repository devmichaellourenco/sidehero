# 049 — Correção: alocar atributos no modal do herói

## Status: concluída

## Sintoma

Ao clicar em **+1 STR/DEX/INT** na aba Atributos, a ação parecia não funcionar.

## Causa

`spendAttributePoint()` chamava apenas `render()` após sucesso, **sem** `refreshModalIfOpen()`. O painel lateral atualizava, mas o **modal aberto** continuava com valores antigos (pontos e atributos), dando impressão de falha.

O mesmo padrão afetava alocação de skills, ativar/desativar skills e ascensão.

## Correção

| Arquivo | Alteração |
|---------|-----------|
| `GameViewController.ts` | `afterHeroProgressionMutation()` → `render()` + `refreshModalIfOpen()` |
| `SpendImprovementPointUseCase.test.ts` | Smoke do fluxo de alocar STR |

## Como validar

1. Subir de nível um herói (ganhar ponto de aprimoramento)
2. Abrir ficha → aba **Atributos**
3. Clicar **+1 STR** → contador e total atualizam no modal + toast
