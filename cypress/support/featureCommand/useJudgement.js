const searchUrl = Cypress.env('LEXT_SEARCH_PATH');
const searchApi = Cypress.env('API_FIND_JUDGEMENT');
const timeoutFindJudgement = Number(Cypress.env('TIMEOUT_FIND_JUDGEMENT') || 300000);
const judgementQuestion = Cypress.env('FIND_JUDGEMENT_QUESTION');
const judgementAdvance = Cypress.env('FIND_JUDGEMENT_ADVANCE_QUESTION');
const needUpgradeLink = Cypress.env('URL_PLAN_PACKAGE');
const needUpgradePackageMessage = "Nâng cấp gói ngay!";

export const useFindJudgementInLexGPT = (canUse) => {
  // Vào trang LextGPT trước
  cy.visit(Cypress.env('URL_LEXGPT_NEW_CONVERSATION'));

  // Gõ câu hỏi tìm bản án
  cy.typingAIBox(judgementQuestion);

  // Wait redirect to /assistant/lexgpt/{id} page
  cy.url({ timeout: 60000 }).should('match', /\/assistant\/lexgpt\/[0-9a-f-]{36}$/);

  // Chờ AI trả lời xong
  cy.waitForAiResponse();

  if (canUse) {
    cy.log('✅ User can use Find Judgement LexGPT features');

    // Kiểm tra box AI trả lời
    cy.get('div.block-list-feedback').should('be.visible');
  } else {
    cy.log('❌ User cannot use Find Judgement LexGPT features - showing upgrade message');

    // Kiểm tra box sau khi hoàn tất
    cy.get('div.markdown-wrapper a', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .and('have.attr', 'href', needUpgradeLink)
      .and('contain.text', needUpgradePackageMessage);
  }
}

export const useFindJudgement = (canUse) => {
  // Vào trang Judgement tìm kiếm bản án
  cy.visit(Cypress.env('URL_FIND_JUDGEMENT'));

  // Nhập từ khóa tìm bản án
  cy.get('input.input-search-new-design')
    .eq(0)
    .should('be.visible')
    .type(judgementQuestion);

  // Click nút Tìm kiếm
  cy.get('button.button-tim-kiem')
    .should('be.visible')
    .click();

  if (canUse) {
    cy.log('✅ User can use Find Judgement features');
    cy.url({ timeout: timeoutFindJudgement }).should('include', searchUrl)
  } else {
    cy.log('❌ User cannot use Find Judgement - showing upgrade message');
    cy.get('div#modal-upgrade-plan___BV_modal_content_').should('be.visible');
  }
}

export const useFindJudgementAdvance = (canUse, canAdvance) => {
  // Vào trang Judgement tìm kiếm bản án
  cy.visit(Cypress.env('URL_FIND_JUDGEMENT'));

  // Nhập từ khóa tìm bản án
  cy.get('input.input-search-new-design')
    .eq(0)
    .should('be.visible')
    .type("\"" + judgementAdvance + "\"");

  // Click nút Tìm kiếm
  cy.get('button.button-tim-kiem')
    .should('be.visible')
    .click();

  if (canUse) {
    cy.log('✅ User can use Find Judgement features');
    cy.url({ timeout: timeoutFindJudgement }).should('include', searchUrl);

    cy.intercept('GET', searchApi).as('searchJudgement');

    // get list item search
    cy.get('div.list_item_search').should('be.visible')
      .within(() => {

        cy.wait('@searchJudgement', { timeout: timeoutFindJudgement }).then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          cy.log('✅ API search judgement returned 200');
        });

        cy.get('.content_item_search').each(($el) => {
          // Lấy toàn bộ text bên trong thẻ <em>
          cy.wrap($el).find('span.content_judgment_text em').each(($em) => {
            const cleanText = $em.text().replace(/\s+/g, ' ').trim();
            if (canAdvance) {
              // Yêu cầu chính xác
              expect(cleanText).to.eq(judgementAdvance);
            } else {
              // Chỉ cần chứa một phần (ví dụ: 'đánh' hoặc 'nhau')
              const keywords = judgementAdvance.split(' ');
              const matched = keywords.some((k) => cleanText.includes(k));
              expect(matched, `phải chứa 1 trong các từ: ${keywords.join(', ')}`).to.be.true;
            }
          });
        });
      });

  } else {
    cy.log('❌ User cannot use Find Judgement - showing upgrade message');
    cy.get('div#modal-upgrade-plan___BV_modal_content_').should('be.visible');
  }
}