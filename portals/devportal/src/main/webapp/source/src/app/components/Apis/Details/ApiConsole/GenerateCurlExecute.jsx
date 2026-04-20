/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { buildMutatedSwaggerRequest, requestObjectToCurl } from './buildTryoutCurlRequest';
import CurlHighlightedPre from './curlSyntaxHighlight';

/** Match `.swagger-ui .opblock-body pre.microlight` (swagger-ui.css): #333 /
 * #fff inline must not use transparent or it wins over class rules. */
const microlightPanel = {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 4,
};

/** Curl <pre>: dark panel like live try-out; token colors come from CurlHighlightedPre spans. */
const curlPreStyle = {
    ...microlightPanel,
    margin: 0,
    padding: '10px 12px 50px 10px',
    overflowX: 'auto',
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: 'left',
    direction: 'ltr',
    unicodeBidi: 'isolate',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxSizing: 'border-box',
    width: '100%',
};

const urlPreStyle = {
    ...microlightPanel,
    margin: 0,
    padding: '10px',
    overflowX: 'auto',
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: 'left',
    direction: 'ltr',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxSizing: 'border-box',
    width: '100%',
};

const placeholderPreStyle = {
    ...microlightPanel,
    margin: 0,
    padding: '10px',
    minHeight: '4em',
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: 'left',
    boxSizing: 'border-box',
    width: '100%',
};

/** Same chrome as swagger-ui `.copy-to-clipboard` / `.download-contents` (#7d8293). */
const swaggerTryoutActionSx = {
    backgroundColor: '#7d8293',
    color: '#fff',
    '&:hover': { backgroundColor: '#6d7282' },
    '&:active': { backgroundColor: '#5e626f' },
};

const curlToolbarSx = {
    position: 'absolute',
    right: 10,
    bottom: 10,
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    zIndex: 1,
};

const curlDownloadButtonSx = {
    ...swaggerTryoutActionSx,
    minWidth: 0,
    height: 30,
    px: 1.25,
    py: 0,
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: '4px',
    boxShadow: 'none',
};

/** Neutralize `.swagger-ui .execute-wrapper { text-align: right }` so headings align with code blocks */
const executeRootStyle = {
    textAlign: 'left',
    width: '100%',
    boxSizing: 'border-box',
};

/**
 * Replaces Swagger UI "Execute" with cURL generation (no in-browser request).
 * Props are injected by swagger-ui (same contract as the built-in Execute control).
 * Output is wrapped like Synapse/Swagger "Responses" (Curl, Request URL, Server response).
 */
