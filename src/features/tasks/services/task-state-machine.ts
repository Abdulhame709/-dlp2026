import { TaskStatus } from '@/core/types/task-types';

export class TaskStateMachine {
  // Enforces deterministic state transition boundaries
  private static readonly allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    INBOX: ['PLANNED', 'ARCHIVED', 'COMPLETED'],
    PLANNED: ['IN_PROGRESS', 'WAITING', 'ARCHIVED', 'COMPLETED'],
    IN_PROGRESS: ['COMPLETED', 'WAITING', 'PLANNED', 'ARCHIVED'],
    WAITING: ['IN_PROGRESS', 'PLANNED', 'ARCHIVED', 'COMPLETED'],
    COMPLETED: ['PLANNED', 'ARCHIVED'],
    ARCHIVED: ['INBOX', 'PLANNED'],
  };

  /**
   * Evaluates if a target status transition is permitted from current status.
   */
  static isValidTransition(current: TaskStatus, target: TaskStatus): boolean {
    if (current === target) return true;
    const allowed = this.allowedTransitions[current];
    return allowed ? allowed.includes(target) : false;
  }

  /**
   * Executes a safe transition, throwing a descriptive exception on illegal actions.
   */
  static transition(current: TaskStatus, target: TaskStatus): TaskStatus {
    if (!this.isValidTransition(current, target)) {
      throw new Error(`ILLEGAL_STATUS_TRANSITION: Cannot transition task status from [${current}] to [${target}]`);
    }
    return target;
  }
}
