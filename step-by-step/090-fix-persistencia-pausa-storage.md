# 090 — Fix persistência da pausa no Chrome Storage

## Problema

Após clicar em **Pausar para ajustes**:
- Banner "Pausa para ajustes" aparecia e sumia
- Party/loadout não editáveis (`canEditParty: false`)
- Jogo parecia travado (combate zerado na UI, ticks bloqueados no cliente)

## Causa raiz

`ChromeStorageGameRepository.serialize()` **não gravava** `loadoutEditOpen` nem `phaseRestartOnResume`.

Fluxo quebrado:
1. `PAUSE_FOR_LOADOUT` salvava pausa em memória e retornava DTO correto → UI mostrava banner
2. Próximo `load()` (tick em fila, `GET_STATE`, refresh) lia storage **sem** as flags
3. Servidor interpretava como fase ativa sem pausa → podia reiniciar combate
4. Cliente recebia estado sem `loadoutEditOpen` → escondia banner e bloqueava edição

## Correção

| Arquivo | Alteração |
|---------|-----------|
| `ChromeStorageGameRepository.ts` | Serializar `loadoutEditOpen` e `phaseRestartOnResume` |
| `PartyEditPolicy.ts` | `loadoutEditOpen` tem prioridade explícita na regra de edição |
| `GameViewController.ts` | `refresh()` continua ativo durante pausa |
| `ChromeStorageGameRepository.test.ts` | Teste de roundtrip das flags |

## Status

Corrigido.
