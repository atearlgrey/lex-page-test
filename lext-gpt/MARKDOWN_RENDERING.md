# Markdown Rendering Guide

## Overview

The LexGPT Web UI now supports **Markdown rendering** for responses. When you ask questions, responses that contain Markdown syntax will be automatically formatted and displayed with proper styling.

## Features

✅ **Full Markdown Support**
- Headings (H1-H6)
- Bold and italic text
- Lists (ordered and unordered)
- Code blocks and inline code
- Blockquotes
- Tables
- Links
- Horizontal rules
- And more!

✅ **Display Format**
- Responses are rendered as formatted HTML
- Line breaks (\n) are preserved
- Markdown syntax is automatically converted to styled elements

✅ **Copy Functionality**
- When you click "Copy", the original **plain text** (not the rendered HTML) is copied to clipboard
- This ensures you get the raw response text, not the HTML markup

## Markdown Syntax Examples

### Headings
```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
```

### Lists
```markdown
- Item 1
- Item 2
  - Nested item
  
1. First
2. Second
3. Third
```

### Code
```markdown
Inline code: `const x = 5;`

Code block:
```javascript
function hello() {
  console.log("Hello, World!");
}
```
```

### Blockquotes
```markdown
> This is a quote
> It can span multiple lines
```

### Tables
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

### Links
```markdown
[Link text](https://example.com)
```

### Horizontal Rule
```markdown
---
```

## Display Examples

When you receive a response like:

```
# LexGPT Overview

LexGPT is a **legal AI assistant** that provides:

- Legal consultation
- Document analysis
- Case research

## Features

1. Quick response time
2. Accurate information
3. Cost-effective

> "LexGPT makes legal assistance accessible to everyone"

For more info, visit [our website](https://example.com)
```

It will be displayed as:

---

# LexGPT Overview

LexGPT is a **legal AI assistant** that provides:

- Legal consultation
- Document analysis
- Case research

## Features

1. Quick response time
2. Accurate information
3. Cost-effective

> "LexGPT makes legal assistance accessible to everyone"

