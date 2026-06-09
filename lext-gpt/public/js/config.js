// Configuration management
const ConfigManager = {
  saveConfig() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const token = document.getElementById('authToken').value.trim();

    localStorage.setItem('lexgpt_api_url', apiUrl);
    localStorage.setItem('lexgpt_token', token);

    RenderUtils.showNotification('Configuration saved!');
  },

  loadConfig() {
    const apiUrl = localStorage.getItem('lexgpt_api_url');
    const token = localStorage.getItem('lexgpt_token');
    if (apiUrl) document.getElementById('apiUrl').value = apiUrl;
    if (token) document.getElementById('authToken').value = token;
  },

  getApiUrl() {
    return document.getElementById('apiUrl').value.trim();
  },

  getToken() {
    return document.getElementById('authToken').value.trim();
  },

  isConfigValid() {
    return this.getApiUrl() && this.getToken();
  }
};
