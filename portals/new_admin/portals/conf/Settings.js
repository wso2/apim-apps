const API_PORT=9443
const API_HOST='localhost'
const API_TRANSPORT='http'
const IDP_CLIENT_ID='T0Po-zLDzKtJHosmgKZZaXhABijNaFWJ'
const IDP_DOMAIN='construct.auth0.com'

const Settings = {
    API_PORT,
    API_HOST,
    API_TRANSPORT,
    IDP_CLIENT_ID,
    IDP_DOMAIN
};

if (typeof module !== 'undefined') {
    module.exports = Settings; // For Jest unit tests
}
