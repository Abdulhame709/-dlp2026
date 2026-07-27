interface PendingOperation {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'COMPLETE';
  entityType: 'TASK' | 'PROJECT' | 'GOAL';
  payload: any;
  timestamp: number;
}

export class SyncManager {
  private static queueKey = 'cortex_pending_sync_queue';

  /**
   * Add a mutation to the local offline synchronization queue
   */
  static queueOperation(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'COMPLETE', entityType: 'TASK' | 'PROJECT' | 'GOAL', payload: any): void {
    if (typeof window === 'undefined') return;

    const queue = this.getQueue();
    const newOp: PendingOperation = {
      id: `sync-op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      entityType,
      payload,
      timestamp: Date.now(),
    };

    queue.push(newOp);
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
    console.log(`🔌 Sync Manager [Offline Queued]: ${action} on ${entityType}`, payload);
  }

  /**
   * Fetch current queued pending sync operations
   */
  static getQueue(): PendingOperation[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.queueKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Clear the local synchronization queue
   */
  static clearQueue(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.queueKey);
  }

  /**
   * Check if browser is currently online
   */
  static isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return window.navigator.onLine;
  }

  /**
   * Run background synchronization of all queued tasks when online
   */
  static async syncPendingOperations(executeSyncHook: (op: PendingOperation) => Promise<boolean>): Promise<boolean> {
    if (!this.isOnline()) {
      console.log('🔌 Sync Manager: Browser is offline. Skipping sync routine.');
      return false;
    }

    const queue = this.getQueue();
    if (queue.length === 0) {
      return true;
    }

    console.log(`🔌 Sync Manager: Synchronizing ${queue.length} pending operations in background...`);
    const remainingOps: PendingOperation[] = [];

    for (const op of queue) {
      try {
        const success = await executeSyncHook(op);
        if (!success) {
          remainingOps.push(op);
        }
      } catch (err: any) {
        console.error(`🔌 Sync Manager Error: Operation ${op.id} failed:`, err.message);
        remainingOps.push(op);
      }
    }

    localStorage.setItem(this.queueKey, JSON.stringify(remainingOps));
    
    if (remainingOps.length === 0) {
      console.log('🔌 Sync Manager: All offline mutations synchronized successfully!');
      return true;
    }

    return false;
  }
}
export type { PendingOperation };
