# LexGPT Web UI - Quick Reference Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install --save-dev express ejs
```

### Step 2: Start Server
```bash
npm run lextgpt:server
```

### Step 3: Open Browser
```
http://localhost:3000
```

---

## 📁 What Was Created

```
lext-gpt/
├── server.js                    ← Express API server
├── test-api.js                  ← Modified for module export
├── views/index.ejs              ← HTML template
├── public/js/app.js             ← Frontend logic
├── README.md                    ← Full documentation
├── SETUP.md                     ← Installation guide
├── MARKDOWN_RENDERING.md        ← Markdown guide
├── CHECKLIST.md                 ← Completion checklist
├── SUMMARY.md                   ← Complete summary
├── QUICKREF.md                  ← This file
├── setup.bat                    ← Windows setup
└── setup.ps1                    ← PowerShell setup
```

---

## 🎨 Features at a Glance

| Feature | Status | Details |
|---------|--------|---------|
| API URL Config | ✅ | Configurable endpoint |
| Token Config | ✅ | Secure token input |
| Add Questions | ✅ | Dynamic rows |
| Ask Individual | ✅ | Single button |
| Ask All (Batch) | ✅ | Process multiple |
| Copy Response | ✅ | Plain text to clipboard |
| Save Locally | ✅ | localStorage storage |
| Download JSON | ✅ | Export format |
| Markdown Render | ✅ | Beautiful formatting |
| Bootstrap UI | ✅ | Responsive design |
| Notifications | ✅ | Toast messages |

---

## 🎯 Common Tasks

### Add a Question
1. Click **"Add Question"** button
2. Type your question
3. Click **"Ask"** or **"Ask All"**
4. Response appears below

### Ask Multiple Questions
1. Click **"Add Question"** multiple times
2. Enter all questions
3. Click **"Ask All"** button
4. Wait for all responses

### Save Your Work
1. Click **"Save"** button
2. Data saved to browser localStorage
3. Persists even after browser closes

### Export as JSON
1. Click **"Download"** button
2. File saves as `questions-TIMESTAMP.json`
3. Same format as original question.json

### Copy a Response
1. Click **"Copy"** button next to response
2. Text copied to clipboard
3. Paste anywhere with Ctrl+V

---

## 🔧 API Configuration

### How to Configure

1. **API URL Field**
   - Default: `https://cms.localllm.me/api/management/lexcentra/chat`
   - Can be changed anytime
   - Used for all requests

2. **Token Field**
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Format: Usually starts with "Bearer "
   - Sent in Authorization header

### API Endpoints

**Single Question:**
```
POST /api/ask
{
  "question": "Your question",
  "apiUrl": "https://...",
  "token": "Bearer ..."
}
```

**Batch Questions:**
```
POST /api/ask-batch
{
  "questions": ["Q1", "Q2", "Q3"],
  "apiUrl": "https://...",
  "token": "Bearer ..."
}
```

---

## 💾 Data Storage

### localStorage
- Questions and responses stored automatically
- Survives browser restart
- Can hold ~5-10MB of data

### JSON Export
- Click "Download" to export
- Format: `[{ "question": "...", "response": "..." }]`
- Compatible with question.json

### Load on Reload
- Questions restore automatically
- No manual action needed
- Stored in browser's localStorage

---

## 🎨 Markdown Rendering

### What Gets Formatted

✅ **Supported:**
- Headings: # ## ###
- Bold: **text**
- Italic: *text*
- Lists: - item
- Code: `inline` or ```blocks```
- Tables
- Links: [text](url)
- Blockquotes: > quote

### Display
- Renders as formatted HTML
- Not editable (read-only)
- Copy still copies plain text
- Beautiful styling applied

### Example Response Format
```markdown
# Legal Answer

**Compliance** means:

1. Following regulations
2. Meeting standards
3. Maintaining ethics

For more info, see [link](url)
```

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
**Solution:** Run `npm install --save-dev express ejs`

### "Port 3000 is already in use"
**Solution:** 
- Edit server.js: Change `PORT = 3000` to `PORT = 3001`
- Or: Kill the process using port 3000

### "Cannot reach localhost:3000"
**Solution:**
- Verify server is running
- Check terminal shows "Server running at..."
- Check firewall settings

### "API not responding"
**Solution:**
- Verify API URL is correct
- Verify token is valid
- Check network connectivity

### "Markdown not showing"
**Solution:**
- Hard refresh: Ctrl+Shift+R
- Check browser console (F12)
- Verify marked.js is loaded

