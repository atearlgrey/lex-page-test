import 'cypress-file-upload';
import './commands';
import './pages';
import './proxies';

Cypress.on('uncaught:exception', (err, runnable) => {
  // Chặn Cypress fail khi web bị lỗi frontend
  console.warn('Ignoring uncaught exception:', err.message);
  return false;
});

beforeEach(() => {
  // cy.session('lexgpt-session', () => {
  //   cy.loginLexcentra(); // hàm tự định nghĩa ở trên
  // });
});

afterEach(function () {
  if (this.currentTest.state === 'failed') {
    const testName = this.currentTest.title.replace(/[^a-z0-9]/gi, '_');
    cy.screenshot(`failed-${testName}`, { capture: 'runner' });
  }
});
