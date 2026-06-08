export interface AscensionRequirementDto {
  label: string;
  met: boolean;
}

export interface AscensionOptionDto {
  id: string;
  name: string;
  description: string;
  requirements: AscensionRequirementDto[];
  canAscend: boolean;
  pointsGranted: number;
}
