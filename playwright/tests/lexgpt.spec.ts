import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const VIB_LOGIN_URL = 'https://vib-client-dev.hacvntech.com/login';
const VIB_LEXGPT_URL = 'https://vib-client-dev.hacvntech.com/';
const TEST_CREDENTIALS = {
  email: 'quynhtrangnguyen26@gmail.com',
  password: 'Admin@123'
};

// Paths for input and output
const INPUT_DIR = path.join(__dirname, '../input/lexgpt');
const OUTPUT_DIR = path.join(__dirname, '../output/lexgpt');
const TEST_RESULTS: any[] = [];

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to save results to JSON
function saveResults(testName: string, status: 'PASS' | 'FAIL', details: any) {
  TEST_RESULTS.push({
    testName,
    status,
    timestamp: new Date().toISOString(),
    details
  });
  
  const resultsPath = path.join(OUTPUT_DIR, 'test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(TEST_RESULTS, null, 2));
}

// Helper function to capture and parse EventStream response
async function captureEventStreamResponse(page: Page, question: string): Promise<any> {
  // Create a state tracker
  const state = {
    finished: false,
    result: false,
    responseData: null as any  // Store full response object
  };

  // Intercept and capture the response
  const responseHandler = async (response: any) => {
    if (response.url().includes('/api/management/lexcentra/chat')) {
      try {
        const text = await response.text();
        console.log('📨 Received response from API');
        
        // Parse each line of the EventStream
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line === 'event:finished') {
            state.finished = true;
            console.log('✅ Detected: event:finished');
          }
          
          // Look for event:result
          if (line === 'event:result') {
            state.result = true;
            console.log('✅ Detected: event:result');
            
            // Next line should contain data:{ JSON }
            const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
            
            if (nextLine.startsWith('data:')) {
              try {
                // Extract JSON from data: prefix
                const jsonStr = nextLine.substring(5); // Remove 'data:' prefix
                const resultObj = JSON.parse(jsonStr);
                
                // Store entire response object
                state.responseData = resultObj;
                
                console.log('✅ Extracted full response data');
                console.log('📊 Response metadata - requestId:', resultObj.requestId);
                console.log('📊 Response metadata - inputToken:', resultObj.data?.inputToken, 'outputToken:', resultObj.data?.outputToken);
                
                if (resultObj.data?.content) {
                  console.log('📊 Content length:', resultObj.data.content.length);
                }
              } catch (parseError) {
                console.log('⚠️ Could not parse result JSON:', nextLine.substring(0, 100));
              }
            }
          }
        }
      } catch (e) {
        console.error('Error capturing response:', e);
      }
    }
  };

  page.on('response', responseHandler);

  // Wait strategy: after "finished" is detected, wait a bit more for "result" to come
  const maxWait = 900000; // 15 minutes
  const startTime = Date.now();
  const pollInterval = 500; // Check every 500ms
  let finishedTime = 0;
  const waitAfterFinished = 5000; // Wait 5 seconds after finished

  console.log('⏳ Starting to wait for EventStream response...');

  while (Date.now() - startTime < maxWait) {
    // If we just detected finished, record the time
    if (state.finished && finishedTime === 0) {
      finishedTime = Date.now();
      console.log('⏱️ Finished detected, waiting for result...');
    }

    // Check if we have both finished and result with data
    if (state.finished && state.result && state.responseData) {
      console.log('✅ EventStream complete - both events received with data');
      break;
    }

    // If finished is detected, give it 5 more seconds to get result
    if (state.finished && finishedTime > 0 && Date.now() - finishedTime > waitAfterFinished) {
      console.log('⏱️ Finished detected 5+ seconds ago, proceeding with current data...');
      if (state.responseData) {
        break;
      }
    }

    await page.waitForTimeout(pollInterval);
  }

  page.off('response', responseHandler);

  console.log(`📊 Final state - finished: ${state.finished}, result: ${state.result}, responseData: ${state.responseData ? 'present' : 'empty'}`);

  if (!state.finished) {
    console.warn('⚠️ Warning: finished event was never detected');
  }

  if (!state.result) {
    console.warn('⚠️ Warning: result event was never detected');
  }

  return state.responseData;
}
function readQuestionsFromInput(): any[] {
  if (!fs.existsSync(INPUT_DIR)) {
    console.warn(`Input directory not found: ${INPUT_DIR}`);
    return [];
  }

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'));
  const questions: any[] = [];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(INPUT_DIR, file), 'utf-8');
      const data = JSON.parse(content);
      questions.push({
        file,
        ...data
      });
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  });

  return questions;
}

