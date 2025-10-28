# Conversation Export API

LibreChat provides a powerful conversation export API that allows users to export their conversations in multiple formats.

## Features

- **Multiple Formats**: JSON, Markdown, HTML, and PDF
- **Full Data Export**: Includes all messages, metadata, and user feedback
- **Authenticated Access**: Requires JWT authentication
- **Security**: HTML escaping to prevent XSS attacks
- **Flexible**: Easy to add new export formats

## API Endpoints

### Export Conversation

```
GET /api/export/:conversationId?format={format}
```

**Authentication**: Required (JWT)

**Parameters**:
- `conversationId` (path, required): The UUID of the conversation to export
- `format` (query, optional): Export format - `json`, `markdown`, `md`, `html`, or `pdf` (default: `json`)

**Response**: File download with appropriate Content-Type and Content-Disposition headers

**Example Requests**:

```bash
# Export as JSON (default)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3080/api/export/550e8400-e29b-41d4-a716-446655440000 \
  -o conversation.json

# Export as Markdown
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3080/api/export/550e8400-e29b-41d4-a716-446655440000?format=markdown" \
  -o conversation.md

# Export as PDF
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3080/api/export/550e8400-e29b-41d4-a716-446655440000?format=pdf" \
  -o conversation.pdf
```

**Error Responses**:
- `400 Bad Request`: Invalid conversation ID or format
- `404 Not Found`: Conversation not found or no access
- `500 Internal Server Error`: Export failed

### Get Supported Formats

```
GET /api/export/
```

**Authentication**: Required (JWT)

**Response**:
```json
{
  "formats": [
    {
      "format": "json",
      "description": "JSON format with full conversation data including metadata",
      "contentType": "application/json",
      "available": true
    },
    {
      "format": "markdown",
      "description": "Markdown format for easy reading and editing",
      "contentType": "text/markdown",
      "available": true
    },
    {
      "format": "html",
      "description": "HTML format with styled output",
      "contentType": "text/html",
      "available": true
    },
    {
      "format": "pdf",
      "description": "PDF format for printing and archiving",
      "contentType": "application/pdf",
      "available": true
    }
  ],
  "defaultFormat": "json"
}
```

## Export Formats

### JSON Format

**Content-Type**: `application/json`
**Filename**: `conversation_{id}_{timestamp}.json`

**Structure**:
```json
{
  "conversation": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My Conversation",
    "model": "gpt-4",
    "endpoint": "openAI",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Hello!",
      "model": "gpt-4",
      "timestamp": "2024-01-01T10:00:00.000Z",
      "parentMessageId": null,
      "tokenCount": 5,
      "feedback": null
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Hi! How can I help you?",
      "model": "gpt-4",
      "timestamp": "2024-01-01T10:01:00.000Z",
      "parentMessageId": "msg-1",
      "tokenCount": 10,
      "feedback": {
        "rating": "thumbsUp",
        "tag": "helpful"
      }
    }
  ],
  "exportedAt": "2024-01-01T13:00:00.000Z",
  "version": "1.0"
}
```

**Use Cases**:
- Programmatic processing
- Data migration
- Backup and archiving
- Integration with other tools

### Markdown Format

**Content-Type**: `text/markdown`
**Filename**: `conversation_{id}_{timestamp}.md`

**Example Output**:
```markdown
# My Conversation

**Model:** gpt-4
**Created:** Jan 1, 2024, 10:00 AM
**Updated:** Jan 1, 2024, 12:00 PM

---

### **User** - Jan 1, 2024, 10:00 AM

Hello!

---

### **Assistant** - Jan 1, 2024, 10:01 AM

Hi! How can I help you?

*Feedback: 👍 (helpful)*

---

*Exported on Jan 1, 2024, 01:00 PM*
```

**Use Cases**:
- Easy reading and editing
- Documentation
- Sharing with non-technical users
- Version control (Git)

### HTML Format

**Content-Type**: `text/html`
**Filename**: `conversation_{id}_{timestamp}.html`

**Features**:
- Styled output with CSS
- Responsive design
- Color-coded roles (user/assistant)
- Timestamps and metadata
- Feedback indicators

**Use Cases**:
- Web viewing
- Sharing via browser
- Printing
- Archiving with formatting

### PDF Format

