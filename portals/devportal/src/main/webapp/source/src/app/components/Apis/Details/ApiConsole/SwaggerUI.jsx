import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import 'swagger-ui-react/swagger-ui.css';
import SwaggerUILib from 'swagger-ui-react';
import CustomPadLock from './CustomPadLock';

const disableAuthorizeAndInfoPlugin = function (spec) {
    return {
        wrapComponents: {
            info: () => () => null,
            authorizeBtn: () => () => null,
            authorizeOperationBtn: () => () => null,
            OperationSummary: (original) => (props) => {
                return <CustomPadLock BaseLayout={original} oldProps={props} spec={spec} />;
            },
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
        spec, accessTokenProvider, authorizationHeader, api,
    } = props;

    const securitySchemeRef = useRef(props.securitySchemeType);
    const authorizationHeaderRef = useRef(props.authorizationHeader);

    useEffect(() => {
        securitySchemeRef.current = props.securitySchemeType;
    }, [props.securitySchemeType]);

    useEffect(() => {
        authorizationHeaderRef.current = props.authorizationHeader;
    }, [props.authorizationHeader]);

    const componentProps = {
        spec,
        validatorUrl: null,
        defaultModelsExpandDepth: -1,
        docExpansion: 'list',
        requestInterceptor: (req) => {
            const { url } = req;
            const { context } = api;
            const currentSecuritySchemeType = securitySchemeRef.current;
            const currentAuthHeader = authorizationHeaderRef.current;
            const patternToCheck = `${context}/*`;
            if (currentSecuritySchemeType === 'API-KEY') {
                req.headers[currentAuthHeader] = accessTokenProvider();
            } else if (currentSecuritySchemeType === 'BASIC') {
                req.headers[currentAuthHeader] = 'Basic ' + accessTokenProvider();
            } else if (currentSecuritySchemeType === 'TEST') {
                req.headers[currentAuthHeader] = accessTokenProvider();
            } else if (api.advertiseInfo && api.advertiseInfo.advertised && authorizationHeader !== '') {
                req.headers[currentAuthHeader] = accessTokenProvider();
            } else {
                req.headers[currentAuthHeader] = 'Bearer ' + accessTokenProvider();
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
        plugins: [disableAuthorizeAndInfoPlugin(spec)],
    };
    const [render, setRender] = useState();
    const [layoutRender, setlayoutRender] = useState();

    useEffect(() => {
        if (!layoutRender) return;
        const len = document.querySelectorAll('.opblock .authorization__btn');
        for (let i = 0; i < len.length; i++) {
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
    securitySchemeType: PropTypes.string.isRequired,
    api: PropTypes.shape({
        context: PropTypes.string.isRequired,
    }).isRequired,
    spec: PropTypes.string.isRequired,
};
export default SwaggerUI;
