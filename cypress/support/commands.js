import { parseAmount } from './utils/numberUtils';

Cypress.Commands.add('loginWithMockGoogle', () => {
  const accessToken = 'Bearer%20' + Cypress.env('USER_GOOGLE_JWT_TOKEN');

  cy.setCookie('auth_token.local', accessToken, {
    domain: 'user-stg.lexcentra.ai',
    path: '/',
    secure: true,
    httpOnly: false,
  });
});

Cypress.Commands.add('loginLexcentra', () => {
  // Go to login page
  cy.visitAuthPage();

  // Fill in email and password
  cy.get('input[placeholder="Nhập email"]').should('be.visible').type(Cypress.env('LOGIN_EMAIL'), { log: false });
  cy.get('input[id="password-field"]').should('be.visible').type(Cypress.env('LOGIN_PASS'), { log: false });

  cy.proxyLogin();

  // Submit form
  cy.get('button[type="submit"]').contains('Đăng nhập').click();

  // Verify successful login by checking URL or presence of an element
  cy.waitForAPIResponse('@proxyLogin', 200);
  // cy.url({ timeout: 15000 }).should('include', '/home');
});

Cypress.Commands.add('loginSpecialUserLexcentra', (username, password) => {
  // Go to login page
  cy.visitAuthPage();

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
  cy.visitNewConversation();

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

  cy.proxyLexGPT();

  cy.get("button.button-send-ai").click();
});

Cypress.Commands.add('uploadAIBox', (fileName, fileDescription) => {
  cy.get('div.box-message-new-ai')
    .should('exist')
    .should('be.visible').
    within(() => {
      cy.get('button.btn-show-in-assistant').should('be.visible').click();
    });

  cy.get('div#modal-upload-file-lexgpt___BV_modal_content_')
    .should('exist')
    .should('be.visible')
    .within(() => {
      cy.get('div#modal-upload-file-lexgpt___BV_modal_body_').should('be.visible')
        .within(() => {
          cy.get('input[type="file"]').attachFile(fileName, { force: true });
          cy.get('textarea.file-details-textarea').type(fileDescription);
        });

      cy.get('#modal-upload-file-lexgpt___BV_modal_footer_')
        .should('exist')
        .should('be.visible')
        .within(() => {
          cy.get('button.btn-upload-lexgpt').click();
        });
    });
});

Cypress.Commands.add('waitForAiResponse', (timeout = Cypress.env('LEXGPT_TIMEOUT') || 120000) => {
  const timeoutMs = Number(timeout);
  cy.url({ timeout: 60000 }).should('match', /\/assistant\/lexgpt\/[0-9a-f-]{36}$/);

  cy.get('button.button-send-ai').should('exist');
  cy.log('⏳ Đợi AI trả lời xong...');
  cy.wait('@proxyLexGPT', { timeout: timeoutMs }).then((interception) => {

    const { statusCode, body } = interception.response;
    cy.log('📦 Response body:', JSON.stringify(body, null, 2));
    // Nếu muốn log ra console (đầy đủ hơn, có thể expand trong DevTools)
    console.log('📨 Request:', interception.request);
    console.log('📩 Response:', interception.response);

    expect(statusCode).to.eq(200);

    cy.log('✅ AI đã trả lời xong');
    cy.get('button.button-send-ai', { timeout: timeoutMs })
      .should(($btn) => {
        expect($btn).not.to.have.class('button-send-ai-disabled');
      });
  });

  // Check that markdown-wrapper exists and is visible
  cy.get('div.markdown-wrapper', { timeout: 30000 })
    .should('exist')
    .and('be.visible');

  // Scroll to bottom of the markdown-wrapper to ensure full content is visible
  cy.get('div.markdown-wrapper')
    .find('*:last')
    .scrollIntoView({ duration: 3000 });
});

Cypress.Commands.add('waitForRegisterAPIResponse', (proxyName, statusCodeExpect, timeout = 3000) => {
  cy.wait(proxyName ?? '@proxyRegister', { timeout: timeout }).then((interception) => {
    console.log('📨 Request:', interception.request);
    const { statusCode, body } = interception.response;
    cy.log('📦 Response body:', JSON.stringify(body, null, 2));
    console.log('📩 Response:', interception.response);

    expect(statusCode).to.eq(statusCodeExpect);
  });
});

Cypress.Commands.add('waitForAPIResponse', (proxyName, statusCodeExpect, timeout = 3000) => {
  cy.wait(proxyName, { timeout: timeout }).then((interception) => {
    console.log('📨 Request:', interception.request);
    const { statusCode, body } = interception.response;
    cy.log('📦 Response body:', JSON.stringify(body, null, 2));
    console.log('📩 Response:', interception.response);

    expect(statusCode).to.eq(statusCodeExpect);
  });
});