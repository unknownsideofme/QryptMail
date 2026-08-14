import { jest } from '@jest/globals';

// 1. Mock the googleapis module using unstable_mockModule for ES Modules support
jest.unstable_mockModule('googleapis', () => {
  const mockMessagesList = jest.fn();
  const mockMessagesGet = jest.fn();
  const mockMessagesSend = jest.fn();

  return {
    google: {
      auth: {
        OAuth2: jest.fn().mockImplementation(() => ({
          setCredentials: jest.fn(),
          generateAuthUrl: jest.fn(),
          getToken: jest.fn(),
          refreshAccessToken: jest.fn()
        }))
      },
      gmail: jest.fn().mockImplementation(() => ({
        users: {
          messages: {
            list: mockMessagesList,
            get: mockMessagesGet,
            send: mockMessagesSend
          }
        }
      }))
    }
  };
});

// 2. Dynamically import modules after mocking
const { default: GmailProvider } = await import('../../src/providers/mail/gmail.provider.js');
const { google } = await import('googleapis');

describe('GmailProvider Unit Tests', () => {
  let provider;
  const mockAccessToken = 'mock-access-token';

  beforeEach(() => {
    provider = new GmailProvider();
    jest.clearAllMocks();
  });

  describe('getInbox', () => {
    it('should retrieve list of messages and fetch metadata for each', async () => {
      const mockList = google.gmail().users.messages.list;
      const mockGet = google.gmail().users.messages.get;

      mockList.mockResolvedValue({
        data: {
          messages: [
            { id: 'msg1', threadId: 'thread1' },
            { id: 'msg2', threadId: 'thread2' }
          ]
        }
      });

      mockGet.mockImplementation(({ id }) => {
        const headers = [
          { name: 'Subject', value: `Subject for ${id}` },
          { name: 'From', value: `Sender for ${id}` },
          { name: 'Date', value: 'Fri, 14 Aug 2026 12:00:00 GMT' }
        ];
        return Promise.resolve({
          data: {
            id,
            threadId: `thread_${id}`,
            snippet: `Snippet for ${id}`,
            payload: { headers }
          }
        });
      });

      const inbox = await provider.getInbox(mockAccessToken, { limit: 5 });

      expect(inbox).toHaveLength(2);
      expect(inbox[0]).toEqual({
        id: 'msg1',
        threadId: 'thread1',
        from: 'Sender for msg1',
        subject: 'Subject for msg1',
        date: 'Fri, 14 Aug 2026 12:00:00 GMT',
        snippet: 'Snippet for msg1',
        isUnread: false,
        starred: false,
        hasAttachments: false,
        attachmentCount: 0
      });
      expect(mockList).toHaveBeenCalledWith({
        userId: 'me',
        q: 'label:INBOX',
        maxResults: 5
      });
    });
  });

  describe('sendMessage', () => {
    it('should compile, base64 url-encode, and transmit MIME message payload', async () => {
      const mockSend = google.gmail().users.messages.send;
      mockSend.mockResolvedValue({
        data: {
          id: 'new_msg_id',
          threadId: 'new_thread_id'
        }
      });

      const result = await provider.sendMessage(mockAccessToken, {
        to: ['bob@example.com'],
        subject: 'Hello',
        body: 'This is the body.'
      });

      expect(result).toEqual({
        id: 'new_msg_id',
        threadId: 'new_thread_id'
      });
      expect(mockSend).toHaveBeenCalled();
    });
  });
});
