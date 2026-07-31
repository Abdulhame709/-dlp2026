// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production-grade database seeding (Cortex AI)...');

  // Seed ONLY essential system configurations (Feature Flags)
  const flags = [
    { key: 'feature_ai_planner', description: 'Enable advanced AI schedule block scheduling.', isEnabled: true },
    { key: 'feature_teams', description: 'Enable organizational workspaces and memberships.', isEnabled: true },
    { key: 'feature_payments', description: 'Enable Stripe and global payment gateways.', isEnabled: false },
    { key: 'feature_knowledge_rag', description: 'Enable Postgres vector knowledge summaries.', isEnabled: false },
  ];

  for (const flag of flags) {
    const record = await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: {
        key: flag.key,
        description: flag.description,
        isEnabled: flag.isEnabled,
      },
    });
    console.log(`✅ System Configuration [FeatureFlag: ${record.key}] successfully initialized.`);
  }

  console.log('🎉 Production database initialization completed successfully!');
}

main()
  .catch((e) => {
    console.error('🛑 Seeding process encountered an error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
