export class Experience {
  private constructor(
    readonly current: number,
    readonly toNextLevel: number,
    readonly level: number,
  ) {}

  static initial(): Experience {
    return new Experience(0, 100, 1);
  }

  static restore(current: number, toNextLevel: number, level: number): Experience {
    return new Experience(current, toNextLevel, level);
  }

  gain(amount: number): { experience: Experience; leveledUp: boolean } {
    let xp = this.current + amount;
    let level = this.level;
    let threshold = this.toNextLevel;
    let leveledUp = false;

    while (xp >= threshold) {
      xp -= threshold;
      level += 1;
      threshold = Math.floor(threshold * 1.4);
      leveledUp = true;
    }

    return {
      experience: new Experience(xp, threshold, level),
      leveledUp,
    };
  }
}