For more info, visit [our website](https://example.com)

---

## Styling Details

### Response Display Area
- Clean, readable layout
- Light gray background (#f8f8f8)
- Scrollable if content is long (max-height: 300px)
- Proper spacing between elements

### Element Styles
- **Headings**: Different font sizes, bold weight, proper margins
- **Code**: Monospace font, gray background, dark border
- **Blockquotes**: Left border in purple (matches theme), italic text
- **Tables**: Bordered cells, header highlighting
- **Links**: Purple color, dotted underline on hover
- **Lists**: Proper indentation, bullet/number styling

## How It Works

### Backend
1. LexGPT API returns response as text with Markdown syntax
2. Response includes line breaks (\n) for structure
3. Response is sent to frontend as-is

### Frontend
1. Response is stored in the data model
2. When rendering:
   - Text is parsed using **marked.js** library
   - HTML is sanitized using **DOMPurify** for security
   - Styled with CSS for better readability
3. When copying:
   - Original plain text is copied (not HTML)
   - Preserves the raw response for documentation

## Libraries Used

### marked.js
- **Purpose**: Parse Markdown to HTML
- **CDN**: https://cdn.jsdelivr.net/npm/marked/marked.min.js
- **Configuration**: 
  - breaks: true (preserves line breaks)
  - gfm: true (GitHub Flavored Markdown)
  - headerIds: true (adds IDs to headers)

### DOMPurify
- **Purpose**: Sanitize HTML to prevent XSS attacks
- **CDN**: https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js
- **Safe tags**: p, strong, em, code, pre, blockquote, table, a, img, etc.

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Tips & Tricks

### 1. Preserve Formatting
```markdown
When copying responses, the original formatting is preserved
even though it displays as rendered markdown
```

### 2. Large Responses
- Responses with lots of content are scrollable
- Maximum height: 300px
- Overflow: auto

### 3. Inline Code vs Code Blocks
```markdown
Inline: Use single backticks `like this`
Block: Use triple backticks
```

### 4. Tables in Responses
Tables from API are automatically formatted with:
- Borders on all cells
- Header row highlighting
- Proper alignment

## Troubleshooting

### Markdown Not Rendering
1. Check browser console (F12) for errors
2. Verify marked.js is loaded
3. Clear cache and reload page

### HTML Displaying Instead of Markdown
1. marked.js may not be loaded
2. Try hard refresh (Ctrl+Shift+R)
3. Check CDN availability

### Copy Not Working
1. Verify clipboard API is enabled
2. Check browser permissions
3. Try in a different browser

### Special Characters Not Displaying
1. Ensure response is UTF-8 encoded
2. Check for encoding issues in API

## Advanced Customization

### Change Markdown Styles

Edit `views/index.ejs` style section:

```css
.response-display h1 {
  font-size: 1.5rem;  /* Change heading size */
  color: #333;        /* Change color */
  margin: 20px 0;     /* Change spacing */
}
```

### Add Custom Markdown Extensions

Modify `public/js/app.js` `renderMarkdown()` method:

```javascript
// Add custom renderer
if (window.marked) {
  const renderer = new marked.Renderer();
  renderer.heading = (token) => {
    // Custom heading rendering
  };
  window.marked.use({ renderer });
}
```

## Example Questions & Responses

### Question 1: Legal Overview
```
Q: What is legal compliance?
```

Response (with Markdown):
```markdown
# Legal Compliance Overview

Legal compliance refers to **adhering to laws, regulations, and standards** set by governing bodies.

## Key Components

1. **Regulatory Requirements**
   - Federal regulations
   - State laws
   - Local ordinances

2. **Industry Standards**
   - ISO standards
   - Professional guidelines
   - Best practices

## Benefits

- Avoid legal penalties
- Protect reputation
- Ensure ethical operations

> Compliance is not just a legal requirement, it's a business imperative
```

### Question 2: Tax Information
```
Q: What documents do I need for tax filing?
```

Response (with Markdown):
```markdown
## Required Tax Documents

| Document | Purpose |
|----------|---------|
| 1040 Form | Personal income tax return |
| W-2 Form | Wage and tax statement |
| 1099 Form | Miscellaneous income |

### Checklist
- [ ] Income statements
- [ ] Expense receipts
- [ ] Deduction documentation
- [ ] Prior year return

For questions, visit [IRS website](https://www.irs.gov)
```

## Performance

- **Marked.js**: Lightweight (~15KB)
- **DOMPurify**: Lightweight (~10KB)
- **Rendering**: Typically < 100ms for most responses
- **Memory**: No significant memory overhead

## Security

✅ **XSS Protection**
- All HTML is sanitized by DOMPurify
- Only safe HTML tags allowed
- Attributes are whitelisted

✅ **Data Protection**
- Responses are stored locally in browser
- No HTML is stored, only raw markdown text
- Original text is copied when copying responses

## Future Enhancements

- [ ] Syntax highlighting for code blocks
- [ ] LaTeX/MathJax support for equations
- [ ] Mermaid diagrams support
- [ ] Custom theme selection
- [ ] Export as PDF with formatting
- [ ] Search within rendered responses

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+C | Copy (after selecting text) |
| F5 | Reload page |
| F12 | Open developer console |

## FAQs

**Q: Does markdown work for all responses?**
A: Yes! If the API returns markdown-formatted text, it will be rendered. If it returns plain text, it will display as-is.

**Q: Can I edit the markdown?**
A: The response display is read-only. If you need to modify responses, download them and edit locally.

**Q: What if the API returns HTML instead of Markdown?**
A: DOMPurify will sanitize it, allowing safe HTML tags through while blocking dangerous ones.

**Q: Is markdown rendering slower?**
A: No, marked.js is very performant and typical responses render in < 100ms.

**Q: Can I customize the markdown rendering?**
A: Yes, see the "Advanced Customization" section above.

---

Last Updated: 2026-06-09
