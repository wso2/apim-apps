const API_PORT=9443
const API_HOST='localhost'
const API_TRANSPORT='http'
const IDP_CLIENT_ID='FbCSH23HybQMV9UlXJfeKHogAEHojzCO'
const wellKnown='https://dev-kw-oeodk.us.auth0.com/.well-known/openid-configuration'
const serverOrigin='https://dev-kw-oeodk.us.auth0.com/'
const loginUri='https://localhost:4000'
const logoutEndpoint='https://dev-kw-oeodk.us.auth0.com/v2/logout'
const scope='openid'
const state='RlZyVjlqYUpHTzltWC42c2FNRDRJT1JPfk1+TUFEa0RLb04yZldwYkpxVA=='

const Settings = {
    API_PORT,
    API_HOST,
    API_TRANSPORT,
    IDP_CLIENT_ID,
    wellKnown,
    serverOrigin,
    loginUri,
    logoutEndpoint,
    scope,
    state
};

if (typeof module !== 'undefined') {
    module.exports = Settings; // For Jest unit tests
}
