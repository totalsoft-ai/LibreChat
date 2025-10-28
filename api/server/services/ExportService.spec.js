const ExportService = require('./ExportService');
const { getConvo } = require('~/models/Conversation');
const { getMessages } = require('~/models/Message');

// Mock dependencies
jest.mock('~/models/Conversation');
jest.mock('~/models/Message');
jest.mock('@librechat/data-schemas', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('ExportService', () => {
  const mockUserId = 'user-123';
  const mockConversationId = '550e8400-e29b-41d4-a716-446655440000';

  const mockConversation = {
    conversationId: mockConversationId,
    title: 'Test Conversation',
    model: 'gpt-4',
    endpoint: 'openAI',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T12:00:00Z'),
  };

  const mockMessages = [
    {
      messageId: 'msg-1',
      conversationId: mockConversationId,
      isCreatedByUser: true,
      text: 'Hello, how are you?',
      model: 'gpt-4',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      parentMessageId: null,
      tokenCount: 10,
    },
    {
      messageId: 'msg-2',
      conversationId: mockConversationId,
      isCreatedByUser: false,
      text: 'I am doing well, thank you! How can I help you today?',
      model: 'gpt-4',
      createdAt: new Date('2024-01-01T10:01:00Z'),
      parentMessageId: 'msg-1',
      tokenCount: 15,
      feedback: {
        rating: 'thumbsUp',
        tag: 'helpful',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getConvo.mockResolvedValue(mockConversation);
    getMessages.mockResolvedValue(mockMessages);
  });

  describe('getConversationData', () => {
    it('should fetch conversation and messages', async () => {
      const result = await ExportService.getConversationData(mockUserId, mockConversationId);

      expect(getConvo).toHaveBeenCalledWith(mockUserId, mockConversationId);
      expect(getMessages).toHaveBeenCalledWith(
        {
          conversationId: mockConversationId,
          user: mockUserId,
        },
        null,
      );
      expect(result).toEqual({
        conversation: mockConversation,
        messages: mockMessages,
      });
    });

    it('should throw error if conversation not found', async () => {
      getConvo.mockResolvedValue(null);

      await expect(
        ExportService.getConversationData(mockUserId, mockConversationId),
      ).rejects.toThrow('Conversation not found');
    });
  });

  describe('exportToJSON', () => {
    it('should export conversation to JSON format', async () => {
      const result = await ExportService.exportToJSON(mockUserId, mockConversationId);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('contentType', 'application/json');
      expect(result.filename).toMatch(/^conversation_.*\.json$/);

      const exportData = JSON.parse(result.data);
      expect(exportData).toHaveProperty('conversation');
      expect(exportData).toHaveProperty('messages');
      expect(exportData).toHaveProperty('exportedAt');
      expect(exportData).toHaveProperty('version', '1.0');
      expect(exportData.conversation.title).toBe('Test Conversation');
      expect(exportData.messages).toHaveLength(2);
      expect(exportData.messages[0].role).toBe('user');
      expect(exportData.messages[1].role).toBe('assistant');
      expect(exportData.messages[1].feedback).toEqual({
        rating: 'thumbsUp',
        tag: 'helpful',
      });
    });
  });

  describe('exportToMarkdown', () => {
    it('should export conversation to Markdown format', async () => {
      const result = await ExportService.exportToMarkdown(mockUserId, mockConversationId);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('contentType', 'text/markdown');
      expect(result.filename).toMatch(/^conversation_.*\.md$/);

      const markdown = result.data;
      expect(markdown).toContain('# Test Conversation');
      expect(markdown).toContain('**Model:** gpt-4');
      expect(markdown).toContain('**User**');
      expect(markdown).toContain('**Assistant**');
      expect(markdown).toContain('Hello, how are you?');
      expect(markdown).toContain('I am doing well, thank you!');
      expect(markdown).toContain('Feedback: 👍');
    });

    it('should handle conversation without title', async () => {
      getConvo.mockResolvedValue({ ...mockConversation, title: null });

      const result = await ExportService.exportToMarkdown(mockUserId, mockConversationId);
      expect(result.data).toContain('# Untitled Conversation');
    });
  });

  describe('exportToHTML', () => {
    it('should export conversation to HTML format', async () => {
      const result = await ExportService.exportToHTML(mockUserId, mockConversationId);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('contentType', 'text/html');
      expect(result.filename).toMatch(/^conversation_.*\.html$/);

      const html = result.data;
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Test Conversation</title>');
      expect(html).toContain('<h1>Test Conversation</h1>');
      expect(html).toContain('class="message-role user"');
      expect(html).toContain('class="message-role assistant"');
      expect(html).toContain('Hello, how are you?');
      expect(html).toContain('I am doing well, thank you!');
    });

    it('should escape HTML special characters', async () => {
      getMessages.mockResolvedValue([
        {
          messageId: 'msg-1',
          conversationId: mockConversationId,
          isCreatedByUser: true,
          text: '<script>alert("XSS")</script>',
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
      ]);

      const result = await ExportService.exportToHTML(mockUserId, mockConversationId);
      expect(result.data).not.toContain('<script>');
      expect(result.data).toContain('&lt;script&gt;');
    });
  });

  describe('exportToPDF', () => {
    it('should throw error if puppeteer is not installed', async () => {
      // Mock require to throw error
      const originalRequire = require;
      jest.mock('puppeteer', () => {
        throw new Error('Cannot find module');
      }, { virtual: true });

      await expect(ExportService.exportToPDF(mockUserId, mockConversationId)).rejects.toThrow(
        'Puppeteer is not installed',
      );
    });
  });

  describe('exportConversation', () => {
    it('should route to JSON export for json format', async () => {
      const result = await ExportService.exportConversation(mockUserId, mockConversationId, 'json');
      expect(result.contentType).toBe('application/json');
    });

    it('should route to Markdown export for markdown format', async () => {
      const result = await ExportService.exportConversation(
        mockUserId,
        mockConversationId,
        'markdown',
      );
      expect(result.contentType).toBe('text/markdown');
    });

    it('should route to Markdown export for md format', async () => {
      const result = await ExportService.exportConversation(mockUserId, mockConversationId, 'md');
      expect(result.contentType).toBe('text/markdown');
    });

    it('should route to HTML export for html format', async () => {
      const result = await ExportService.exportConversation(mockUserId, mockConversationId, 'html');
      expect(result.contentType).toBe('text/html');
    });

    it('should default to JSON format', async () => {
      const result = await ExportService.exportConversation(mockUserId, mockConversationId);
      expect(result.contentType).toBe('application/json');
    });

    it('should throw error for unsupported format', async () => {
      await expect(
        ExportService.exportConversation(mockUserId, mockConversationId, 'xml'),
      ).rejects.toThrow('Unsupported export format: xml');
    });
  });
});
