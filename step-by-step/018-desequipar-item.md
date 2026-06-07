# 018 — Desequipar item

## Objetivo
Permitir remover equipamento do herói e devolver o item ao inventário.

## Domínio
- **`Hero.unequip(slot)`**: remove gear do slot, ajusta HP ao novo máximo e retorna `{ hero, removed }`.

## Aplicação
- **`UnequipGearUseCase`**: move item equipado de volta para `inventory` e registra no log.

## Infraestrutura
- Mensagem **`UNEQUIP_GEAR`** em `GameMessageBus` e `service-worker.ts`.

## UI
- Modal de equipar por slot exibe seção **Equipado agora** com botão **Desequipar**.
- Seção **Trocar por** lista itens compatíveis do inventário (se houver).

## Fluxo
1. Clique no slot equipado → modal de equipar.
2. **Desequipar** → item volta ao inventário, log atualiza.
3. Se veio da ficha do herói, volta para ela; se veio do inventário, volta ao inventário; se veio do painel principal, fecha o modal.

## Navegação pós-ação (`afterGearMutation`)
- Remove só o `equip-picker` da pilha e mantém o modal pai (`hero-detail` ou `inventory`).
