# Playwright LexGPT Test Suite

## 📁 Folder Structure

```
playwright/
├── tests/
│   └── lexgpt.spec.ts          # Main test file
├── input/
│   └── lexgpt/
│       ├── question-01.json     # Sample input questions
│       ├── question-02.json
│       └── question-03.json
├── output/
│   └── lexgpt/                  # AI responses saved here
│       ├── question-01-response.json
│       ├── question-02-response.json
│       ├── question-03-response.json
│       └── test-results.json    # Test execution results
├── config/
├── playwright.config.ts         # Playwright configuration
└── README.md
```

## 🧪 Test Cases

1. **TC01**: Successful Login
2. **TC02**: Components Display
3. **TC03**: Single Question
4. **TC04**: Multiple Questions
5. **TC05**: Textarea Responsiveness
6. **TC06**: Send Button Functionality
7. **TC07**: Session Persistence
8. **TC08**: Ask questions from input folder and save responses

## 🚀 How to Run

### Installation
```bash
npm install -D @playwright/test
```

### Run all tests
```bash
npx playwright test playwright/tests/lexgpt.spec.ts
```

### Run specific test
```bash
npx playwright test playwright/tests/lexgpt.spec.ts -g 'TC08'
```

### Run with UI
```bash
npx playwright test --ui
```

### Run headed (see browser)
```bash
npx playwright test --headed
```

## 📝 Input Format

Place JSON files in `playwright/input/lexgpt/` with the following format:

```json
{
  "question": "Your question here?"
}
```

## 📤 Output Format

Responses are automatically saved to `playwright/output/lexgpt/` as:

```json
{
  "question": "Your question?",
  "response": "AI response text here...",
  "timestamp": "2026-06-01T23:47:00.000Z",
  "sourceFile": "question-01.json"
}
```

Test results are saved in `playwright/output/lexgpt/test-results.json`

## 📋 Credentials

- **Email**: quynhtrangnguyen26@gmail.com
- **Password**: Admin@123
- **Login URL**: https://vib-client-dev.hacvntech.com/login
- **Application URL**: https://vib-client-dev.hacvntech.com/

## ⚙️ Configuration

Edit `playwright.config.ts` to customize:
- Browser type
- Viewport size
- Timeout settings
- Screenshot/trace options
