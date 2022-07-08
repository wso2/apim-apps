/**
 * This file contains the Publisher web app related configurations
 * Note: In future,this configuration will be be parameterized and manage from deployment.toml
 */
const AppConfig = {
    app: {
        context: '/publisher', // Note the leading `/` and no trailing `/`
        /*
        If the proxy context path is configured, it's required to provide it here as well. For example,
        to serve https://company.com/apim/publisher/ URL the context and proxy_context_path will be as follows.
        context: '/apim/publisher',
        proxy_context_path: '/apim',
        */
        customUrl: { // Dynamically set the redirect origin according to the forwardedHeader host|proxyPort combination
            enabled: false,
            forwardedHeader: 'X-Forwarded-For',
        },
        origin: {
            // Used to construct the loopback origin, It's very unlike you need to change this hostname,
            // It is `localhost` in 99.99% case, If you want to change server host name change it in deployment.toml
            host: 'localhost',
        },
        feedback: { // If enabled, Feedback form option(an icon) will be available in the footer LHS bottom
            enable: false,
            serviceURL: '', // Check `/source/src/app/components/Base/Footer/FeedbackForm.jsx` for details
        },
        singleLogout: {
            // If enabled, user will be logged out from the App when logged out from the IDP
            // (eg: SSO logout from a different App).
            enabled: true,
            timeout: 4000, // Defines the timeout for the above periodical session status check
        },
        throttlingPolicyLimit: 80,
        operationPolicyCount: 500,
        propertyDisplaySuffix: '__display',
        markdown: {
            skipHtml: true,
            syntaxHighlighterProps: {
                showLineNumbers: false,
            },
            syntaxHighlighterDarkTheme: false,
        },
        loadDefaultLocales: true, // If false, Default en.json file will not be used/loaded in app.
        // loadDefaultLocales = false is good for performance but text overrides using the locale file will not work
        supportedDocTypes: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,'
                    + ' application/msword, application/pdf, text/plain, application/vnd.ms-excel,'
                    + ' application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,'
                    + ' application/vnd.oasis.opendocument.text, application/vnd.oasis.opendocument.spreadsheet,'
                    + ' application/json, application/x-yaml, .md',
    },
    serviceCatalogDefinitionTypes: {
        OAS2: 'Swagger',
        OAS3: 'Open API V3',
        WSDL1: 'WSDL 1',
        WSDL2: 'WSDL 2',
        GRAPHQL_SDL: 'GraphQL SDL',
        ASYNC_API: 'AsyncAPI',
    },
    serviceCatalogSecurityTypes: {
        BASIC: 'Basic',
        DIGEST: 'Digest',
        OAUTH2: 'OAuth2',
        NONE: 'None',
        X509: 'X509',
        API_KEY: 'API Key',
    },
    apis: {
        alwaysShowDeploySampleButton: true,
        endpoint: {
            aws: {
                regions: {
                    'us-east-1': 'us-east-1: US East (N. Virginia)',
                    'us-east-2': 'us-east-2: US East (Ohio)',
                    'us-west-1': 'us-west-1: US West (N. California)',
                    'us-west-2': 'us-west-2: US West (Oregon)',
                    'af-south-1': 'af-south-1: Africa (Cape Town)',
                    'ap-east-1': 'ap-east-1: Asia Pacific (Hong Kong)',
                    'ap-south-1': 'ap-south-1: Asia Pacific (Mumbai)',
                    'ap-northeast-1': 'ap-northeast-1: Asia Pacific (Tokyo)',
                    'ap-northeast-2': 'ap-northeast-2: Asia Pacific (Seoul)',
                    'ap-northeast-3': 'ap-northeast-3: Asia Pacific (Osaka-Local)',
                    'ap-southeast-1': 'ap-southeast-1: Asia Pacific (Singapore)',
                    'ap-southeast-2': 'ap-southeast-2: Asia Pacific (Sydney)',
                    'ca-central-1': 'ca-central-1: Canada (Central)',
                    'eu-central-1': 'eu-central-1: Europe (Frankfurt)',
                    'eu-west-1': 'eu-west-1: Europe (Ireland)',
                    'eu-west-2': 'eu-west-2: Europe (London)',
                    'eu-south-1': 'eu-south-1: Europe (Milan)',
                    'eu-west-3': 'eu-west-3: Europe (Paris)',
                    'eu-north-1': 'eu-north-1: Europe (Stockholm)',
                    'me-south-1': 'me-south-1: Middle East (Bahrain)',
                    'sa-east-1': 'sa-east-1: South America (São Paulo)',
                },
            },
        },
    },
};

if (typeof module !== 'undefined') {
    module.exports = AppConfig; // For Jest unit tests
}
