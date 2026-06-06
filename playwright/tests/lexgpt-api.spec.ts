import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const API_ENDPOINT = 'https://cms.localllm.me/api/management/lexcentra/chat';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzgwNzQ4NTU5LCJleHAiOjE3ODMzNDA1NTl9.iB9Dmmp4nuibsNrfw6B_z6q4Ad5MNZ6yGl1auEQwhrY';

// Paths for input and output
const INPUT_DIR = path.join(__dirname, '../input/lexgpt');
const OUTPUT_DIR = path.join(__dirname, '../output/lexgpt');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Parse SSE format response
function parseEventStream(data: string): any {
  const lines = data.split('\n');
  const results: any[] = [];
  let currentEvent = null;
  let currentData = '';

  for (const line of lines) {
    if (line.startsWith('event:')) {
      currentEvent = line.substring(6).trim();
    } else if (line.startsWith('data:')) {
      currentData = line.substring(5).trim();
      if (currentEvent && currentData) {
        try {
          results.push({
            event: currentEvent,
            data: JSON.parse(currentData)
          });
        } catch (e) {
          console.error('Failed to parse JSON:', currentData);
        }
        currentEvent = null;
        currentData = '';
      }
    }
  }

  return results;
}

// Save AI response to output file
function saveAIResponse(questionIndex: number, question: string, responseData: any) {
  const outputFile = path.join(OUTPUT_DIR, `question-${String(questionIndex).padStart(2, '0')}-response.json`);
  
  const output = {
    timestamp: new Date().toISOString(),
    question: question,
    apiResponse: responseData
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), { encoding: 'utf8' });
  console.log(`✅ Saved response to: ${outputFile}`);
}

test.describe('LextGPT API Tests', () => {
  test('TC01: Test API connectivity', async ({ request }) => {
    try {
      const response = await request.post(API_ENDPOINT, {
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        data: {
          message: 'Xin chào'
        }
      });

      expect(response.ok()).toBeTruthy();
      console.log('✅ API is responsive');
    } catch (error) {
      console.error('❌ API connectivity failed:', error);
      throw error;
    }
  });

  test('TC02: Test API with single question', async ({ request }) => {
    const testQuestion = 'Hãy giải thích về lãi suất ngân hàng';
    
    try {
      const response = await request.post(API_ENDPOINT, {
        headers: {
          'Authorization': AUTH_TOKEN,
          'Content-Type': 'application/json'
        },
        data: {
          message: testQuestion
        }
      });

      expect(response.ok()).toBeTruthy();
      const responseText = await response.text();
      console.log('📨 Received response');
      
      // Parse EventStream response
      const events = parseEventStream(responseText);
      console.log(`📊 Parsed ${events.length} events`);
      
      // Save response
      if (events.length > 0) {
        saveAIResponse(1, testQuestion, events);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }, { timeout: 1200000 }); // 20 minutes

  test('TC03: Test API with multiple questions from input files', async ({ request }) => {
    // Get all JSON files from input directory
    const inputFiles = fs.readdirSync(INPUT_DIR)
      .filter(file => file.endsWith('.json'))
      .sort();

    console.log(`📁 Found ${inputFiles.length} input files`);

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      const filePath = path.join(INPUT_DIR, file);
      
      try {
        // Read question from input file
        const content = fs.readFileSync(filePath, 'utf8');
        const questionData = JSON.parse(content);
        const question = questionData.question;

        console.log(`\n🔄 Processing: ${file}`);
        console.log(`❓ Question: ${question.substring(0, 100)}...`);

        // Send to API
        const response = await request.post(API_ENDPOINT, {
          headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json'
          },
          data: {
            message: question
          }
        });

        expect(response.ok()).toBeTruthy();
        const responseText = await response.text();
        
        // Parse EventStream response
        const events = parseEventStream(responseText);
        console.log(`📊 Parsed ${events.length} events from response`);
        
        // Extract "result" event with full response data
        const resultEvent = events.find(e => e.event === 'result');
        if (resultEvent && resultEvent.data) {
          console.log(`✅ Found result event with content`);
          
          // Save the full response
          saveAIResponse(i + 1, question, resultEvent.data);
        } else {
          console.warn(`⚠️ No result event found in response`);
        }

      } catch (error) {
        console.error(`❌ Failed to process ${file}:`, error);
      }

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }, { timeout: 9000000 }); // 150 minutes for 3+ questions
});