---

## 📊 File Sizes & Performance

| Component | Size | Purpose |
|-----------|------|---------|
| server.js | 2KB | Express server |
| app.js | 12KB | Frontend logic |
| index.ejs | 7KB | HTML template |
| marked.js | 30KB | Markdown parser |
| DOMPurify | 15KB | HTML sanitizer |
| Bootstrap | 50KB | CSS framework |

**Total:** ~115KB (with libraries)

---

## 🔒 Security Notes

✅ **What's Secure:**
- HTML sanitization (DOMPurify)
- XSS prevention
- Safe markdown parsing

⚠️ **Not Secure (don't use in production without):**
- No user authentication
- No rate limiting
- Token visible in URL
- No HTTPS

---

## 📱 Browser Support

✅ **Works On:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

❌ **Doesn't Work On:**
- IE11 and older
- Very old Android browsers

---

## 🚀 Deployment Quick Tips

### Heroku
```bash
# Create Procfile
echo "web: cd lext-gpt && node server.js" > Procfile

# Deploy
git push heroku main
```

### Your Own Server
```bash
# Install Node.js
# Clone repository
# Run: npm install --save-dev express ejs
# Run: npm run lextgpt:server
# Access via: http://your-server:3000
```

### Environment Variables
```bash
# Create .env in lext-gpt/
PORT=3000
API_ENDPOINT=https://...
AUTH_TOKEN=Bearer ...
```

---

## 📚 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| **README.md** | Features & usage |
| **SETUP.md** | Installation & troubleshooting |
| **MARKDOWN_RENDERING.md** | Markdown syntax & styling |
| **SUMMARY.md** | Complete overview |
| **CHECKLIST.md** | Implementation checklist |
| **QUICKREF.md** | This quick reference |

---

## 💡 Pro Tips

1. **Add Multiple Questions Fast**
   - Use Tab key to move between fields
   - Click "Add Question" to create new rows

2. **Batch Processing**
   - Add all questions first
   - Click "Ask All" once
   - More efficient than individual asks

3. **Backup Your Data**
   - Regularly click "Download"
   - Keep copies of exported JSON files

4. **Check Markdown**
   - If responses look plain, they might not be markdown
   - Check API returns markdown format

5. **Copy & Share**
   - Click "Copy" to get response text
   - Perfect for sharing with team
   - Already formatted from API

---

## 🎓 Common Workflows

### Workflow 1: Quick Question
```
1. Type question
2. Click "Ask"
3. Wait for response
4. Click "Copy" to share
```

### Workflow 2: Batch Research
```
1. Add 5-10 questions
2. Click "Ask All"
3. Wait for all answers
4. Review responses
5. Click "Save"
```

### Workflow 3: Document Export
```
1. Collect questions & answers
2. Click "Save" to localStorage
3. Click "Download" 
4. Share JSON file with team
5. Open in text editor or reimport
```

### Workflow 4: Daily Updates
```
1. Open http://localhost:3000
2. Questions load from yesterday
3. Add new questions
4. Ask batch
5. Save again
```

---

## 🛠️ Customization Quick Start

### Change Port
Edit `server.js`:
```javascript
const PORT = 3001;  // Changed from 3000
```

### Change Styling
Edit `views/index.ejs`:
```css
/* Change header color */
.header {
  background: #your-color;
}
```

### Add New API Endpoint
Edit `server.js`:
```javascript
app.post('/api/custom', (req, res) => {
  // Your code here
});
```

---

## 📞 Getting Help

### If Something Breaks
1. Check SETUP.md troubleshooting
2. Look at browser console (F12)
3. Check server console output
4. Try restarting server

### If You Need Features
1. Edit files directly
2. Reference the code comments
3. Check documentation

### If You Have Questions
1. Read the documentation files
2. Check example code
3. Review inline comments

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Page loads and renders
- [ ] Can add questions
- [ ] Can ask questions
- [ ] Responses appear
- [ ] Markdown renders nicely
- [ ] Can copy responses
- [ ] Can save to localStorage
- [ ] Can download JSON

If all checked ✅ - You're good to go!

---

## 🎉 You're All Set!

Everything is ready to use. Start with:

```bash
npm run lextgpt:server
```

Then open: **http://localhost:3000**

Enjoy! 🚀

---

**Last Updated:** 2026-06-09  
**Version:** 1.0.0  
**Status:** ✅ Complete & Ready to Use
