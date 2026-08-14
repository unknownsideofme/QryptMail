import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmailProvider, useEmails } from './EmailContext';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('EmailContext Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { messages: [] } })
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with default demo state when not authenticated', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let contextValue;
    const TestComponent = () => {
      contextValue = useEmails();
      return null;
    };

    act(() => {
      root.render(
        <EmailProvider>
          <TestComponent />
        </EmailProvider>
      );
    });

    expect(contextValue.isDemoMode).toBe(true);
    expect(contextValue.activeFolder).toBe('inbox');
    expect(contextValue.emails.length).toBeGreaterThan(0); // Mock demo emails loaded

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('should initialize in authenticated non-demo mode if credentials exist', () => {
    localStorage.setItem('qrypt_authenticated', 'true');
    localStorage.setItem('qrypt_is_demo', 'false');
    localStorage.setItem('qrypt_app_token', 'valid-token');

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let contextValue;
    const TestComponent = () => {
      contextValue = useEmails();
      return null;
    };

    act(() => {
      root.render(
        <EmailProvider>
          <TestComponent />
        </EmailProvider>
      );
    });

    expect(contextValue.isDemoMode).toBe(false);
    expect(contextValue.emails).toEqual([]); // Authenticated starts empty to load progressively

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
