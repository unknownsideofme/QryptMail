import GmailProvider from './gmail.provider.js';
import MicrosoftProvider from './microsoft.provider.js';

export class ProviderFactory {
    static #gmailInstance = null;
    static #microsoftInstance = null;

    /**
     * Get the singleton MailProvider client for the user's connection type
     * @param {string} providerName - 'google' or 'microsoft'
     * @returns {MailProvider}
     */
    static getProvider(providerName) {
        const name = providerName.toLowerCase();
        if (name === 'google') {
            if (!this.#gmailInstance) {
                this.#gmailInstance = new GmailProvider();
            }
            return this.#gmailInstance;
        } else if (name === 'microsoft') {
            if (!this.#microsoftInstance) {
                this.#microsoftInstance = new MicrosoftProvider();
            }
            return this.#microsoftInstance;
        } else {
            throw new Error(`Unsupported mail provider: "${providerName}"`);
        }
    }
}
