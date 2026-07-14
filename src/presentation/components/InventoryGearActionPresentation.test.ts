import { describe, expect, it } from 'vitest';
import { renderInventoryGearAction } from './InventoryGearActionPresentation';

describe('InventoryGearActionPresentation', () => {
  it('renderiza ícone de equipar com tooltip textual', () => {
    const html = renderInventoryGearAction(
      'equip',
      'Equipar',
      'data-inventory-equip="g1" data-inventory-equip-hero="h1"',
    );

    expect(html).toContain('inventory-gear-action--equip');
    expect(html).toContain('title="Equipar"');
    expect(html).toContain('aria-label="Equipar"');
    expect(html).toContain('data-inventory-equip="g1"');
    expect(html).toContain('<svg');
    expect(html).not.toMatch(/>\s*Equipar\s*</);
  });

  it('renderiza ícones de baú e destruição', () => {
    const stash = renderInventoryGearAction('stash', 'Guardar no baú', 'data-move-to-stash="g1"');
    const destroy = renderInventoryGearAction(
      'destroy',
      'Destruir',
      'data-destroy-gear="g1" data-gear-location="inventory"',
    );

    expect(stash).toContain('inventory-gear-action--stash');
    expect(stash).toContain('title="Guardar no baú"');
    expect(destroy).toContain('inventory-gear-action--destroy');
    expect(destroy).toContain('gear-destroy-btn');
    expect(destroy).toContain('title="Destruir"');
  });
});
