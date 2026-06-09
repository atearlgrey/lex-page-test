# LexGPT Web UI - Setup Instructions

## Quick Start

### Step 1: Install Dependencies

Choose one of the following methods:

#### Method A: Using npm (Recommended)
```bash
npm install --save-dev express ejs
```

#### Method B: Using the setup script

**Windows (Command Prompt):**
```bash
cd lext-gpt
setup.bat
```

**Windows (PowerShell):**
```powershell
cd lext-gpt
.\setup.ps1
```

### Step 2: Start the Server

**Using npm script:**
```bash
npm run lextgpt:server
```

**Or directly:**
```bash
cd lext-gpt
node server.js
```

### Step 3: Open in Browser

Open your web browser and navigate to:
```
http://localhost:3000
```

---

## Detailed Setup Guide

### Prerequisites

1. **Node.js and npm**
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git (Optional but recommended)**
   - For version control: https://git-scm.com/

### Installation Steps

#### 1. Verify Node.js Installation

```bash
node --version
npm --version
```

You should see version numbers for both.

#### 2. Install Required Packages

Navigate to the project root directory and run:

```bash
npm install --save-dev express ejs
```

This will:
- Install Express.js (web framework)
- Install EJS (template engine)
- Update package-lock.json

#### 3. Verify Files are in Place

Check that these files exist in the `lext-gpt` directory:

```
lext-gpt/
├── server.js              ✓ Express server
├── test-api.js            ✓ API interface (modified)
├── question.json          ✓ Sample data
├── views/
│   └── index.ejs         ✓ HTML template
├── public/
│   └── js/
│       └── app.js        ✓ Frontend logic
├── README.md             ✓ Documentation
├── SETUP.md              ✓ This file
├── setup.bat             ✓ Windows batch script
└── setup.ps1             ✓ PowerShell script
```

#### 4. Start the Server

Choose one of these options:

**Option A: Using npm script (from project root)**
```bash
npm run lextgpt:server
```

**Option B: Direct node command**
```bash
cd lext-gpt
node server.js
```

**Option C: Using npx**
```bash
npx node lext-gpt/server.js
```

#### 5. Access the Application

Once you see this message:
```
✅ Server running at http://localhost:3000
```

Open your web browser and go to: **http://localhost:3000**

---

## Configuration

### API Endpoint

The default API endpoint is:
```
https://cms.localllm.me/api/management/lexcentra/chat
```

You can change it in the web UI:
1. Open http://localhost:3000
2. In the "API URL" field, enter your endpoint
3. In the "Authorization Token" field, enter your Bearer token

### Environment Variables (Optional)

Create a `.env` file in the `lext-gpt` directory:

```
API_ENDPOINT=https://cms.localllm.me/api/management/lexcentra/chat
AUTH_TOKEN=Bearer your_token_here
PORT=3000
```

Then modify `server.js` to use these values:

```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://...';
```

---

## Troubleshooting

### Problem: "npm: command not found"

**Solution:** Node.js/npm is not installed or not in your system PATH.

1. Install Node.js from https://nodejs.org/
2. Restart your terminal/command prompt
3. Verify: `node --version`

### Problem: "Module not found: express"

**Solution:** Dependencies are not installed.

1. Run: `npm install --save-dev express ejs`
2. Wait for installation to complete
3. Try starting the server again

### Problem: "Port 3000 is already in use"

**Solution:** Another process is using port 3000.

**Option A: Kill the process**
- Windows: `taskkill /F /IM node.exe`
- Mac/Linux: `killall node`

**Option B: Use a different port**
- Edit `server.js` and change `const PORT = 3000` to another port (e.g., 3001)

### Problem: "Cannot find module './test-api.js'"

**Solution:** Make sure you're running the server from the correct directory.

- Correct: `cd lext-gpt && node server.js`
- Incorrect: `node lext-gpt/server.js` (while in wrong directory)

### Problem: CORS errors in browser console

**Solution:** API server doesn't allow requests from http://localhost:3000.

Contact your API provider to enable CORS headers, or use a CORS proxy (not recommended for production).

### Problem: Responses not appearing

**Solution:** Check the following:

1. Verify API URL is correct and accessible
2. Verify authentication token is valid
3. Check browser console for errors (F12)
4. Check server console for error messages
5. Try a simple test question first

---

## Running the Server in Background

### Windows

**Using npm script:**
```bash
npm run lextgpt:server
```

Then in a new terminal, you can continue using the command prompt.

**Using batch file:**
```bash
start node lext-gpt/server.js
```

### Mac/Linux

**Using npm script:**
```bash
npm run lextgpt:server &
```

**Using nohup:**
```bash
nohup node lext-gpt/server.js &
```

**Using screen:**
```bash
screen -S lexgpt node lext-gpt/server.js
```

To detach: Press `Ctrl+A` then `D`
To reattach: `screen -r lexgpt`

---

## Development Mode with Auto-Reload

To restart the server automatically when files change, install `nodemon`:

```bash
npm install --save-dev nodemon
```

Then run:
```bash
npx nodemon lext-gpt/server.js
```

---

## Testing the Setup

1. **Test Server is Running**
   - Open http://localhost:3000 in your browser
   - You should see the "LexGPT Questions UI" page

2. **Test Configuration**
   - Enter a valid API URL
   - Enter a valid authentication token
   - Click "Add Question"

3. **Test Single Question**
   - Type a question
   - Click "Ask"
   - Wait for response

4. **Test Batch Processing**
   - Add multiple questions
   - Click "Ask All"
   - All should be answered

5. **Test Data Persistence**
   - Answer some questions
   - Click "Save"
   - Reload the page (F5)
   - Questions and responses should still be there

6. **Test Download**
   - Click "Download"
   - File should be saved as `questions-TIMESTAMP.json`

---

## Next Steps

After successful setup:

1. **Customize the API**
   - Update `server.js` if using a different API
   - Modify `test-api.js` for custom request formats

2. **Style the UI**
   - Edit CSS in `views/index.ejs`
   - Modify Bootstrap classes as needed

3. **Add Features**
   - Implement database storage instead of localStorage
   - Add user authentication
   - Create API endpoints for file upload

4. **Deploy**
   - Consider using PM2 for process management
   - Use nginx/Apache as reverse proxy
   - Deploy to Heroku, Vercel, or your own server

---

## Additional Resources

- **Express.js Documentation**: https://expressjs.com/
- **EJS Documentation**: https://ejs.co/
- **Bootstrap 5 Documentation**: https://getbootstrap.com/docs/5.0/
- **Node.js Documentation**: https://nodejs.org/docs/

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the server console for error messages
3. Check browser console (F12) for JavaScript errors
4. Read the README.md for more information
5. Check the original LexGPT API documentation

---

## File Modifications

The following files have been modified from their original versions:

### test-api.js
- Updated `askQuestion()` function to accept custom API endpoint and token
- Added module export: `module.exports = { askQuestion, processQuestions }`
- Modified to only run `processQuestions()` when executed directly

### package.json
- Added `express` and `ejs` to devDependencies
- Added `"lextgpt:server"` npm script

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit tokens to version control**
   - Use environment variables or .env files
   - Add `.env` to `.gitignore`

2. **Use HTTPS in production**
   - Configure with SSL/TLS certificates
   - Set secure cookie flags

3. **Implement authentication**
   - Add login/logout functionality
   - Use secure session management

4. **Validate all inputs**
   - Sanitize user questions
   - Validate API responses

5. **Rate limiting**
   - Implement rate limiting on API endpoints
   - Prevent abuse

---

Last Updated: 2026-06-09
