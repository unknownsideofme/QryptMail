export default class AuthProvider {
    async signIn() {
        throw new Error("Method not implemented");
    }
    
    async signOut() {
        throw new Error("Method not implemented");
    }
    
    async getTokens(code) {
        throw new Error("Method not implemented");
    }
    
    async refreshToken(refreshToken) {
        throw new Error("Method not implemented");
    }

    async fetchMail(accessToken) {
        throw new Error("Method not implemented");
    }

    async getUserProfile(accessToken) {
        throw new Error("Method not implemented");
    }
}