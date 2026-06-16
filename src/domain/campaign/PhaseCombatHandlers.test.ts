import { describe, expect, it } from 'vitest';
import { resolvePhase } from './CampaignCatalog';
import { buildPhaseId } from './CampaignIds';
import { PhaseCombatHandlers } from './PhaseCombatHandlers';
import { PhaseRun } from './PhaseRun';
import { EncounterResolver } from './EncounterResolver';
import { GameState } from '../entities/GameState';
import { Hero } from '../entities/Hero';
import { HeroUnlockService } from '../party/HeroUnlockService';

describe('PhaseCombatHandlers', () => {
  const handlers = new PhaseCombatHandlers();
  const resolver = new EncounterResolver();

  it('reinicia fase do início ao retomar pausa manual', () => {
    const phaseId = buildPhaseId(1, 1);
    const phaseRun = PhaseRun.start(phaseId).advanceWave();
    let state = GameState.initial().withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    const restarted = handlers.restartPhaseFromPause(state, phaseRun);

    expect(restarted.state.phaseRun?.waveIndex).toBe(0);
    expect(restarted.state.combat).not.toBeNull();
    expect(restarted.events.some((event) => event.includes('reiniciada'))).toBe(true);
  });

  it('avança para wave 2 após limpar lixo sem conceder XP', () => {
    const phaseId = buildPhaseId(1, 2);
    const phaseRun = PhaseRun.start(phaseId);
    const wave1 = resolver.resolve(phaseId, 0);
    expect(wave1).not.toBeNull();

    let state = GameState.initial()
      .withPhaseRun(phaseRun)
      .withCombat(null);

    const started = handlers.startPhaseRun(state, phaseRun);
    state = started.state;

    const defeated = wave1!.enemies;
    const cleared = handlers.onWaveCleared(
      state,
      defeated,
      state.heroes,
      wave1!.meta,
      phaseRun,
    );

    expect(cleared.state.phaseRun?.waveIndex).toBe(1);
    expect(cleared.state.combat?.encounterMeta?.isBossWave).toBe(true);
    expect(cleared.events.some((event) => event.includes('ouro'))).toBe(true);
    expect(cleared.state.heroes.every((hero) => hero.level === 1)).toBe(true);
  });

  it('restaura vida da party ao derrotar boss e avançar de fase', () => {
    const phaseId = buildPhaseId(1, 2);
    const phaseRun = PhaseRun.start(phaseId);
    let state = GameState.initial()
      .withCampaignProgress(
        GameState.initial().campaignProgress.withSelectedPhase(phaseId),
      )
      .withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    state = state.withHeroes(
      state.heroes.map((hero, index) =>
        Hero.restore({ ...hero.toProps(), currentHealth: index === 0 ? 1 : hero.maxHealth }),
      ),
    );

    const boss = resolver.resolve(phaseId, 1);
    expect(boss).not.toBeNull();

    const victory = handlers.onBossDefeated(
      state,
      boss!.enemies,
      state.heroes,
      boss!.meta,
    );

    expect(victory.state.heroes.every((hero) => hero.currentHealth === hero.maxHealth)).toBe(
      true,
    );
    expect(victory.state.battleLog.some((entry) => entry.message.includes('Party recuperada'))).toBe(
      true,
    );
  });

  it('avança selectedPhaseId para próxima fase ao derrotar boss', () => {
    const phaseId = buildPhaseId(1, 2);
    const phaseRun = PhaseRun.start(phaseId);
    let state = GameState.initial()
      .withCampaignProgress(
        GameState.initial().campaignProgress.withSelectedPhase(phaseId),
      )
      .withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    const boss = resolver.resolve(phaseId, 1);
    expect(boss).not.toBeNull();

    const victory = handlers.onBossDefeated(
      state,
      boss!.enemies,
      state.heroes,
      boss!.meta,
    );

    expect(victory.state.campaignProgress.isCleared(phaseId)).toBe(true);
    expect(victory.state.campaignProgress.isUnlocked(buildPhaseId(1, 3))).toBe(true);
    expect(victory.state.campaignProgress.selectedPhaseId).toBe(buildPhaseId(1, 3));
    expect(victory.state.phaseRun).toBeNull();
    expect(victory.state.combat).toBeNull();
    expect(victory.state.loadoutEditOpen).toBe(false);
  });

  it('marca temporada concluída ao derrotar boss final', () => {
    const phaseId = '10-50';
    const phaseRun = PhaseRun.start(phaseId);
    let state = GameState.initial().withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    const finale = resolvePhase(phaseId)!;
    const resolved = resolver.resolve(phaseId, finale.waves.length - 1);
    expect(resolved).not.toBeNull();

    const victory = handlers.onBossDefeated(
      state,
      resolved!.enemies,
      state.heroes,
      resolved!.meta,
    );

    expect(victory.state.campaignProgress.seasonCompleted).toBe(true);
    expect(victory.events.some((event) => event.includes('Temporada concluída'))).toBe(true);
  });

  it('reinicia fase com cura completa no wipe', () => {
    const phaseId = buildPhaseId(1, 1);
    const phaseRun = PhaseRun.start(phaseId);
    let state = GameState.initial().withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    const woundedHero = state.heroes[0];
    state = state.withHeroes([
      Hero.restore({ ...woundedHero.toProps(), currentHealth: 1 }),
    ]);

    const wiped = handlers.onPhaseWipe(state, phaseRun);

    expect(wiped.state.phaseRun?.waveIndex).toBe(0);
    expect(wiped.state.heroes[0].currentHealth).toBe(wiped.state.heroes[0].maxHealth);
    expect(wiped.state.combat?.enemies.length).toBeGreaterThan(0);
  });

  it('concede 50% do ouro ao repetir wave de fase já cleared', () => {
    const phaseId = buildPhaseId(1, 2);
    const phaseRun = PhaseRun.start(phaseId);
    const wave1 = resolver.resolve(phaseId, 0);
    expect(wave1).not.toBeNull();

    const clearedProgress = GameState.initial()
      .campaignProgress.markCleared(phaseId, [buildPhaseId(1, 3)], 2)
      .withSelectedPhase(buildPhaseId(1, 5));

    const baseGold = wave1!.enemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
    const expectedGold = Math.floor(baseGold * 0.5);

    let state = GameState.initial()
      .withGold(GameState.initial().gold.add(500))
      .withCampaignProgress(clearedProgress)
      .withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    const replayWave = handlers.onWaveCleared(
      state,
      wave1!.enemies,
      state.heroes,
      wave1!.meta,
      phaseRun,
    );

    expect(replayWave.state.gold.amount).toBe(500 + expectedGold);
    expect(replayWave.events.some((event) => event.includes('50%'))).toBe(true);
    expect(replayWave.state.chests).toHaveLength(0);
  });

  it('concede 50% ouro e 75% XP ao repetir boss sem baú nem avanço de fase', () => {
    const phaseId = buildPhaseId(1, 2);
    const phaseRun = PhaseRun.start(phaseId);
    const boss = resolver.resolve(phaseId, 1);
    expect(boss).not.toBeNull();

    const clearedProgress = GameState.initial()
      .campaignProgress.markCleared(phaseId, [buildPhaseId(1, 3)], 2)
      .withSelectedPhase(buildPhaseId(1, 5));

    const baseGold = boss!.enemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
    const baseXp = boss!.enemies.reduce((sum, enemy) => sum + enemy.xpReward, 0);
    const expectedGold = Math.floor(baseGold * 0.5);
    const expectedXp = Math.floor(baseXp * 0.75);

    let state = GameState.initial()
      .withGold(GameState.initial().gold.add(1000))
      .withCampaignProgress(clearedProgress)
      .withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    const victory = handlers.onBossDefeated(state, boss!.enemies, state.activeHeroes(), boss!.meta);

    expect(victory.state.gold.amount).toBe(1000 + expectedGold);
    expect(victory.state.chests).toHaveLength(0);
    expect(victory.state.campaignProgress.selectedPhaseId).toBe(buildPhaseId(1, 5));
    expect(victory.state.activeHeroes()[0].experience.current).toBe(expectedXp);
    expect(victory.state.battleLog.some((entry) => entry.message.includes('75% XP'))).toBe(true);
  });

  it('concede XP parcial à reserva ao derrotar boss', () => {
    let state = GameState.initial().withActivePartyIds(['hero-1', 'hero-2']);
    state = HeroUnlockService.applyUnlock(state, 'berserker');

    const phaseId = buildPhaseId(1, 2);
    const phaseRun = PhaseRun.start(phaseId);
    state = state
      .withCampaignProgress(GameState.initial().campaignProgress.withSelectedPhase(phaseId))
      .withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    const boss = resolver.resolve(phaseId, 1);
    expect(boss).not.toBeNull();

    const totalXp = boss!.enemies.reduce((sum, enemy) => sum + enemy.xpReward, 0);
    const victory = handlers.onBossDefeated(state, boss!.enemies, state.activeHeroes(), boss!.meta);

    const benchHero = victory.state.roster.find((hero) => hero.id === 'hero-berserker');
    const activeHero = victory.state.roster.find((hero) => hero.id === 'hero-1');
    expect(benchHero).toBeDefined();
    expect(activeHero).toBeDefined();
    expect(benchHero!.experience.current).toBe(Math.floor(totalXp * 0.5));
    expect(activeHero!.experience.current).toBe(totalXp);
  });
});
