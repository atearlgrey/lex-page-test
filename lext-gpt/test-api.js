const fs = require('fs');
const path = require('path');

const API_ENDPOINT = 'https://cms.localllm.me/api/management/lexcentra/chat';
const AUTH_TOKEN = 'Bearer ...'; // Update with actual token

const QUESTION_FILE = path.join(__dirname, 'question.json');

/**
 * Send a question to the API and collect the streamed response
 */
async function askQuestion(question) {
  console.log(`\n📝 Asking: "${question}"`);

  const requestBody = {
    attachments: [],
    attachmentsDesStr: [],
    prompt: question,
    vbplIds: '',
    vbtt: false,
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result = null;
    let finishMetadata = null;
    let resultMetadata = null;
    let tokenContent = '';

    console.log('⏳ Waiting for response stream...');

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines[lines.length - 1];

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse event type and data
        if (line.startsWith('event:')) {
          const eventType = line.substring(6).trim();
          if (eventType != 'token') {
            console.log(`📨 Event: ${eventType}`);
          }
        } else if (line.startsWith('data:')) {
          const dataStr = line.substring(5).trim();

          try {
            const data = JSON.parse(dataStr);
            // Handle different event types
            if (data.key === 'token' && data.content?.token) {
              tokenContent += data.content.token;
            } else if (data.key === 'finished' && data.content?.content) {
              // Capture the finished event as finishMetadata
              finishMetadata = {
                key: 'finished',
                content: data,
              };
              console.log('\n✅ Finished event received');
            } else if (data.key === 'result' || data.requestId) {
              result = data;
              resultMetadata = data.data.content;
              console.log('\n🎯 Result received');
            }
          } catch (e) {
            // Some events might be metadata without JSON content
            if (dataStr.includes('chatMetadata')) {
              console.log(`📊 Metadata: ${dataStr}`);
            } else if (dataStr === 'connected') {
              console.log('✨ Connected to stream');
            }
          }
        }
      }
    }

    console.log(`\n✨ Response complete. Tokens collected: ${tokenContent.length} characters`);

    // If we collected tokens but no result object, create one
    if (!result && tokenContent) {
      result = {
        content: tokenContent,
        rspMessage: 'success',
        rspCode: '001',
      };
    }

    return {
      statusCode: 200,
      response: resultMetadata,
    };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return {
      statusCode: error.response?.status || 500,
      content: `Error: ${error.message}`,
    };
  }
}

function parseOptions(argv) {
  const options = {
    batchSize: 5,
    start: 1,
    stop: null,
  };

  for (const arg of argv) {
    if (arg.startsWith('--batch-size=')) {
      const parsed = Number.parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        options.batchSize = parsed;
      }
    } else if (arg.startsWith('--start=')) {
      const parsed = Number.parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        options.start = parsed;
      }
    } else if (arg.startsWith('--stop=')) {
      const parsed = Number.parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(parsed) && parsed >= options.start) {
        options.stop = parsed;
      }
    }
  }

  return options;
}

function chunkArray(array, size) {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Process all questions from the question.json file
 */
async function processQuestions() {
  console.log('🚀 Starting API test script...\n');

  try {
    // Read the question file
    let fileContent = fs.readFileSync(QUESTION_FILE, 'utf-8');
    let questions = JSON.parse(fileContent);

    const options = parseOptions(process.argv.slice(2));
    const startIndex = Math.max(0, options.start - 1);
    const stopIndex = options.stop ? Math.min(questions.length, options.stop) : questions.length;
    const selectedQuestions = questions
      .slice(startIndex, stopIndex)
      .filter((item) => !item.response || String(item.response).trim() === '');

    console.log(`📂 Loaded ${questions.length} question(s) from ${QUESTION_FILE}`);
    console.log(`⚙️  Using batch size: ${options.batchSize}, start: ${options.start}, stop: ${options.stop ?? 'end'}`);

    if (selectedQuestions.length === 0) {
      console.warn('⚠️  No questions matched the provided start/stop range.');
      return;
    }

    // Process selected questions in batches, running each batch in parallel
    const batches = chunkArray(selectedQuestions, options.batchSize);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      console.log(`\n🚦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} question(s))`);

      await Promise.all(
        batch.map(async (item, offset) => {
          const globalIndex = startIndex + batchIndex * options.batchSize + offset;

          if (!item.question) {
            console.warn(`⚠️  Skipping item ${globalIndex + 1}: No question found`);
            return;
          }

          const result = await askQuestion(item.question);
          item.response = result.response || result.content || null;

          console.log(`💾 Updated response for question ${globalIndex + 1}/${questions.length}`);
        })
      );

      // Save after each batch so progress is persisted immediately
      fs.writeFileSync(QUESTION_FILE, JSON.stringify(questions, null, 2));
      console.log(`\n✅ Batch ${batchIndex + 1} saved to ${QUESTION_FILE}`);
    }
  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
processQuestions();
