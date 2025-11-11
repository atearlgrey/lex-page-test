Cypress.Commands.add('visitAuthPage', () => {
  cy.visit(Cypress.env('LEX_AUTH_URL') || '/auth/login');
});

Cypress.Commands.add('visitRegisterPage', () => {
  cy.visit(Cypress.env('LEX_REGISTER_URL') || '/auth/register');
});

Cypress.Commands.add('visitNewConversation', () => {
  cy.visit(Cypress.env('LEXGPT_NEW_CONVERSATION_URL') || '/assistant/lexgpt/new');
});

Cypress.Commands.add('visitUserInfoPage', () => {
  cy.visit(Cypress.env('USER_INFO_URL') || '/profile');
});

Cypress.Commands.add('visitUserPackPage', () => {
  cy.visit(Cypress.env('USER_PACK_URL') || '/profile/pack');
});

Cypress.Commands.add('visitJudgementPage', () => {
  cy.visit(Cypress.env('FIND_JUDGEMENT_URL') || '/assistant/judgement');
});

