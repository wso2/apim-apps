/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import TextField from '@mui/material/TextField';
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
import * as monaco from 'monaco-editor'
import { Editor as MonacoEditor, loader } from '@monaco-editor/react';

import { FormattedMessage } from 'react-intl';
import OperationGovernance 
    from 'AppComponents/Apis/Details/Resources/components/operationComponents/OperationGovernance';
import { getOperationScopes } from 'AppComponents/Apis/Details/Resources/operationUtils';

const PREFIX = 'Operation';

// load Monaco from node_modules instead of CDN
loader.config({ monaco });

const classes = {
    customButton: `${PREFIX}-customButton`,
    paperStyles: `${PREFIX}-paperStyles`,
    customDivider: `${PREFIX}-customDivider`,
    linearProgress: `${PREFIX}-linearProgress`,
    highlightSelected: `${PREFIX}-highlightSelected`,
    contentNoMargin: `${PREFIX}-contentNoMargin`,
    overlayUnmarkDelete: `${PREFIX}-overlayUnmarkDelete`,
    targetText: `${PREFIX}-targetText`,
    title: `${PREFIX}-title`,
    descriptionSection: `${PREFIX}-descriptionSection`,
    schemaEditor: `${PREFIX}-schemaEditor`,
    resourceMapping: `${PREFIX}-resourceMapping`
};


const Root = styled('div')(({ theme }) => {
    return {
        [`& .${classes.customButton}`]: {
            width: theme.spacing(12),
        },
        [`& .${classes.paperStyles}`]: {
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
        [`& .${classes.descriptionSection}`]: {
            marginBottom: theme.spacing(3),
        },
        [`& .${classes.schemaEditor}`]: {
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            height: '300px',
        },
        [`& .${classes.resourceMapping}`]: {
            backgroundColor: theme.palette.grey[50],
            padding: theme.spacing(2),
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${theme.palette.divider}`,
        },
    };
});

/**
 * Description and Summary Component
 */
function DescriptionAndSummary({ operation, operationsDispatcher, disableUpdate, target, verb }) {
    // Get resource mapping from backend operation
    const getResourceMapping = () => {
        if (operation.backendOperationMapping && operation.backendOperationMapping.backendOperation) {
            const backendOp = operation.backendOperationMapping.backendOperation;
            return `${backendOp.verb} ${backendOp.target}`;
        }
        return 'Not available';
    };

    return (
        <Grid item xs={12} className={classes.descriptionSection}>
            <Typography variant='h6' gutterBottom>
                <FormattedMessage
                    id='Apis.Details.Resources.components.Operation.Tool.Details'
                    defaultMessage='Tool Details'
                />
            </Typography>
            
            <Grid container spacing={3}>
                {/* Name (formerly target) */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label={
                            <FormattedMessage
                                id='Apis.Details.Resources.components.Operation.Name'
                                defaultMessage='Name'
                            />
                        }
                        value={operation.target || ''}
                        disabled={disableUpdate}
                        variant='outlined'
                        size='small'
                        onChange={({ target: { value } }) => operationsDispatcher({
                            action: 'target',
                            data: { target, verb, value },
                        })}
                    />
                </Grid>

                {/* Description */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label={
                            <FormattedMessage
                                id='Apis.Details.Resources.Operation.Components.Description'
                                defaultMessage='Description'
                            />
                        }
                        multiline
                        rows={4}
                        value={operation.description || ''}
                        disabled={disableUpdate}
                        variant='outlined'
                        size='small'
                        onChange={({ target: { value } }) => operationsDispatcher({
                            action: 'description',
                            data: { target, verb, value },
                        })}
                    />
                </Grid>

                {/* Schema: view only */}
                <Grid item xs={12}>
                    <Typography variant='subtitle2' color='textSecondary' gutterBottom>
                        <FormattedMessage
                            id='Apis.Details.Resources.components.Operation.Schema'
                            defaultMessage='Schema'
                        />
                    </Typography>
                    {operation.schemaDefinition ? (
                        <Box className={classes.schemaEditor}>
                            <MonacoEditor
                                language='json'
                                width='100%'
                                height='300px'
                                theme='vs-light'
                                value={operation.schemaDefinition}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontSize: 12,
                                }}
                            />
                        </Box>
                    ) : (
                        <Typography variant='body2' color='textSecondary'>
                            No schema definition available
                        </Typography>
                    )}
                </Grid>

                {/* Resource Mapping */}
                <Grid item xs={12}>
                    <Typography variant='subtitle2' color='textSecondary' gutterBottom>
                        <FormattedMessage
                            id='Apis.Details.Resources.components.Operation.Resource.Mapping'
                            defaultMessage='Resource Mapping'
                        />
                    </Typography>
                    <Box className={classes.resourceMapping}>
                        <Typography variant='body1' fontFamily='monospace'>
                            {getResourceMapping()}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Grid>
    );
}

DescriptionAndSummary.propTypes = {
    operation: PropTypes.shape({
        target: PropTypes.string,
        description: PropTypes.string,
        schemaDefinition: PropTypes.string,
        backendOperationMapping: PropTypes.shape({
            backendOperation: PropTypes.shape({
                verb: PropTypes.string,
                target: PropTypes.string,
            }),
        }),
    }).isRequired,
    operationsDispatcher: PropTypes.func.isRequired,
    disableUpdate: PropTypes.bool.isRequired,
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
};

/**
 *
 * Handle the operation UI
 * @export
 * @param {*} props
 * @returns {React.Component} @inheritdoc
 */
function ToolDetails(props) {
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
        spec,
        target,
        verb,
        sharedScopes,
        setFocusOperationLevel,
        expandedResource,
        setExpandedResource,
        componentValidator,
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
                                    aria-label={'Tool verb ' + verb}
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
                                {(operation.description && operation.description !== '') && (
                                    <Typography
                                        display='inline-block'
                                        style={{ margin: '0px 30px' }}
                                        variant='caption'
                                        gutterBottom
                                    >
                                        {operation.description}
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
                            componentValidator={componentValidator}
                        />
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Root>
    );
}
ToolDetails.defaultProps = {
    highlight: false,
    disableUpdate: false,
    disableDelete: false,
    onMarkAsDelete: () => {},
    markAsDelete: false,
    operationRateLimits: [], // Response body.list from apis policies for `api` throttling policies type
};
ToolDetails.propTypes = {
    api: PropTypes.shape({ scopes: PropTypes.arrayOf(PropTypes.shape({})), resourcePolicies: PropTypes.shape({}) })
        .isRequired,
    operationsDispatcher: PropTypes.func.isRequired,
    onMarkAsDelete: PropTypes.func,
    markAsDelete: PropTypes.bool,
    disableDelete: PropTypes.bool,
    disableUpdate: PropTypes.bool,
    resourcePolicy: PropTypes.shape({}).isRequired,
    operation: PropTypes.shape({
        'x-wso2-new': PropTypes.bool,
        summary: PropTypes.string,
        target: PropTypes.string,
        description: PropTypes.string,
        schemaDefinition: PropTypes.string,
        backendOperationMapping: PropTypes.shape({
            backendOperation: PropTypes.shape({
                verb: PropTypes.string,
                target: PropTypes.string,
            }),
        }),
    }).isRequired,
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    spec: PropTypes.shape({}).isRequired,
    highlight: PropTypes.bool,
    operationRateLimits: PropTypes.arrayOf(PropTypes.shape({})),
    resolvedSpec: PropTypes.shape({}).isRequired,
    sharedScopes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    expandedResource: PropTypes.string.isRequired,
    setExpandedResource: PropTypes.func.isRequired,
};

export default React.memo(ToolDetails);
