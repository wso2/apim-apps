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

import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import DescriptionAndSummary from './operationComponents/asyncapi/DescriptionAndSummary';
import OperationGovernance from './operationComponents/asyncapi/OperationGovernance';
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
    } = props;

    const trimmedVerb = verb === 'publish' || verb === 'subscribe' ? verb.substr(0, 3) : verb;
    const theme = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[trimmedVerb];

    const [isExpanded, setIsExpanded] = useState(false);
    const isUsedInAPIProduct = false;

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
                    <Grid container direction='row' justifyContent='space-between' alignItems='center' spacing={0}>
                        <Grid item md={11}>
                            <Badge invisible='false' color='error' variant='dot'>
                                <Button
                                    disableFocusRipple
                                    variant='outlined'
                                    size='small'
                                    className={classes.customButton}
                                    sx={{ borderColor: backgroundColor, color: backgroundColor }}
                                >
                                    {trimmedVerb.toUpperCase()}
                                </Button>
                            </Badge>
                            <Typography display='inline' style={{ margin: '0px 30px' }} variant='h6' gutterBottom>
                                {target}
                            </Typography>
                        </Grid>
                        {!(disableDelete || markAsDelete) && (
                            <Grid item md={1} justifyContent='flex-end' container>
                                <Tooltip
                                    title={
                                        isUsedInAPIProduct
                                            ? (
                                                <FormattedMessage
                                                    id={'Apis.Details.Resources.components.Operation.cannot.delete'
                                                    + '.when.used.in.api.products'}
                                                    defaultMessage='Cannot delete operation when used in an API product'
                                                />
                                            )
                                            : (
                                                <FormattedMessage
                                                    id='Apis.Details.Resources.components.Operation.Delete'
                                                    defaultMessage='Delete'
                                                />
                                            )
                                    }
                                    aria-label={(
                                        <FormattedMessage
                                            id='Apis.Details.Resources.components.Operation.delete.operation'
                                            defaultMessage='Delete operation'
                                        />
                                    )}
                                >
                                    <div>
                                        <IconButton
                                            disabled={Boolean(isUsedInAPIProduct)
                                                || disableUpdate
                                                || isRestricted(['apim:api_publish', 'apim:api_create'])}
                                            onClick={toggleDelete}
                                            aria-label='delete'
                                            size='large'>
                                            <DeleteIcon fontSize='small' />
                                        </IconButton>
                                    </div>
                                </Tooltip>
                            </Grid>
                        )}
                    </Grid>
                </AccordionSummary>
                <Divider sx={{ backgroundColor }} />
                <AccordionDetails>
                    <Grid spacing={2} container direction='row' justifyContent='flex-start' alignItems='flex-start'>
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
    }).isRequired,
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    spec: PropTypes.shape({}).isRequired,
    resolvedSpec: PropTypes.shape({}).isRequired,
    sharedScopes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    highlight: PropTypes.bool,
    disableUpdate: PropTypes.bool,
};

export default React.memo(AsyncOperation);
