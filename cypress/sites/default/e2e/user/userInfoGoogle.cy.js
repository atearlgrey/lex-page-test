describe('User Info Page', () => {
  beforeEach(() => {
    // cy.session('lexgpt-session', () => {
    //   cy.loginWithMockGoogle();
    // });
    cy.session('lexcentra-google-session', () => {
      cy.visit('https://user-stg.lexcentra.ai/login');
      // thực hiện login Google 1 lần bằng tay

      cy.get('button[class="css-button-google"]').click();
    });
  });

  it('should display user information correctly', () => {
    cy.visitUserInfoPage();
    cy.get('div#new_user div.profile-tab-new').within(() => {
      cy.get('div').eq(0).within(() => {
        cy.get('span').should('contain.text', Cypress.env('USER_GOOGLE_INFO_NAME')).and('not.be.empty');
      });

      cy.get('div').eq(1).within(() => {
        cy.get('span').should('contain.text', Cypress.env('USER_GOOGLE_INFO_EMAIL')).and('not.be.empty');
      });

      if (Cypress.env('USER_GOOGLE_INFO_DATE_OF_BIRTH')) {
        cy.get('div').eq(2).within(() => {
          cy.get('span').should('contain.text', Cypress.env('USER_GOOGLE_INFO_DATE_OF_BIRTH')).and('not.be.empty');
        });
      }

      if (Cypress.env('USER_GOOGLE_INFO_PHONE')) {
        cy.get('div').eq(3).within(() => {
          cy.get('span').should('contain.text', Cypress.env('USER_GOOGLE_INFO_PHONE')).and('not.be.empty');
        });
      }
      if (Cypress.env('USER_GOOGLE_INFO_JOB')) {
        cy.get('div').eq(4).within(() => {
          cy.get('span').should('contain.text', Cypress.env('USER_GOOGLE_INFO_JOB')).and('not.be.empty');
        });
      }
    });
  });

  it('should display package information correctly', () => {
    cy.visitUserPackPage();
    cy.get('div#profile-pack').within(() => {
      cy.get('.status-point')
        .closest('.d-flex').within(() => {
          cy.get('.large_text').invoke('text').then((text) => {
            cy.log('Tên gói hiện tại:', text.trim());
            expect(text.trim().toUpperCase()).to.contain(Cypress.env('USER_GOOGLE_INFO_PACKAGE').toUpperCase());
          });
          cy.get('span.status-tag').should('be.visible').contains('Còn hiệu lực');
        });
    });
  });

  it('should display button to buy new package', () => {
    cy.visitUserPackPage();

    cy.get('div#profile-pack').within(() => {
      cy.contains('button', 'Mua gói mới').should('be.visible');
    });
  });

  it('should display histoy package correctly', () => {
    cy.visitUserPackPage();
    cy.get('.manager_table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
  });
});