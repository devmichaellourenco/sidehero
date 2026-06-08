import { GearDto } from './GameStateDto';

export interface ShopOfferDto {
  id: string;
  price: number;
  gear: GearDto;
  canAfford: boolean;
}
