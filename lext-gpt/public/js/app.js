class QuestionManager {
  constructor() {
    this.questions = [];
    this.rowIdCounter = 0;
    this.init();
  }

  init() {
    this.loadFromLocalStorage();
    this.renderQuestions();
    this.attachEventListeners();
  }

  attachEventListeners() {
    document.getElementById('btnAddRow').addEventListener('click', () => this.addQuestion());
    document.getElementById('btnBatchAsk').addEventListener('click', () => this.askBatch());
    document.getElementById('btnSave').addEventListener('click', () => this.saveToLocalStorage());
    document.getElementById('btnDownload').addEventListener('click', () => this.download());
  }

  addQuestion(question = '', response = '') {
    const id = `row-${++this.rowIdCounter}`;
    this.questions.push({
      id,
      question,
      response
    });
    this.renderQuestions();
  }

  removeQuestion(id) {
    this.questions = this.questions.filter(q => q.id !== id);
    this.renderQuestions();
  }

  async askQuestion(id) {
    const question = this.questions.find(q => q.id === id);
    if (!question) return;

    const apiUrl = document.getElementById('apiUrl').value.trim();
    const token = document.getElementById('authToken').value.trim();

    if (!apiUrl || !token) {
      this.showNotification('Please fill in API URL and Token', 'error');
      return;
    }

    if (!question.question.trim()) {
      this.showNotification('Please enter a question', 'error');
      return;
    }

    const btn = document.querySelector(`[data-ask="${id}"]`);
    const spinner = btn.querySelector('.spinner');
    const icon = btn.querySelector('i');

    btn.classList.add('loading');
    spinner.style.display = 'inline-block';
    icon.style.display = 'none';
    btn.disabled = true;

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question.question,
          apiUrl,
          token
        })
      });

      const data = await response.json();

      if (data.success) {
        question.response = data.response;
        this.renderQuestions();
        this.showNotification('Question answered successfully!');
      } else {
        this.showNotification(data.message || 'Error asking question', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showNotification(error.message, 'error');
    } finally {
      btn.classList.remove('loading');
      spinner.style.display = 'none';
      icon.style.display = 'inline';
      btn.disabled = false;
    }
  }

  async askBatch() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const token = document.getElementById('authToken').value.trim();

    if (!apiUrl || !token) {
      this.showNotification('Please fill in API URL and Token', 'error');
      return;
    }

    const questionsToAsk = this.questions.filter(q => q.question.trim());

    if (questionsToAsk.length === 0) {
      this.showNotification('No questions to ask', 'error');
      return;
    }

    const btn = document.getElementById('btnBatchAsk');
    const spinner = btn.querySelector('.spinner');
    const icon = btn.querySelector('i');

    btn.classList.add('loading');
    spinner.style.display = 'inline-block';
    icon.style.display = 'none';
    btn.disabled = true;

    try {
      const response = await fetch('/api/ask-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questions: questionsToAsk.map(q => q.question),
          apiUrl,
          token
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update responses for each question
        data.results.forEach((result, index) => {
          if (index < questionsToAsk.length) {
            questionsToAsk[index].response = result.response;
          }
        });
        this.renderQuestions();
        this.showNotification(`Successfully answered ${questionsToAsk.length} question(s)!`);
      } else {
        this.showNotification(data.message || 'Error asking batch questions', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showNotification(error.message, 'error');
    } finally {
      btn.classList.remove('loading');
      spinner.style.display = 'none';
      icon.style.display = 'inline';
      btn.disabled = false;
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('lexgptQuestions', JSON.stringify(this.questions));
    this.showNotification('Questions saved to localStorage!');
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('lexgptQuestions');
    if (saved) {
      try {
        this.questions = JSON.parse(saved);
        // Update row counter
        this.rowIdCounter = Math.max(...this.questions.map(q => {
          const match = q.id.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        }), 0);
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }

  download() {
    const data = this.questions.map(q => ({
      question: q.question,
      response: q.response
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification('File downloaded successfully!');
  }

  copyToClipboard(id) {
    const question = this.questions.find(q => q.id === id);
    if (!question || !question.response) {
      this.showNotification('No response to copy', 'error');
      return;
    }

    navigator.clipboard.writeText(question.response).then(() => {
      this.showNotification('Response copied to clipboard!');
    }).catch(error => {
      console.error('Copy failed:', error);
      this.showNotification('Failed to copy response', 'error');
    });
  }

  updateQuestion(id, question, response) {
    const item = this.questions.find(q => q.id === id);
    if (item) {
      item.question = question;
      item.response = response;
    }
  }

  renderQuestions() {
    const container = document.getElementById('questionsContainer');

    if (this.questions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-inbox"></i>
          <h5>No questions yet</h5>
          <p>Click "Add Question" to start asking LexGPT!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.questions.map((q, index) => `
      <div class="question-row">
        <div class="mb-3">
          <label class="form-label"><span class="row-number">${index + 1}</span>Question</label>
          <textarea 
            class="form-control question-input" 
            data-question="${q.id}"
            placeholder="Enter your question here..."
            rows="3">${q.question}</textarea>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Response</label>
          <textarea 
            class="form-control response-input" 
            data-response="${q.id}"
            placeholder="Response will appear here..."
            rows="3"
            readonly>${q.response}</textarea>
        </div>

        <div>
          <button class="btn btn-action btn-copy" data-copy="${q.id}" title="Copy response to clipboard">
            <i class="bi bi-clipboard"></i> Copy
          </button>
          <button class="btn btn-action btn-ask" data-ask="${q.id}" title="Ask this question">
            <span class="spinner" style="display: none;"></span>
            <i class="bi bi-chat-fill"></i> Ask
          </button>
          <button class="btn btn-action btn-danger btn-sm" data-remove="${q.id}" title="Delete this row">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    `).join('');

    // Attach event listeners to dynamically created elements
    container.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('button').dataset.copy;
        this.copyToClipboard(id);
      });
    });

    container.querySelectorAll('[data-ask]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.target.closest('button').dataset.ask;
        // Update question from textarea before asking
        const questionText = document.querySelector(`[data-question="${id}"]`).value;
        this.updateQuestion(id, questionText, this.questions.find(q => q.id === id).response);
        this.askQuestion(id);
      });
    });

    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('button').dataset.remove;
        if (confirm('Are you sure you want to delete this question?')) {
          this.removeQuestion(id);
        }
      });
    });

    // Update questions on textarea input
    container.querySelectorAll('[data-question]').forEach(textarea => {
      textarea.addEventListener('change', (e) => {
        const id = e.target.dataset.question;
        const responseText = document.querySelector(`[data-response="${id}"]`).value;
        this.updateQuestion(id, e.target.value, responseText);
      });
    });
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `toast-notification ${type === 'error' ? 'error' : ''}`;
    notification.innerHTML = `
      <i class="bi bi-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> 
      ${message}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.questionManager = new QuestionManager();
});
