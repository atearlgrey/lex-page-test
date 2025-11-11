import { useLexGPTFollowup } from '@featureCommand';

describe('LexGPT Upload', () => {
  beforeEach(() => {
    cy.session('lexgpt-session', () => {
      cy.loginLexcentra(); // hàm tự định nghĩa ở trên
    });
  });

  it('should display link follow up in chat', () => {
    useLexGPTFollowup(true);
  });
});