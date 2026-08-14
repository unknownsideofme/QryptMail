export default class Database {
    async connect() {
        throw new Error("Method not implemented");
    }

    async disconnect() {
        throw new Error("Method not implemented");
    }

    async query(statement, params) {
        throw new Error("Method not implemented");
    }

    async findUserById(userId) {
        throw new Error("Method not implemented");
    }

    async findUserByProviderId(provider, providerAccountId) {
        throw new Error("Method not implemented");
    }

    async createUser(userData) {
        throw new Error("Method not implemented");
    }

    async findMailAccountByUserAndEmail(userId, email) {
        throw new Error("Method not implemented");
    }

    async createMailAccount(accountData) {
        throw new Error("Method not implemented");
    }

    async updateMailAccountTokens(accountId, tokenData) {
        throw new Error("Method not implemented");
    }
}