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

import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Utils from 'AppData/Utils';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import LockIcon from '@mui/icons-material//Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import { FormattedMessage } from 'react-intl';
import DescriptionAndSummary from './operationComponents/DescriptionAndSummary';
import OperationGovernance from './operationComponents/OperationGovernance';
import AWSLambdaSettings from './operationComponents/AWSLambdaSettings';
import Parameters from './operationComponents/Parameters';
import SOAPToRESTListing from './operationComponents/SOAPToREST/SOAPToRESTListing';
import { getOperationScopes } from '../operationUtils';

const PREFIX = 'Operation';

const classes = {
    customButton: `${PREFIX}-customButton`,
    paperStyles: `${PREFIX}-paperStyles`,
    customDivider: `${PREFIX}-customDivider`,
    linearProgress: `${PREFIX}-linearProgress`,
    highlightSelected: `${PREFIX}-highlightSelected`,
    contentNoMargin: `${PREFIX}-contentNoMargin`,
    overlayUnmarkDelete: `${PREFIX}-overlayUnmarkDelete`,
    targetText: `${PREFIX}-targetText`,
    title: `${PREFIX}-title`
};


const Root = styled('div')(({ theme }) => {
    return {
        [`& .${classes.customButton}`]: {
            // '&:hover': { backgroundColor },
            // backgroundColor,
            width: theme.spacing(12),
            // color: theme.palette.getContrastText(backgroundColor),
        },
        [`& .${classes.paperStyles}`]: {
            // border: `1px solid ${backgroundColor}`,
            borderBottom: '',
        },
        [`& .${classes.customDivider}`]: {
            // backgroundColor,
        },
        [`& .${classes.linearProgress}`]: {
            height: '2px',
        },
        [`& .${classes.highlightSelected}`]: {
            // backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1),
        },
        [`& .${classes.contentNoMargin}`]: {
            margin: theme.spacing(0),
        },
        [`& .${classes.overlayUnmarkDelete}`]: {
            position: 'absolute',
            zIndex: theme.zIndex.operationDeleteUndo,
            right: '10%',
        },
        [`& .${classes.targetText}`]: {
            maxWidth: 180,
            margin: '0px 20px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'inline-block',
        },
        [`& .${classes.title}`]: {
            display: 'inline',
            margin: `0 ${theme.spacing(5)}`,
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
function Operation(props) {
    const {
        operation,
        operationsDispatcher,
        highlight,
        operationRateLimits,
        api,
        disableDelete,
        disableUpdate,
        onMarkAsDelete,
        markAsDelete,
        hideParameters,
        spec,
        resourcePolicy,
        resourcePoliciesDispatcher,
        target,
        verb,
        arns,
        resolvedSpec,
        sharedScopes,
        setFocusOperationLevel,
        expandedResource,
        setExpandedResource,
    } = props;
    const apiOperation = api.operations[target] && api.operations[target][verb.toUpperCase()];
    const isUsedInAPIProduct = apiOperation && Array.isArray(
        apiOperation.usedProductIds,
    ) && apiOperation.usedProductIds.length;

    /**
     *
     *
     * @param {*} event
     */
    function toggleDelete(event) {
        event.stopPropagation();
        event.preventDefault();
        setExpandedResource(false);
        onMarkAsDelete({ verb, target }, !markAsDelete);
    }

    const handleExpansion = (panel) => (event, isExpanded) => {
        setExpandedResource(isExpanded ? panel : false);
    };

    const theme = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[verb];

    return (
        <Root>
            {markAsDelete && (
                <Box className={classes.overlayUnmarkDelete}>
                    <Tooltip title='Marked for delete'>
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
                expanded={expandedResource === verb + target}
                onChange={handleExpansion(verb + target)}
                disabled={markAsDelete}
                className={classes.paperStyles}
                sx={{ border: `1px solid ${backgroundColor}`}}
            >
                <AccordionSummary
                    className={highlight ? classes.highlightSelected : ''}
                    disableRipple
                    disableTouchRipple
                    expandIcon={<ExpandMoreIcon />}
                    id={verb + target}
                    classes={{ content: classes.contentNoMargin }}
                    sx={{ backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1)}}
                >
                    <Grid container direction='row' justifyContent='space-between' alignItems='center'>
                        <Grid item md={4} style={{ display: 'flex', alignItems: 'center' }}>
                            <Badge
                                invisible={!operation['x-wso2-new']}
                                color='error'
                                variant='dot'
                                style={{ display: 'inline-block' }}
                            >
                                <Button
                                    disableFocusRipple
                                    variant='contained'
                                    aria-label={'HTTP verb ' + verb}
                                    size='small'
                                    className={classes.customButton}
                                    sx={{ backgroundColor, color: theme.palette.getContrastText(backgroundColor) }}
                                >
                                    {verb}
                                </Button>
                            </Badge>
                            <Typography
                                display='inline-block'
                                variant='h6'
                                component='div'
                                gutterBottom
                                className={classes.targetText}
                                title={target}
                            >
                                {target}
                                {(operation.summary && operation.summary !== '') && (
                                    <Typography
                                        display='inline-block'
                                        style={{ margin: '0px 30px' }}
                                        variant='caption'
                                        gutterBottom
                                    >
                                        {operation.summary}
                                    </Typography>
                                )}
                            </Typography>
                        </Grid>
                        {(isUsedInAPIProduct) ? (
                            <Grid item md={3}>
                                <Box display='flex' justifyContent='center'>
                                    <ReportProblemOutlinedIcon fontSize='small' />
                                    <Box display='flex' ml={1} mt={1 / 4} fontSize='caption.fontSize'>
                                        <FormattedMessage
                                            id={'Apis.Details.Resources.components.Operation.this.operation.'
                                            + 'used.in.products'}
                                            defaultMessage={'This operation is used in {isUsedInAPIProduct} API '
                                            + 'product(s)'}
                                            values={{ isUsedInAPIProduct }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        ) : (
                            <Grid item md={3} />
                        )}
                        <Grid item md={4}>
                            <Typography
                                display='inline'
                                style={{ margin: '0px 30px' }}
                                variant='caption'
                                gutterBottom
                            >
                                <b>{ getOperationScopes(operation, spec).length !== 0 && 'Scope : ' }</b>
                                { getOperationScopes(operation, spec).join(', ') }
                            </Typography>
                        </Grid>
                        <Grid item md={1} justifyContent='flex-end' alignItems='center' container>
                            {!(disableDelete || markAsDelete) && (
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
                                >
                                    <div>
                                        <IconButton
                                            disabled={Boolean(isUsedInAPIProduct) || disableUpdate}
                                            onClick={toggleDelete}
                                            aria-label='delete operation'
                                            size='large'>
                                            <DeleteIcon fontSize='small' />
                                        </IconButton>
                                    </div>
                                </Tooltip>
                            )}
                            <Tooltip
                                title={
                                    (operation['x-auth-type'] && operation['x-auth-type'].toLowerCase() !== 'none')
                                        ? (
                                            <FormattedMessage
                                                id={'Apis.Details.Resources.components.Operation.disable.security'
                                                    + '.when.used.in.api.products'}
                                                defaultMessage='Security enabled'
                                            />
                                        )
                                        : (
                                            <FormattedMessage
                                                id='Apis.Details.Resources.components.enabled.security'
                                                defaultMessage='No security'
                                            />
                                        )
                                }
                                aria-label={(
                                    <FormattedMessage
                                        id='Apis.Details.Resources.components.Operation.security.operation'
                                        defaultMessage='Security '
                                    />
                                )}
                            >
                                <IconButton aria-label='Security' size='large'>
                                    {(operation['x-auth-type'] && operation['x-auth-type'].toLowerCase() !== 'none')
                                        ? <LockIcon fontSize='small' />
                                        : <LockOpenIcon fontSize='small' />}
                                </IconButton>
                            </Tooltip>

                        </Grid>
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
                        <OperationGovernance
                            operation={operation}
                            operationsDispatcher={operationsDispatcher}
                            operationRateLimits={operationRateLimits}
                            api={api}
                            disableUpdate={disableUpdate}
                            spec={spec}
                            target={target}
                            verb={verb}
                            sharedScopes={sharedScopes}
                            setFocusOperationLevel={setFocusOperationLevel}
                        />
                        {!hideParameters && (
                            <Parameters
                                operation={operation}
                                operationsDispatcher={operationsDispatcher}
                                operationRateLimits={operationRateLimits}
                                api={api}
                                disableUpdate={disableUpdate}
                                spec={spec}
                                target={target}
                                verb={verb}
                                resolvedSpec={resolvedSpec}
                            />
                        )}
                        {resourcePolicy && (
                            <SOAPToRESTListing
                                operation={operation}
                                operationsDispatcher={operationsDispatcher}
                                operationRateLimits={operationRateLimits}
                                resourcePolicy={resourcePolicy}
                                resourcePoliciesDispatcher={resourcePoliciesDispatcher}
                                disableUpdate={disableUpdate}
                                spec={spec}
                                target={target}
                                verb={verb}
                            />
                        )}
                        {
                            api.endpointConfig
                            && api.endpointConfig.endpoint_type
                            && api.endpointConfig.endpoint_type === 'awslambda'
                            && (
                                <AWSLambdaSettings
                                    operation={operation}
                                    operationsDispatcher={operationsDispatcher}
                                    target={target}
                                    verb={verb}
                                    arns={arns}
                                />
                            )
                        }
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Root>
    );
}
Operation.defaultProps = {
    highlight: false,
    disableUpdate: false,
    hideParameters: false,
    disableDelete: false,
    onMarkAsDelete: () => {},
    markAsDelete: false,
    operationRateLimits: [], // Response body.list from apis policies for `api` throttling policies type
};
Operation.propTypes = {
    api: PropTypes.shape({ scopes: PropTypes.arrayOf(PropTypes.shape({})), resourcePolicies: PropTypes.shape({}) })
        .isRequired,
    operationsDispatcher: PropTypes.func.isRequired,
    onMarkAsDelete: PropTypes.func,
    resourcePoliciesDispatcher: PropTypes.func.isRequired,
    markAsDelete: PropTypes.bool,
    disableDelete: PropTypes.bool,
    disableUpdate: PropTypes.bool,
    hideParameters: PropTypes.bool,
    resourcePolicy: PropTypes.shape({}).isRequired,
    operation: PropTypes.shape({
        'x-wso2-new': PropTypes.bool,
        summary: PropTypes.string,
    }).isRequired,
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    spec: PropTypes.shape({}).isRequired,
    highlight: PropTypes.bool,
    operationRateLimits: PropTypes.arrayOf(PropTypes.shape({})),
    arns: PropTypes.shape([]).isRequired,
    resolvedSpec: PropTypes.shape({}).isRequired,
    sharedScopes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    expandedResource: PropTypes.string.isRequired,
    setExpandedResource: PropTypes.func.isRequired,
};

export default React.memo(Operation);
