import { useLexGPT, useFindJudgementInLexGPT } from '@featureCommand';

describe('LexGPT Ask Questions', () => {
  beforeEach(() => {
    cy.session('lexgpt-session', () => {
      cy.loginLexcentra(); // hàm tự định nghĩa ở trên
    });
  });

  it('should chat normal', () => {
    useLexGPT(true);
  });

  it('should chat find judgement', () => {
    useFindJudgementInLexGPT(true);
  });
});