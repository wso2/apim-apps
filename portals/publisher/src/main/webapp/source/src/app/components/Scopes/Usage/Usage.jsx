/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Typography, Box } from '@mui/material';
import Button from '@mui/material/Button';
import UsageIcon from '@mui/icons-material/List';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import API from 'AppData/api';
import UsageViewAPI from './UsageViewAPI';

const PREFIX = 'Usage';

const classes = {
    appBar: `${PREFIX}-appBar`,
    flex: `${PREFIX}-flex`,
    popupHeader: `${PREFIX}-popupHeader`,
    splitWrapper: `${PREFIX}-splitWrapper`,
    docName: `${PREFIX}-docName`,
    button: `${PREFIX}-button`,
    root: `${PREFIX}-root`,
    usageDialogHeader: `${PREFIX}-usageDialogHeader`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    sectionContainer: `${PREFIX}-sectionContainer`,
};

const Root = styled('div')(() => ({
    [`&.${classes.root}`]: {
        width: '100%',
        flexDirection: 'row',
        display: 'flex',
    },

    [`& .${classes.usageDialogHeader}`]: {
        fontWeight: '600',
        fontSize: 'h6.fontSize',
        marginRight: 10,
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: 10,
    },

    [`& .${classes.sectionContainer}`]: {
        width: '100%',
    },
}));

/**
*
* @param {any} props Props for usage function.
* @returns {any} Returns the rendered UI for scope usage.
*/
function Usage(props) {

    const [open, setOpen] = useState(false);
    const [usage, setUsage] = useState({});
    const { scopeName, scopeId, usageCount } = props;

    useEffect(() => {
        API.getSharedScopeUsages(scopeId).then((response) =>
        {
            // Process the usages array to separate HTTP and MCP types
            const usagesList = response.body.usages || [];
            
            // Process revision resources, in case a shared scope applied resource is used in current API and a revision
            // the response from API will have 2 records. Here we flatten it to a single API record that has 2
            // revision resources.
            const httpApisMap = new Map();
            const mcpServersMap = new Map();
            const processedApiList = [];
            const processedMCPList = [];
            
            // Define API types that should be processed as HTTP APIs
            const apiTypeList = [
                'HTTP', 'WS', 'SOAPTOREST', 'GRAPHQL', 'SOAP', 
                'SSE', 'WEBSUB', 'WEBHOOK', 'ASYNC'
            ];
            
            for (let i = 0; i < usagesList.length; i++) {
                const usageItem = usagesList[i];
                const key = usageItem.provider + ":" + usageItem.name + ":" + usageItem.version;
                
                const usageData = {
                    name: usageItem.name,
                    context: usageItem.context,
                    version: usageItem.version,
                    provider: usageItem.provider,
                    usedResourceList: usageItem.usedResourceList || []
                };

                if (apiTypeList.includes(usageItem.type)) {
                    let apiData = null;
                    if (httpApisMap.has(key)) {
                        apiData = httpApisMap.get(key);
                        for (let j = 0; j < usageItem.usedResourceList.length; j++) {
                            const resource = usageItem.usedResourceList[j];
                            resource.revisionID = usageItem.revisionId;
                            apiData.usedResourceList.push(resource);
                        }
                    } else {
                        const resourceList = [];
                        for (let k = 0; k < usageItem.usedResourceList.length; k++) {
                            const resource = usageItem.usedResourceList[k];
                            resource.revisionID = usageItem.revisionId;
                            resourceList.push(resource);
                        }
                        apiData = {
                            ...usageData,
                            usedResourceList: resourceList
                        };
                        httpApisMap.set(key, apiData);
                        processedApiList.push(apiData);
                    }
                } else if (usageItem.type === 'MCP') {
                    let mcpData = null;
                    if (mcpServersMap.has(key)) {
                        mcpData = mcpServersMap.get(key);
                        for (let j = 0; j < usageItem.usedResourceList.length; j++) {
                            const resource = usageItem.usedResourceList[j];
                            resource.revisionID = usageItem.revisionId;
                            mcpData.usedResourceList.push(resource);
                        }
                    } else {
                        const resourceList = [];
                        for (let k = 0; k < usageItem.usedResourceList.length; k++) {
                            const resource = usageItem.usedResourceList[k];
                            resource.revisionID = usageItem.revisionId;
                            resourceList.push(resource);
                        }
                        mcpData = {
                            ...usageData,
                            usedResourceList: resourceList
                        };
                        mcpServersMap.set(key, mcpData);
                        processedMCPList.push(mcpData);
                    }
                }
            }
            
            setUsage({
                ...response.body,
                usedApiList: processedApiList,
                mcpServersList: processedMCPList
            });
        });
    }, [scopeName, scopeId, usageCount]);

    const handleUsageOpen = () => {
        setOpen(true);
    };

    const handleUsageCancel = () => {
        setOpen(false);
    };

    const dialogTitle = (
        <Root className={classes.root}>
            <Typography compnent='div' variant='h5' className={classes.usageDialogHeader}>
                <FormattedMessage
                    id='Scopes.Usage.Usage.usage'
                    defaultMessage='Usages of'
                />
            </Typography>
            <Typography compnent='div' variant='h5' className={classes.usageDialogHeader}>
                {scopeName}
            </Typography>
        </Root>
    );

    const renderAPISection = () => {
        if (!usage.usedApiList || usage.usedApiList.length === 0) {
            return null;
        }
        
        return (
            <Box className={classes.sectionContainer}>
                <UsageViewAPI scopeUsage={{ usedApiList: usage.usedApiList }} />
            </Box>
        );
    };

    const renderMCPSection = () => {
        if (!usage.mcpServersList || usage.mcpServersList.length === 0) {
            return null;
        }
        
        return (
            <Box className={classes.sectionContainer}>
                <UsageViewAPI 
                    scopeUsage={{ usedApiList: usage.mcpServersList }} 
                    sectionTitle='List of MCP Servers'
                />
            </Box>
        );
    };

    const dialogContent = (
        <Box>
            {renderAPISection()}
            {renderMCPSection()}
        </Box>
    );

    return (
        <div>
            <Button onClick={handleUsageOpen} disabled={usageCount === 0}>
                <UsageIcon />
                <FormattedMessage
                    id='Scopes.Usage.Usage.scope.usage'
                    defaultMessage='Usage'
                />
            </Button>
            <Dialog onBackdropClick={setOpen} open={open} maxWidth='xl'>
                <DialogTitle>
                    <Typography className={classes.usageDialogHeader}>
                        {dialogTitle}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {dialogContent}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleUsageCancel}>
                        <FormattedMessage
                            id='Scopes.Usage.Usage.usage.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
Usage.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    scopeName: PropTypes.string.isRequired,
    scopeId: PropTypes.string.isRequired,
    usageCount: PropTypes.number.isRequired,
    intl: PropTypes.shape({}).isRequired,
    fetchScopeData: PropTypes.shape({}).isRequired,
};

export default injectIntl((Usage));
