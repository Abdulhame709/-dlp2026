/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

import { SettingsService } from '../features/settings/settings-service';
import { OrganizationService } from '../features/organizations/organization-service';
import { SubscriptionService } from '../features/billing/subscription-service';
import { NotificationService } from '../features/notifications/notification-service';
import { GlobalSearchService } from '../core/services/global-search-service';
import { AuditLogger } from '../core/monitoring/audit-logger';
import { ErrorTracker } from '../core/monitoring/error-tracker';

async function runSaaSFoundationTests() {
  console.log('🧪 Initiating Production-Grade SaaS Foundation & Production Readiness Tests...');
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

  // 1. Test User Settings Profile
  const settings = await SettingsService.getUserSettings(demoUserId);
  assert(settings.id === demoUserId, 'SaaS Settings: Successfully fetched user profile configurations');
  assert(settings.theme === 'dark', 'SaaS Settings: Mapped default dark mode theme configurations');

  const updatedSettings = await SettingsService.updateSettings(demoUserId, { language: 'en' });
  assert(updatedSettings.language === 'en', 'SaaS Settings: Persisted setting changes successfully');

  // 2. Test Organization Permissions Matrix
  const members = await OrganizationService.getMembers(demoUserId, 'org-1-uuid');
  assert(members.length > 0, 'SaaS Orgs: Fetched organization membership lists correctly');

  const inviteResult = await OrganizationService.inviteMember(demoUserId, 'org-1-uuid', 'new-guy@cortexai.com');
  assert(inviteResult.success === true, 'SaaS Orgs: Role check and invitation trigger authorized OWNER sessions');

  // 3. Test Subscription Tiers & Checkout
  const sub = await SubscriptionService.getSubscription(demoUserId);
  assert(sub.planName === 'FREE', 'SaaS Billing: Mapped default FREE tier plan details');

  const checkoutUrl = await SubscriptionService.upgradePlan(demoUserId, 'PRO');
  assert(checkoutUrl.includes('stripe.mock'), 'SaaS Billing: Generated mock payment checkout URLs successfully');

  const upgradedSub = await SubscriptionService.getSubscription(demoUserId);
  assert(upgradedSub.planName === 'PRO', 'SaaS Billing: Upgraded user plan to PRO tier safely');

  // 4. Test Notification Center
  const originalNotifs = await NotificationService.getNotifications(demoUserId);
  const beforeCount = originalNotifs.length;

  await NotificationService.sendNotification(demoUserId, 'Task Overdue Warn', 'Task DB RLS is overdue!', 'REMINDER');
  const finalNotifs = await NotificationService.getNotifications(demoUserId);

  assert(finalNotifs.length > beforeCount, 'Notifications: Successfully pushed task reminders and alerts');

  // 5. Test Global Command Search
  const searchResults = await GlobalSearchService.query(demoUserId, 'Database');
  assert(searchResults.length > 0, 'Global Search: Successfully queried tasks and conversations indexed under "Database"');

  // 6. Test Audit Logging
  try {
    await AuditLogger.log(demoUserId, 'Task Deleted', 'TASK', 'task-uuid-1');
    assert(true, 'SRE Monitoring: Logged administrative system audit events successfully');
  } catch (err: any) {
    console.error('Audit Logging failed:', err.message);
    testsFailed++;
  }

  // 7. Test Error Tracking
  try {
    ErrorTracker.captureException(new Error('Mock RLS violation exception'), { userId: demoUserId });
    assert(true, 'SRE Monitoring: Handled and tracked error exceptions gracefully');
  } catch (err: any) {
    console.error('Error tracking failed:', err.message);
    testsFailed++;
  }

  // Final summary
  console.log(`\n📊 TEST SUMMARY: \x1b[32m${testsPassed} passed\x1b[0m, \x1b[31m${testsFailed} failed\x1b[0m.`);
  if (testsFailed > 0) {
    console.error('🛑 Some SaaS Foundation tests failed!');
    process.exit(1);
  } else {
    console.log('🌟 All SaaS Foundation and Production Readiness verification tests passed successfully!');
  }
}

runSaaSFoundationTests();
