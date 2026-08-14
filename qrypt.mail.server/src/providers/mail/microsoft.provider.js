import MailProvider from './mailProvider.js';

export default class MicrosoftProvider extends MailProvider {
    // Stub class to be implemented in Phase 4
    async getInbox(accessToken, options = {}) {
        throw new Error("Microsoft Mail Provider is not yet fully implemented (Phase 4).");
    }
}
