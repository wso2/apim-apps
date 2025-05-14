// Constants and configuration data for GraphQL Query Analysis

export const PREFIX = 'GraphQLQueryAnalysis';
export const API_ENDPOINT = 'http://127.0.0.1:8000';

// Define vulnerability types by category
export const statisticalVulnerabilities = [
    'Alias overloading', 'Batch overloading', 'Deep circular queries',
    'Directive overloading', 'Introspection queries', 'Excessive complexity',
    'Excessive query depth', 'Query payload inflation'
];

export const aiPoweredVulnerabilities = [
    'SQL injections', 'XSS exploits', 'OS command injections', 'SSRF attempts'
];

// Combined vulnerability types
export const vulnerabilityTypes = [...statisticalVulnerabilities, ...aiPoweredVulnerabilities];

export const vulnerabilityTooltips = {
    'Alias overloading': 'Detects attacks that use excessive aliases to cause denial of service.',
    'Batch overloading': 'Identifies requests with multiple operations to prevent resource exhaustion.',
    'Deep circular queries': 'Prevents recursive query patterns that could cause infinite loops.',
    'Directive overloading': 'Blocks queries with excessive directives that might overload resolvers.',
    'Introspection queries': 'Identifies and blocks schema introspection attempts that expose API structure.',
    'Excessive complexity': 'Prevents computationally expensive queries that could impact performance.',
    'Excessive query depth': 'Stops deeply nested queries that may cause server resource exhaustion.',
    'Query payload inflation': 'Prevents oversized queries that could consume excessive bandwidth or memory.',
    'SQL injections': 'Uses AI to detect potential SQL injection attempts in query variables or arguments.',
    'XSS exploits': 'Identifies cross-site scripting patterns that could lead to client-side attacks.',
    'OS command injections': 'Detects attempts to execute operating system commands via GraphQL queries.',
    'SSRF attempts': 'Identifies server-side request forgery attempts that could access internal resources.'
};

// Map of vulnerability types to their corresponding threshold keys
export const vulnerabilityToThresholdMap = {
    'Alias overloading': ['ALIAS_THRESHOLD'],
    'Batch overloading': ['BATCH_THRESHOLD'],
    'Deep circular queries': ['CIRCULAR_QUERY_THRESHOLD'],
    'Directive overloading': ['DIRECTIVE_THRESHOLD'],
    'Excessive complexity': ['SIMPLE_ESTIMATOR_COMPLEXITY', 'SIMPLE_ESTIMATOR_THRESHOLD'],
    'Excessive query depth': ['QUERY_DEPTH_THRESHOLD'],
    'Query payload inflation': ['TOKEN_LIMIT_THRESHOLD'],
    'Introspection queries': [],
    'SQL injections': [],
    'XSS exploits': [],
    'OS command injections': [],
    'SSRF attempts': []
};

// Map vulnerability types to API parameter keys
export const vulnerabilityToApiKeyMap = {
    'Directive overloading': 'detect_directive_overloading',
    'Alias overloading': 'detect_alias_overloading',
    'Batch overloading': 'detect_batch_overloading',
    'Deep circular queries': 'detect_circular_query',
    'Introspection queries': 'check_introspection_query',
    'Excessive query depth': 'detect_query_depth',
    'Query payload inflation': 'detect_token_limit',
    'Excessive complexity': 'detect_complex_query',
    'SQL injections': 'detect_sqli',
    'XSS exploits': 'detect_xss_exploit',
    'OS command injections': 'detect_osi',
    'SSRF attempts': 'check_ssrf'
};

// Configuration and threshold settings
export const thresholdLabels = {
    ALIAS_THRESHOLD: 'Maximum Aliases Allowed',
    BATCH_THRESHOLD: 'Maximum Batch Size',
    CIRCULAR_QUERY_THRESHOLD: 'Maximum Circular References',
    DIRECTIVE_THRESHOLD: 'Maximum Directives per Query',
    SIMPLE_ESTIMATOR_COMPLEXITY: 'Complexity Multiplier',
    SIMPLE_ESTIMATOR_THRESHOLD: 'Maximum Query Complexity',
    QUERY_DEPTH_THRESHOLD: 'Maximum Query Depth',
    TOKEN_LIMIT_THRESHOLD: 'Maximum Tokens per Query',
    MODEL_CONFIDENT_THRESHOLD: 'AI Confidence Threshold'
};

export const thresholdTooltips = {
    ALIAS_THRESHOLD: 'Limits number of alias fields in a query to prevent alias overloading attacks',
    BATCH_THRESHOLD: 'Controls maximum number of operations per request to prevent batch overloading',
    CIRCULAR_QUERY_THRESHOLD: 'Restricts recursive queries that could cause denial of service',
    DIRECTIVE_THRESHOLD: 'Limits directive usage to prevent directive-based attacks',
    SIMPLE_ESTIMATOR_COMPLEXITY: 'Base multiplier for query complexity calculations',
    SIMPLE_ESTIMATOR_THRESHOLD: 'Maximum allowed query complexity score before rejection',
    QUERY_DEPTH_THRESHOLD: 'Controls maximum nesting depth of queries to prevent deep query attacks',
    TOKEN_LIMIT_THRESHOLD: 'Maximum query size in tokens to prevent oversized payloads',
    MODEL_CONFIDENT_THRESHOLD: 'Minimum confidence level required for AI-powered checks to flag malicious queries'
};

export const defaultThresholds = {
    ALIAS_THRESHOLD: 5,
    BATCH_THRESHOLD: 5,
    CIRCULAR_QUERY_THRESHOLD: 3,
    DIRECTIVE_THRESHOLD: 5,
    SIMPLE_ESTIMATOR_COMPLEXITY: 1,
    SIMPLE_ESTIMATOR_THRESHOLD: 40,
    QUERY_DEPTH_THRESHOLD: 8,
    TOKEN_LIMIT_THRESHOLD: 1200,
    MODEL_CONFIDENT_THRESHOLD: 0.5
};

// Styled components class names
export const classes = {
    content: `${PREFIX}-content`,
    itemWrapper: `${PREFIX}-itemWrapper`,
    FormControl: `${PREFIX}-FormControl`,
    subTitle: `${PREFIX}-subTitle`,
    subTitleDescription: `${PREFIX}-subTitleDescription`,
    flowWrapper: `${PREFIX}-flowWrapper`,
    subHeading: `${PREFIX}-subHeading`,
    heading: `${PREFIX}-heading`,
    paper: `${PREFIX}-paper`,
    editIcon: `${PREFIX}-editIcon`,
    thresholdField: `${PREFIX}-thresholdField`,
    thresholdGroup: `${PREFIX}-thresholdGroup`,
    thresholdLabel: `${PREFIX}-thresholdLabel`,
    iconSpace: `${PREFIX}-iconSpace`,
};
