export interface PendingOperation {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'COMPLETE';
  entityType: 'TASK' | 'PROJECT' | 'GOAL';
  payload: any;
  timestamp: number;
}

export class SyncManager {
  private static dbName = 'cortex_offline_db';
  private static storeName = 'pending_operations';
  private static dbVersion = 1;

  /**
   * Safe asynchronous IndexedDB opener
   */
  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported on this environment.'));
        return;
      }

      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Queue a database mutation asynchronously in IndexedDB
   */
  static async queueOperation(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'COMPLETE',
    entityType: 'TASK' | 'PROJECT' | 'GOAL',
    payload: any
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const db = await this.openDB();
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const newOp: PendingOperation = {
        id: `sync-op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        entityType,
        payload,
        timestamp: Date.now(),
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.add(newOp);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`🔌 Sync Manager [IndexedDB Queued]: ${action} on ${entityType}`, payload);
    } catch (err: any) {
      console.warn('SyncManager IndexedDB queuing failed:', err.message);
    }
  }

  /**
   * Fetch all queued pending operations from IndexedDB
   */
  static async getQueue(): Promise<PendingOperation[]> {
    if (typeof window === 'undefined') return [];

    try {
      const db = await this.openDB();
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);

      return await new Promise<PendingOperation[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  /**
   * Clear the IndexedDB queue
   */
  static async clearQueue(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const db = await this.openDB();
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err: any) {
      console.warn('SyncManager clear queue failed:', err.message);
    }
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
  static async syncPendingOperations(
    executeSyncHook: (op: PendingOperation) => Promise<boolean>
  ): Promise<boolean> {
    if (!this.isOnline()) {
      console.log('🔌 Sync Manager: Browser is offline. Skipping sync routine.');
      return false;
    }

    const queue = await this.getQueue();
    if (queue.length === 0) {
      return true;
    }

    console.log(`🔌 Sync Manager: Synchronizing ${queue.length} pending operations inside IndexedDB...`);
    
    // Clear queue before syncing, re-adding any failed operations back
    await this.clearQueue();
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

    // Re-save any failed syncs
    if (remainingOps.length > 0) {
      const db = await this.openDB();
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      for (const op of remainingOps) {
        store.add(op);
      }
    }
    
    if (remainingOps.length === 0) {
      console.log('🔌 Sync Manager: All IndexedDB offline mutations synchronized successfully!');
      return true;
    }

    return false;
  }
}
