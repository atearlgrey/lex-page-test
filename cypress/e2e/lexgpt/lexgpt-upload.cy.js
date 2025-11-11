import { useLexGPTUploadImage, useLexGPTUploadDoc } from '@featureCommand';

describe('LexGPT Upload', () => {
  beforeEach(() => {
    cy.session('lexgpt-session', () => {
      cy.loginLexcentra(); // hàm tự định nghĩa ở trên
    });
  });

  it('should chat upload image', () => {
    useLexGPTUploadImage(true);
  });

  it('should chat upload doc', () => {
    useLexGPTUploadDoc(true);
  });
});