/**
 * Abstract class representing the interface for mail providers.
 */
export default class MailProvider {
    /**
     * Retrieve the list of messages in the user's inbox
     * @param {string} accessToken 
     * @param {Object} options 
     */
    async getInbox(accessToken, options = {}) {
        throw new Error("Method 'getInbox' not implemented");
    }

    /**
     * Fetch a specific message by its ID
     * @param {string} accessToken 
     * @param {string} messageId 
     */
    async getMessage(accessToken, messageId) {
        throw new Error("Method 'getMessage' not implemented");
    }

    /**
     * Send an email message
     * @param {string} accessToken 
     * @param {Object} emailDetails 
     */
    async sendMessage(accessToken, { to, subject, body, attachments = [] }) {
        throw new Error("Method 'sendMessage' not implemented");
    }

    /**
     * Create a new draft
     * @param {string} accessToken 
     * @param {Object} draftDetails 
     */
    async createDraft(accessToken, { to, subject, body }) {
        throw new Error("Method 'createDraft' not implemented");
    }

    /**
     * Fetch a specific attachment payload
     * @param {string} accessToken 
     * @param {string} messageId 
     * @param {string} attachmentId 
     */
    async getAttachment(accessToken, messageId, attachmentId) {
        throw new Error("Method 'getAttachment' not implemented");
    }

    /**
     * Search for messages matching a query
     * @param {string} accessToken 
     * @param {string} query 
     */
    async searchMessages(accessToken, query) {
        throw new Error("Method 'searchMessages' not implemented");
    }
}
