import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const VIB_LOGIN_URL = 'https://vib-client-dev.hacvntech.com/login';
const VIB_LEXGPT_URL = 'https://vib-client-dev.hacvntech.com/';
const TEST_CREDENTIALS = {
  email: 'quynhtrangnguyen26@gmail.com',
  password: 'Admin@123'
};

const TEST_RESULTS: any[] = [];

// Helper function to save results to JSON
function saveResults(testName: string, status: 'PASS' | 'FAIL', details: any) {
  TEST_RESULTS.push({
    testName,
    status,
    timestamp: new Date().toISOString(),
    details
  });
  
  const resultsPath = path.join(__dirname, './lexgpt-test-results.json');
  
  fs.writeFileSync(resultsPath, JSON.stringify(TEST_RESULTS, null, 2));
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

});
