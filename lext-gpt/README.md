# LexGPT Web UI

A modern web-based interface for asking questions to LexGPT API with batch processing, local storage, and file export capabilities.

## Features

✅ **Interactive Question Management**
- Add/remove questions dynamically
- Real-time question and response handling
- Copy responses to clipboard

✅ **API Integration**
- Configurable API endpoint and authentication token
- Single question asking with response streaming
- Batch processing of multiple questions

✅ **Data Persistence**
- Save questions and responses to browser localStorage
- Load previously saved questions on page reload
- Download responses in question.json format

✅ **User-Friendly Interface**
- Built with Bootstrap 5 for responsive design
- Real-time notifications for user actions
- Loading indicators and error handling
- Clean, modern UI with smooth animations

## Installation

### Prerequisites
- Node.js 14+ and npm
- Express.js 4.18+
- EJS template engine 3.1+

### Setup

1. Install dependencies:
```bash
npm install --save-dev express ejs
```

2. Navigate to the lext-gpt directory:
```bash
cd lext-gpt
```

3. Start the server:
```bash
npm run lextgpt:server
```

Or directly:
```bash
node server.js
```

The server will start on `http://localhost:3000`

## Usage

### Web Interface

1. **Configure API**
   - Enter your LexGPT API URL in the "API URL" field
   - Enter your authorization token in the "Authorization Token" field

2. **Add Questions**
   - Click "Add Question" button to create a new question row
   - Type your question in the question textbox

3. **Get Responses**
   - Click "Ask" button for individual questions, or
   - Click "Ask All" to process all questions in batch mode
   - Wait for responses to appear in the response textbox

4. **Manage Responses**
   - Click "Copy" to copy a response to clipboard
   - Click "Delete" to remove a question row
   - Responses are read-only in the UI

5. **Save & Download**
   - Click "Save" to store all questions and responses in browser localStorage
   - Click "Download" to export data as JSON file

### API Endpoints

#### Single Question
```
POST /api/ask
Content-Type: application/json

{
  "question": "Your question here",
  "apiUrl": "https://cms.localllm.me/api/management/lexcentra/chat",
  "token": "Bearer YOUR_TOKEN"
}

Response:
{
  "success": true,
  "response": "API response text",
  "statusCode": 200
}
```

#### Batch Questions
```
POST /api/ask-batch
Content-Type: application/json

{
  "questions": ["Question 1", "Question 2", "Question 3"],
  "apiUrl": "https://cms.localllm.me/api/management/lexcentra/chat",
  "token": "Bearer YOUR_TOKEN"
}

Response:
{
  "success": true,
  "results": [
    {
      "question": "Question 1",
      "response": "Response 1",
      "statusCode": 200
    },
    ...
  ]
}
```

## Data Format

### localStorage Storage
Questions and responses are stored in localStorage under the key `lexgptQuestions`:

```javascript
[
  {
    "id": "row-1",
    "question": "What is LexGPT?",
    "response": "LexGPT is a legal AI assistant..."
  },
  ...
]
```

### Download Format (question.json)
Downloaded files follow the standard question.json format:

```json
[
  {
    "question": "Question text",
    "response": "Response text"
  },
  {
    "question": "Another question",
    "response": "Its response"
  }
]
```

## File Structure

```
lext-gpt/
├── server.js                 # Express server
├── test-api.js              # LexGPT API interface
├── question.json            # Sample questions file
├── views/
│   └── index.ejs            # Main HTML template
├── public/
│   ├── js/
│   │   └── app.js          # Frontend application logic
│   └── css/                # CSS files (future)
```

## Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "lextgpt:server": "cd lext-gpt && node server.js",
    "lextgpt:test": "cd lext-gpt && node test-api.js"
  }
}
```

## API Integration Details

The application uses the `askQuestion()` function from `test-api.js` which:

1. Accepts the question, API endpoint, and authentication token
2. Streams responses from the LexGPT API
3. Returns parsed response data
4. Handles errors gracefully

### Key Functions

**Server-side:**
- `POST /api/ask` - Ask a single question
- `POST /api/ask-batch` - Ask multiple questions

**Client-side (app.js):**
- `addQuestion()` - Add new question row
- `askQuestion(id)` - Ask a specific question
- `askBatch()` - Ask all questions
- `saveToLocalStorage()` - Persist to browser storage
- `download()` - Export as JSON file
- `copyToClipboard(id)` - Copy response text

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires localStorage and fetch API support.

## Notes

- Questions and responses are saved locally in your browser
- API credentials are only sent to the configured API endpoint
- Batch processing requests are sequential (one after another)
- Network errors will be displayed as notifications
- Empty questions are skipped during batch processing

## Troubleshooting

### "Please fill in API URL and Token"
- Ensure both API URL and token fields are filled
- Check that token is in correct format (usually starts with "Bearer ")

### Connection errors
- Verify the API URL is accessible
- Check network connectivity
- Ensure CORS is properly configured on API server

### localStorage issues
- Clear browser cache if data doesn't load
- Use "Download" button to backup important data
- Check browser's localStorage quota

## Environment Variables

Optional: Create a `.env` file in lext-gpt directory:

```
API_ENDPOINT=https://cms.localllm.me/api/management/lexcentra/chat
AUTH_TOKEN=Bearer your_token_here
PORT=3000
```

Then modify server.js to use these values:

```javascript
const PORT = process.env.PORT || 3000;
```

## Development

### Start dev server:
```bash
cd lext-gpt
node server.js
```

Server runs on `http://localhost:3000` with automatic static file serving from `public/` directory.

### Modify templates:
Edit `views/index.ejs` for HTML structure and styling.

### Update frontend logic:
Modify `public/js/app.js` for client-side functionality.

### Update API handling:
Modify `server.js` for backend routes and `test-api.js` for LexGPT integration.

## License

ISC
