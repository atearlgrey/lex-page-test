const urlReviewContract = Cypress.env('URL_REVIEW_CONTRACT') || '/assistant/document-review';
const apiReviewContract = Cypress.env('API_REVIEW_CONTRACT') || '**/api/document-review/v1.0/review-full';
const timeoutReviewContract = Number(Cypress.env('TIMEOUT_REVIEW_CONTRACT')) || 600000;

export function useReviewDocument(canUse) {
  // Vào trang LextGPT trước
  cy.visit(Cypress.env('URL_LEXGPT_NEW_CONVERSATION'));
  // 1️⃣ Mở tab Rà soát
  cy.contains('span', 'Rà soát')
    .should('be.visible')
    .parents('.tab-item')
    .click();

  // 2️⃣ Thao tác trong modal
  cy.get('#modal-document-review___BV_modal_content_')
    .should('be.visible')
    .within(() => {
      // Chọn loại rà soát
      cy.contains(
        'div.modal-document-review-step-1-content-item-text-label',
        'Rà soát tuân thủ pháp luật Việt Nam'
      )
        .should('be.visible')
        .click();

      // Tiếp tục bước 2
      cy.contains('button', 'Tiếp tục').should('be.visible').click();

      // Upload file
      const fileName = 'contract_review.docx';
      cy.get('input[type="file"]').attachFile(fileName, { force: true });

      cy.get('div.modal-document-review-step-2')
        .find('div.upload-area.success.upload-area-lg')
        .should('be.visible')
        .find('div.fw-bold.fs-6.line-clamp-2')
        .should('contain.text', fileName);

      // Tiếp tục bước 3
      cy.contains('button', 'Tiếp tục').should('be.visible').click();

      // Nhập thông tin bổ sung
      cy.get('div.review-internal-description textarea')
        .eq(1)
        .should('be.visible')
        .type('Người lao động');

      cy.intercept('POST', apiReviewContract).as('reviewContract');

      // Tiếp tục đến trang document-review
      cy.contains('button', 'Tiếp tục').should('be.visible').click();
    });
  if (canUse) {
    cy.log('✅ User can use Review Document features');
    cy.wait('@reviewContract', { timeout: timeoutReviewContract }).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.log('✅ API drafting contract returned 200');
    });

    // 3️⃣ Đợi chuyển hướng sang trang document-review
    cy.url({ timeout: timeoutReviewContract }).should('include', urlReviewContract);
    cy.log('✅ Redirected to ' + urlReviewContract);

  } else {
    cy.log('❌ User cannot use Review Document features - showing upgrade message');
    cy.get('div#modal-upgrade-plan___BV_modal_content_').should('be.visible');
  }
}