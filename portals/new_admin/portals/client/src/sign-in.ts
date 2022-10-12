import { getCodeVerifier, getCodeChallenge } from './crypto';
import { OIDCRequestParamsInterface } from './models/oidc-request-params';
import { TokenResponseInterface } from './models/token-response';
import { AUTHORIZATION_CODE } from './constants/token';
const axios = require('axios');

export const sendAuthorizationRequest = (requestParams: OIDCRequestParamsInterface): Promise<never> | boolean => {
    const authorizeEndpoint = "https://dev-kw-oeodk.us.auth0.com/authorize";

    if (!authorizeEndpoint || authorizeEndpoint.trim().length === 0) {
        return Promise.reject(new Error("Invalid authorize endpoint found."));
    }

    let authorizeRequest = authorizeEndpoint + "?response_type=code&client_id="
        + requestParams.clientId;

    authorizeRequest += "&scope=" + requestParams.scope;

    authorizeRequest += "&state=" + requestParams.state;

    const codeVerifier = getCodeVerifier();
    window.sessionStorage.setItem("code_verifier", codeVerifier);
    const codeChallenge = getCodeChallenge(codeVerifier);
    authorizeRequest += "&code_challenge_method=S256&code_challenge=" + codeChallenge;
    authorizeRequest += "&redirect_uri=https://localhost:4000/publisher/token";

    document.location.href = authorizeRequest;

    return false;
};


/**
 * Send token request.
 *
 * @param {OIDCRequestParamsInterface} requestParams request parameters required for token request.
 * @returns {Promise<TokenResponseInterface>} token response data or error.
 */
export const sendTokenRequest = (
    requestParams: OIDCRequestParamsInterface
): Promise<TokenResponseInterface> => {

    const tokenEndpoint = 'https://dev-kw-oeodk.us.auth0.com/oauth/token';
    const stsEndoint = 'https://da59-203-94-95-4.in.ngrok.io/api/am/sts/v1/oauth2/token';

    if (!tokenEndpoint || tokenEndpoint.trim().length === 0) {
        return Promise.reject(new Error("Invalid token endpoint found."));
    }

    const code = new URL(window.location.href).searchParams.get(AUTHORIZATION_CODE);

    const body = [];
    body.push(`client_id=${requestParams.clientId}`);
    body.push(`code=${code}`);
    body.push("grant_type=authorization_code");
    body.push(`redirect_uri=https://localhost:4000/users`);
    body.push(`code_verifier=${window.sessionStorage.getItem("code_verifier")}`);

    return axios.post(tokenEndpoint, body.join("&"))
        .then((response: any) => {
            if (response.status !== 200) {
                return Promise.reject(new Error("Invalid status code received in the token response: "
                    + response.status));
            }
            window.sessionStorage.setItem("token", response.data.access_token);

            const body = [];
            body.push(`client_id=${requestParams.clientId}`);
            body.push(`scope=apim:api_manage apim:subscription_manage apim:tier_manage apim:admin`);
            body.push("grant_type=urn:ietf:params:oauth:grant-type:token-exchange");
            body.push(`subject_token_type=urn:ietf:params:oauth:token-type:jwt`);
            body.push(`requested_token_type=urn:ietf:params:oauth:token-type:jwt`);
            body.push(`subject_token=${response.data.access_token}`);
            body.push(`org_handle=organization`);
            return axios.post(stsEndoint, body.join("&"))
                .then((response: any) => {
                    window.sessionStorage.setItem("exchanged_token", response.data.access_token);
                    window.location.href = "https://localhost:4000/users";
                });
        }).catch((error: any) => {
            return Promise.reject(error);
        });
};


// export const login = () : any => {
//     var codeVerifier = getCodeVerifier();

//     Promise.resolve()
//         .then(() => {
//             return getCodeChallenge(codeVerifier)
//         })
//         .then(function (codeChallenge) {
//             window.sessionStorage.setItem("code_verifier", codeVerifier);

//             var args = new URLSearchParams({
//                 client_id: "FbCSH23HybQMV9UlXJfeKHogAEHojzCO",
//                 redirect_uri: "https://localhost:4000/#/publisher/token",
//                 response_type: "code",
//                 scope: "openid",
//                 state: "RlZyVjlqYUpHTzltWC42c2FNRDRJT1JPfk1+TUFEa0RLb04yZldwYkpxVA==",
//                 code_challenge: codeChallenge,
//                 code_challenge_method: "S256"
//             });
//             window.location = "https://dev-kw-oeodk.us.auth0.com/authorize?" + args;
//         })
// }

