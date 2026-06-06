// ✅ Xử lý chuỗi tiền tệ/số có dấu nghìn (phù hợp cả định dạng US và EU)
export function parseAmount(raw) {
  const s = String(raw).trim().replace(/\s/g, '').replace(/[^0-9.,-]/g, '');
  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');

  if (lastDot !== -1 && lastComma !== -1) {
    // Có cả . và , → xác định dấu thập phân là ký tự xuất hiện sau cùng
    return lastDot > lastComma
      ? parseFloat(s.replace(/,/g, '')) // "9,969.02" → 9969.02
      : parseFloat(s.replace(/\./g, '').replace(',', '.')); // "9.969,02" → 9969.02
  }

  if (s.includes(',')) {
    const [, frac = ''] = s.split(',');
    return frac.length === 3
      ? parseFloat(s.replace(/,/g, '')) // "9,969" → 9969
      : parseFloat(s.replace(',', '.')); // "9,02" → 9.02
  }

  return parseFloat(s); // chỉ có số hoặc có .
}
