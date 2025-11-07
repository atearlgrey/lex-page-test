describe('LexGPT Ask Questions', () => {
  beforeEach(() => {
    cy.session('lexgpt-session', () => {
      cy.loginLexcentra(); // hàm tự định nghĩa ở trên
    });
  });
  
  before(() => {
    cy.fixture('questions.json').then((data) => {
      cy.wrap(data).as('questions');
    });
  });

  it('asks each question sequentially and saves conversation URLs', function () {
    this.questions.forEach((q, i) => {
      const question = q.question;
      cy.log(`⚙️ Start Question ${i + 1}: ${question}`);

      // Open new conversation page
      cy.visit(Cypress.env('LEXGPT_PATH'));

      cy.get('#customTextarea')
        .should('be.visible')
        .clear()
        .invoke('val', question)   // set value question to textarea with \n character
        .trigger('input');         // check react input change

      cy.get('#customTextarea').should('have.value', question);

      cy.get("button[class='button-send-ai']").click();

      // Wait redirect to /assistant/lexgpt/{id} page
      cy.url({ timeout: 60000 }).should('match', /\/assistant\/lexgpt\/[0-9a-f-]{36}$/);

      // Write conversation URL to file
      cy.url().then((currentUrl) => {
        cy.log(`✅ Question ${i + 1}: ${question}`);
        cy.log('Conversation URL:', currentUrl);

        cy.writeFile('cypress/downloads/conversation_urls.txt', `${question}\n${currentUrl}\n\n`, {
          flag: 'a+',
        });
      });
    });
  });
});
