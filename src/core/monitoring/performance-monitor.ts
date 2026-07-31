export class PerformanceMonitor {
  /**
   * Tracks and records latency durations for transactions
   */
  static trackDuration(
    operationName: string,
    durationMs: number,
    meta: Record<string, any> = {}
  ): void {
    const payload = {
      timestamp: new Date().toISOString(),
      operationName,
      durationMs,
      ...meta,
    };

    console.log(`⏱️ [Performance Metric]: ${operationName} took ${durationMs}ms`, JSON.stringify(payload));
  }
}
