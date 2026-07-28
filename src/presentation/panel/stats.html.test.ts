import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('stats.html', () => {
  it('expõe shell da janela popup de estatísticas', () => {
    const html = readFileSync(
      join(process.cwd(), 'src/presentation/panel/stats.html'),
      'utf8',
    );

    expect(html).toContain('class="stats-window"');
    expect(html).toContain('id="battle-stats-body"');
    expect(html).toContain('sheet-title-row');
    expect(html).toContain('id="stats-window-pin"');
    expect(html).toContain('title="Fixar"');
    expect(html).toContain('assets/ui/pin.png');
    expect(html).toContain('stats-pin-btn__icon');
    expect(html).toContain('id="stats-window-close"');
    expect(html.indexOf('stats-window-title')).toBeLessThan(html.indexOf('stats-window-pin'));
    expect(html).toContain('Estatísticas');
    expect(html).toContain('stats.js');
    expect(html).toContain('panel.css');
  });
});
