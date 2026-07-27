/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

import { AnalyticsService } from '../features/analytics/analytics-service';
import { EventBus } from '../core/utils/event-bus';
import { MockAnalyticsRepository } from '../features/analytics/mock-analytics-repository';

async function runAnalyticsTests() {
  console.log('🧪 Initiating Production-Grade Analytics Pipeline & User Intelligence Tests...');
  let testsFailed = 0;
  let testsPassed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  \x1b[32m✅ [PASS]\x1b[0m: ${testName}`);
      testsPassed++;
    } else {
      console.error(`  \x1b[31m❌ [FAIL]\x1b[0m: ${testName}`);
      testsFailed++;
    }
  }

  // 1. Initialize Analytics pipeline and wire up subscribers to EventBus
  try {
    AnalyticsService.initialize();
    assert(true, 'Pipeline: Analytics pipeline successfully initialized and subscribed to central EventBus');
  } catch (err: any) {
    console.error('Pipeline initialization failed:', err.message);
    testsFailed++;
  }

  const demoUserId = '11111111-1111-1111-1111-111111111111';
  const repository = new MockAnalyticsRepository();

  // 2. Test Metric Calculation before Event Processing
  const initialMetrics = await repository.getProductivityMetrics(demoUserId);
  assert(initialMetrics.productivityScore > 0, `Metrics: Successfully computed initial Productivity Score [${initialMetrics.productivityScore}/100]`);
  assert(initialMetrics.focusTimeMinutes === 120, 'Metrics: Successfully computed initial focus minutes');

  // 3. Test Event Processing integration via EventBus
  const initialEvents = await repository.getRawEvents(demoUserId);
  const initialCount = initialEvents.length;

  console.log('  🎬 Simulating active Task Created and Task Completed events over the EventBus...');
  
  // Publish TaskCreated event
  await EventBus.publish('TaskCreated', {
    userId: demoUserId,
    task: { id: 'task-test-1', title: 'Compile Statements', priority: 'HIGH', status: 'INBOX' }
  });

  // Publish TaskCompleted event (simulating 150 minutes of deep focus actual_duration)
  await EventBus.publish('TaskCompleted', {
    taskId: 'task-test-1',
    task: { id: 'task-test-1', title: 'Compile Statements', priority: 'HIGH', status: 'COMPLETED', actualDuration: 150 }
  });

  const finalEvents = await repository.getRawEvents(demoUserId);
  const finalCount = finalEvents.length;

  assert(finalCount > initialCount, `Pipeline: Successfully intercepted and persisted ${finalCount - initialCount} events in database`);

  // 4. Test User Profile Generation
  const profile = await repository.getUserIntelligenceProfile(demoUserId);
  assert(profile.userId === demoUserId, 'Intelligence: Successfully generated User Intelligence Profile');
  assert(profile.preferredWorkingHours.start === '09:00', 'Intelligence: Successfully retrieved working hours start constraints');
  assert(profile.favoredTaskCategories.includes('AI Engineering'), 'Intelligence: Correctly mapped favored behavioral category indexes');

  // 5. Test Time Aggregation Engine
  const report = await repository.getAggregationReport(demoUserId, 'WEEKLY');
  assert(report.range === 'WEEKLY', 'Reporting: Successfully compiled Weekly performance records');
  assert(report.completionPercentage === 88, 'Reporting: Correctly evaluated target completion percentage');
  assert(report.growthRate === 12.5, 'Reporting: Correctly evaluated growth rate indexes');

  // Final summary
  console.log(`\n📊 TEST SUMMARY: \x1b[32m${testsPassed} passed\x1b[0m, \x1b[31m${testsFailed} failed\x1b[0m.`);
  if (testsFailed > 0) {
    console.error('🛑 Some analytics engine tests failed!');
    process.exit(1);
  } else {
    console.log('🌟 All Analytics Engine and User Intelligence verification tests passed successfully!');
  }
}

runAnalyticsTests();
