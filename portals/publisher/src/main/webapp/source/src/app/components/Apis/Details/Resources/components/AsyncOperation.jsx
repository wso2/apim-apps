/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Utils from 'AppData/Utils';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import DescriptionAndSummary from './operationComponents/asyncapi/DescriptionAndSummary';
import OperationGovernance from './operationComponents/asyncapi/OperationGovernance';
import Asyncv3OperationsList from './operationComponents/asyncapi/Asyncv3OperationsList';
import Parameters from './operationComponents/asyncapi/Parameters';
import PayloadProperties from './operationComponents/asyncapi/PayloadProperties';
import Runtime from './operationComponents/asyncapi/Runtime';

const PREFIX = 'AsyncOperation';

const classes = {
    customButton: `${PREFIX}-customButton`,
    paperStyles: `${PREFIX}-paperStyles`,
    linearProgress: `${PREFIX}-linearProgress`,
    contentNoMargin: `${PREFIX}-contentNoMargin`,
    overlayUnmarkDelete: `${PREFIX}-overlayUnmarkDelete`
};

const Root = styled('div')(({ theme }) => {
    return {
        [`& .${classes.customButton}`]: {
            backgroundColor: '#ffffff',
            width: theme.spacing(2),
        },
        [`& .${classes.paperStyles}`]: {
            borderBottom: '',
        },
        [`& .${classes.linearProgress}`]: {
            height: '2px',
        },
        [`& .${classes.contentNoMargin}`]: {
            margin: theme.spacing(0),
        },
        [`& .${classes.overlayUnmarkDelete}`]: {
            position: 'absolute',
            zIndex: theme.zIndex.operationDeleteUndo,
            right: '10%',
        },
    };
});

const HeaderContent = ({ isAsyncV3, ...props }) => {
    const {
        verb, trimmedVerb, target, backgroundColor, 
        isUsedInAPIProduct, disableDelete, markAsDelete, 
        disableUpdate, toggleDelete, operation, namedOperations 
    } = props;

    const deleteButton = !(disableDelete || markAsDelete) && (
        <Tooltip title={isUsedInAPIProduct ? 'Cannot delete' : 'Delete'}>
            <div>
                <IconButton
                    disabled={Boolean(isUsedInAPIProduct) || disableUpdate ||
                        isRestricted(['apim:api_publish', 'apim:api_create'])}
                    onClick={toggleDelete}
                    size='large'>
                    <DeleteIcon fontSize='small' />
                </IconButton>
            </div>
        </Tooltip>
    );

    const isSecure = operation['x-auth-type']?.toLowerCase() !== 'none';
    const securityIcon = (
        <Tooltip title={isSecure ? 'Security enabled' : 'No security'}>
            <IconButton aria-label='Security'>
                {isSecure ? <LockIcon fontSize='small' /> : <LockOpenIcon fontSize='small' />}
            </IconButton>
        </Tooltip>
    );

    if (isAsyncV3) {
        return (
            <Box display='flex' alignItems='center' justifyContent='space-between' width='100%'>
                <Box display='flex' alignItems='center' gap={2} sx={{ flex: 4 }}>
                    <Badge invisible='false' color='error' variant='dot'>
                        <Button variant='outlined' size='small' className={classes.customButton}
                            sx={{ borderColor: backgroundColor, color: backgroundColor }}>
                            {verb.toUpperCase()}
                        </Button>
                    </Badge>
                    <Typography display='inline' style={{ margin: '0px 30px' }} variant='h6'>{target}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={1} sx={{ flex: 1, justifyContent: 'center' }}>
                    <Typography variant='body2'>
                        <FormattedMessage id='...' defaultMessage='<b>Operations</b> ({count})'
                            values={{ count: namedOperations.length, b: (c) => <strong>{c}</strong> }} />
                    </Typography>
                </Box>
                <Box display='flex' alignItems='center' sx={{ flex: 1, justifyContent: 'flex-end' }}>
                    {deleteButton}
                    {securityIcon}
                </Box>
            </Box>
        );
    }

    return (
        <Grid container direction='row' justifyContent='space-between' alignItems='center' spacing={0}>
            <Grid item md={11}>
                <Badge invisible='false' color='error' variant='dot'>
                    <Button variant='outlined' size='small' className={classes.customButton}
                        sx={{ borderColor: backgroundColor, color: backgroundColor }}>
                        {trimmedVerb.toUpperCase()}
                    </Button>
                </Badge>
                <Typography display='inline' style={{ margin: '0px 30px' }} variant='h6'>{target}</Typography>
            </Grid>
            <Grid item md={1} justifyContent='flex-end' container>
                {deleteButton}
                {securityIcon}
            </Grid>
        </Grid>
    );
};

/**
 *
 * Handle the operation UI
 * @export
 * @param {*} props
 * @returns {React.Component} @inheritdoc
 */
