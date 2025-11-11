function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

describe('LexGPT Ask Questions (multi-file, paged)', () => {
  let files = [];
  let allData = [];

  before(() => {
    const dir = 'cypress/fixtures/lexgpt';
    const fileName = Cypress.env('fileName') || null;

    cy.task('readLexgptFiles', { dir, fileName }).then(({ files: f, data }) => {
      files = f;
      allData = data;
    });
  });

  it('Run questions by page', () => {
    const pages = chunkArray(allData, 10);
    cy.session('lexgpt-session', () => cy.loginLexcentra());

    pages.forEach((page, pageIndex) => {
      page.forEach((q, i) => {
        const question = q.question;
        const qIndex = pageIndex * 10 + i + 1;

        cy.log(`⚙️ ${files.join(', ')} | Q${qIndex}: ${question}`);
        cy.visitNewConversation();
        cy.typingAIBox(question);
        cy.get('button.button-send-ai').click();
        cy.url({ timeout: 60000 }).should('match', /\/assistant\/lexgpt\/[0-9a-f-]{36}$/);

        cy.url().then((url) => {
          const baseName = files.map(f => f.replace('.json', '')).join('_');
          const dir = `cypress/output/lexgpt/${baseName}`;
          const fileName = `conversation_${baseName}_page${pageIndex + 1}.txt`;

          // ✅ Ghi ra thư mục output/ (không bị Cypress xoá)
          cy.task('writeConversationFile', {
            dir,
            fileName,
            content: `Q${qIndex}: ${question}\n${url}\n`,
          });
        });

        cy.wait(1500);
      });
    });
  });
});