// Helper function to save AI responses to output
function saveAIResponse(questionFile: string, question: string, responseData: any) {
  const outputFile = questionFile.replace('.json', '-response.json');
  
  // Save full response data with proper UTF-8 encoding
  const outputData = {
    question,
    timestamp: new Date().toISOString(),
    sourceFile: questionFile,
    result: responseData // Save entire result object
  };

  const outputPath = path.join(OUTPUT_DIR, outputFile);
  
  // Write with UTF-8 encoding for Vietnamese characters
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), { encoding: 'utf8' });

  return outputPath;
}

// Helper function to login
async function login(page: Page) {
  await page.goto(VIB_LOGIN_URL);
  
  // Fill email
  await page.fill('body div#root form input[type=email]', TEST_CREDENTIALS.email);
  
  // Fill password
  await page.fill('body div#root form input[type=password]', TEST_CREDENTIALS.password);
  
  // Click login button
  await page.click('body div#root form button[type=submit]');
  
  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
  
  // If redirected to /dashboard, navigate back to / (LexGPT main page)
  const currentUrl = page.url();
  if (currentUrl.includes('/dashboard')) {
    await page.goto(VIB_LEXGPT_URL);
    await page.waitForLoadState('networkidle');
  }
  
  // Wait for main element to be visible
  await page.waitForSelector('body div#root main', { timeout: 10000 });
}

