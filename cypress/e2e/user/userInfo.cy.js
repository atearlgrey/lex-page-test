describe('User Info Page', () => {
  beforeEach(() => {
    cy.session('lexgpt-session', () => {
      cy.loginSpecialUserLexcentra(
        Cypress.env('USER_INFO_USERNAME'),
        Cypress.env('USER_INFO_PASSWORD')
      );
    });
  });


  it('should display user information correctly', () => {

    cy.visit(Cypress.env('URL_USER_INFO') || '/profile');
    cy.get('div#new_user div.profile-tab-new').within(() => {
      cy.get('div').eq(0).within(() => {
        cy.get('span').should('contain.text', Cypress.env('USER_INFO_NAME')).and('not.be.empty');
      });

      cy.get('div').eq(1).within(() => {
        cy.get('span').should('contain.text', Cypress.env('USER_INFO_EMAIL')).and('not.be.empty');
      });

      if (Cypress.env('USER_INFO_DATE_OF_BIRTH')) {
        cy.get('div').eq(2).within(() => {
          cy.get('span').should('contain.text', Cypress.env('USER_INFO_DATE_OF_BIRTH')).and('not.be.empty');
        });
      }

      cy.get('div').eq(3).within(() => {
        cy.get('span').should('contain.text', Cypress.env('USER_INFO_PHONE')).and('not.be.empty');
      });

      if (Cypress.env('USER_INFO_JOB')) {
        cy.get('div').eq(4).within(() => {
          cy.get('span').should('contain.text', Cypress.env('USER_INFO_JOB')).and('not.be.empty');
        });
      }
    });
  });

  it('should display package information correctly', () => {
    cy.visit(Cypress.env('URL_USER_PACK') || '/profile/pack');
    cy.get('div#profile-pack').within(() => {
      cy.get('.status-point')
        .closest('.d-flex').within(() => {
          cy.get('.large_text').invoke('text').then((text) => {
            cy.log('Tên gói hiện tại:', text.trim());
            expect(text.trim().toUpperCase()).to.contain(Cypress.env('USER_INFO_PACKAGE').toUpperCase());
          });
          cy.get('span.status-tag').should('be.visible').contains('Còn hiệu lực');
        });
    });
  });

  it('should display button to buy new package', () => {
    cy.visit(Cypress.env('URL_USER_PACK') || '/profile/pack');

    cy.get('div#profile-pack').within(() => {
      cy.contains('button', 'Mua gói mới').should('be.visible');
    });
  });

  it('should display histoy package correctly', () => {
    cy.visit(Cypress.env('URL_USER_PACK') || '/profile/pack');
    cy.get('.manager_table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
  });
});