function AsyncOperation(props) {
    const {
        operation,
        operationsDispatcher,
        highlight,
        api,
        disableDelete,
        disableUpdate,
        onMarkAsDelete,
        markAsDelete,
        spec,
        target,
        verb,
        sharedScopes,
        componentValidator,
        isAsyncV3,
    } = props;

    const trimmedVerb = (!isAsyncV3 && (verb === 'publish' || verb === 'subscribe'))
        ? verb.substr(0, 3)
        : verb;

    const theme = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[trimmedVerb] || theme.palette.primary.main;

    const [isExpanded, setIsExpanded] = useState(false);

    // v3 only
    const namedOperations = isAsyncV3
        ? (operation[verb]?.['x-operations'] || [])
        : [];

    function handleDeleteNamedOperation(opName) {
        operationsDispatcher({
            action: 'deleteNamedOperation',
            data: { target, verb, value: opName },
        });
    }

    /**
     *
     *
     * @param {*} event
     */
    function toggleDelete(event) {
        event.stopPropagation();
        event.preventDefault();
        setIsExpanded(false);
        onMarkAsDelete({ verb, target }, !markAsDelete);
    }

    /**
     *
     *
     * @param {*} event
     * @param {*} expanded
     */
    function handleExpansion(event, expanded) {
        setIsExpanded(expanded);
    }

    return (
        <Root>
            {markAsDelete && (
                <Box className={classes.overlayUnmarkDelete}>
                    <Tooltip title='Marked for delete' aria-label='Marked for delete'>
                        <Button onClick={toggleDelete} variant='outlined' style={{ marginTop: '10px' }}>
                            <FormattedMessage
                                id='Apis.Details.Resources.components.Operation.undo.delete'
                                defaultMessage='Undo Delete'
                            />
                        </Button>
                    </Tooltip>
                </Box>
            )}
            <Accordion
                expanded={isExpanded}
                onChange={handleExpansion}
                disabled={markAsDelete}
                className={classes.paperStyles}
                sx={{ borderColor: backgroundColor }}
            >
                <AccordionSummary
                    disableRipple
                    disableTouchRipple
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel2a-content'
                    id='panel2a-header'
                    classes={{ content: classes.contentNoMargin }}
                    sx={highlight ? { backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1) } : { }}
                >
                    <HeaderContent 
                        {...props} 
                        trimmedVerb={trimmedVerb} 
                        backgroundColor={backgroundColor} 
                        toggleDelete={toggleDelete} 
                        namedOperations={namedOperations}
                    />
                </AccordionSummary>
                <Divider sx={{ backgroundColor }} />
                <AccordionDetails>
                    <Grid spacing={2} container direction='row' justifyContent='flex-start' alignItems='flex-start'>
                        {isAsyncV3 && (
                            <Asyncv3OperationsList
                                operations={namedOperations}
                                onDeleteOperation={handleDeleteNamedOperation}
                                disableDelete={disableDelete || disableUpdate}
                            />
                        )}
                        <DescriptionAndSummary
                            operation={operation}
                            operationsDispatcher={operationsDispatcher}
                            disableUpdate={disableUpdate}
                            target={target}
                            verb={verb}
                        />
                        {operation.parameters && (
                            <Parameters
                                operation={operation}
                                operationsDispatcher={operationsDispatcher}
                                api={api}
                                disableUpdate={disableUpdate}
                                spec={spec}
                                target={target}
                                verb={verb}
                            />
                        )}
                        <PayloadProperties
                            operation={operation}
                            operationsDispatcher={operationsDispatcher}
                            disableUpdate={disableUpdate}
                            target={target}
                            verb={verb}
                            namedOperations={namedOperations}
                            isAsyncV3={isAsyncV3}
                        />
                        {(api.gatewayVendor === 'wso2') && (
                            <>
                                <OperationGovernance
                                    operation={operation}
                                    operationsDispatcher={operationsDispatcher}
                                    api={api}
                                    disableUpdate={disableUpdate}
                                    spec={spec}
                                    target={target}
                                    verb={verb}
                                    sharedScopes={sharedScopes}
                                    componentValidator={componentValidator}
                                />
                                {(api.type === 'WS' || api.type === 'WEBSUB') && (
                                    <Runtime
                                        operation={operation}
                                        operationsDispatcher={operationsDispatcher}
                                        disableUpdate={disableUpdate}
                                        target={target}
                                        verb={verb}
                                        api={api}
                                    />
                                )}
                            </>
                        )}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Root>
    );
}
AsyncOperation.defaultProps = {
    highlight: false,
    disableUpdate: false,
    disableDelete: false,
    onMarkAsDelete: () => {},
    markAsDelete: false,
    isAsyncV3: false,
};
AsyncOperation.propTypes = {
    api: PropTypes.shape({ scopes: PropTypes.arrayOf(PropTypes.shape({})), resourcePolicies: PropTypes.shape({}) })
        .isRequired,
    operationsDispatcher: PropTypes.func.isRequired,
    onMarkAsDelete: PropTypes.func,
    resourcePolicy: PropTypes.shape({}).isRequired,
    markAsDelete: PropTypes.bool,
    disableDelete: PropTypes.bool,
    operation: PropTypes.shape({
        'x-wso2-new': PropTypes.bool,
        summary: PropTypes.string,
        'x-auth-type': PropTypes.string,
    }).isRequired,
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    spec: PropTypes.shape({}).isRequired,
    resolvedSpec: PropTypes.shape({}).isRequired,
    sharedScopes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    highlight: PropTypes.bool,
    disableUpdate: PropTypes.bool,
    isAsyncV3: PropTypes.bool,
};

export default React.memo(AsyncOperation);
