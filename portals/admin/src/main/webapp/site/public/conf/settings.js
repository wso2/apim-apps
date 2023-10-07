const AppConfig = {
    "app": {
        "context": "/admin",
        "customUrl": {
            "enabled": false,
            "forwardedHeader": "X-Forwarded-For"
        },
        "origin": {
            "host": "localhost"
        },
        "workflows": {
            "limit": 30.0
        },
        "feedback": {
            "enable": false,
            "serviceURL": ""
        },
        "singleLogout": {
            "enabled": true,
            "timeout": 2000.0
        },
        "docUrl": "https://apim.docs.wso2.com/en/4.2.0/"
    },
    "idp": {
        "checkSessionEndpoint": "https://localhost:9443/oidc/checksession",
        "origin": "https://localhost:9443"
    }
};
