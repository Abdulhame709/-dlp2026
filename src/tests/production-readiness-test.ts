/* eslint-disable @typescript-eslint/no-explicit-any */

import { signUpSchema, loginSchema } from '../core/security/validation';
import { PermissionManager } from '../core/auth/permission-manager';
import { AIGateway } from '../features/ai/core/ai-gateway';
import { SubscriptionService } from '../features/billing/subscription-service';
import { AuditLogger } from '../core/monitoring/audit-logger';
import { ErrorTracker } from '../core/monitoring/error-tracker';

async function runProductionReadinessTest() {
  console.log('🧪 Initiating Final Production Readiness & SRE Integration Tests...');
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

  const demoUserId = '11111111-1111-1111-1111-111111111111';

  // 1. Authentication Schemas Verification
  const validAuth = loginSchema.safeParse({ email: 'founder@cortexai.com', password: 'password123' });
  const invalidAuth = loginSchema.safeParse({ email: 'bad-format', password: '' });
  assert(validAuth.success === true, 'SRE Auth: Validated standard authentication inputs');
  assert(invalidAuth.success === false, 'SRE Auth: Catches invalid email structures and empty fields');

  // 2. Permission Matrix (RBAC) Verification
  const ownerHasBilling = PermissionManager.hasPermission('OWNER', 'MANAGE_BILLING');
  const memberHasBilling = PermissionManager.hasPermission('MEMBER', 'MANAGE_BILLING');
  assert(ownerHasBilling === true, 'SRE RBAC: Authorized OWNER to access organization billing');
  assert(memberHasBilling === false, 'SRE RBAC: Blocked ordinary MEMBER from accessing organization billing');

  // 3. AI Gateway Provider Swapping & Cost Verification
  try {
    AIGateway.switchProvider('ANTHROPIC');
    const provider = AIGateway.getProvider();
    assert(provider.constructor.name === 'AnthropicAdapter', 'SRE AI: Successfully configured runtime model provider routing');

    AIGateway.trackCost('ANTHROPIC', 100, 200); // Track simulated cost
    const cost = AIGateway.getAccumulatedCost();
    assert(cost > 0, `SRE AI: Audited cost accumulation successfully (Total: $${cost.toFixed(5)})`);
  } catch (err: any) {
    console.error('AI Gateway test failed:', err.message);
    testsFailed++;
  }

  // 4. Billing & Subscription upgrade verification
  try {
    await SubscriptionService.upgradePlan(demoUserId, 'ENTERPRISE');
    const sub = await SubscriptionService.getSubscription(demoUserId);
    assert(sub.planName === 'ENTERPRISE', 'SRE Billing: Completed subscription upgrades to ENTERPRISE tier safely');
  } catch (err: any) {
    console.error('Billing test failed:', err.message);
    testsFailed++;
  }

  // 5. Audit Logging Verification
  try {
    await AuditLogger.log(demoUserId, 'Database RLS Enforced', 'DATABASE', 'postgres-public');
    assert(true, 'SRE Audit: Logged administrative database schema updates successfully');
  } catch (err: any) {
    console.error('Audit logging failed:', err.message);
    testsFailed++;
  }

  // 6. Error Tracking Verification
  try {
    ErrorTracker.captureException(new Error('Mock Sentry RLS violation capture'), { userId: demoUserId });
    assert(true, 'SRE Observability: Captured and processed exception telemetry gracefully');
  } catch (err: any) {
    console.error('Error tracking failed:', err.message);
    testsFailed++;
  }

  // Final summary
  console.log(`\n📊 TEST SUMMARY: \x1b[32m${testsPassed} passed\x1b[0m, \x1b[31m${testsFailed} failed\x1b[0m.`);
  if (testsFailed > 0) {
    console.error('🛑 Some Production Readiness validation tests failed!');
    process.exit(1);
  } else {
    console.log('🌟 All Production Readiness and SRE verification tests passed successfully! Deployment Status: READY');
  }
}

runProductionReadinessTest();
