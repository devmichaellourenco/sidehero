import { Gear } from './Gear';

export interface ChestProps {
  id: string;
  stageEarned: number;
  opened: boolean;
  loot: Gear | null;
}

export class Chest {
  readonly id: string;
  readonly stageEarned: number;
  readonly opened: boolean;
  readonly loot: Gear | null;

  private constructor(props: ChestProps) {
    this.id = props.id;
    this.stageEarned = props.stageEarned;
    this.opened = props.opened;
    this.loot = props.loot;
  }

  static create(stageEarned: number): Chest {
    return new Chest({
      id: `chest-${stageEarned}-${Date.now()}`,
      stageEarned,
      opened: false,
      loot: null,
    });
  }

  static restore(props: ChestProps): Chest {
    return new Chest(props);
  }

  open(loot: Gear): Chest {
    return new Chest({
      id: this.id,
      stageEarned: this.stageEarned,
      opened: true,
      loot,
    });
  }

  toProps(): ChestProps {
    return {
      id: this.id,
      stageEarned: this.stageEarned,
      opened: this.opened,
      loot: this.loot,
    };
  }
}
