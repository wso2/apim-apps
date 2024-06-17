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
import { Typography } from '@mui/material';
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
    buttonIcon: `${PREFIX}-buttonIcon`
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
    }
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
            // process revision resources, in case a shared scope applied resource is used in current API and a revision
            // the response from API will have 2 records. Here we flatten it to a single API record that has 2
            // revision resources.
            const apiList = response.body.usedApiList;
            const apisMap = new Map();
            const processedAPIList = [];
            for (let i = 0; i < apiList.length; i++) {
                const api = apiList[i];
                const key =  api.provider + ":" + api.name + ":" + api.version;

                let apiData = null;
                if (apisMap.has(key)) {
                    apiData = apisMap.get(key);
                    for (let j = 0; j < api.usedResourceList.length; j++) {
                        const resource = api.usedResourceList[j];
                        resource.revisionID = api.revisionID;
                        apiData.usedResourceList.push(resource);
                    }
                } else {
                    const resourceList = [];
                    for (let k = 0; k < api.usedResourceList.length; k++) {
                        const resource = api.usedResourceList[k];
                        resource.revisionID = api.revisionID;
                        resourceList.push(resource);
                    }
                    apiData = {
                        name: api.name,
                        context: api.context,
                        version: api.version,
                        provider: api.provider,
                        usedResourceList: resourceList
                    };
                    apisMap.set(key, apiData);
                    processedAPIList.push(apiData);
                }
            }
            response.body.usedApiList = processedAPIList;
            setUsage(response.body);
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
    const dialogContent = (
        <UsageViewAPI scopeUsage={usage} />
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
