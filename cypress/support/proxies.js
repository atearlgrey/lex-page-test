// cypress/support/proxies.js
const apiDraftingContract = Cypress.env('DRAFTING_CONTRACT_API') || '**/api/drafting/v1.0/contract';
const apiReviewContract = Cypress.env('REVIEW_CONTRACT_API') || '**/api/document-review/v1.0/review-full';
const searchApi = Cypress.env('FIND_JUDGEMENT_API') || '**/api/search/v3.0*';

Cypress.Commands.add('proxyRegister', () => {
  cy.intercept('POST', '**/api/auth/user/v2.0/register').as('proxyRegister');
});

Cypress.Commands.add('proxyLexGPT', () => {
  cy.intercept('POST', Cypress.env('LEXGPT_API')).as('proxyLexGPT');
});

Cypress.Commands.add('proxyDraftingContract', () => {
  cy.intercept('POST', apiDraftingContract).as('proxyDraftingContract');
});

Cypress.Commands.add('proxyReviewContract', () => {
  cy.intercept('POST', apiReviewContract).as('proxyReviewContract');
});

Cypress.Commands.add('proxySearchJudgement', () => {
  cy.intercept('GET', searchApi).as('proxySearchJudgement');
});