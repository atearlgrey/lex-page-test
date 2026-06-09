class QuestionManager {
  constructor() {
    this.questions = [];
    this.rowIdCounter = 0;
    this.init();
  }

  init() {
    ConfigManager.loadConfig();
    this.loadFromLocalStorage();
    this.renderQuestions();
    this.attachEventListeners();
  }

  attachEventListeners() {
    document.getElementById('btnSaveToken').addEventListener('click', () => ConfigManager.saveConfig());
    document.getElementById('btnDoImport').addEventListener('click', () => QuestionUtils.importFromExcel(this));
    document.getElementById('btnBatchAsk').addEventListener('click', () => QuestionUtils.askBatch(this));
    document.getElementById('btnSave').addEventListener('click', () => this.saveToLocalStorage());
    document.getElementById('btnDownload').addEventListener('click', () => this.download());
    document.getElementById('btnClearResponses').addEventListener('click', () => this.clearResponses());
    document.getElementById('btnClearAll').addEventListener('click', () => this.clearAllQuestions());

    const bulkImportArea = document.getElementById('bulkImportArea');
    if (bulkImportArea) {
      bulkImportArea.addEventListener('paste', () => {
        setTimeout(() => {
          const text = bulkImportArea.value;
          if (text.trim()) {
            QuestionUtils.importFromExcel(this);
          }
        }, 50);
      });
    }
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

  saveToLocalStorage() {
    localStorage.setItem('lexgptQuestions', JSON.stringify(this.questions));
    RenderUtils.showNotification('Questions saved to localStorage!');
  }

  clearAllQuestions() {
    if (!confirm(`Delete all ${this.questions.length} questions?`)) {
      return;
    }
    this.questions = [];
    this.renderQuestions();
    localStorage.removeItem('lexgptQuestions');
    RenderUtils.showNotification('All questions cleared!');
  }

  clearResponses() {
    if (!confirm(`Delete all ${this.questions.length} response?`)) {
      return;
    }
    this.questions.forEach(q => {
      q.response = '';
    });
    this.renderQuestions();
    RenderUtils.showNotification('All responses cleared!');
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('lexgptQuestions');
    if (saved) {
      try {
        this.questions = JSON.parse(saved);
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

    RenderUtils.showNotification('File downloaded successfully!');
  }

  async copyToClipboard(id) {
    try {
      const responseDiv = document.querySelector(
        `[data-response="${id}"]`
      );

      if (!responseDiv) {
        RenderUtils.showNotification('No response to copy', 'error');
        return;
      }

      const html = responseDiv.innerHTML;
      const text = responseDiv.innerText;

      if (window.ClipboardItem) {
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob(
            [html],
            { type: 'text/html' }
          ),
          'text/plain': new Blob(
            [text],
            { type: 'text/plain' }
          )
        });

        await navigator.clipboard.write([clipboardItem]);
      } else {
        await navigator.clipboard.writeText(text);
      }

      RenderUtils.showNotification(
        'Response copied with formatting!'
      );
    } catch (error) {
      console.error('Copy failed:', error);
      RenderUtils.showNotification(
        'Failed to copy response',
        'error'
      );
    }
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
          <div 
            class="response-display" 
            data-response="${q.id}"
            data-raw-response="${RenderUtils.escapeHtml(q.response)}">
            ${RenderUtils.renderMarkdown(q.response)}
          </div>
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
        const questionText = document.querySelector(`[data-question="${id}"]`).value;
        this.updateQuestion(id, questionText, this.questions.find(q => q.id === id).response);
        QuestionUtils.askQuestion(this, id);
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

    container.querySelectorAll('[data-question]').forEach(textarea => {
      textarea.addEventListener('change', (e) => {
        const id = e.target.dataset.question;
        const responseText = this.questions.find(q => q.id === id)?.response || '';
        this.updateQuestion(id, e.target.value, responseText);
      });
    });
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.questionManager = new QuestionManager();
});
