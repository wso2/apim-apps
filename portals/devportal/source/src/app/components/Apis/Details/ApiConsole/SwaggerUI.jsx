import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import 'swagger-ui-react/swagger-ui.css';
import SwaggerUILib from 'swagger-ui-react';

const disableAuthorizeAndInfoPlugin = function () {
    return {
        wrapComponents: {
            info: () => () => null,
            authorizeBtn: () => () => null,
        },
    };
};
/**
 *
 * @class SwaggerUI
 * @extends {Component}
 */
const SwaggerUI = (props) => {
    const {
        spec, accessTokenProvider, authorizationHeader, api, securitySchemeType,
    } = props;

    const componentProps = {
        spec,
        validatorUrl: null,
        defaultModelsExpandDepth: -1,
        docExpansion: 'list',
        requestInterceptor: (req) => {
            const { url } = req;
            const { context } = api;
            const patternToCheck = `${context}/*`;
            if (authorizationHeader === 'apikey') {
                req.headers[authorizationHeader] = accessTokenProvider();
            } else if (securitySchemeType === 'BASIC') {
                req.headers[authorizationHeader] = 'Basic ' + accessTokenProvider();
            } else if (securitySchemeType === 'TEST') {
                req.headers[authorizationHeader] = accessTokenProvider();
            } else {
                req.headers[authorizationHeader] = 'Bearer ' + accessTokenProvider();
            }
            if (url.endsWith(patternToCheck)) {
                req.url = url.substring(0, url.length - 2);
            } else if (url.includes(patternToCheck + '?')) { // Check for query parameters.
                const splitTokens = url.split('/*?');
                req.url = splitTokens.length > 1 ? splitTokens[0] + '?' + splitTokens[1] : splitTokens[0];
            }
            return req;
        },
        defaultModelExpandDepth: -1,
        plugins: [disableAuthorizeAndInfoPlugin],
    };
    const [render, setRender] = useState();
    const [layoutRender, setlayoutRender] = useState();

    useEffect(() => {
        if (!layoutRender) return;
        const len = document.querySelectorAll('.opblock .authorization__btn');
        let i = 0;
        for (; i < len.length; i++) {
            len[i].remove();
        }
        document.querySelector('.schemes select').setAttribute('id', 'schemes');
        document.getElementById('unlocked').parentNode.parentNode.remove();
        setlayoutRender(false);
    }, [layoutRender]);

    useEffect(() => {
        setlayoutRender(true);
    }, [render]);

    return (
        <>
            <SwaggerUILib {...componentProps} />
            {setRender}
        </>
    );
};

SwaggerUI.propTypes = {
    accessTokenProvider: PropTypes.func.isRequired,
    authorizationHeader: PropTypes.string.isRequired,
    api: PropTypes.shape({
        context: PropTypes.string.isRequired,
    }).isRequired,
    spec: PropTypes.string.isRequired,
};
export default SwaggerUI;