**Content-Type**: `application/pdf`
**Filename**: `conversation_{id}_{timestamp}.pdf`

**Features**:
- Professional formatting
- A4 page size
- Print-ready
- Margins optimized for reading
- Based on HTML format with PDF rendering

**Requirements**:
- Requires `puppeteer` package: `npm install puppeteer`
- Headless Chrome/Chromium

**Use Cases**:
- Official documentation
- Legal records
- Offline archiving
- Printing

## Implementation Details

### Service: ExportService

**Location**: `api/server/services/ExportService.js`

**Methods**:
- `getConversationData(userId, conversationId)`: Fetches conversation and messages
- `exportToJSON(userId, conversationId)`: Exports as JSON
- `exportToMarkdown(userId, conversationId)`: Exports as Markdown
- `exportToHTML(userId, conversationId)`: Exports as HTML
- `exportToPDF(userId, conversationId)`: Exports as PDF (requires puppeteer)
- `exportConversation(userId, conversationId, format)`: Main export method

### Routes: export.js

**Location**: `api/server/routes/export.js`

**Middleware**:
- `requireJwtAuth`: Ensures user is authenticated
- Zod validation for parameters

### Security

1. **Authentication**: All endpoints require JWT authentication
2. **Authorization**: Users can only export their own conversations
3. **HTML Escaping**: All user content is escaped in HTML/PDF exports
4. **Input Validation**: Conversation IDs validated with Zod (UUID format)
5. **Error Handling**: Proper error messages without exposing sensitive data

### Performance

1. **Database Queries**: Uses optimized queries with `.lean()` for better performance
2. **Field Selection**: Fetches only necessary message fields
3. **Memory**: Streams PDF generation to avoid memory issues
4. **Caching**: No caching implemented (exports are dynamic)

## Testing

**Test File**: `api/server/services/ExportService.spec.js`

**Coverage**:
- ✅ Fetch conversation data
- ✅ JSON export format
- ✅ Markdown export format
- ✅ HTML export format
- ✅ PDF export (mock test)
- ✅ Format routing
- ✅ Error handling (conversation not found, invalid format)
- ✅ HTML escaping (XSS prevention)
- ✅ Feedback preservation

**Run Tests**:
```bash
npm run test:api -- ExportService
```

## Adding New Formats

To add a new export format:

1. Add a new method to `ExportService`:
```javascript
async exportToXML(userId, conversationId) {
  const { conversation, messages } = await this.getConversationData(userId, conversationId);

  // Generate XML
  const xml = generateXML(conversation, messages);

  return {
    data: xml,
    filename: `conversation_${conversationId}_${Date.now()}.xml`,
    contentType: 'application/xml',
  };
}
```

2. Update the `exportConversation` method:
```javascript
case 'xml':
  return await this.exportToXML(userId, conversationId);
```

3. Update the validation schema in `export.js`:
```javascript
format: z.enum(['json', 'markdown', 'md', 'html', 'pdf', 'xml']).default('json'),
```

4. Add tests for the new format

5. Update documentation

## Troubleshooting

### PDF Export Not Available

**Error**: "Puppeteer is not installed"

**Solution**:
```bash
npm install puppeteer
```

### Conversation Not Found

**Error**: 404 "Conversation not found"

**Causes**:
- Invalid conversation ID
- Conversation belongs to another user
- Conversation was deleted

**Solution**: Verify the conversation ID and user ownership

### Export Timeout

**Problem**: Large conversations timing out

**Solution**:
- Increase request timeout in Nginx/reverse proxy
- Consider pagination for very large conversations
- Export in chunks for conversations with 1000+ messages

## Future Enhancements

- [ ] Add CSV export format
- [ ] Support batch export (multiple conversations)
- [ ] Add export scheduling/automation
- [ ] Implement export caching
- [ ] Add export preview endpoint
- [ ] Support custom templates for PDF/HTML
- [ ] Add filters (date range, message type)
- [ ] Implement streaming for very large exports
- [ ] Add compression (ZIP) for multiple files
- [ ] Support exporting with attachments

## Related Documentation

- [CLAUDE_BACKEND.md](../CLAUDE_BACKEND.md) - Backend architecture
- [TODO_BACKEND.md](../TODO_BACKEND.md) - Backend tasks
- [API Documentation](./api-docs.md) - General API docs
