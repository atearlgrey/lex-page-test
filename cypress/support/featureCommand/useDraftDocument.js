const urlDraftContract = Cypress.env('URL_DRAFT_CONTRACT') || '/assistant/document-drafting';
const apiDraftingContract = Cypress.env('API_DRAFTING_CONTRACT') || '**/api/drafting/v1.0/contract';
const timeoutDraftContract = Number(Cypress.env('TIMEOUT_DRAFT_CONTRACT')) || 600000;

export function useDraftDocument(canUse) {
  cy.visit(Cypress.env('URL_LEXGPT_NEW_CONVERSATION'));
  // 1️⃣ Mở tab Soạn thảo
  cy.contains('span', 'Soạn thảo')
    .should('be.visible')
    .parents('.tab-item')
    .click();

  // 2️⃣ Thao tác trong modal
  cy.get('#modal-soan-thao___BV_modal_content_')
    .should('be.visible')
    .within(() => {

      // Chọn ngôn ngữ
      cy.get('div.dropdown-menu-language-selector', { timeout: 10000 })
        .should('exist')
        .and('be.visible');

      cy.contains('div.dropdown-item', 'Tiếng Việt')
        .should('be.visible')
        .click();

      // Tiếp tục bước 2
      cy.contains('button', 'Tiếp tục').should('be.visible').click();

      cy.get('div.modal-soan-thao-step-2')
        .find('div.modal-soan-thao-step-2-content-item-choose-upload')
        .eq(1)
        .should('be.visible')
        .click();

      // Tiếp tục bước 3
      cy.contains('button', 'Tiếp tục').should('be.visible').click();

      // Nhập thông tin bổ sung
      cy.get('div.review-internal-description textarea')
        .eq(0)
        .should('be.visible')
        .type('Soạn hợp đồng lao động');

      cy.get('div.review-internal-description textarea')
        .eq(1)
        .should('be.visible')
        .type('Người lao động');

      // Tiếp tục đến trang document-review
      cy.contains('button', 'Tiếp tục').should('be.visible').click();
    });
  if (canUse) {
    cy.log('✅ User can use Draft Document features');

    // Chờ hiển thị header "Dàn ý phác thảo"
    cy.contains('h4', 'Dàn ý phác thảo', { timeout: timeoutDraftContract }) // đợi header hiển thị
      .should('be.visible');

    cy.intercept('POST', apiDraftingContract).as('draftContract');

    // Khi thấy rồi -> click "Duyệt dàn ý"
    cy.contains('button', 'Duyệt dàn ý')
      .should('be.visible')
      .click();
      
    cy.wait('@draftContract', { timeout: timeoutDraftContract }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('✅ API drafting contract returned 200');
    });

    // 3️⃣ Đợi chuyển hướng sang trang document-drafting
    cy.url({ timeout: timeoutDraftContract }).should('include', urlDraftContract);
    cy.log('✅ Redirected to ' + urlDraftContract);
  } else {
    cy.log('❌ User cannot use Draft Document features - showing upgrade message');
    cy.get('div#modal-upgrade-plan___BV_modal_content_').should('be.visible');
  }
}