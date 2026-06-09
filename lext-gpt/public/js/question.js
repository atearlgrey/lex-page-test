// Question management utilities
const QuestionUtils = {
  parseExcelRows(text) {
    const rows = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (insideQuotes && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
        continue;
      }

      if (char === '\n' && !insideQuotes) {
        const row = current.trim();
        if (row) {
          rows.push(row);
        }
        current = '';
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      rows.push(current.trim());
    }

    return rows;
  },

  importFromExcel(questionManager) {
    const textarea = document.getElementById('bulkImportArea');
    const rawText = textarea.value;
    if (!rawText.trim()) {
      RenderUtils.showNotification('No data to import', 'error');
      return;
    }

    const rows = this.parseExcelRows(rawText);
    if (!rows.length) {
      RenderUtils.showNotification('No valid questions found', 'error');
      return;
    }

    rows.forEach(question => { questionManager.addQuestion(question, ''); });
    textarea.value = '';
    RenderUtils.showNotification(`${rows.length} question(s) imported`);
    const modal = bootstrap.Modal.getInstance(document.getElementById('importExcelModal'));
    if (modal) {
      modal.hide();
    }
  },

  async askQuestion(questionManager, id) {
    const question = questionManager.questions.find(q => q.id === id);
    if (!question) return;

    const apiUrl = ConfigManager.getApiUrl();
    const token = ConfigManager.getToken();

    if (!ConfigManager.isConfigValid()) {
      RenderUtils.showNotification('Please fill in API URL and Token', 'error');
      return;
    }

    if (!question.question.trim()) {
      RenderUtils.showNotification('Please enter a question', 'error');
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
        questionManager.renderQuestions();
        RenderUtils.showNotification('Question answered successfully!');
      } else {
        RenderUtils.showNotification(data.message || 'Error asking question', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      RenderUtils.showNotification(error.message, 'error');
    } finally {
      btn.classList.remove('loading');
      spinner.style.display = 'none';
      icon.style.display = 'inline';
      btn.disabled = false;
    }
  },

  async askBatch(questionManager) {
    const apiUrl = ConfigManager.getApiUrl();
    const token = ConfigManager.getToken();

    if (!ConfigManager.isConfigValid()) {
      RenderUtils.showNotification('Please fill in API URL and Token', 'error');
      return;
    }

    const questionsToAsk = questionManager.questions.filter(q => q.question.trim());

    if (questionsToAsk.length === 0) {
      RenderUtils.showNotification('No questions to ask', 'error');
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
        data.results.forEach((result, index) => {
          if (index < questionsToAsk.length) {
            questionsToAsk[index].response = result.response;
          }
        });
        questionManager.renderQuestions();
        RenderUtils.showNotification(`Successfully answered ${questionsToAsk.length} question(s)!`);
      } else {
        RenderUtils.showNotification(data.message || 'Error asking batch questions', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      RenderUtils.showNotification(error.message, 'error');
    } finally {
      btn.classList.remove('loading');
      spinner.style.display = 'none';
      icon.style.display = 'inline';
      btn.disabled = false;
    }
  }
};
