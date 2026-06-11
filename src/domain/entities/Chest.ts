import { Gear } from './Gear';
import { ChestType } from '../combat/ChestType';

export interface ChestProps {
  id: string;
  stageEarned: number;
  chestType: ChestType;
  opened: boolean;
  loot: Gear | null;
}

export class Chest {
  readonly id: string;
  readonly stageEarned: number;
  readonly chestType: ChestType;
  readonly opened: boolean;
  readonly loot: Gear | null;

  private constructor(props: ChestProps) {
    this.id = props.id;
    this.stageEarned = props.stageEarned;
    this.chestType = props.chestType;
    this.opened = props.opened;
    this.loot = props.loot;
  }

  static create(stageEarned: number, chestType: ChestType = 'monster'): Chest {
    return new Chest({
      id: `chest-${chestType}-${stageEarned}-${Date.now()}`,
      stageEarned,
      chestType,
      opened: false,
      loot: null,
    });
  }

  static restore(props: ChestProps): Chest {
    return new Chest({
      ...props,
      chestType: props.chestType ?? 'monster',
    });
  }

  open(loot: Gear): Chest {
    return new Chest({
      id: this.id,
      stageEarned: this.stageEarned,
      chestType: this.chestType,
      opened: true,
      loot,
    });
  }

  toProps(): ChestProps {
    return {
      id: this.id,
      stageEarned: this.stageEarned,
      chestType: this.chestType,
      opened: this.opened,
      loot: this.loot,
    };
  }
}
