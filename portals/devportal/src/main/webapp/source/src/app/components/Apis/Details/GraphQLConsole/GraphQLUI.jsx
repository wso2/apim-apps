/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
    useState, useEffect, useRef, useContext,
} from 'react';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';
import '@graphiql/plugin-explorer/dist/style.css';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { ApiContext } from '../ApiContext';
import Api from '../../../../data/api';
import QueryComplexityView from './QueryComplexityView';
import Progress from '../../../Shared/Progress';

const { buildSchema } = require('graphql');

/**
 *
 * @param {*} props
 */
export default function GraphQLUI(props) {
    const {
        authorizationHeader,
        URLs,
        securitySchemeType,
        accessTokenProvider,
        additionalHeaders,
    } = props;
    const { api } = useContext(ApiContext);
    const [schema, setSchema] = useState(null);
    const [query, setQuery] = useState('');
    const graphiqlEl = useRef(null);

    useEffect(() => {
        const apiID = api.id;
        const apiClient = new Api();
        const promiseGraphQL = apiClient.getGraphQLSchemaByAPIId(apiID);
        promiseGraphQL
            .then((res) => {
                const graphqlSchemaObj = buildSchema(res.data);
                setSchema(graphqlSchemaObj);
            });
    }, []);

    /**
     * Get subscription fetcher.
     * @param {string} wsUrl subscription websocket URL
     * @return {string} The subscription fetcher
     */
    function queryFetcher(wsUrl) {
        let token;
        if (api.advertiseInfo && api.advertiseInfo.advertised) {
            token = accessTokenProvider();
        } else if (securitySchemeType === 'API-KEY') {
            token = accessTokenProvider();
        } else if (securitySchemeType === 'BASIC') {
            token = 'Basic ' + accessTokenProvider();
        } else {
            token = 'Bearer ' + accessTokenProvider();
        }

        const headers = {
            [authorizationHeader]: token,
        };

        additionalHeaders.forEach((header) => {
            headers[header.name] = header.value;
        });

        return createGraphiQLFetcher({
            headers,
            url: URLs ? URLs.https : null,
            subscriptionUrl: wsUrl === null || wsUrl === undefined ? null
                : wsUrl + '?access_token=' + accessTokenProvider(),
        });
    }

    const explorer = explorerPlugin();

    const queryComplexityAnalyzer = {
        title: 'Query Complexity Analyzer',
        icon: () => <QueryStatsIcon />,
        content: () => <QueryComplexityView />,
    };

    if (schema === null) {
        return <Progress />;
    } else {
        return (
            <>
                <div>
                    <Box display='flex'>
                        <Box display='flex' width={1}>
                            <Box display='flex' height='800px' flexGrow={1}>
                                <GraphiQL
                                    ref={graphiqlEl}
                                    fetcher={(queryFetcher(URLs && URLs.wss))}
                                    schema={schema}
                                    query={query}
                                    onEditQuery={setQuery}
                                    plugins={[explorer, queryComplexityAnalyzer]}
                                />
                            </Box>
                        </Box>
                    </Box>
                </div>
            </>
        );
    }
}

GraphQLUI.propTypes = {
    classes: PropTypes.shape({
        paper: PropTypes.string.isRequired,
    }).isRequired,
    additionalHeaders: PropTypes.shape({
        array: PropTypes.arrayOf(PropTypes.element).isRequired,
    }).isRequired,
};
