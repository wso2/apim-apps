/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';
import { getBasePath } from 'AppComponents/Shared/Utils';
import API from 'AppData/api';

/**
 * AssociatedAPI component to display the associated APIs from MCP Server operations
 * @param {Object} props - Component props
 * @param {Object} props.api - The API object containing operations
 * @param {Object} props.parentClasses - Parent component classes
 * @returns {JSX.Element} - The AssociatedAPI component
 */
function AssociatedAPI({ api, parentClasses }) {
    // Extract unique API name and version combinations from operations
    const getAssociatedAPIs = () => {
        if (!api.operations || !Array.isArray(api.operations)) {
            return [];
        }

        const apiMap = new Map();
        
        api.operations.forEach(operation => {
            if (operation.apiOperationMapping) {
                const { apiName, apiVersion, apiId } = operation.apiOperationMapping;
                if (apiName && apiVersion) {
                    const key = `${apiName}-${apiVersion}`;
                    if (!apiMap.has(key)) {
                        apiMap.set(key, { apiName, apiVersion, apiId });
                    }
                }
            }
        });

        return Array.from(apiMap.values());
    };

    const associatedAPIs = getAssociatedAPIs();

    return (
        <>
            <div>
                <Typography variant='h5' component='h3' className={parentClasses.title}>
                    {associatedAPIs.length === 1 ? (
                        <FormattedMessage
                            id='Apis.Details.Overview.AssociatedAPI.title'
                            defaultMessage='Associated API'
                        />
                    ) : (
                        <FormattedMessage
                            id='Apis.Details.Overview.AssociatedAPI.title'
                            defaultMessage='Associated APIs'
                        />
                    )}
                </Typography>
            </div>
            <Box p={1}>
                <Grid container spacing={1}>
                    {associatedAPIs.length > 0 ? (
                        associatedAPIs.map((apiInfo, index) => (
                            <React.Fragment key={`${apiInfo.apiName}-${apiInfo.apiVersion}`}>
                                <Grid item xs={12} md={6} lg={4}>
                                    <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                        <FormattedMessage
                                            id='Apis.Details.Overview.AssociatedAPI.api.name'
                                            defaultMessage='API Name {number}'
                                            values={{ number: associatedAPIs.length === 1 ? '' : index + 1 }}
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={8}>
                                    <Typography component='p' variant='body1'>
                                        {apiInfo.apiId ? (
                                            <Link
                                                to={getBasePath(API.CONSTS.API) + apiInfo.apiId + '/overview'}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    textDecoration: 'none',
                                                    color: 'inherit'
                                                }}
                                            >
                                                {apiInfo.apiName}
                                                <LaunchIcon style={{ marginLeft: '4px' }} fontSize='small' />
                                            </Link>
                                        ) : (
                                            apiInfo.apiName
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={4}>
                                    <Typography component='p' variant='subtitle2' className={parentClasses.subtitle}>
                                        <FormattedMessage
                                            id='Apis.Details.Overview.AssociatedAPI.api.version'
                                            defaultMessage='Version {number}'
                                            values={{ number: associatedAPIs.length === 1 ? '' : index + 1 }}
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6} lg={8}>
                                    <Typography component='p' variant='body1'>
                                        {apiInfo.apiVersion}
                                    </Typography>
                                </Grid>
                            </React.Fragment>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography component='p' variant='body1' className={parentClasses.notConfigured}>
                                <FormattedMessage
                                    id='Apis.Details.Overview.AssociatedAPI.no.apis'
                                    defaultMessage='No associated APIs found'
                                />
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </>
    );
}

AssociatedAPI.propTypes = {
    api: PropTypes.shape({
        operations: PropTypes.arrayOf(PropTypes.shape({
            apiOperationMapping: PropTypes.shape({
                apiName: PropTypes.string,
                apiVersion: PropTypes.string,
                apiId: PropTypes.string,
            }),
        })),
    }).isRequired,
    parentClasses: PropTypes.shape({}).isRequired,
};

export default AssociatedAPI;