test.describe('VIB LexGPT Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear cookies for fresh session
    await page.context().clearCookies();
  });

  test('TC01: User should successfully login to VIB LexGPT', async ({ page }) => {
    try {
      await login(page);
      
      // Verify on main page
      const mainElement = await page.$('body div#root main');
      expect(mainElement).toBeTruthy();
      
      saveResults('TC01: Successful Login', 'PASS', {
        url: page.url(),
        mainElementVisible: !!mainElement
      });
    } catch (error) {
      saveResults('TC01: Successful Login', 'FAIL', {
        error: (error as Error).message
      });
      throw error;
    }
  });

  test('TC02: LexGPT page should display all required components', async ({ page }) => {
    try {
      await login(page);
      
      // Verify QNA scrollbar component is visible
      const qnaComponent = await page.$('body div#root main div.vib-qna-scrollbar');
      expect(qnaComponent).toBeTruthy();
      
      // Verify textarea is visible
      const textarea = await page.$('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]');
      expect(textarea).toBeTruthy();
      
      // Verify send button is visible
      const sendButton = await page.$('body div#root main div.vib-qna-scrollbar div.items-center.justify-between button.w-10.h-10.rounded-full');
      expect(sendButton).toBeTruthy();
      
      saveResults('TC02: Components Display', 'PASS', {
        qnaComponentVisible: !!qnaComponent,
        textareaVisible: !!textarea,
        sendButtonVisible: !!sendButton
      });
    } catch (error) {
      saveResults('TC02: Components Display', 'FAIL', {
        error: (error as Error).message
      });
      throw error;
    }
  });

  test('TC03: User should be able to ask a single question', async ({ page }) => {
    try {
      await login(page);
      
      const testQuestion = 'What are my legal rights?';
      
      // Click on textarea to focus
      await page.click('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]');
      
      // Type question
      await page.fill('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]', testQuestion);
      
      // Verify text is entered
      const textareaValue = await page.inputValue('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]');
      expect(textareaValue).toBe(testQuestion);
      
      // Click send button
      await page.click('body div#root main div.vib-qna-scrollbar div.items-center.justify-between button.w-10.h-10.rounded-full');
      
      // Wait for textarea to clear (indicating submission)
      await page.waitForTimeout(2000);
      const clearedValue = await page.inputValue('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]');
      
      saveResults('TC03: Single Question', 'PASS', {
        questionSent: testQuestion,
        textareaCleared: clearedValue === '' || clearedValue === null,
        responseReceived: true
      });
    } catch (error) {
      saveResults('TC03: Single Question', 'FAIL', {
        error: (error as Error).message
      });
      throw error;
    }
  });

  test('TC04: User should be able to ask multiple questions', async ({ page }) => {
    try {
      await login(page);
      
      const questions = [
        'What is contract law?',
        'How do I draft a document?',
        'Tell me about LexGPT'
      ];
      
      const questionsResults = [];
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        // Click on textarea to focus
        await page.click('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]');
        
        // Type question
        await page.fill('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]', question);
        
        // Click send button
        await page.click('body div#root main div.vib-qna-scrollbar div.items-center.justify-between button.w-10.h-10.rounded-full');
        
        // Wait for submission
        await page.waitForTimeout(1500);
        
        questionsResults.push({
          questionNumber: i + 1,
          question: question,
          sent: true
        });
        
        // Small delay between questions
        if (i < questions.length - 1) {
          await page.waitForTimeout(2000);
        }
      }
      
      saveResults('TC04: Multiple Questions', 'PASS', {
        totalQuestionsSent: questions.length,
        questions: questionsResults
      });
    } catch (error) {
      saveResults('TC04: Multiple Questions', 'FAIL', {
        error: (error as Error).message
      });
      throw error;
    }
  });

  test('TC05: Textarea should be enabled and responsive', async ({ page }) => {
    try {
      await login(page);
      
      const textarea = await page.$('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]');
      const isDisabled = await textarea?.evaluate(el => (el as HTMLTextAreaElement).disabled);
      const isVisible = await textarea?.isVisible();
      
      expect(isVisible).toBe(true);
      expect(isDisabled).toBe(false);
      
      // Type in textarea to verify responsiveness
      await page.click('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]');
      await page.type('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]', 'Test input', { delay: 50 });
      
      const value = await page.inputValue('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]');
      expect(value).toContain('Test input');
      
      saveResults('TC05: Textarea Responsiveness', 'PASS', {
        textareaVisible: isVisible,
        textareaEnabled: !isDisabled,
        inputWorking: value.includes('Test input')
      });
    } catch (error) {
      saveResults('TC05: Textarea Responsiveness', 'FAIL', {
        error: (error as Error).message
      });
      throw error;
    }
  });

  test('TC06: Send button should be functional', async ({ page }) => {
    try {
      await login(page);
      
      const sendButton = await page.$('body div#root main div.vib-qna-scrollbar div.items-center.justify-between button.w-10.h-10.rounded-full');
      const isVisible = await sendButton?.isVisible();
      const isEnabled = await sendButton?.evaluate(el => !(el as HTMLButtonElement).disabled);
      
      expect(isVisible).toBe(true);
      expect(isEnabled).toBe(true);
      
      saveResults('TC06: Send Button Functionality', 'PASS', {
        sendButtonVisible: isVisible,
        sendButtonEnabled: isEnabled
      });
    } catch (error) {
      saveResults('TC06: Send Button Functionality', 'FAIL', {
        error: (error as Error).message
      });
      throw error;
    }
  });

  test('TC07: Session should persist after page refresh', async ({ page }) => {
    try {
      await login(page);
      
      // Verify logged in
      let mainElement = await page.$('body div#root main');
      expect(mainElement).toBeTruthy();
      
      // Refresh page
      await page.reload();
      
      // Verify still logged in
      await page.waitForSelector('body div#root main', { timeout: 10000 });
      mainElement = await page.$('body div#root main');
      expect(mainElement).toBeTruthy();
      
      saveResults('TC07: Session Persistence', 'PASS', {
        sessionPersisted: !!mainElement,
        refreshSuccessful: true
      });
    } catch (error) {
      saveResults('TC07: Session Persistence', 'FAIL', {
        error: (error as Error).message
      });
      throw error;
    }
  });

  test('TC08: Ask questions from input folder and save responses', async ({ page }) => {
    // Set timeout to 20 minutes for this test (AI responses take ~10 min each)
    test.setTimeout(1200000);
    try {
      await login(page);
      
      // Read questions from input folder
      const questions = readQuestionsFromInput();
      
      if (questions.length === 0) {
        console.log('No questions found in input folder');
        saveResults('TC08: Input Questions', 'PASS', {
          questionsProcessed: 0,
          message: 'No input files found'
        });
        return;
      }

      const responseResults = [];

      for (const questionData of questions) {
        const { file, question } = questionData;
        
        if (!question) {
          console.warn(`Question not found in file: ${file}`);
          continue;
        }

        // Click on textarea to focus
        await page.click('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]');
        
        // Type question
        await page.fill('body div#root main div.vib-qna-scrollbar textarea[placeholder="Hãy đặt câu hỏi cho tôi"]', question);
        
        // Click send button
        await page.click('body div#root main div.vib-qna-scrollbar div.items-center.justify-between button.w-10.h-10.rounded-full');
        
        // Capture EventStream response until 'finished' and 'result' keys appear
        const responseData = await captureEventStreamResponse(page, question);
        
        // Save the full response data to output folder (includes requestId, responseTime, tokens, etc)
        const outputPath = saveAIResponse(file, question, responseData);
        
        responseResults.push({
          inputFile: file,
          question,
          outputFile: path.basename(outputPath),
          processed: true,
          responseId: responseData?.requestId
        });

        // Small delay between questions
        await page.waitForTimeout(1500);
      }

      saveResults('TC08: Input Questions', 'PASS', {
        questionsProcessed: questions.length,
        responses: responseResults
      });
    } catch (error) {
      saveResults('TC08: Input Questions', 'FAIL', {
        error: (error as Error).message
      });
      throw error;
    }
  });

});
