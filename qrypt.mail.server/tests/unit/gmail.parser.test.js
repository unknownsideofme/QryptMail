import { jest } from '@jest/globals';

// 1. Mock the googleapis module
jest.unstable_mockModule('googleapis', () => {
  const mockMessagesGet = jest.fn();
  return {
    google: {
      auth: {
        OAuth2: jest.fn().mockImplementation(() => ({
          setCredentials: jest.fn()
        }))
      },
      gmail: jest.fn().mockImplementation(() => ({
        users: {
          messages: {
            get: mockMessagesGet
          }
        }
      }))
    }
  };
});

// 2. Import modules dynamically after mocking
const { default: GmailProvider } = await import('../../src/providers/mail/gmail.provider.js');
const { google } = await import('googleapis');

describe('Gmail Provider Parser Deep Inspection Tests', () => {
  let provider;
  const mockAccessToken = 'test-token';

  beforeEach(() => {
    provider = new GmailProvider();
    jest.clearAllMocks();
  });

  it('should parse simple flat text messages (no multipart)', async () => {
    const mockGet = google.gmail().users.messages.get;
    mockGet.mockResolvedValue({
      data: {
        id: 'msg-flat',
        threadId: 'thread-flat',
        snippet: 'A simple email',
        payload: {
          headers: [
            { name: 'Subject', value: 'Flat Email' },
            { name: 'From', value: 'Alice <alice@test.com>' },
            { name: 'To', value: 'Bob <bob@test.com>' }
          ],
          body: {
            data: Buffer.from('Hello simple world!').toString('base64url')
          }
        }
      }
    });

    const parsed = await provider.getMessage(mockAccessToken, 'msg-flat');
    expect(parsed.body).toBe('Hello simple world!');
    expect(parsed.attachments).toEqual([]);
    expect(parsed.cc).toBe('');
    expect(parsed.bcc).toBe('');
  });

  it('should prioritize HTML content in multipart/alternative nested blocks', async () => {
    const mockGet = google.gmail().users.messages.get;
    mockGet.mockResolvedValue({
      data: {
        id: 'msg-alt',
        threadId: 'thread-alt',
        snippet: 'Snippet text',
        payload: {
          headers: [
            { name: 'Subject', value: 'Alt Email' },
            { name: 'From', value: 'Alice <alice@test.com>' },
            { name: 'Cc', value: 'cc@test.com' }
          ],
          parts: [
            {
              mimeType: 'text/plain',
              body: {
                data: Buffer.from('Plain Text Body').toString('base64url')
              }
            },
            {
              mimeType: 'text/html',
              body: {
                data: Buffer.from('<h1>HTML Body</h1>').toString('base64url')
              }
            }
          ]
        }
      }
    });

    const parsed = await provider.getMessage(mockAccessToken, 'msg-alt');
    // Prioritizes HTML body over plain text body
    expect(parsed.body).toBe('<h1>HTML Body</h1>');
    expect(parsed.cc).toBe('cc@test.com');
  });

  it('should recursively parse deeply nested multipart/mixed structures with attachments', async () => {
    const mockGet = google.gmail().users.messages.get;
    mockGet.mockResolvedValue({
      data: {
        id: 'msg-complex',
        threadId: 'thread-complex',
        snippet: 'Deeply nested mail',
        payload: {
          headers: [
            { name: 'Subject', value: 'Complex Email' },
            { name: 'From', value: 'sender@test.com' },
            { name: 'Bcc', value: 'bcc@test.com' }
          ],
          parts: [
            {
              // Nested multipart/alternative block
              mimeType: 'multipart/alternative',
              parts: [
                {
                  mimeType: 'text/plain',
                  body: {
                    data: Buffer.from('Nested plain body').toString('base64url')
                  }
                },
                {
                  mimeType: 'text/html',
                  body: {
                    data: Buffer.from('<p>Nested html body</p>').toString('base64url')
                  }
                }
              ]
            },
            {
              // Attachment part
              filename: 'report.pdf',
              mimeType: 'application/pdf',
              body: {
                attachmentId: 'att-pdf-123',
                size: 204800
              }
            }
          ]
        }
      }
    });

    const parsed = await provider.getMessage(mockAccessToken, 'msg-complex');
    expect(parsed.body).toBe('<p>Nested html body</p>');
    expect(parsed.bcc).toBe('bcc@test.com');
    expect(parsed.attachments).toHaveLength(1);
    expect(parsed.attachments[0]).toEqual({
      id: 'att-pdf-123',
      filename: 'report.pdf',
      mimeType: 'application/pdf',
      size: 204800
    });
  });
});