class GenerateCurlExecute extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curlText: '',
            requestUrl: '',
            busy: false,
            error: '',
            copyDone: false,
        };
        this.copyResetTimer = null;
    }

    componentWillUnmount() {
        if (this.copyResetTimer) {
            clearTimeout(this.copyResetTimer);
        }
    }

    copyCurlToClipboard = () => {
        const { curlText } = this.state;
        if (!curlText) {
            return;
        }
        const markCopied = () => {
            this.setState({ copyDone: true });
            if (this.copyResetTimer) {
                clearTimeout(this.copyResetTimer);
            }
            this.copyResetTimer = setTimeout(() => {
                this.setState({ copyDone: false });
                this.copyResetTimer = null;
            }, 2000);
        };
        const fallbackCopy = () => {
            try {
                const ta = document.createElement('textarea');
                ta.value = curlText;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                markCopied();
            } catch (e) {
                /* ignore */
            }
        };
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(curlText).then(markCopied).catch(fallbackCopy);
        } else {
            fallbackCopy();
        }
    };

    downloadCurl = () => {
        const { curlText } = this.state;
        if (!curlText) {
            return;
        }
        const blob = new Blob([curlText], { type: 'text/plain;charset=utf-8' });
        const href = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.download = 'curl-request.sh';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(href);
    };

    handleValidateParameters = () => {
        const {
            specSelectors, specActions, path, method,
        } = this.props;
        specActions.validateParams([path, method]);
        return specSelectors.validateBeforeExecute([path, method]);
    };

    handleValidateRequestBody = () => {
        const {
            path, method, specSelectors, oas3Selectors, oas3Actions,
        } = this.props;
        const validationErrors = {
            missingBodyValue: false,
            missingRequiredKeys: [],
        };
        oas3Actions.clearRequestBodyValidateError({ path, method });
        const oas3RequiredRequestBodyContentType = specSelectors.getOAS3RequiredRequestBodyContentType(
            [path, method],
        );
        const oas3RequestBodyValue = oas3Selectors.requestBodyValue(path, method);
        const oas3ValidateBeforeExecuteSuccess = oas3Selectors.validateBeforeExecute([path, method]);
        const oas3RequestContentType = oas3Selectors.requestContentType(path, method);

        if (!oas3ValidateBeforeExecuteSuccess) {
            validationErrors.missingBodyValue = true;
            oas3Actions.setRequestBodyValidateError({ path, method, validationErrors });
            return false;
        }
        if (!oas3RequiredRequestBodyContentType) {
            return true;
        }
        const missingRequiredKeys = oas3Selectors.validateShallowRequired({
            oas3RequiredRequestBodyContentType,
            oas3RequestContentType,
            oas3RequestBodyValue,
        });
        if (!missingRequiredKeys || missingRequiredKeys.length < 1) {
            return true;
        }
        missingRequiredKeys.forEach((missingKey) => {
            validationErrors.missingRequiredKeys.push(missingKey);
        });
        oas3Actions.setRequestBodyValidateError({ path, method, validationErrors });
        return false;
    };

    handleValidationResultFail = () => {
        const { specActions, path, method } = this.props;
        specActions.clearValidateParams([path, method]);
        setTimeout(() => {
            specActions.validateParams([path, method]);
        }, 40);
    };

    onGenerateCurl = async () => {
        const {
            getSystem, operation, path, method,
        } = this.props;
        const paramsOk = this.handleValidateParameters();
        const bodyOk = this.handleValidateRequestBody();
        if (!paramsOk || !bodyOk) {
            this.handleValidationResultFail();
            return;
        }

        this.setState({
            busy: true, error: '', curlText: '', requestUrl: '', copyDone: false,
        });
        try {
            const mutated = await buildMutatedSwaggerRequest(getSystem, {
                path,
                method,
                operation,
            });
            const curlText = requestObjectToCurl(mutated);
            const requestUrl = mutated && mutated.url ? String(mutated.url) : '';
            this.setState({
                curlText,
                requestUrl,
                busy: false,
            });
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.error(e);
            }
            this.setState({
                busy: false,
                error: e.message || String(e),
            });
        }
    };

    onClear = () => {
        this.setState({
            curlText: '', requestUrl: '', error: '', copyDone: false,
        });
    };

    render() {
        const {
            disabled,
            intl,
        } = this.props;
        const copyTooltip = intl.formatMessage({
            id: 'Apis.Details.APIConsole.GenerateCurl.copy',
            defaultMessage: 'Copy to clipboard',
        });
        const copiedTooltip = intl.formatMessage({
            id: 'Apis.Details.APIConsole.GenerateCurl.copied',
            defaultMessage: 'Copied',
        });
        const downloadTooltip = intl.formatMessage({
            id: 'Apis.Details.APIConsole.GenerateCurl.downloadAria',
            defaultMessage: 'Download generated cURL as a file',
        });
        const {
            curlText, requestUrl, busy, error, copyDone,
        } = this.state;
        const hasOutput = Boolean(curlText);

        return (
            <div className='apim-universal-execute-root' style={executeRootStyle}>
                <div className='btn-group' style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button
                        type='button'
                        className='btn execute opblock-control__btn'
                        onClick={this.onGenerateCurl}
                        disabled={disabled || busy}
                    >
                        <FormattedMessage
                            id='Apis.Details.APIConsole.GenerateCurl.button'
                            defaultMessage='Generate cURL'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-clear opblock-control__btn'
                        onClick={this.onClear}
                        disabled={busy}
                    >
                        <FormattedMessage
                            id='Apis.Details.APIConsole.GenerateCurl.clear'
                            defaultMessage='Clear'
                        />
                    </button>
                </div>
                {error && (
                    <div className='errors-wrapper' style={{ marginTop: 12 }}>
                        <span className='errors small'>{error}</span>
                    </div>
                )}
                {hasOutput && (
                    <div className='responses-wrapper'>
                        <div className='responses-inner'>
                            <h4>
                                <FormattedMessage
                                    id='Apis.Details.APIConsole.GenerateCurl.responsesHeading'
                                    defaultMessage='Responses'
                                />
                            </h4>
                            <h5>
                                <FormattedMessage
                                    id='Apis.Details.APIConsole.GenerateCurl.curlHeading'
                                    defaultMessage='Curl'
                                />
                            </h5>
                            <div className='curl'>
                                <div className='highlight-code'>
                                    <Box sx={curlToolbarSx}>
                                        {/* Swagger copy-to-clipboard; static position keeps it in the toolbar. */}
                                        <div
                                            className='copy-to-clipboard'
                                            style={{
                                                position: 'static',
                                                right: 'auto',
                                                bottom: 'auto',
                                            }}
                                            title={copyDone ? copiedTooltip : copyTooltip}
                                        >
                                            <button
                                                type='button'
                                                onClick={this.copyCurlToClipboard}
                                                aria-label={copyDone ? copiedTooltip : copyTooltip}
                                            />
                                        </div>
                                        <Tooltip title={downloadTooltip}>
                                            <Button
                                                type='button'
                                                variant='contained'
                                                disableElevation
                                                onClick={this.downloadCurl}
                                                sx={curlDownloadButtonSx}
                                                aria-label={downloadTooltip}
                                            >
                                                <FormattedMessage
                                                    id='Apis.Details.APIConsole.GenerateCurl.download'
                                                    defaultMessage='Download'
                                                />
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                    <CurlHighlightedPre
                                        text={curlText}
                                        style={curlPreStyle}
                                        className='microlight'
                                    />
                                </div>
                            </div>
                            {requestUrl && (
                                <>
                                    <h5>
                                        <FormattedMessage
                                            id='Apis.Details.APIConsole.GenerateCurl.requestUrlHeading'
                                            defaultMessage='Request URL'
                                        />
                                    </h5>
                                    <div className='highlight-code'>
                                        <pre className='microlight' style={urlPreStyle}>
                                            {requestUrl}
                                        </pre>
                                    </div>
                                </>
                            )}
                            <h4>
                                <FormattedMessage
                                    id='Apis.Details.APIConsole.GenerateCurl.serverResponseHeading'
                                    defaultMessage='Server response'
                                />
                            </h4>
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th className='response-col_status'>
                                            <FormattedMessage
                                                id='Apis.Details.APIConsole.GenerateCurl.codeColumn'
                                                defaultMessage='Code'
                                            />
                                        </th>
                                        <th className='response-col_description'>
                                            <FormattedMessage
                                                id='Apis.Details.APIConsole.GenerateCurl.detailsColumn'
                                                defaultMessage='Details'
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='response-col_status'>
                                            <span className='response-undocumented'>—</span>
                                        </td>
                                        <td className='response-col_description'>
                                            <FormattedMessage
                                                id='Apis.Details.APIConsole.GenerateCurl.noLiveResponseDetail'
                                                defaultMessage={'Not applicable. This try-out does not send the '
                                                    + 'request; run the generated cURL in your environment to see '
                                                    + 'status and body.'}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <h5>
                                <FormattedMessage
                                    id='Apis.Details.APIConsole.GenerateCurl.responseBodyHeading'
                                    defaultMessage='Response body'
                                />
                            </h5>
                            <div className='highlight-code'>
                                <pre className='microlight' style={placeholderPreStyle}>
                                    <FormattedMessage
                                        id='Apis.Details.APIConsole.GenerateCurl.noLiveResponseBody'
                                        defaultMessage={'No response body. Execute the cURL command to capture '
                                            + 'the gateway response.'}
                                    />
                                </pre>
                            </div>
                            <h5>
                                <FormattedMessage
                                    id='Apis.Details.APIConsole.GenerateCurl.responseHeadersHeading'
                                    defaultMessage='Response headers'
                                />
                            </h5>
                            <div className='highlight-code'>
                                <pre className='microlight' style={placeholderPreStyle}>
                                    —
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default injectIntl(GenerateCurlExecute);
