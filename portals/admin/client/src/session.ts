import {
    ACCESS_TOKEN,
    ID_TOKEN
} from "./constants/token";

/**
 * Remove parameter from session storage.
 *
 * @param {string} key.
 */
 export const removeSessionParameter = (key: string): void => {
    sessionStorage.removeItem(key);
};

/**
 * Set parameter to session storage.
 *
 * @param {string} key.
 * @param value value.
 */
 export const setSessionParameter = (key: string, value: string): void => {
    sessionStorage.setItem(key, value);
};

/**
 * Get parameter from session storage.
 *
 * @param {string} key.
 * @returns {string | null} parameter value or null.
 */
 export const getSessionParameter = (key: string): string|null => {
    return sessionStorage.getItem(key);
};

/**
 * End authenticated user session.
 */
 export const endAuthenticatedSession = (): void => {
    removeSessionParameter(ACCESS_TOKEN);
    removeSessionParameter(ID_TOKEN);
};