export interface AchievementUpdateDto {
  id: string;
  title: string;
  description: string;
  previousProgress: number;
  currentProgress: number;
  target: number;
  completed: boolean;
  justCompleted: boolean;
}
