import { ID_TOKEN } from "./constants/token";
import { getEndSessionEndpoint } from "./op-config";
import { getSessionParameter } from "./session";
import Settings from '../public/Settings'

/**
 * Handle user sign out.
 *
 * @returns {}
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const sendSignOutRequest =  (redirectUri: string, sessionClearCallback: any): Promise<any> => {
    const logoutEndpoint = getEndSessionEndpoint();
    let logoutRequest = logoutEndpoint + "?client_id=" + Settings.IDP_CLIENT_ID + "&returnTo=" + redirectUri
    if (!logoutEndpoint || logoutEndpoint.trim().length === 0) {
        return Promise.reject(new Error("Invalid logout endpoint found."));
    }

    const idToken = getSessionParameter(ID_TOKEN);

    if (!idToken || idToken.trim().length === 0) {
        return Promise.reject(new Error("Invalid id_token found."));
    }

    sessionClearCallback();
    Promise.resolve("Logout sucess!");

    document.location.href = logoutRequest;
};