import GoogleAuth from '../../integrations/gmail/auth/auth.provider.js';
import MicrosoftAuth from '../../integrations/microsoft/auth/auth.provider.js';

export const authType = {
    GOOGLE : 'google' ,
    MICROSOFT : 'microsoft'
}

export default class authFactory {
    getAuth(type) {
        switch(type) {
            case authType.GOOGLE:
                return new GoogleAuth();
            case authType.MICROSOFT:
                return new MicrosoftAuth();
            default:
                throw new Error("Invalid auth type");
        }
    }
}