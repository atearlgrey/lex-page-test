Cypress.Commands.add('loginLexcentra', () => {
  // Go to login page
  cy.visit(Cypress.env('LEXAUTH_PATH'));

  // Fill in email and password
  cy.get('input[placeholder="Nhập email"]').should('be.visible').type(Cypress.env('LOGIN_EMAIL'), { log: false });
  cy.get('input[id="password-field"]').should('be.visible').type(Cypress.env('LOGIN_PASS'), { log: false });

  // Submit form
  cy.get('button[type="submit"]').contains('Đăng nhập').click();

  // Verify successful login by checking URL or presence of an element
  cy.url({ timeout: 15000 }).should('include', '/home');
});
