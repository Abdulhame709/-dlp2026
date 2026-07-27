/* eslint-disable @typescript-eslint/no-explicit-any */

import { TaskStateMachine } from '../features/tasks/services/task-state-machine';
import { TaskService } from '../features/tasks/services/task-service';
import { signUpSchema } from '../core/security/validation';

async function runDomainTests() {
  console.log('🧪 Initiating Core Domain Validation & State Machine Tests...');
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

  // --- UNIT TESTS ---

  // 1. Task State Machine Tests
  const isInboxToPlannedLegal = TaskStateMachine.isValidTransition('INBOX', 'PLANNED');
  const isCompletedToInProgressLegal = TaskStateMachine.isValidTransition('COMPLETED', 'IN_PROGRESS');

  assert(isInboxToPlannedLegal === true, 'State Machine: Inbox to Planned is a valid transition');
  assert(isCompletedToInProgressLegal === false, 'State Machine: Completed directly to In Progress is BLOCKED (requires Re-Opening / Planned first)');

  try {
    TaskStateMachine.transition('COMPLETED', 'IN_PROGRESS');
    assert(false, 'State Machine: Should have thrown an error for illegal transition');
  } catch (err: any) {
    assert(err.message.includes('ILLEGAL_STATUS_TRANSITION'), 'State Machine: Successfully throws standard illegal transition exception');
  }

  // 2. Validation Schema Checks
  const badEmailValidation = signUpSchema.safeParse({ email: 'not-valid', password: 'ValidPass123!', fullName: 'Abdul' });
  assert(badEmailValidation.success === false, 'Validation: Correctly rejects invalid email schemas');


  // --- INTEGRATION TESTS ---
  const demoUserId = '11111111-1111-1111-1111-111111111111';

  // 3. Task Creation Integration
  const task = await TaskService.createTask(demoUserId, {
    title: 'Write Integration Tests',
    priority: 'HIGH',
    status: 'INBOX',
  });
  assert(task.id.startsWith('task-uuid-'), 'Integration: Successfully creates a new Task record with unique UUID');

  // 4. Task Update Integration
  const updatedTask = await TaskService.updateTask(task.id, {
    status: 'PLANNED',
    description: 'Verifying State Machine boundaries.',
  });
  assert(updatedTask?.status === 'PLANNED' && updatedTask.description === 'Verifying State Machine boundaries.', 'Integration: Updates task fields and rotates status safely');

  // 5. Task Completion Integration
  const completedTask = await TaskService.completeTask(task.id);
  assert(completedTask?.status === 'COMPLETED' && completedTask.completedAt !== null, 'Integration: Marks task completed with actual timestamps');

  // 6. Task Delete Integration
  const deleteSuccess = await TaskService.deleteTask(task.id);
  const fetchedTasks = await TaskService.getUserTasks(demoUserId, { status: 'COMPLETED' });
  const deletedStillExists = fetchedTasks.find(t => t.id === task.id);

  assert(deleteSuccess === true, 'Integration: Soft-deletes task successfully');
  assert(!deletedStillExists, 'Integration: Excludes deleted tasks from active queries automatically');


  // Summary
  console.log(`\n📊 TEST SUMMARY: \x1b[32m${testsPassed} passed\x1b[0m, \x1b[31m${testsFailed} failed\x1b[0m.`);
  if (testsFailed > 0) {
    console.error('🛑 Some core domain tests failed!');
    process.exit(1);
  } else {
    console.log('🌟 All Core Domain and State Machine validation tests passed successfully!');
  }
}

runDomainTests();
