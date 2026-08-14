import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmailProvider, useEmails } from './EmailContext';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('EmailContext Progressive Loading Deep Inspection Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('qrypt_authenticated', 'true');
    localStorage.setItem('qrypt_is_demo', 'false');
    localStorage.setItem('qrypt_app_token', 'test-api-token');
    localStorage.setItem('qrypt_user_email', 'user@test.com');
    
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should request and parse Level 1 inbox metadata and transition pagination tokens', async () => {
    // 1. Mock list response with nextPageToken
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          messages: [
            { id: '1', from: 'Alice <alice@test.com>', subject: 'Hello 1', date: '2026-08-14T12:00:00Z', snippet: 'Preview 1' },
            { id: '2', from: 'Bob <bob@test.com>', subject: 'Hello 2', date: '2026-08-14T12:05:00Z', snippet: 'Preview 2' }
          ],
          nextPageToken: 'page-token-abc'
        }
      })
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let contextValue;
    const TestComponent = () => {
      contextValue = useEmails();
      return null;
    };

    await act(async () => {
      root.render(
        <EmailProvider>
          <TestComponent />
        </EmailProvider>
      );
    });

    // Verify loading parameters
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/mail/inbox?email=user%40test.com&folder=inbox&limit=20'),
      expect.any(Object)
    );

    // Verify context loaded values
    expect(contextValue.emails).toHaveLength(2);
    expect(contextValue.emails[0].id).toBe('2'); // Sorted descending
    expect(contextValue.emails[0].isFullBodyLoaded).toBe(false); // Only snippet loaded initially
    expect(contextValue.nextPageToken).toBe('page-token-abc');

    // 2. Mock loadMore response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          messages: [
            { id: '3', from: 'Charlie <charlie@test.com>', subject: 'Hello 3', date: '2026-08-14T12:10:00Z', snippet: 'Preview 3' }
          ],
          nextPageToken: null
        }
      })
    });

    await act(async () => {
      await contextValue.fetchEmails(true); // loadMore = true
    });

    // Verify pageToken was appended to query
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining('&pageToken=page-token-abc'),
      expect.any(Object)
    );

    // Verify new items were appended to state
    expect(contextValue.emails).toHaveLength(3);
    expect(contextValue.emails[0].id).toBe('3'); // Sorted descending (most recent first)
    expect(contextValue.nextPageToken).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('should fetch Level 2 full details on selectEmail and update state', async () => {
    // 1. Seed initial metadata email
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          messages: [
            { id: '1', from: 'Alice <alice@test.com>', subject: 'Hello 1', date: '2026-08-14T12:00:00Z', snippet: 'Preview 1' }
          ],
          nextPageToken: null
        }
      })
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let contextValue;
    const TestComponent = () => {
      contextValue = useEmails();
      return null;
    };

    await act(async () => {
      root.render(
        <EmailProvider>
          <TestComponent />
        </EmailProvider>
      );
    });

    expect(contextValue.emails[0].isFullBodyLoaded).toBe(false);

    // 2. Mock Level 2 details endpoint
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          message: {
            id: '1',
            body: '<h1>Full HTML Content</h1>',
            cc: 'cc-user@test.com',
            bcc: '',
            attachments: [
              { id: 'att-1', filename: 'doc.pdf', size: 1024, mimeType: 'application/pdf' }
            ]
          }
        }
      })
    });

    await act(async () => {
      await contextValue.selectEmail('1');
    });

    // Verify detail endpoint request
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining('/api/mail/messages/1?email=user%40test.com'),
      expect.any(Object)
    );

    // Verify email details updated in state
    const updated = contextValue.emails.find(e => e.id === '1');
    expect(updated.body).toBe('<h1>Full HTML Content</h1>');
    expect(updated.cc).toBe('cc-user@test.com');
    expect(updated.isFullBodyLoaded).toBe(true);
    expect(updated.attachments).toHaveLength(1);
    expect(updated.attachments[0].name).toBe('doc.pdf');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
