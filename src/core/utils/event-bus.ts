export type EventHandler<T = any> = (data: T) => void | Promise<void>;

export class EventBus {
  private static listeners = new Map<string, EventHandler[]>();

  /**
   * Subscribe a handler to a specific domain event name
   */
  static subscribe<T = any>(eventName: string, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(eventName) || [];
    handlers.push(handler);
    this.listeners.set(eventName, handlers);
  }

  /**
   * Publish data payload to all registered listeners of that event
   */
  static async publish<T = any>(eventName: string, data: T): Promise<void> {
    const handlers = this.listeners.get(eventName) || [];
    for (const handler of handlers) {
      try {
        await handler(data);
      } catch (err: any) {
        console.warn(`[EventBus Error] Failed to execute listener for event ${eventName}:`, err.message);
      }
    }
  }

  /**
   * Unsubscribe a handler from a specific event
   */
  static unsubscribe<T = any>(eventName: string, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(eventName) || [];
    this.listeners.set(
      eventName,
      handlers.filter((h) => h !== handler)
    );
  }
}
