const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const webpack = require('@cypress/webpack-preprocessor');
const webpackConfig = require('./webpack.config');

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
    chromeWebSecurity: false,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0,
    setupNodeEvents(on, config) {
      on('file:preprocessor', webpack({ webpackOptions: webpackConfig }));
      on('task', {
        // 🔹 Task 1: Đọc toàn bộ file JSON trong thư mục hoặc theo env fileName
        readLexgptFiles({ dir, fileName }) {
          const folderPath = path.resolve(dir);
          const files = fileName
            ? fileName.split(',').map(f => f.trim())
            : fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));

          const result = files.flatMap(file =>
            JSON.parse(fs.readFileSync(path.join(folderPath, file), 'utf8'))
          );

          return { files, data: result };
        },

        // 🔹 Task 2: Tạo thư mục (đảm bảo tồn tại trước khi ghi file)
        makeDir(dir) {
          const folderPath = path.resolve(dir);
          fs.mkdirSync(folderPath, { recursive: true });
          return null;
        },

        // 🔹 Task 3: Ghi file an toàn ở thư mục ngoài (ví dụ output/)
        writeConversationFile({ dir, fileName, content }) {
          const folderPath = path.resolve(dir);
          fs.mkdirSync(folderPath, { recursive: true });

          const filePath = path.join(folderPath, fileName);
          fs.appendFileSync(filePath, content + '\n', 'utf8');
          return filePath;
        },
      });
      return config;
    },
  }
});
