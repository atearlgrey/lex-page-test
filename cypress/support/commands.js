import { parseAmount } from './utils/numberUtils';

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

Cypress.Commands.add('loginSpecialUserLexcentra', (username, password) => {
  // Go to login page
  cy.visit(Cypress.env('LEXAUTH_PATH'));

  // Fill in email and password
  cy.get('input[placeholder="Nhập email"]').should('be.visible').type(username, { log: false });
  cy.get('input[id="password-field"]').should('be.visible').type(password, { log: false });

  // Submit form
  cy.get('button[type="submit"]').contains('Đăng nhập').click();

  // Verify successful login by checking URL or presence of an element
  cy.url({ timeout: 15000 }).should('include', '/home');
});

Cypress.Commands.add('logoutLexcentra', () => {
  // Mở menu người dùng
  cy.get('div.user-avatar').should('be.visible').click();
});

Cypress.Commands.add('checkCreditLexGPT', (minCredit) => {
  // Mở menu người dùng
  cy.visit(Cypress.env('URL_LEXGPT_NEW_CONVERSATION'));

  cy.get('img[alt="credit-icon"]').should('be.visible');
  cy.get('img[alt="credit-icon"]')
    .closest('div.d-flex')
    .find('span.fw-bold.fs-5\\.5.lh-1')
    .should('be.visible')
    .invoke('text')
    .then((text) => {
      const credit = parseAmount(text.trim());
      expect(credit).to.be.least(minCredit);
    });
});

Cypress.Commands.add('typingAIBox', (question) => {
  cy.get('#customTextarea')
    .should('be.visible')
    .clear()
    .invoke('val', question)
    .trigger('input');

  cy.get('#customTextarea').should('have.value', question);
  cy.get("button.button-send-ai").click();
});

Cypress.Commands.add('waitForAiResponse', (timeout = Cypress.env('URL_LEXTGPT_TIMEOUT') || 120000) => {

  const timeoutMs = Number(timeout);
  cy.get('button.button-send-ai').should('exist');

  cy.log('⏳ Đợi AI trả lời xong...');
  cy.get('button.button-send-ai', { timeout: timeoutMs })
    .should(($btn) => {
      expect($btn).not.to.have.class('button-send-ai-disabled');
    });

  cy.log('✅ AI đã trả lời xong');

  // Check that markdown-wrapper exists and is visible
  cy.get('div.markdown-wrapper', { timeout: 30000 })
    .should('exist')
    .and('be.visible');

  // Scroll to bottom of the markdown-wrapper to ensure full content is visible
  cy.get('div.markdown-wrapper')
    .find('*:last')
    .scrollIntoView({ duration: 3000 });
});