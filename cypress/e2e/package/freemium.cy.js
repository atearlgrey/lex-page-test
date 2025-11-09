import { useLexGPT, useFindJudgementInLexGPT, useFindJudgement, useDraftDocument, useReviewDocument } from '@featureCommand';
import { featureMatrix, canUseFeature } from './featureMatrix';

const packageType = 'freemium';

describe('Freemium Package', () => {
  beforeEach(() => {
    cy.session('lexgpt-session', () => {
      cy.loginSpecialUserLexcentra(
        Cypress.env('PACKAGE_FREEMIUM_USERNAME'),
        Cypress.env('PACKAGE_FREEMIUM_PASSWORD')
      );
    });
  });

  before(() => {
    cy.log(`Using package: ${packageType}`);
    cy.log(`Available features:`);
    Object.keys(featureMatrix).forEach((featureKey) => {
      const isAvailable = canUseFeature(packageType, featureKey);
      cy.log(`- ${featureMatrix[featureKey].name}: ${isAvailable ? 'Available' : 'Not Available'}`);
    });
  });

  it('user has cent', () => {
    cy.checkCreditLexGPT(0);
  });

  it(`user uses ${packageType} package can ask normal question`, () => {
    const featureKey = 'lexGPT';
    useLexGPT(canUseFeature(packageType, featureKey));
  });

  it(`user uses ${packageType} package can not using search judgement`, () => {
    const featureKey = 'findJudgementInLexGPT';
    useFindJudgementInLexGPT(canUseFeature(packageType, featureKey));
  });

  it(`user uses ${packageType} package can not using find judgement`, () => {
    const featureKey = 'findJudgement';
    useFindJudgement(canUseFeature(packageType, featureKey));
  });

  it(`user uses ${packageType} package using document review`, () => {
    const featureKey = 'reviewDocument';
    useReviewDocument(canUseFeature(packageType, featureKey));
  });

  it(`user uses ${packageType} package using document draft`, () => {
    const featureKey = 'draftDocument';
    useDraftDocument(canUseFeature(packageType, featureKey));
  });
});