import './commands';

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
