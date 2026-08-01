export interface GoalEntity {
  id: string;
  userId: string;
  organizationId?: string | null;
  title: string;
  description?: string | null;
  deadline?: Date | null;
  status: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IGoalRepository {
  getGoals(userId: string): Promise<GoalEntity[]>;
  getGoalById(id: string): Promise<GoalEntity | null>;
  createGoal(userId: string, goalData: Partial<GoalEntity>): Promise<GoalEntity>;
  updateGoal(id: string, goalData: Partial<GoalEntity>): Promise<GoalEntity | null>;
  deleteGoal(id: string): Promise<boolean>;
}
