import { describe, expect, it, beforeEach } from 'vitest';
import {
  getStoredCampaignViewMode,
  isMapNewToPlayer,
  isMapSeen,
  markMapSeen,
  setStoredCampaignViewMode,
} from './CampaignViewStorage';

describe('CampaignViewStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('persiste e recupera o modo de visualização', () => {
    expect(getStoredCampaignViewMode()).toBeNull();
    setStoredCampaignViewMode('world');
    expect(getStoredCampaignViewMode()).toBe('world');
    setStoredCampaignViewMode('region');
    expect(getStoredCampaignViewMode()).toBe('region');
  });

  it('rastreia mapas vistos para banner de desbloqueio', () => {
    expect(isMapSeen('gondonor')).toBe(false);
    expect(isMapNewToPlayer('gondonor', true)).toBe(true);

    markMapSeen('gondonor');

    expect(isMapSeen('gondonor')).toBe(true);
    expect(isMapNewToPlayer('gondonor', true)).toBe(false);
    expect(isMapNewToPlayer('gondonor', false)).toBe(false);
  });
});
