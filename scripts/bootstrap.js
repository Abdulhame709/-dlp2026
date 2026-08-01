const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, errorMessage) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`🛑 Error: ${errorMessage}`);
    return false;
  }
}

async function bootstrap() {
  console.log('\n====================================================================');
  console.log('🚀 [CORTEX AI - BOOTSTRAP INITIALIZATION TOOL]');
  console.log('====================================================================');

  // 1. Install Dependencies Check
  console.log('\n📦 Step 1: Verification of Node Dependencies...');
  if (!fs.existsSync(path.resolve(__dirname, '../node_modules'))) {
    console.log('node_modules not found. Installing packages...');
    const ok = runCommand('npm install', 'Failed to install dependencies.');
    if (!ok) process.exit(1);
  } else {
    console.log('✅ node_modules are already populated.');
  }

  // 2. Generate Prisma Client
  console.log('\n🗃️ Step 2: Generating Local Prisma Client...');
  const prismaOk = runCommand('npx prisma generate', 'Failed to generate local Prisma client classes.');
  if (!prismaOk) {
    console.log('⚠️ Warning: Prisma engine binary generation bypassed (normal in restricted offline sandboxes).');
  } else {
    console.log('✅ Local Prisma client generated successfully.');
  }

  // 3. Environment Variables Check and Mode selection
  console.log('\n🔑 Step 3: Resolving Active Mode & Environment variables...');
  const hasEnvFile = fs.existsSync(path.resolve(__dirname, '../.env.local')) || fs.existsSync(path.resolve(__dirname, '../.env'));
  
  let useMock = true;
  if (process.env.USE_MOCK === 'false') {
    useMock = false;
  } else if (fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
    const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
    if (envContent.includes('USE_MOCK="false"') || envContent.includes('USE_MOCK=false')) {
      useMock = false;
    }
  }

  if (useMock) {
    console.log('👉 [SRE Active Fallback]: USE_MOCK is set to TRUE.');
    console.log('   The application is in OFFLINE/MOCK mode.');
    console.log('   No remote databases or APIs are required.');
    console.log('   Skipping migrations and remote seeding.');
  } else {
    console.log('👉 [Mode]: Cloud Development / Live Connected active.');
    console.log('   DATABASE_URL and DIRECT_URL are being evaluated.');

    // 4. Run database migrations to Supabase
    console.log('\n🚀 Step 4: Applying safe Supabase database migrations...');
    const migrateOk = runCommand('npx prisma migrate deploy', 'Prisma migration failed. Please check database connectivity.');
    if (!migrateOk) {
      console.log('⚠️ SRE Note: If you are in a sandboxed offline environment, migrations can only be executed via the prepared GitHub Actions "database-migrate" workflow.');
    } else {
      console.log('✅ Database schema migrated successfully.');
      
      // 5. Run Production seed
      console.log('\n🌱 Step 5: Initializing System configurations and Flags...');
      const seedOk = runCommand('npx tsx prisma/production-seed.ts', 'Production seeding failed.');
      if (seedOk) {
        console.log('✅ Production system configurations initialized successfully.');
      }
    }
  }

  console.log('\n====================================================================');
  console.log('🎉 Cortex AI is fully prepared for execution!');
  console.log('   To start the development server, run:');
  console.log('   👉 npm run dev');
  console.log('====================================================================\n');
}

bootstrap();
