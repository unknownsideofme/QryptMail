import { jest } from '@jest/globals';

// 1. Mock the internal dependencies of MailService
jest.unstable_mockModule('../../src/config/database.js', () => {
  return {
    db: {
      findMailAccountByUserAndEmail: jest.fn(),
      updateMailAccountTokens: jest.fn()
    }
  };
});

jest.unstable_mockModule('../../src/providers/mail/provider.factory.js', () => {
  const mockProvider = {
    getInbox: jest.fn(),
    getMessage: jest.fn(),
    sendMessage: jest.fn(),
    getAttachment: jest.fn()
  };
  return {
    ProviderFactory: {
      getProvider: jest.fn().mockReturnValue(mockProvider)
    }
  };
});

jest.unstable_mockModule('../../src/factory/authFactory/auth.factory.js', () => {
  const mockAuthProvider = {
    refreshToken: jest.fn()
  };
  const MockAuthFactory = jest.fn().mockImplementation(() => {
    return {
      getAuth: jest.fn().mockReturnValue(mockAuthProvider)
    };
  });
  return {
    default: MockAuthFactory
  };
});

// 2. Import modules dynamically after mocking
const { default: MailService } = await import('../../src/services/mail.service.js');
const { db } = await import('../../src/config/database.js');
const { ProviderFactory } = await import('../../src/providers/mail/provider.factory.js');
const authFactoryModule = await import('../../src/factory/authFactory/auth.factory.js');
const AuthFactory = authFactoryModule.default;

describe('MailService Unit Tests', () => {
  const userId = 'user-123';
  const email = 'test@qryptmail.com';
  let mockProvider;
  let mockAuthFactoryInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider = ProviderFactory.getProvider('gmail');
    mockAuthFactoryInstance = new AuthFactory();
  });

  describe('getValidAccessToken', () => {
    it('should return existing access token if it is valid and far from expiry', async () => {
      const farFutureDate = new Date();
      farFutureDate.setHours(farFutureDate.getHours() + 2); // 2 hours in future

      db.findMailAccountByUserAndEmail.mockResolvedValue({
        id: 'acc-1',
        provider: 'gmail',
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
        tokenExpiresAt: farFutureDate.toISOString()
      });

      const token = await MailService.getValidAccessToken(userId, email);
      expect(token).toBe('valid-token');
      expect(db.updateMailAccountTokens).not.toHaveBeenCalled();
    });

    it('should refresh and save token if it is expired or close to expiry', async () => {
      const nearFutureDate = new Date();
      nearFutureDate.setMinutes(nearFutureDate.getMinutes() + 2); // expires in 2 minutes (less than 5m threshold)

      db.findMailAccountByUserAndEmail.mockResolvedValue({
        id: 'acc-1',
        provider: 'gmail',
        accessToken: 'old-token',
        refreshToken: 'valid-refresh-token',
        tokenExpiresAt: nearFutureDate.toISOString()
      });

      const mockAuthProvider = mockAuthFactoryInstance.getAuth('gmail');
      mockAuthProvider.refreshToken.mockResolvedValue({
        access_token: 'new-refreshed-token',
        refresh_token: 'valid-refresh-token',
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      });

      const token = await MailService.getValidAccessToken(userId, email);
      expect(token).toBe('new-refreshed-token');
      expect(mockAuthProvider.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(db.updateMailAccountTokens).toHaveBeenCalled();
    });

    it('should throw an error if token is expired and refresh token is missing', async () => {
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1); // expired 1 hour ago

      db.findMailAccountByUserAndEmail.mockResolvedValue({
        id: 'acc-1',
        provider: 'gmail',
        accessToken: 'old-token',
        refreshToken: null,
        tokenExpiresAt: expiredDate.toISOString()
      });

      await expect(MailService.getValidAccessToken(userId, email)).rejects.toThrow(
        /Refresh token is missing/
      );
    });
  });

  describe('getInbox', () => {
    it('should fetch inbox list from provider using valid access token', async () => {
      db.findMailAccountByUserAndEmail.mockResolvedValue({
        id: 'acc-1',
        provider: 'gmail',
        accessToken: 'valid-token',
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
      });

      mockProvider.getInbox.mockResolvedValue([
        { id: 'msg-1', subject: 'Hello' }
      ]);

      const inbox = await MailService.getInbox(userId, email, { limit: 10 });
      expect(inbox).toEqual([{ id: 'msg-1', subject: 'Hello' }]);
      expect(ProviderFactory.getProvider).toHaveBeenCalledWith('gmail');
      expect(mockProvider.getInbox).toHaveBeenCalledWith('valid-token', { limit: 10 });
    });
  });
});
