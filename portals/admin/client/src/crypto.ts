import Base64 from "crypto-js/enc-base64";
import WordArray from "crypto-js/lib-typedarrays";
import sha256 from "crypto-js/sha256";
/**
 * Get URL encoded string.
 *
 * @param {any} value.
 * @returns {string} base 64 url encoded value.
 */
export const base64URLEncode = (value: any): string => {
    return Base64.stringify(value)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
};

/**
 * Generate code verifier.
 *
 * @returns {string} code verifier.
 */
 export const getCodeVerifier = (): string => {
    return base64URLEncode(WordArray.random(32));
};

/**
 * Derive code challenge from the code verifier.
 *
 * @param {string} verifier.
 * @returns {string} code challenge.
 */
 export const getCodeChallenge = (verifier: string): string => {
    return base64URLEncode(sha256(verifier));
};

// export function generateRandomString(length) {
//     var text = "";
//     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//     for (var i = 0; i < length; i++) {
//         text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }

//     return text;
// }

// export async function generateCodeChallenge(codeVerifier) {
//     var digest = await crypto.subtle.digest("SHA-256",
//         new TextEncoder().encode(codeVerifier));

//     return btoa(String.fromCharCode(...new Uint8Array(digest)))
//         .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
// }