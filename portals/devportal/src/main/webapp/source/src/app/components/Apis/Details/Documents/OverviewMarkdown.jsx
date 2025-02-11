/* eslint-disable react/no-children-prop */
/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, {
    useState, useEffect, useContext, Suspense, lazy,
} from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import API from 'AppData/api';
import Settings from 'Settings';
import remarkGfm from 'remark-gfm';
import CircularProgress from '@mui/material/CircularProgress';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ApiContext } from '../ApiContext';

const PREFIX = 'OverviewMarkdown';

const classes = {
    root: `${PREFIX}-root`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        paddingBottom: theme.spacing(2),
        paddingTop: theme.spacing(2),
    },
}));

const ReactMarkdown = lazy(() => import('react-markdown' /* webpackChunkName: "MDReactMarkdown" */));

function OverviewMarkdown({ apiId }) {
    const { api } = useContext(ApiContext);
    const [content, setContent] = useState('');
    const restAPI = new API();
    const { skipHtml, syntaxHighlighterProps = {}, syntaxHighlighterDarkTheme } = Settings.app.markdown;

    useEffect(() => {
        restAPI.getMarkdownContentOfAPI(apiId)
            .then(({ text }) => {
                const updatedText = Object.entries(api).reduce((acc, [fieldName, value]) => {
                    return acc.replace(new RegExp(`___${fieldName}___`, 'g'), value);
                }, text);
                setContent(updatedText);
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
            });
    }, [apiId]);

    return (
        <Root>
            <div className='markdown-content-wrapper'>
                <Suspense fallback={<CircularProgress />}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        skipHtml={skipHtml}
                        components={{
                            code({
                                inline, className = '', children, ...propsInner
                            }) {
                                const match = /language-(\w+)/.exec(className);
                                const codeContent = String(children).replace(/\n$/, '');
                                if (inline || !match) {
                                    return (
                                        <code className={className} {...propsInner}>{children}</code>
                                    );
                                }

                                const syntaxProps = {
                                    style: syntaxHighlighterDarkTheme ? vscDarkPlus : vs,
                                    language: match[1],
                                    PreTag: 'div',
                                    ...propsInner,
                                    ...syntaxHighlighterProps,
                                };
                                return <SyntaxHighlighter {...syntaxProps}>{codeContent}</SyntaxHighlighter>;
                            },
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </Suspense>
            </div>
        </Root>
    );
}

OverviewMarkdown.propTypes = {
    apiId: PropTypes.string.isRequired,
};

export default injectIntl((OverviewMarkdown));
