// cypress/e2e/auth/register.cy.js

describe('User Registration - Lexengine', () => {
  beforeEach(() => {
    cy.visitRegisterPage();
    cy.proxyRegister();
  });

  const email = `user${Date.now()}@gmail.com`;

  // ========== 1. UI TESTS ==========
  context('UI Display', () => {
    it('TC01 - Should display registration form correctly', () => {
      cy.contains('Đăng ký tài khoản').should('be.visible');
      cy.get('input[name="name"]').should('exist');
      cy.get('input[name="email"]').should('exist');
      cy.get('input[name="phone"]').should('exist');
      cy.get('#password-field').should('exist');
      cy.get('#confirm-password-field').should('exist');
      cy.get('button[type="submit"]').should('contain', 'Tiếp theo');
      cy.contains('Đăng ký bằng Google').should('be.visible');
    });
  });

  // ========== 2. LINK TESTS ==========
  context('Navigation Links', () => {
    it('TC02 - Google Sign Up button should redirect to Google OAuth', () => {
      cy.contains('Đăng ký bằng Google').should('have.attr', 'type', 'button').click();
      cy.url().should('include', 'accounts.google.com');
    });

    it('TC03 - Login link should redirect to /auth/login', () => {
      cy.contains('Đăng nhập ngay').should('have.attr', 'href', '/auth/login').click();
      cy.url().should('include', '/auth/login');
    });
  });

  // ========== 3. VALIDATION TESTS ==========
  context('Form Validation', () => {
    it('TC04 - Should show errors when form is empty', () => {
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 400);
    });

    it('TC05 - Should show error when Name is missing', () => {
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="phone"]').type('0912345678');
      cy.get('#password-field').type('Abc123!@');
      cy.get('#confirm-password-field').type('Abc123!@');
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 400);
    });

    it('TC06 - Should show error when Email is missing', () => {
      cy.get('input[name="name"]').type('Nguyen Van A');
      cy.get('input[name="phone"]').type('0912345678');
      cy.get('#password-field').type('Abc123!@');
      cy.get('#confirm-password-field').type('Abc123!@');
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 400);
    });

    it('TC07 - Should show error when Email format is invalid', () => {
      cy.get('input[name="name"]').type('Nguyen Van A');
      cy.get('input[name="email"]').type('abc@com');
      cy.get('input[name="phone"]').type('0912345678');
      cy.get('#password-field').type('Abc123!@');
      cy.get('#confirm-password-field').type('Abc123!@');
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 400);
    });

    it('TC08 - Should accept valid Email', () => {
      cy.get('input[name="email"]').type('testuser@gmail.com');
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 400);
    });

    it('TC09 - Should show error when Phone is missing', () => {
      cy.get('input[name="name"]').type('Nguyen Van A');
      cy.get('input[name="email"]').type(email);
      cy.get('#password-field').type('Abc123!@');
      cy.get('#confirm-password-field').type('Abc123!@');
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 400);
    });

    it('TC10 - Should show error when Phone format is invalid', () => {
      cy.get('input[name="name"]').type('Nguyen Van A');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="phone"]').type('abc123');
      cy.get('#password-field').type('Abc123!@');
      cy.get('#confirm-password-field').type('Abc123!@');
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 400);
    });

    it('TC11 - Should show error when Password is missing', () => {
      cy.get('input[name="name"]').type('Nguyen Van A');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="phone"]').type('0912345678');
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 400);
    });

    const passwords = [
      { value: 'Abc12!@', msg: 'less than 8 characters' },
      { value: 'abc123!@', msg: 'missing uppercase letter' },
      { value: 'ABC123!@', msg: 'missing lowercase letter' },
      { value: 'Abc12345', msg: 'missing special character' },
    ];

    passwords.forEach(({ value, msg }, idx) => {
      it(`TC1${2 + idx} - Invalid password: ${msg}`, () => {
        cy.get('input[name="name"]').type('Nguyen Van A');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="phone"]').type('0912345678');
        cy.get('#password-field').clear().type(value);
        cy.get('#confirm-password-field').type(value);
        cy.get('button[type="submit"]').click();
        cy.contains('Mật khẩu').should('be.visible');
        cy.waitForRegisterAPIResponse('@proxyRegister', 400);
      });
    });

    it('TC16 - Should show error when Confirm Password does not match', () => {
      cy.get('input[name="name"]').type('Nguyen Van A');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="phone"]').type('0912345678');
      cy.get('#password-field').type('Abc123!@');
      cy.get('#confirm-password-field').type('Abc123@@');
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 400);
    });

    it('TC17 - Should register successfully with valid data', () => {
      cy.get('input[name="name"]').type('Nguyen Van A');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="phone"]').type('0912345678');
      cy.get('#password-field').type('Abc123!@');
      cy.get('#confirm-password-field').type('Abc123!@');
      cy.get('button[type="submit"]').click();
      cy.waitForRegisterAPIResponse('@proxyRegister', 200);
      cy.url().should('include', '/home');
    });
  });
});
