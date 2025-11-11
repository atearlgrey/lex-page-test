const searchUrl = Cypress.env('LEXT_SEARCH_URL');
const timeoutFindJudgement = Number(Cypress.env('FIND_JUDGEMENT_TIMEOUT') || 300000);
const judgementQuestion = Cypress.env('FIND_JUDGEMENT_QUESTION');
const judgementAdvance = Cypress.env('FIND_JUDGEMENT_ADVANCE_QUESTION');
const needUpgradeLink = Cypress.env('PLAN_PACKAGE_URL');
const needUpgradePackageMessage = "Nâng cấp gói ngay!";

export const useFindJudgementInLexGPT = (canUse) => {
  // Open new AI Conversation
  cy.visitNewConversation();

  // Ask AI
  cy.typingAIBox(judgementQuestion);

  // Wait AI Box Response
  cy.waitForAiResponse();

  if (canUse) {
    cy.log('✅ User can use Find Judgement LexGPT features');

    // Check box AI response
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
  // Open page Judgement
  cy.visitJudgementPage();

  // Search judgement
  cy.get('input.input-search-new-design')
    .eq(0)
    .should('be.visible')
    .type(judgementQuestion);

  // Click search button
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
  // Open page Judgement
  cy.visitJudgementPage();

  // Search judgement
  cy.get('input.input-search-new-design')
    .eq(0)
    .should('be.visible')
    .type("\"" + judgementAdvance + "\"");

  // Click search button
  cy.get('button.button-tim-kiem')
    .should('be.visible')
    .click();

  if (canUse) {
    cy.log('✅ User can use Find Judgement features');
    cy.url({ timeout: timeoutFindJudgement }).should('include', searchUrl);

    cy.proxySearchJudgement();

    // get list item search
    cy.get('div.list_item_search').should('be.visible')
      .within(() => {

        cy.wait('@proxySearchJudgement', { timeout: timeoutFindJudgement }).then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          cy.log('✅ API search judgement returned 200');
        });

        cy.get('.content_item_search').each(($el) => {
          // Get all text in tag <em>
          cy.wrap($el).find('span.content_judgment_text em').each(($em) => {
            const cleanText = $em.text().replace(/\s+/g, ' ').trim();
            if (canAdvance) {
              // Equals word
              expect(cleanText).to.eq(judgementAdvance);
            } else {
              // Just contain one part (e.g. 'hit' or 'each other')
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