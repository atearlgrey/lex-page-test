const normalQuestion = "Dạo này em thấy nhiều livestream đăng thông tin giật gân, lấy nước mắt của cộng đồng mạng và rồi sau đó bị nhà chức trách xác định là nội dung sai sự thật. Xin hỏi livestream nói dối về sự việc liên quan chính mình có vị phạt không, hay chỉ bị phạt khi nói xấu, bịa đặt với người khác, ảnh hưởng cá nhân, cơ quan tổ chức nào đó? Xin hỏi người livestream sai sự thật sẽ bị xử lý thế nào? Người biết sai phạm của họ thì báo với cơ quan nào? Mục đích, tính chất livestream có ảnh hưởng đến hình thức, tội danh họ bị quy kết xử lý không? Xin được luật sư tư vấn, cảnh báo cụ thể. Em xin cảm ơn!"

export function useLexGPT(canUse) {

  // Vào trang LextGPT trước
  cy.visit(Cypress.env('URL_LEXGPT_NEW_CONVERSATION'));

  // Gõ câu hỏi thường
  cy.typingAIBox(normalQuestion);

  // 1️⃣ Chờ redirect sang trang chat cụ thể
  cy.url({ timeout: 60000 }).should('match', /\/assistant\/lexgpt\/[0-9a-f-]{36}$/);

  cy.waitForAiResponse();
  if (canUse) {
    cy.log('✅ User can use LextGPT features');

    // Kiểm tra box sau khi hoàn tất
    cy.contains('Câu hỏi bạn có thể quan tâm', { timeout: 30000 })
      .scrollIntoView({ duration: 3000 })
      .should('be.visible');
  } else {
    cy.log('❌ User cannot use LextGPT features - showing upgrade message');
  }
}

