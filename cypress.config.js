const { defineConfig } = require('cypress');
const fs = require('fs');
const dotenv = require('dotenv');

function loadEnv() {
  // 1. Load base (luôn có)
  if (fs.existsSync('.env.base')) dotenv.config({ path: '.env.base' });

  // 3. Load môi trường cụ thể (VD: .env.stg, .env.uat, .env.prod)
  const currentEnv = process.env.CYPRESS_ENV || 'stg';
  const envFile = `.env.${currentEnv}`;
  if (fs.existsSync(envFile)) dotenv.config({ path: envFile });

  console.log(`✅ Loaded environment: ${currentEnv}`);
}

loadEnv();

// ✅ Dynamic mapping
const dynamicEnv = { ...process.env };

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL,
    env: dynamicEnv,
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    chromeWebSecurity: false
  }
});
