import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('stats.html', () => {
  it('redireciona para panel.html?detached=stats', () => {
    const html = readFileSync(
      join(process.cwd(), 'src/presentation/panel/stats.html'),
      'utf8',
    );
    expect(html).toContain('panel.html?detached=stats');
    expect(html).toContain('location.replace');
  });
});
