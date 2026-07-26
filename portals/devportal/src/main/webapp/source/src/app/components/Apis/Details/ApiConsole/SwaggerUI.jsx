import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import 'swagger-ui-react/swagger-ui.css';
import SwaggerUILib from 'swagger-ui-react';
import CustomPadLock from './CustomPadLock';
import GenerateCurlExecute from './GenerateCurlExecute';
import isPlatformGatewayApi from './platformGateway';
import { applyTryOutAuthHeaders } from './applyTryOutAuthHeaders';

const generateCurlTryoutPlugin = () => ({
    wrapComponents: {
        execute: (_, system) => (props) => (
            <GenerateCurlExecute
                {...props}
                getSystem={system.getSystem}
            />
        ),
    },
});

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
    const authorizationHeaderRef = useRef(authorizationHeader);

    useEffect(() => {
        securitySchemeRef.current = props.securitySchemeType;
    }, [props.securitySchemeType]);

    useEffect(() => {
        authorizationHeaderRef.current = authorizationHeader;
    }, [authorizationHeader]);

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
            const rawToken = accessTokenProvider();
            const patternToCheck = `${context}/*`;
            let nextReq = applyTryOutAuthHeaders(req, {
                securitySchemeType: currentSecuritySchemeType,
                authorizationHeader: currentAuthHeader,
                token: rawToken,
                isAdvertised: Boolean(api.advertiseInfo && api.advertiseInfo.advertised),
            });
            if (url.endsWith(patternToCheck)) {
                nextReq = { ...nextReq, url: url.substring(0, url.length - 2) };
            } else if (url.includes(patternToCheck + '?')) { // Check for query parameters.
                const splitTokens = url.split('/*?');
                nextReq = {
                    ...nextReq,
                    url: splitTokens.length > 1 ? splitTokens[0] + '?' + splitTokens[1] : splitTokens[0],
                };
            }
            return nextReq;
        },
        defaultModelExpandDepth: -1,
        plugins: [
            disableAuthorizeAndInfoPlugin(spec),
            ...(isPlatformGatewayApi(api)
                ? [generateCurlTryoutPlugin()]
                : []),
        ],
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
