import { IGoalRepository, GoalEntity } from './goal-repository-interface';

export class MockGoalRepository implements IGoalRepository {
  private static goals: GoalEntity[] = [
    {
      id: '55555555-5555-5555-5555-555555555554',
      userId: '11111111-1111-1111-1111-111111111111',
      organizationId: '22222222-2222-2222-2222-222222222222',
      title: 'Launch Cortex MVP',
      description: 'Acquire first 100 organic beta subscribers through product intelligence.',
      progress: 45,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  async getGoals(userId: string): Promise<GoalEntity[]> {
    return MockGoalRepository.goals.filter(g => g.userId === userId && !g.deletedAt);
  }

  async getGoalById(id: string): Promise<GoalEntity | null> {
    const goal = MockGoalRepository.goals.find(g => g.id === id && !g.deletedAt);
    return goal || null;
  }

  async createGoal(userId: string, goalData: Partial<GoalEntity>): Promise<GoalEntity> {
    const newGoal: GoalEntity = {
      id: `goal-mock-${Date.now()}`,
      userId: userId,
      organizationId: goalData.organizationId || null,
      title: goalData.title || 'Untitled Goal',
      description: goalData.description || '',
      progress: goalData.progress || 0,
      status: goalData.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MockGoalRepository.goals.push(newGoal);
    return newGoal;
  }

  async updateGoal(id: string, goalData: Partial<GoalEntity>): Promise<GoalEntity | null> {
    const idx = MockGoalRepository.goals.findIndex(g => g.id === id);
    if (idx === -1) return null;

    const updated = {
      ...MockGoalRepository.goals[idx],
      ...goalData,
      updatedAt: new Date(),
    };
    MockGoalRepository.goals[idx] = updated;
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    const idx = MockGoalRepository.goals.findIndex(g => g.id === id);
    if (idx === -1) return false;
    
    // Soft delete
    MockGoalRepository.goals[idx].deletedAt = new Date();
    return true;
  }
}
