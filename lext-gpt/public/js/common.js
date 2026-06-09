// Rendering utilities
const RenderUtils = {
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  decodeResponse(text) {
    if (!text) return '';

    try {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      text = textarea.value;

      text = text
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\n');

      return text;
    } catch (e) {
      console.error('Decode response error:', e);
      return text;
    }
  },

  renderMarkdown(text) {
    if (!text) {
      return '<p style="color:#999;">No response yet...</p>';
    }

    text = this.decodeResponse(text);

    try {
      if (window.marked) {
        marked.setOptions({
          breaks: true,
          gfm: true
        });
      }

      let html = window.marked
        ? marked.parse(text)
        : this.escapeHtml(text);

      if (window.DOMPurify) {
        html = DOMPurify.sanitize(html);
      }

      return html;
    } catch (error) {
      console.error('Markdown render error:', error);
      return `<pre>${this.escapeHtml(text)}</pre>`;
    }
  },

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
};
