# 060 — Fix: vida ao trocar equipamento

## Problema

`Hero.equip()` definia `currentHealth = maxHealth` após equipar, curando o herói sempre. Isso permitia exploit de imortalidade ao trocar itens com bônus de vida.

## Comportamento esperado

| Situação | Antes | Depois (correto) |
|----------|-------|------------------|
| Equipar +20 HP com 90/100 | 120/120 | 90/120 |
| Remover anel de 100/100 | 80/80 | 80/80 (já ok) |
| Re-equipar anel após 80/80 | 100/100 | 80/100 |

## Correção

`src/domain/entities/Hero.ts` — `equip()` passa a usar a mesma regra de `unequip()`:

```typescript
currentHealth: Math.min(this.currentHealth, updated.maxHealth)
```

A vida atual **permanece** quando o máximo sobe; só é **limitada** quando o máximo cai.

## Testes

`src/domain/entities/Hero.equipmentHealth.test.ts` — 3 cenários do usuário.
