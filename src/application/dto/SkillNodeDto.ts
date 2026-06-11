import { HeroActiveSkillStatDto } from './GameStateDto';

export type SkillBranchDto = 'offense' | 'defense' | 'utility';
export type SkillScopeDto = 'universal' | 'class';
export type SkillNodeStatusDto = 'locked' | 'ready' | 'owned' | 'maxed';

export interface SkillRequirementDto {
  label: string;
  met: boolean;
}

export interface SkillNodeDto {
  id: string;
  name: string;
  description: string;
  branch: SkillBranchDto;
  branchLabel: string;
  scope: SkillScopeDto;
  scopeLabel: string;
  maxRank: number;
  currentRank: number;
  status: SkillNodeStatusDto;
  isEquipped: boolean;
  canAllocateRank: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  activationCost: number;
  scaling: string;
  scalingLabel: string;
  battleStats: HeroActiveSkillStatDto[];
  requirements: SkillRequirementDto[];
}

export const SKILL_BRANCH_LABELS: Record<SkillBranchDto, string> = {
  offense: 'Ofensivo',
  defense: 'Defensivo',
  utility: 'Utilidade',
};
