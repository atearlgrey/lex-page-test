const normalQuestion = Cypress.env('LEXGPT_NORMAL_QUESTION');
const followupQuestion = Cypress.env('LEXGPT_FOLLOWUP_QUESTION');

export function useLexGPT(canUse) {
  // Open new AI Conversation
  cy.visitNewConversation();
  // Ask AI Box
  cy.typingAIBox(normalQuestion);
  // Wait AI Box Response
  cy.waitForAiResponse();

  if (canUse) {
    cy.log('✅ User can use LextGPT features');
    // Check box AI response
    cy.get('div.block-list-feedback').should('be.visible');
  } else {
    cy.log('❌ User cannot use LextGPT features - showing upgrade message');
    cy.get('div#modal-upgrade-plan___BV_modal_content_').should('be.visible');
  }
}

export function useLexGPTFollowup(canUse, question) {
  // Open new AI Conversation
  cy.visitNewConversation();
  // Ask AI Box
  cy.typingAIBox(question ?? followupQuestion);
  // Wait AI Box Response
  cy.waitForAiResponse();

  if (canUse) {
    cy.log('✅ User can use LextGPT features');
    // Check box AI response
    cy.get('div.follow-up').should('be.visible')
    .within(() => {
      cy.get('ul.dash-list').should('exist').should('be.visible')
      .within(() => {
        cy.get('li').should('have.length', 2);
      });
    });
  } else {
    cy.log('❌ User cannot use LextGPT features - showing upgrade message');
    cy.get('div#modal-upgrade-plan___BV_modal_content_').should('be.visible');
  }
}

export function useLexGPTUploadImage(canUse) {
  // Open new AI Conversation
  cy.visitNewConversation();
  // Upload image in AI Box
  cy.uploadAIBox("judgement.jpg", "bản án");
  // Ask AI Box
  cy.typingAIBox("Tóm tắt bản án này");
  // Wait AI Box Response
  cy.waitForAiResponse();

  if (canUse) {
    cy.log('✅ User can use LextGPT features');
    // Check box AI response
    cy.get('div.block-list-feedback').should('be.visible');
  } else {
    cy.log('❌ User cannot use LextGPT features - showing upgrade message');
    cy.get('div#modal-upgrade-plan___BV_modal_content_').should('be.visible');
  }
}

export function useLexGPTUploadDoc(canUse) {
  // Open new AI Conversation
  cy.visitNewConversation();
  // Upload Doc file in AI Box
  cy.uploadAIBox("contract_review.docx", "hợp đồng lao động");
  // Ask AI Box
  cy.typingAIBox("Tóm tắt văn bản này");
  // Wait AI Box Response
  cy.waitForAiResponse();

  if (canUse) {
    cy.log('✅ User can use LextGPT features');
    // Check box AI response
    cy.get('div.block-list-feedback').should('be.visible');
  } else {
    cy.log('❌ User cannot use LextGPT features - showing upgrade message');
    cy.get('div#modal-upgrade-plan___BV_modal_content_').should('be.visible');
  }
}

