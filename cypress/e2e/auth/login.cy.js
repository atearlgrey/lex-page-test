describe('Login Page', () => {
  beforeEach(() => {
    cy.visitAuthPage();
  });

  it('should display the login form', () => {
    cy.get('div[class="form_login_content"]').should('be.visible').within(() => {
      cy.get('button[class="css-button-google"]').should('be.visible');
      cy.get('input[placeholder="Nhập email"]').should('be.visible');
      cy.get('input[id="password-field"]').should('be.visible');
      cy.get('button[type="submit"]').contains('Đăng nhập').should('be.visible');
    });
  });

  it('should show error message on empty username', () => {
    cy.get('button[type="submit"]').contains('Đăng nhập').click();
    cy.get('div.toast-custom-block-body span').should('contain.text', 'Vui lòng nhập email');;
  });

  it('should show error message on empty password', () => {
    cy.get('input[placeholder="Nhập email"]').type('invalidUser@gmail.com');
    cy.get('button[type="submit"]').contains('Đăng nhập').click();
    cy.get('input[name="password"]')
      .closest('div.has-error')
      .find('small.help-block')
      .should('contain.text', 'Vui lòng nhập mật khẩu');
  });

  it('should show error message on invalid format user', () => {
    cy.get('input[placeholder="Nhập email"]').type('invalidUser');
    cy.get('input[id="password-field"]').type('wrongPassword');
    cy.get('button[type="submit"]').contains('Đăng nhập').click();

    cy.get('div.toast-custom-block-body span').should('contain.text', 'Email không đúng định dạng');;
  });

  it('should show error message on invalid credentials', () => {
    cy.get('input[placeholder="Nhập email"]').type('invalidUser@gmail.com');
    cy.get('input[id="password-field"]').type('wrongPassword');
    cy.get('button[type="submit"]').contains('Đăng nhập').click();

    cy.get('div.toast-custom-block-body span').should('contain.text', 'Email hoặc mật khẩu không đúng');;
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[placeholder="Nhập email"]').type(Cypress.env('LOGIN_EMAIL'), { log: false });
    cy.get('input[id="password-field"]').type(Cypress.env('LOGIN_PASS'), { log: false });
    cy.get('button[type="submit"]').contains('Đăng nhập').click();

    // Verify successful login by checking URL or presence of an element
    cy.url({ timeout: 15000 }).should('include', '/home');
  });
});