const judgementQuestion = "bản án về tàng trữ trái phép chất ma túy số lượng lớn";
const needUpgradeLink = "/plan-packages";
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
  } else {
    cy.log('❌ User cannot use Find Judgement - showing upgrade message');
  }
}