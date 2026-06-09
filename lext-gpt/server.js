const express = require('express');
const path = require('path');
const fs = require('fs');
const { askQuestion } = require('./test-api');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'LexGPT Questions' });
});

// API endpoint to ask question
app.post('/api/ask', async (req, res) => {
  try {
    const { question, apiUrl, token } = req.body;

    if (!question || !apiUrl || !token) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: question, apiUrl, token'
      });
    }

    // Call the askQuestion function with dynamic API endpoint and token
    const result = await askQuestion(question, apiUrl, token);

    res.json({
      success: true,
      response: result.response || result.content || '',
      statusCode: result.statusCode
    });
  } catch (error) {
    console.error('Error in /api/ask:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      response: ''
    });
  }
});

// API endpoint to ask batch questions
app.post('/api/ask-batch', async (req, res) => {
  try {
    const { questions, apiUrl, token } = req.body;

    if (!Array.isArray(questions) || questions.length === 0 || !apiUrl || !token) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: questions (array), apiUrl, token'
      });
    }

    // Process all questions sequentially
    const results = [];
    for (const question of questions) {
      if (question.trim()) {
        const result = await askQuestion(question, apiUrl, token);
        results.push({
          question,
          response: result.response || result.content || '',
          statusCode: result.statusCode
        });
      }
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error in /api/ask-batch:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      results: []
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
