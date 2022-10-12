/**
 * Interface of the OAuth2/OIDC tokens.
 */
 export interface TokenResponseInterface {
    accessToken: string;
    idToken: string;
    expiresIn: string;
    scope: string;
    tokenType: string;
}