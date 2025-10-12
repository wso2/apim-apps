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

import { FormattedMessage } from 'react-intl';
import OperationGovernance
    from 'AppComponents/Apis/Details/Resources/components/operationComponents/OperationGovernance';
import ToolDetailsSection from './ToolDetailsSection';

const PREFIX = 'ToolDetails';

const classes = {
    paperStyles: `${PREFIX}-paperStyles`,
    highlightSelected: `${PREFIX}-highlightSelected`,
    contentNoMargin: `${PREFIX}-contentNoMargin`,
    overlayUnmarkDelete: `${PREFIX}-overlayUnmarkDelete`,
    toolName: `${PREFIX}-toolName`,
    accordionContainer: `${PREFIX}-accordionContainer`,
    resourceMappingChip: `${PREFIX}-resourceMappingChip`,
    truncatedText: `${PREFIX}-truncatedText`
};


const Root = styled('div')(({ theme }) => {
    return {
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
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
            right: '9%',
        },
        [`& .${classes.toolName}`]: {
            fontWeight: 400,
            fontSize: '1rem',
            color: theme.palette.text.primary,
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
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
            overflow: 'hidden',
            width: `calc(100% - ${theme.spacing(2)}) !important`,
            maxWidth: `calc(100% - ${theme.spacing(2)}) !important`,
            minWidth: `calc(100% - ${theme.spacing(2)}) !important`,
            boxSizing: 'border-box',
            position: 'relative',
            left: 0,
            right: 0,
            '&.Mui-expanded': {
                margin: theme.spacing(1),
                width: `calc(100% - ${theme.spacing(2)}) !important`,
                maxWidth: `calc(100% - ${theme.spacing(2)}) !important`,
                minWidth: `calc(100% - ${theme.spacing(2)}) !important`,
                position: 'relative',
                left: 0,
                right: 0
            }
        },
        [`& .${classes.accordionContainer}.markedForDelete`]: {
            opacity: 0.5,
            filter: 'grayscale(50%)',
            pointerEvents: 'none',
        },
        [`& .${classes.resourceMappingChip}`]: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            marginLeft: theme.spacing(1),
            width: '250px',
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
 * Handle the tool details UI
 * @export
 * @param {object} props - Component props
 * @param {object} props.operation - The operation object
 * @param {Function} props.operationsDispatcher - Function to dispatch operation updates
 * @param {boolean} props.highlight - Whether to highlight the component
 * @param {Array} props.operationRateLimits - Array of operation rate limits
 * @param {object} props.api - The API object
 * @param {boolean} props.disableDelete - Whether delete is disabled
 * @param {boolean} props.disableUpdate - Whether updates are disabled
 * @param {Function} props.onMarkAsDelete - Function to handle mark as delete
 * @param {boolean} props.markAsDelete - Whether marked for deletion
 * @param {object} props.spec - The specification object
 * @param {string} props.target - The target string
 * @param {string} props.feature - The feature string
 * @param {Array} props.sharedScopes - Array of shared scopes
 * @param {Function} props.setFocusOperationLevel - Function to set focus operation level
 * @param {string} props.expandedResource - The expanded resource identifier
 * @param {Function} props.setExpandedResource - Function to set expanded resource
 * @param {object} props.componentValidator - Component validator object
 * @param {Array} props.availableOperations - Array of available operations
 * @returns {React.Component} Tool details component
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
        feature,
        sharedScopes,
        setFocusOperationLevel,
        expandedResource,
        setExpandedResource,
        componentValidator,
        availableOperations,
    } = props;
    const isUsedInAPIProduct = false;

    /**
     * Toggle delete state for the operation
     * @param {Event} event - The event object
     */
    function toggleDelete(event) {
        event.stopPropagation();
        event.preventDefault();
        setExpandedResource(false);
        onMarkAsDelete({ target }, !markAsDelete);
    }

    const handleExpansion = (panel) => (event, isExpanded) => {
        setExpandedResource(isExpanded ? panel : false);
    };

    // Use stable ID for accordion expansion to prevent collapse during name changes
    const stableId = operation.id || `${feature}_${target}`;

    const theme = useTheme();

    // Get resource mapping for display in accordion summary
    const getResourceMappingDisplay = () => {
        if (operation.backendOperationMapping && operation.backendOperationMapping.backendOperation) {
            const backendOp = operation.backendOperationMapping.backendOperation;
            return `${backendOp.verb} ${backendOp.target}`;
        }
        if (operation.apiOperationMapping && operation.apiOperationMapping.backendOperation) {
            const apiOp = operation.apiOperationMapping.backendOperation;
            return `${apiOp.verb} ${apiOp.target}`;
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

    const backendOperationVerb = operation.backendOperationMapping?.backendOperation?.verb || 
                                 operation.apiOperationMapping?.backendOperation?.verb;
    const backgroundColor = theme.custom.resourceChipColors[backendOperationVerb.toLowerCase()];

    return (
        <Root>
            {markAsDelete && (
                <Box className={classes.overlayUnmarkDelete}>
                    <Tooltip title='Marked for delete'>
                        <Button
                            onClick={toggleDelete}
                            variant='outlined'
                            style={{ marginTop: '10px' }}
                            size='small'
                        >
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
                className={`${classes.paperStyles} ${classes.accordionContainer} ${
                    markAsDelete ? 'markedForDelete' : ''
                }`}
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
                        <Grid 
                            item 
                            md={4} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center' 
                            }}
                        >
                            <Typography
                                display='inline-block'
                                variant='h6'
                                component='div'
                                gutterBottom
                                className={classes.toolName}
                                title={getToolName()}
                                style={{ 
                                    marginLeft: theme.spacing(1),
                                    minWidth: '150px',
                                    maxWidth: '150px',
                                    flexShrink: 0
                                }}
                            >
                                {getToolName()}
                            </Typography>
                            {(operation.description && operation.description !== '') && (
                                <Typography
                                    display='inline-block'
                                    style={{
                                        marginLeft: theme.spacing(3),
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
                                    {operation.scopes && operation.scopes.length > 0 && (
                                        <>
                                            <b>Scope : </b>
                                            {operation.scopes.join(', ')}
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item md={2}>
                            <Box display='flex' alignItems='center' justifyContent='flex-start'>
                                {/* Resource Mapping Display */}
                                {getResourceMappingDisplay() && (
                                    <Box
                                        className={classes.resourceMappingChip}
                                        title={getResourceMappingDisplay()}
                                    >
                                        <Button
                                            disableFocusRipple
                                            disableRipple
                                            variant='contained'
                                            aria-label={backendOperationVerb}
                                            size='small'
                                            className={classes.customButton}
                                            sx={{
                                                backgroundColor,
                                                color: theme.palette.getContrastText(backgroundColor),
                                                marginRight: theme.spacing(0.2),
                                                flexShrink: 0,
                                                '&:hover': {
                                                    backgroundColor,
                                                },
                                                cursor: 'default'
                                            }}
                                        >
                                            {backendOperationVerb}
                                        </Button>
                                        <Typography
                                            display='inline'
                                            style={{ margin: '0px 10px' }}
                                            variant='caption'
                                            gutterBottom
                                            className={classes.truncatedText}
                                        >
                                            {getTruncatedTarget(
                                                operation.backendOperationMapping?.backendOperation?.target || 
                                                operation.apiOperationMapping?.backendOperation?.target, 15
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
                                                disabled={Boolean(isUsedInAPIProduct) || disableUpdate || disableDelete}
                                                onClick={toggleDelete}
                                                aria-label='delete operation'
                                                size='large'
                                            >
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
                <AccordionDetails sx={{ width: '100%', overflow: 'hidden' }}>
                    <Grid
                        spacing={2}
                        container
                        direction='row'
                        justifyContent='flex-start'
                        alignItems='flex-start'
                        sx={{ width: '100%', maxWidth: '100%' }}
                    >
                        <ToolDetailsSection
                            operation={operation}
                            operationsDispatcher={operationsDispatcher}
                            disableUpdate={disableUpdate}
                            target={target}
                            feature={feature}
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
                            verb={feature}
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
    onMarkAsDelete: () => { },
    markAsDelete: false,
    operationRateLimits: [],
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
        id: PropTypes.string,
        'x-auth-type': PropTypes.string,
        throttlingPolicy: PropTypes.string,
        'x-throttling-tier': PropTypes.string,
        scopes: PropTypes.arrayOf(PropTypes.shape({})),
        backendOperationMapping: PropTypes.shape({
            backendOperation: PropTypes.shape({
                verb: PropTypes.string,
                target: PropTypes.string,
            }),
        }),
        apiOperationMapping: PropTypes.shape({
            apiId: PropTypes.string,
            apiName: PropTypes.string,
            apiVersion: PropTypes.string,
            backendOperation: PropTypes.shape({
                verb: PropTypes.string,
                target: PropTypes.string,
            }),
        }),
    }).isRequired,
    target: PropTypes.string.isRequired,
    feature: PropTypes.string.isRequired,
    spec: PropTypes.shape({}).isRequired,
    highlight: PropTypes.bool,
    operationRateLimits: PropTypes.arrayOf(PropTypes.shape({})),
    resolvedSpec: PropTypes.shape({}).isRequired,
    sharedScopes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    expandedResource: PropTypes.string.isRequired,
    setExpandedResource: PropTypes.func.isRequired,
    setFocusOperationLevel: PropTypes.func.isRequired,
    componentValidator: PropTypes.arrayOf(PropTypes.string).isRequired,
    availableOperations: PropTypes.arrayOf(PropTypes.shape({
        target: PropTypes.string,
        verb: PropTypes.string,
        summary: PropTypes.string,
        description: PropTypes.string,
    })).isRequired,
};

export default React.memo(ToolDetails);
