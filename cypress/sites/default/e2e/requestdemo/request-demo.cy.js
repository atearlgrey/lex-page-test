describe("Request Demo Page", () => {
  beforeEach(() => {
    cy.visitRequestDemoPage();
    cy.proxyRequestDemo();
  });

  const email = `user${Date.now()}@gmail.com`;
  const requiredFields = [
    { field: "name", opts: { skipName: true }, msg: "Vui lòng nhập họ và tên" },
    { field: "email", opts: { skipEmail: true }, msg: "Vui lòng nhập email" },
    { field: "phone", opts: { skipPhone: true }, msg: "Vui lòng nhập số điện thoại" },
    { field: "job", opts: { skipJob: true }, msg: "Công việc là bắt buộc" },
    { field: "company name", opts: { skipCompany: true }, msg: "Tên công ty là bắt buộc" },
    { field: "company size", opts: { skipCompanySize: true }, msg: "Quy mô công ty là bắt buộc" }
  ];

  const invalidFieldsMessage = {
    email: 'Email không đúng định dạng',
    phone: 'Số điện thoại không đúng định dạng',
  };

  const submitMessage = {
    success: 'LEXcentra đã nhận được yêu cầu của bạn. Đội ngũ tư vấn viên sẽ liên hệ để hỗ trợ bạn.',
    duplicate: 'Bạn đã từng gửi yêu cầu trước đây. Không thể gửi thêm yêu cầu.'
  }

  const fillValidForm = ({
    skipName = false,
    skipEmail = false,
    skipPhone = false,
    skipJob = false,
    skipCompany = false,
    skipCompanySize = false,
    skipDescription = false
  } = {}) => {

    if (!skipName) {
      cy.get("input[name='name']").clear().type("Nguyen Van A");
    }

    if (!skipEmail) {
      cy.get("input[name='email']").clear().type(email);
    }

    if (!skipPhone) {
      cy.get("input[name='phone']").clear().type("0123456789");
    }

    if (!skipJob) {
      cy.get(".vue-single-select .multiselect").first().click();
      cy.contains("Luật sư nội bộ / Pháp chế doanh nghiệp").click();
    }

    if (!skipCompany) {
      cy.get("input[name='company_name']").clear().type("Lexcentra");
    }

    if (!skipCompanySize) {
      cy.get(".z-index-for-company-size .multiselect").click();
      cy.contains("1-30 người").click();
    }

    if (!skipDescription) {
      cy.get("textarea").clear().type("I would like to try the system for evaluation.");
    }
  };

  // ----------------------------
  // 1. Required Field Validation
  // ----------------------------
  context("Required Field Validation", () => {
    it("TC01 - All fields empty should show all required errors", () => {
      cy.get("button.submit-btn").click();
      cy.waitForAPIResponse('@proxyRequestDemo', 400);
    });

    requiredFields.forEach((testCase, index) => {
      it(`TC0${index + 2} - Missing '${testCase.field}' should show required message`, () => {
        cy.get("form.demo-form").should("be.visible").within(() => {
          fillValidForm(testCase.opts);

          cy.get("button.submit-btn").click();
          cy.waitForAPIResponse('@proxyRequestDemo', 400);

          cy.contains(testCase.msg).should("be.visible");
        });
      });
    });
  });

  // ----------------------------
  // 2. Max Length Validation
  // ----------------------------
  context('Max length validation', () => {
    it("TC01 - Should not allow input beyond maxlength constraints", () => {
      cy.get("form.demo-form").should("be.visible").within(() => {
        cy.get("input[name='name']")
          .type("a".repeat(60))
          .should("have.value", "a".repeat(50));

        cy.get("input[name='email']")
          .type("a".repeat(300))
          .should("have.value", "a".repeat(255));

        cy.get("input[name='company_name']")
          .type("a".repeat(200))
          .should("have.value", "a".repeat(150));

        cy.get("textarea")
          .type("b".repeat(600))
          .should("have.value", "b".repeat(500));
      });
    });
  });
  context('Format validation', () => {
    // ----------------------------
    // 3. Email Format Validation
    // ----------------------------
    it("TC01 - Invalid email format should show error", () => {
      cy.get("form.demo-form").should("be.visible").within(() => {
        fillValidForm();
        cy.get("input[name='email']").type("abc123");
        cy.get("button.submit-btn").click();

        cy.waitForAPIResponse('@proxyRequestDemo', 400);
        cy.contains(invalidFieldsMessage.email).should("exist");
      });
    });

    // ----------------------------
    // 4. Phone Format Validation
    // ----------------------------
    it("TC02 - Phone number with letters should show error", () => {
      cy.get("form.demo-form").should("be.visible").within(() => {
        fillValidForm();
        cy.get("input[name='phone']").type("12345abc");
        cy.get("button.submit-btn").click();

        cy.waitForAPIResponse('@proxyRequestDemo', 400);
        cy.contains(invalidFieldsMessage.phone).should("exist");
      });
    });

    it("TC03 - Phone must have 10 digits starting with 0", () => {
      cy.get("form.demo-form").should("be.visible").within(() => {
        fillValidForm();

        cy.get("input[name='phone']").clear().type("012345678");
        cy.get("button.submit-btn").click();

        cy.waitForAPIResponse('@proxyRequestDemo', 400);
        cy.contains(invalidFieldsMessage.phone).should("exist");
      });
    });

    it("TC04 - Phone must have 11 digits starting with 84", () => {
      cy.get("form.demo-form").should("be.visible").within(() => {
        fillValidForm();

        cy.get("input[name='phone']").type("841234567890");
        cy.get("button.submit-btn").click();

        cy.waitForAPIResponse('@proxyRequestDemo', 400);
        cy.contains(invalidFieldsMessage.phone).should("exist");
      });
    });
  });

  // ----------------------------
  // 6. Successful Submit
  // ----------------------------
  context("Submit Form", () => {
    it("TC01 - Successful submit (first submission)", () => {
      cy.get("form.demo-form").should("be.visible").within(() => {
        fillValidForm();
        cy.get("button.submit-btn").click();
        cy.waitForAPIResponse('@proxyRequestDemo', 200);
      });

      cy.get("div.toast-custom-block-body span")
        .contains(submitMessage.success)
        .should("exist");
    });

    // ----------------------------
    // 7. Block repeated submission
    // ----------------------------
    it("TC02 - Failed submit if already submitted", () => {
      cy.get("form.demo-form").should("be.visible").within(() => {
        fillValidForm();
        cy.get("button.submit-btn").click();
        cy.waitForAPIResponse('@proxyRequestDemo', 400);
      });

      cy.get("div.toast-custom-block-body")
        .contains(submitMessage.duplicate)
        .should("exist");
    });
  });
});
