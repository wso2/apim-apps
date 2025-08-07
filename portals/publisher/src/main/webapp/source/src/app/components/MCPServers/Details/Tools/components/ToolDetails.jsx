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
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import LockIcon from '@mui/icons-material//Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import * as monaco from 'monaco-editor'
import { Editor as MonacoEditor, loader } from '@monaco-editor/react';
import MethodView from 'AppComponents/Apis/Details/ProductResources/MethodView';

import { FormattedMessage } from 'react-intl';
import OperationGovernance 
    from 'AppComponents/Apis/Details/Resources/components/operationComponents/OperationGovernance';
import { getOperationScopes } from 'AppComponents/Apis/Details/Resources/operationUtils';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const PREFIX = 'ToolDetails';

// load Monaco from node_modules instead of CDN
loader.config({ monaco });

const classes = {
    paperStyles: `${PREFIX}-paperStyles`,
    highlightSelected: `${PREFIX}-highlightSelected`,
    contentNoMargin: `${PREFIX}-contentNoMargin`,
    overlayUnmarkDelete: `${PREFIX}-overlayUnmarkDelete`,
    descriptionSection: `${PREFIX}-descriptionSection`,
    toolName: `${PREFIX}-toolName`,
    accordionContainer: `${PREFIX}-accordionContainer`,
    resourceMappingChip: `${PREFIX}-resourceMappingChip`,
    truncatedText: `${PREFIX}-truncatedText`
};


const Root = styled('div')(({ theme }) => {
    return {
        [`& .${classes.paperStyles}`]: {
            borderBottom: '',
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
        [`& .${classes.descriptionSection}`]: {
            marginY: theme.spacing(1),
        },
        [`& .${classes.toolName}`]: {
            fontWeight: 400,
            fontSize: '1rem',
            color: theme.palette.text.primary,
        },
        [`& .${classes.accordionContainer}`]: {
            border: '1px solid #f2d4a7',
            borderRadius: '8px',
            margin: theme.spacing(1),
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
            },
            transition: 'box-shadow 0.2s ease-in-out',
            overflow: 'hidden'
        },
        [`& .${classes.resourceMappingChip}`]: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            marginLeft: theme.spacing(1),
            width: '200px',
            height: '32px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: theme.spacing(0.5, 1),
            borderRadius: '4px',
            flexShrink: 0
        },
        [`& .${classes.truncatedText}`]: {
            maxWidth: '140px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
    };
});

/**
 * Tool Details Component (Name, Description, Schema, Resource Mapping)
 */
