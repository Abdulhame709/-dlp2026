// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Production environmental safety gate
  if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase.co')) {
    console.warn('⚠️ Seed command blocked: Attempting to seed a production database!');
    return;
  }

  console.log('🌱 Starting database seeding...');

  // 1. Seed Demo User Profile
  const demoUserId = '11111111-1111-1111-1111-111111111111';
  const profile = await prisma.profile.upsert({
    where: { id: demoUserId },
    update: {},
    create: {
      id: demoUserId,
      fullName: 'Abdul Demo User',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      timezone: 'Asia/Aden',
      language: 'ar',
      preferences: {
        theme_preference: 'dark',
        ai_behavior_style: 'supportive',
      },
    },
  });
  console.log('✅ Demo Profile seeded:', profile.fullName);

  // 2. Seed Demo Organization
  const demoOrgId = '22222222-2222-2222-2222-222222222222';
  const org = await prisma.organization.upsert({
    where: { id: demoOrgId },
    update: {},
    create: {
      id: demoOrgId,
      name: 'Cortex Founders Inc.',
      ownerId: demoUserId,
      subscriptionPlan: 'PRO',
      createdBy: demoUserId,
    },
  });
  console.log('✅ Demo Organization seeded:', org.name);

  // 3. Seed Organization Membership
  await prisma.organizationMember.upsert({
    where: {
      id: '33333333-3333-3333-3333-333333333333',
    },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333333',
      organizationId: demoOrgId,
      userId: demoUserId,
      role: 'OWNER',
      createdBy: demoUserId,
    },
  });
  console.log('✅ Demo Org Membership seeded.');

  // 4. Seed Demo Project
  const demoProjectId = '44444444-4444-4444-4444-444444444444';
  const project = await prisma.project.upsert({
    where: { id: demoProjectId },
    update: {},
    create: {
      id: demoProjectId,
      organizationId: demoOrgId,
      ownerId: demoUserId,
      name: 'Cortex Platform Launch',
      description: 'Building and launching the premier AI Productivity Operating System.',
      status: 'ACTIVE',
      createdBy: demoUserId,
    },
  });
  console.log('✅ Demo Project seeded:', project.name);

  // 5. Seed Demo Goals
  const demoGoalId = '55555555-5555-5555-5555-555555555554';
  const goal = await prisma.goal.upsert({
    where: { id: demoGoalId },
    update: {},
    create: {
      id: demoGoalId,
      userId: demoUserId,
      organizationId: demoOrgId,
      title: 'Launch Cortex MVP',
      description: 'Acquire first 100 organic beta subscribers.',
      progress: 45,
      status: 'ACTIVE',
      createdBy: demoUserId,
    },
  });
  console.log('✅ Demo Goal seeded:', goal.title);

  // 6. Seed Sample Tasks
  const task1 = await prisma.task.upsert({
    where: { id: '66666666-6666-6666-6666-666666666661' },
    update: {},
    create: {
      id: '66666666-6666-6666-6666-666666666661',
      userId: demoUserId,
      organizationId: demoOrgId,
      projectId: demoProjectId,
      goalId: demoGoalId,
      title: 'Deploy Database Schema with RLS',
      description: 'Configure and test Supabase PostgreSQL security policies.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      createdBy: demoUserId,
    },
  });
  console.log('✅ Sample Task 1 seeded:', task1.title);

  const task2 = await prisma.task.upsert({
    where: { id: '66666666-6666-6666-6666-666666666662' },
    update: {},
    create: {
      id: '66666666-6666-6666-6666-666666666662',
      userId: demoUserId,
      organizationId: demoOrgId,
      projectId: demoProjectId,
      title: 'Setup GitHub Actions CI/CD Pipeline',
      description: 'Verify linting, testing, and deployment scripts automations.',
      status: 'PLANNED',
      priority: 'HIGH',
      createdBy: demoUserId,
    },
  });
  console.log('✅ Sample Task 2 seeded:', task2.title);

  // 7. Seed Feature Flags
  const flags = [
    { key: 'feature_ai_planner', description: 'Enable advanced AI schedule block scheduling.', isEnabled: true },
    { key: 'feature_teams', description: 'Enable organizational workspaces and memberships.', isEnabled: true },
    { key: 'feature_payments', description: 'Enable Stripe and global payment gateways.', isEnabled: false },
    { key: 'feature_knowledge_rag', description: 'Enable Postgres vector knowledge summaries.', isEnabled: false },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: {
        key: flag.key,
        description: flag.description,
        isEnabled: flag.isEnabled,
      },
    });
  }
  console.log('✅ Base Feature Flags seeded.');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('🛑 Seeding process encountered an error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
