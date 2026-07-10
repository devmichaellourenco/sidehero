import { describe, expect, it } from 'vitest';
import { formatChromeStorageError } from './ChromeStorageLocal';

describe('formatChromeStorageError', () => {
  it('traduz erro de espaço em disco', () => {
    expect(formatChromeStorageError('FILE_ERROR_NO_SPACE')).toContain('Sem espaço para salvar');
  });

  it('traduz erro de quota do chrome.storage', () => {
    expect(formatChromeStorageError('QUOTA_BYTES quota exceeded')).toContain('Sem espaço para salvar');
  });

  it('mantém mensagens desconhecidas', () => {
    expect(formatChromeStorageError('Erro genérico')).toBe('Erro genérico');
  });
});