function ToolDetailsSection({ operation, operationsDispatcher, disableUpdate, target, verb, availableOperations }) {

    // Get current selected operation value for the select component
    const getCurrentOperationValue = () => {
        if (operation.backendAPIOperationMapping && operation.backendAPIOperationMapping.backendOperation) {
            const backendOp = operation.backendAPIOperationMapping.backendOperation;
            return `${backendOp.target}_${backendOp.verb}`;
        }
        return '';
    };

    const editorOptions = {
        selectOnLineNumbers: true,
        readOnly: true,
        smoothScrolling: true,
        wordWrap: 'on',
    };

    return (
        <Grid
            item
            xs={12}
            className={classes.descriptionSection}
        >
            <Typography variant='subtitle1' gutterBottom>
                <FormattedMessage
                    id='Apis.Details.Resources.components.Operation.Tool.Details'
                    defaultMessage='Tool Details'
                />
            </Typography>
            <Divider variant='middle' />
            <Grid container spacing={3} px={3} mt={1}>
                {/* Left Panel */}
                <Grid item xs={6}>
                    <Grid container spacing={2}>
                        {/* Name */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={
                                    <FormattedMessage
                                        id='Apis.Details.Resources.components.Operation.Name'
                                        defaultMessage='Name'
                                    />
                                }
                                value={operation.target || target || ''}
                                disabled={disableUpdate}
                                variant='outlined'
                                // size='small'
                                onChange={({ target: { value } }) => operationsDispatcher({
                                    action: 'name',
                                    data: { target, verb, value },
                                })}
                            />
                        </Grid>

                        {/* Resource Mapping - Just the dropdown */}
                        <Grid item xs={12}>
                            <FormControl 
                                fullWidth
                                margin='dense' 
                                variant='outlined' 
                                disabled={disableUpdate}
                            >
                                <InputLabel>
                                    <FormattedMessage
                                        id='MCPServers.Details.Tools.AddTool.operation.label'
                                        defaultMessage='Operation'
                                    />
                                </InputLabel>
                                <Select
                                    value={getCurrentOperationValue()}
                                    onChange={(event) => {
                                        const selectedValue = event.target.value;
                                        const selectedOp = availableOperations.find(op =>
                                            `${op.target}_${op.verb}` === selectedValue
                                        );
                                        if (selectedOp) {
                                            operationsDispatcher({
                                                action: 'updateBackendOperation',
                                                data: { 
                                                    target, 
                                                    verb, 
                                                    backendOperation: {
                                                        target: selectedOp.target,
                                                        verb: selectedOp.verb
                                                    }
                                                },
                                            });
                                        }
                                    }}
                                    label='Operations'
                                    displayEmpty
                                >
                                    <MenuItem value=''>
                                        <em>Select an operation</em>
                                    </MenuItem>
                                    {availableOperations.map((op) => {
                                        const menuValue = `${op.target}_${op.verb}`;
                                        return (
                                            <MenuItem
                                                key={menuValue}
                                                value={menuValue}
                                                sx={{
                                                    margin: '3px 0',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <MethodView
                                                        method={op.verb}
                                                        style={{ marginRight: '5px' }}
                                                    />
                                                    <span style={{ marginLeft: '8px' }}>{op.target}</span>
                                                </div>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Schema */}
                        <Grid item xs={12}>
                            <Typography 
                                variant='subtitle2' 
                                gutterBottom
                                sx={{ 
                                    fontWeight: 400,
                                    color: 'black'
                                }}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Resources.components.Operation.Schema'
                                    defaultMessage='Schema'
                                />
                            </Typography>
                            <Box
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    padding: 2,
                                    backgroundColor: '#fafafa'
                                }}
                            >
                                {operation.schemaDefinition ? (
                                    <MonacoEditor
                                        language='json'
                                        width='100%'
                                        height='200px'
                                        theme='vs-light'
                                        value={operation.schemaDefinition}
                                        options={editorOptions}
                                    />
                                ) : (
                                    <Typography variant='body2' color='textSecondary'>
                                        <FormattedMessage
                                            id='Apis.Details.Resources.components.Operation.Schema.Not.Available'
                                            defaultMessage='No schema definition available'
                                        />
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Right Panel */}
                <Grid item xs={6}>
                    <Grid container spacing={2}>
                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={
                                    <FormattedMessage
                                        id='Apis.Details.Resources.Operation.Components.Description'
                                        defaultMessage='Description'
                                    />
                                }
                                value={operation.description || ''}
                                disabled={disableUpdate}
                                variant='outlined'
                                multiline
                                rows={5}
                                onChange={({ target: { value } }) => operationsDispatcher({
                                    action: 'description',
                                    data: { target, verb, value },
                                })}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

ToolDetailsSection.propTypes = {
    operation: PropTypes.shape({
        name: PropTypes.string,
        target: PropTypes.string,
        description: PropTypes.string,
        schemaDefinition: PropTypes.string,
        backendAPIOperationMapping: PropTypes.shape({
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
    availableOperations: PropTypes.arrayOf(PropTypes.shape({
        target: PropTypes.string,
        verb: PropTypes.string,
        summary: PropTypes.string,
        description: PropTypes.string,
    })).isRequired,
};

/**
 *
 * Handle the tool details UI
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
        availableOperations,
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

    // Use stable ID for accordion expansion to prevent collapse during name changes
    const stableId = operation.id || `${verb}_${target}`;

    const theme = useTheme();

    // Get resource mapping for display in accordion summary
    const getResourceMappingDisplay = () => {
        if (operation.backendAPIOperationMapping && operation.backendAPIOperationMapping.backendOperation) {
            const backendOp = operation.backendAPIOperationMapping.backendOperation;
            return `${backendOp.verb} ${backendOp.target}`;
        }
        return '';
    };

    const getTruncatedTarget = (inputTarget, maxLength = 20) => {
        if (!inputTarget) return '';
        return inputTarget.length > maxLength ? inputTarget.substring(0, maxLength) + '...' : inputTarget;
    };

    // Get tool name for display
    const getToolName = () => {
        return operation.target || target;
    };

    const backendOperationVerb = operation.backendAPIOperationMapping?.backendOperation?.verb;

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
                expanded={expandedResource === stableId}
                onChange={handleExpansion(stableId)}
                disabled={markAsDelete}
                className={`${classes.paperStyles} ${classes.accordionContainer}`}
            >
                <AccordionSummary
                    className={highlight ? classes.highlightSelected : ''}
                    disableRipple
                    disableTouchRipple
                    expandIcon={<ExpandMoreIcon />}
                    id={stableId}
                    classes={{ content: classes.contentNoMargin }}
                    sx={{ 
                        backgroundColor: theme.custom.mcpToolBar?.backgroundColor || '#fef6ea',
                    }}
                >
                    <Grid 
                        container 
                        direction='row' 
                        justifyContent='space-between' 
                        alignItems='center'
                    >
                        <Grid item md={4} style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                                display='inline-block'
                                variant='h6'
                                component='div'
                                gutterBottom
                                className={classes.toolName}
                                title={getToolName()}
                                sx={{ marginLeft: theme.spacing(1) }}
                            >
                                {getToolName()}
                            </Typography>
                            {(operation.description && operation.description !== '') && (
                                <Typography
                                    display='inline-block'
                                    style={{ 
                                        margin: '0px 20px',
                                        maxWidth: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                    variant='caption'
                                    gutterBottom
                                    title={operation.description}
                                >
                                    {operation.description}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                <Typography
                                    display='inline'
                                    style={{ margin: '0px 20px' }}
                                    variant='caption'
                                    gutterBottom
                                    sx={{ 
                                        maxWidth: '200px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <b>{ getOperationScopes(operation, spec).length !== 0 && 'Scope : ' }</b>
                                    { getOperationScopes(operation, spec).join(', ') }
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item md={2}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    marginLeft: 10
                                }}
                            >
                                {/* Resource Mapping Display */}
                                {getResourceMappingDisplay() && (
                                    <Box 
                                        className={classes.resourceMappingChip}
                                        title={getResourceMappingDisplay()}
                                    >
                                        <MethodView
                                            method={operation.backendAPIOperationMapping?.backendOperation?.verb}
                                            style={{ marginRight: theme.spacing(0.2), flexShrink: 0 }}
                                        />
                                        <Typography
                                            display='inline'
                                            style={{ margin: '0px 20px' }}
                                            variant='caption'
                                            gutterBottom
                                            className={classes.truncatedText}
                                        >
                                            {getTruncatedTarget(
                                                operation.backendAPIOperationMapping?.backendOperation?.target, 15
                                            )}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                        <Grid item md={2} justifyContent='flex-end' alignItems='center' container>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                {!(disableDelete || markAsDelete) && (
                                    <Tooltip
                                        title={
                                            <FormattedMessage
                                                id='Apis.Details.Resources.components.Operation.Delete'
                                                defaultMessage='Delete'
                                            />
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
                            </Box>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <Divider sx={{
                    backgroundColor: theme.custom.resourceChipColors[backendOperationVerb]
                        || theme.palette.primary.main
                }} />
                <AccordionDetails>
                    <Grid 
                        spacing={2} 
                        container 
                        direction='row' 
                        justifyContent='flex-start' 
                        alignItems='flex-start'
                    >
                        <ToolDetailsSection
                            operation={operation}
                            operationsDispatcher={operationsDispatcher}
                            disableUpdate={disableUpdate}
                            target={target}
                            verb={verb}
                            availableOperations={availableOperations}
                        />
                        <OperationGovernance
                            operation={{
                                ...operation,
                                'x-throttling-tier': operation.throttlingPolicy || operation['x-throttling-tier'],
                                scopes: operation.scopes || []
                            }}
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
                            isMCPServer
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
    resourcePolicy: {},
};
ToolDetails.propTypes = {
    api: PropTypes.shape({ scopes: PropTypes.arrayOf(PropTypes.shape({})), resourcePolicies: PropTypes.shape({}) })
        .isRequired,
    operationsDispatcher: PropTypes.func.isRequired,
    onMarkAsDelete: PropTypes.func,
    markAsDelete: PropTypes.bool,
    disableDelete: PropTypes.bool,
    disableUpdate: PropTypes.bool,
    resourcePolicy: PropTypes.shape({}),
    operation: PropTypes.shape({
        'x-wso2-new': PropTypes.bool,
        summary: PropTypes.string,
        name: PropTypes.string,
        target: PropTypes.string,
        description: PropTypes.string,
        schemaDefinition: PropTypes.string,
        backendAPIOperationMapping: PropTypes.shape({
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
    availableOperations: PropTypes.arrayOf(PropTypes.shape({
        target: PropTypes.string,
        verb: PropTypes.string,
        summary: PropTypes.string,
        description: PropTypes.string,
    })).isRequired,
};

export default React.memo(ToolDetails);
