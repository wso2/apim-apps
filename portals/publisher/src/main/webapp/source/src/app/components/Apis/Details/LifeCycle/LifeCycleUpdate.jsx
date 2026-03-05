/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { Component } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress,
    Box,
    Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import { injectIntl, FormattedMessage } from 'react-intl';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import { ScopeValidation, resourceMethod, resourcePath } from 'AppData/ScopeValidation';
import Alert from 'AppComponents/Shared/Alert';
import Banner from 'AppComponents/Shared/Banner';
import PublishWithoutDeploy from 'AppComponents/Apis/Details/LifeCycle/Components/PublishWithoutDeploy';
import PublishWithoutDeployProduct from 'AppComponents/Apis/Details/LifeCycle/Components/PublishWithoutDeployProduct';
import Configurations from 'Config';
import APIProduct from 'AppData/APIProduct';
import Progress from 'AppComponents/Shared/Progress';
import GovernanceViolations from 'AppComponents/Shared/Governance/GovernanceViolations';
import Utils from 'AppData/Utils';
import Link from '@mui/material/Link';
import LifeCycleImage from './LifeCycleImage';
import CheckboxLabels from './CheckboxLabels';
import LifecyclePending from './LifecyclePending';
import { API_SECURITY_MUTUAL_SSL_MANDATORY, API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY }
    from '../Configuration/components/APISecurity/components/apiSecurityConstants';

const PREFIX = 'LifeCycleUpdate';

const classes = {
    buttonsWrapper: `${PREFIX}-buttonsWrapper`,
    stateButton: `${PREFIX}-stateButton`,
    paperCenter: `${PREFIX}-paperCenter`,
    subHeading: `${PREFIX}-subHeading`,
    mandatoryStar: `${PREFIX}-mandatoryStar`
};
const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.buttonsWrapper}`]: {
        marginTop: 40,
    },

    [`& .${classes.stateButton}`]: {
        marginRight: theme.spacing(),
    },

    [`& .${classes.paperCenter}`]: {
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'left',
        justifyContent: 'left',
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: '38px',
    },

    [`& .${classes.mandatoryStar}`]: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    }
}));

/**
 *
 *
 * @class LifeCycleUpdate
 * @extends {Component}
 */
class LifeCycleUpdate extends Component {
    /**
     * @param {*} props @inheritdoc
     */
    constructor(props) {
        super(props);
        this.updateLifeCycleState = this.updateLifeCycleState.bind(this);
        this.api = new API();
        this.apiProduct = new APIProduct();
        this.WORKFLOW_STATUS = {
            CREATED: 'CREATED',
            APPROVED: 'APPROVED',
            REJECTED: 'REJECTED'
        };
        this.state = {
            newState: null,
            isUpdating: null,
            pageError: null,
            isOpen: false,
            deploymentsAvailable: false,
            isMandatoryPropertiesAvailable: false,
            loading: true,
            isMandatoryPropertiesConfigured: false,
            message: null,
            openMenu: false,
            selectedTransitionState: null,
            isGovernanceViolation: false,
            governanceError: null,
            isEndpointAvailable: false,
            // Deprecation / Retirement Guide state
            deprecationGuide: null,
            deprecationGuideLoading: false,
        };
        this.setIsOpen = this.setIsOpen.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleRequestOpen = this.handleRequestOpen.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
    }

    /**
     * Set Deployment & Mandatory Properties availability
     */
    componentDidMount() {
        this.fetchData();
    }

    /**
     * 
     * Set the openMenu state of the dialog box which shows when deprecating or retiring
     * Store the selected transition state
     * @param {*} event event
     */
    handleRequestOpen(event) {
        const selectedState = event.currentTarget.getAttribute('data-value');
        this.setState({
            openMenu: true,
            selectedTransitionState: selectedState,
            deprecationGuide: null,
            deprecationGuideLoading: false,
        });

        // Fetch Deprecation / Retirement Guide for both transitions
        if (selectedState === 'Deprecate' || selectedState === 'Retire') {
            const { api: { id: apiUUID } } = this.props;
            this.setState({ deprecationGuideLoading: true });
            // Build URL with ?action= query parameter
            const actionParam = selectedState === 'Retire' ? 'Retire' : 'Deprecate';
            const guideUrl = `/apis/${apiUUID}/deprecation-guide?action=${actionParam}`;
            const restApi = new API();
            restApi.client.then((client) => {
                const baseUrl = client.spec.servers
                    ? client.spec.servers[0].url
                    : client.url || '';
                // eslint-disable-next-line no-underscore-dangle
                const meta = restApi._requestMetaData();
                return fetch(baseUrl + guideUrl, {
                    headers: {
                        Authorization: `Bearer ${meta.headers.Authorization || ''}`,
                    },
                    credentials: 'same-origin',
                });
            }).then((resp) => resp.json())
                .then((data) => {
                    this.setState({
                        deprecationGuide: data,
                        deprecationGuideLoading: false,
                    });
                })
                .catch((error) => {
                    console.error('Deprecation guide fetch error:', error);
                    // Fallback — use the Swagger client method which was working before
                    this.api.getDeprecationGuide(apiUUID)
                        .then((response) => {
                            const guideData = response.body || response.obj;
                            this.setState({
                                deprecationGuide: guideData,
                                deprecationGuideLoading: false,
                            });
                        })
                        .catch((fallbackErr) => {
                            console.error('Deprecation guide fallback error:', fallbackErr);
                            this.setState({
                                deprecationGuide: {
                                    successorFound: false,
                                    migrationRisk: true,
                                    lifecycleAction: actionParam,
                                    enforcementMode: 'warn',
                                    message: 'Could not retrieve deprecation guide. Proceed with caution.',
                                },
                                deprecationGuideLoading: false,
                            });
                        });
                });
        }
    }

    /**
     * Set the openMenu state
     */
    handleRequestClose() {
        this.setState({
            openMenu: false,
            deprecationGuide: null,
            deprecationGuideLoading: false,
        });
    }

    /**
     * Set handle click warning
     */
    handleClick() {
        const {
            api: { id: apiUUID, type },
        } = this.props;
        this.setIsOpen(false);
        this.updateLCStateOfAPI(apiUUID, 'Publish', type);
    }

    /**
     *
     * Set isOpen state of the dialog box which shows the caution message when publish without deploying
     * @param {Boolean} isOpen Should dialog box is open or not
     */
    setIsOpen(isOpen) {
        this.setState({ isOpen });
    }

    /**
     * Fetch the revisions and settings of the API
     */
    fetchData() {
        const {
            api: { id: apiUUID, type }, isAPIProduct
        } = this.props;
        const { api } = this.context;
        const isMCPServer = type === MCPServer.CONSTS.MCP;

        // Create a promises array to hold multiple promises
        const promises = [];
    
        const getRevisionPromise = isMCPServer
            ? MCPServer.getRevisionsWithEnv(apiUUID)
            : this.api.getRevisionsWithEnv(apiUUID);
        promises.push(getRevisionPromise);

        // Add endpoint check promise for MCP servers
        let endpointPromise;
        if (isMCPServer) {
            if (api.isMCPServerFromExistingAPI()) {
                // TODO: Check the endpoint availability for MCP Server from existing API
                endpointPromise = Promise.resolve({ hasEndpoint: true });
            } else {
                endpointPromise = MCPServer.getMCPServerEndpoints(apiUUID)
                    .then(response => {
                        const endpoints = response.body;
                        return { hasEndpoint: endpoints && endpoints.length > 0 };
                    })
                    .catch(() => {
                        return { hasEndpoint: false };
                    });
            }
        } else if (isAPIProduct) {
            endpointPromise = Promise.resolve({ hasEndpoint: false });
        } else {
            endpointPromise = Promise.resolve({ hasEndpoint: api.endpointConfig !== null });
        }
        promises.push(endpointPromise);

        // Execute all promises in parallel
        Promise.all(promises)
            .then(([revisionResult, endpointResult]) => {
                this.setState({
                    deploymentsAvailable: revisionResult.body.count > 0 && this.hasApprovedStatus(revisionResult.body),
                    isEndpointAvailable: endpointResult.hasEndpoint,
                });

                API.getSettings()
                    .then((response) => {
                        const { customProperties } = response;
                        let isMandatoryPropertiesAvailable;
                        if (customProperties && customProperties.length > 0) {
                            const requiredPropertyNames = customProperties
                                .filter(property => property.Required)
                                .map(property => property.Name);
                            if (requiredPropertyNames.length > 0) {
                                this.setState({ isMandatoryPropertiesConfigured: true })
                                isMandatoryPropertiesAvailable = requiredPropertyNames.every(propertyName => {
                                    const property = api.additionalProperties.find(
                                        prop => prop.name === propertyName);
                                    return property && property.value !== '';
                                });
                            } else {
                                isMandatoryPropertiesAvailable = true;
                            }
                        } else {
                            isMandatoryPropertiesAvailable = true;
                        }
                        this.setState({ isMandatoryPropertiesAvailable });
                        this.setState({ loading: false });
                    })
                    .catch((error) => {
                        console.error('Error fetching settings:', error);
                    });
            })
            .catch((error) => {
                console.error('Error fetching revisions:', error);
            });
    };

    /**
     * @param {string} apiUUID api UUID
     * @param {string} action life cycle action
     * @param {string} type API type
     * @memberof LifeCycleUpdate
     */
    updateLCStateOfAPI(apiUUID, action, type) {
        this.setState({ isUpdating: action });
        let promisedUpdate;
        const complianceErrorCode = 903300;
        const { intl, handleUpdate } = this.props;
        const lifecycleChecklist = this.props.checkList.map((item) => item.value + ':' + item.checked);
        const { isAPIProduct } = this.props;
        const isMCPServer = type === MCPServer.CONSTS.MCP;

        // [DORMANT] Successor UUID selection is no longer passed during lifecycle transitions.
        // The successor is displayed informational-only in the UI.
        // const { selectedSuccessorUuid } = this.state;

        if (isAPIProduct) {
            promisedUpdate = this.apiProduct.updateLcState(apiUUID, action, lifecycleChecklist.length > 0
                ? lifecycleChecklist.toString() : lifecycleChecklist );
        } else if (isMCPServer) {
            promisedUpdate  = (lifecycleChecklist.length > 0)
                ? MCPServer.updateLcState(apiUUID, action, lifecycleChecklist.toString())
                : MCPServer.updateLcState(apiUUID, action);
        } else {
            const checklist = lifecycleChecklist.length > 0
                ? lifecycleChecklist.toString() : undefined;
            // [DORMANT] successorUuid no longer passed — kept for future integration
            // promisedUpdate = this.api.updateLcState(
            //     apiUUID, action, checklist, selectedSuccessorUuid || undefined,
            // );
            promisedUpdate = this.api.updateLcState(
                apiUUID, action, checklist, undefined,
            );
        }
        promisedUpdate
            .then((response) => {
                /* TODO: Handle IO erros ~tmkb */
                // get the latest state of the API
                this.context.updateAPI();
                const newState = response.body.lifecycleState.state;
                const { workflowStatus, jsonPayload } = response.body;
                if (jsonPayload && jsonPayload !== '') {
                    const { message } = JSON.parse(jsonPayload);
                    this.setState({ message });
                }
                this.setState({ newState });
                handleUpdate();

                if (workflowStatus === this.WORKFLOW_STATUS.CREATED) {
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Details.LifeCycle.LifeCycleUpdate.success.createStatus',
                        defaultMessage: 'Lifecycle state change request has been sent',
                    }));
                } 
                if (workflowStatus === this.WORKFLOW_STATUS.APPROVED) {
                    if (this.state.message && this.state.message !== '') {
                        Alert.info(this.state.message);
                    } else{
                        Alert.info(intl.formatMessage({
                            id: 'Apis.Details.LifeCycle.LifeCycleUpdate.approve.approveStatus',
                            defaultMessage: 'Lifecycle state change action approved successfully',
                        }));
                    }
                }
                if (workflowStatus === this.WORKFLOW_STATUS.REJECTED) {
                    if (this.state.message && this.state.message !== '') {
                        Alert.error(this.state.message);
                    } else {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.LifeCycle.LifeCycleUpdate.reject.rejectStatus',
                            defaultMessage: 'Lifecycle state change action rejected due to validation failure',
                        }));
                    }
                } else {
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Details.LifeCycle.LifeCycleUpdate.success.otherStatus',
                        defaultMessage: 'Lifecycle state updated successfully',
                    }));
                }
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.body.code === complianceErrorCode) {
                        // Handle governance violation
                        const errorDescription = error.response.body.description;
                        const violations = JSON.parse(errorDescription).blockingViolations;
                        this.setState({
                            governanceError: violations,
                            isGovernanceViolation: true,
                        });
                        Alert.error(
                            <Box sx={{ width: '100%' }}>
                                <Typography>
                                    <FormattedMessage
                                        id='Apis.Details.LifeCycle.LifeCycleUpdate.error.governance'
                                        defaultMessage='Lifecycle update failed. Governance policy violations found.'
                                    />
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    mt: 1
                                }}>
                                    <Link
                                        component='button'
                                        onClick={() => Utils.downloadAsJSON(violations, 'governance-violations')}
                                        sx={{
                                            color: 'inherit',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                textShadow: '0px 1px 2px rgba(0,0,0,0.2)',
                                            },
                                        }}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.LifeCycle.LifeCycleUpdate.error.governance.download'
                                            defaultMessage='Download Violations'
                                        />
                                    </Link>
                                </Box>
                            </Box>
                        );
                    } else {
                        Alert.error(error.response.body.description);
                        this.setState({ pageError: error.response.body });
                    }
                } else {
                    // TODO add i18n ~tmkb
                    const message = intl.formatMessage({
                        id: 'Apis.Details.LifeCycle.LifeCycleUpdate.error',
                        defaultMessage: 'Something went wrong while updating the lifecycle',
                    });
                    Alert.error(message);
                    this.setState({ pageError: error.response.body });
                }
                console.error(error);
            })
            .finally(() => {
                this.setState({ isUpdating: null });
            });
    }

    /**
     *
     *
     * @param {*} event event
     * @memberof LifeCycleUpdate
     */
    updateLifeCycleState(event) {
        const { deploymentsAvailable } = this.state;
        event.preventDefault();
        let action = event.currentTarget.getAttribute('data-value');
        if (action === 'Deploy To Test') {
            action = 'Deploy as a Prototype';
        }
        const {
            api: { id: apiUUID, advertiseInfo, type }, isAPIProduct,
        } = this.props;
        if (action === 'Publish' && !deploymentsAvailable && ((advertiseInfo && !advertiseInfo.advertised)
            || isAPIProduct)) {
            this.setIsOpen(true);
        } else {
            this.updateLCStateOfAPI(apiUUID, action, type);
        }
    }

    /**
     * Check if the API has at least one deployment with APPROVED status
     * @param {Object} data API data containing deployment information
     * @returns {boolean} True if at least one deployment has APPROVED status, otherwise
     */
    hasApprovedStatus(data) {
        for (const item of data.list) {
            if (item && item.deploymentInfo && Array.isArray(item.deploymentInfo)) {
                for (const deployment of item.deploymentInfo) {
                    if (deployment && (deployment.status === "APPROVED" || deployment.status === null)) {
                        return true; // At least one status is APPROVED. Null is for API products.
                    }
                }
            }
        }
      
        return false; // No status with APPROVED found
    }

    /**
     * Render the deprecation / retirement guide panel.
     * Shown when transitioning to Deprecate or Retire state.
     *
     * Informational-only display:
     * - Shows successor candidates as a read-only list (no selection required)
     * - Consistent styling between "Successors Found" and "Migration Risk" panels
     * - Enforcement mode indicator (block/warn/audit)
     *
     * @returns {JSX.Element|null} panel or null
     */
    renderDeprecationGuide() {
        const {
            deprecationGuideLoading,
            deprecationGuide,
        } = this.state;

        if (deprecationGuideLoading) {
            return (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                }}
                >
                    <CircularProgress size={20} />
                    <Typography
                        variant='body2'
                        color='textSecondary'
                    >
                        Analyzing structural successors...
                    </Typography>
                </Box>
            );
        }

        if (!deprecationGuide) return null;

        const {
            lifecycleAction = 'Deprecate',
            enforcementMode = 'warn',
            successorCarriedOver = false,
            allCandidates = [],
        } = deprecationGuide;

        const isBlock = enforcementMode === 'block';
        const actionLabel = lifecycleAction === 'Retire' ? 'Retire' : 'Deprecate';

        // Common panel styling for both scenarios
        let panelBorder = 'success.main';
        let panelBgColor = 'background.paper';
        if (!deprecationGuide.successorFound) {
            panelBorder = isBlock ? 'error.main' : 'warning.main';
            panelBgColor = isBlock
                ? 'rgba(211, 47, 47, 0.03)'
                : 'rgba(237, 108, 2, 0.03)';
        }

        // ── Scenario A: Successor Found — informational list ─────────────
        if (deprecationGuide.successorFound) {
            const sType = deprecationGuide.successorType;
            const isOfficial = sType === 'OFFICIAL_VERSION';
            const typeLabel = isOfficial
                ? 'Official New Version'
                : 'Semantic Neighbor';

            const similarity = deprecationGuide.similarityPercentage || 0;
            let impactLevel = 'High';
            let impactColor = 'error.main';
            if (similarity >= 80) {
                impactLevel = 'Low';
                impactColor = 'success.main';
            } else if (similarity >= 60) {
                impactLevel = 'Medium';
                impactColor = 'warning.main';
            }

            return (
                <Box sx={{
                    p: 2.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderLeft: '4px solid',
                    borderLeftColor: panelBorder,
                    bgcolor: panelBgColor,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
                }}
                >
                    <Typography
                        variant='subtitle2'
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Box component='span' sx={{ color: 'success.main', fontWeight: 'bold' }}>✓</Box>
                        {(() => {
                            if (successorCarriedOver) return 'Successor Carried Over from Deprecation';
                            if (isOfficial) return 'Official Version Successor Found';
                            return 'Semantic Neighbor Successor Found';
                        })()}
                    </Typography>

                    {/* Primary successor summary */}
                    <Box sx={{ mb: 1 }}>
                        <Typography variant='body2' sx={{ mb: 0.5 }}>
                            <b>Recommended Successor:</b>{' '}
                            {deprecationGuide.successorApiName}{' '}
                            v{deprecationGuide.successorApiVersion}
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 0.5 }}>
                            <b>Type:</b> {typeLabel}
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 0.5 }}>
                            <b>Migration Impact:</b>{' '}
                            <Box
                                component='span'
                                sx={{ color: impactColor, fontWeight: 600 }}
                            >
                                {impactLevel}
                            </Box>
                            {` (${similarity.toFixed(0)}% structural match)`}
                        </Typography>
                    </Box>

                    {/* Enforcement mode badge */}
                    {isBlock && (
                        <Box sx={{ mt: 1.5 }}>
                            <Typography
                                variant='caption'
                                sx={{
                                    display: 'inline-flex',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: 'error.main',
                                    bgcolor: 'rgba(211, 47, 47, 0.05)',
                                    color: 'error.main',
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    textTransform: 'uppercase',
                                }}
                            >
                                Enforcement: Block
                            </Typography>
                        </Box>
                    )}

                    {/* Read-only candidate list (informational only) */}
                    {allCandidates && allCandidates.length > 1 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant='caption'
                                sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}
                            >
                                All Detected Candidates ({allCandidates.length})
                            </Typography>
                            {allCandidates.map((cand) => {
                                const candIsOfficial = cand.successorType === 'OFFICIAL_VERSION';
                                return (
                                    <Box
                                        key={cand.apiUuid}
                                        sx={{
                                            p: 1,
                                            mb: 0.5,
                                            borderRadius: 0.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Box>
                                            <Typography variant='body2'>
                                                {cand.apiName} v{cand.apiVersion}
                                            </Typography>
                                            <Typography variant='caption' color='textSecondary'>
                                                {candIsOfficial ? 'Official Version' : 'Semantic Neighbor'}
                                                {' · '}
                                                {(cand.similarityPercentage || 0).toFixed(0)}% match
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            );
        }

        // ── Scenario B: No Successor — Migration Risk ───────────────────
        const riskMsg = deprecationGuide.message
            || 'API deprecated without an identified successor. '
            + 'This creates a migration risk for consumers.';

        return (
            <Box sx={{
                p: 2.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '4px solid',
                borderLeftColor: panelBorder,
                bgcolor: panelBgColor,
                boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
            }}
            >
                <Typography
                    variant='subtitle2'
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Box
                        component='span'
                        sx={{ color: isBlock ? 'error.main' : 'warning.main', fontWeight: 'bold' }}
                    >
                        {isBlock ? '✗' : '⚠'}
                    </Box>
                    {isBlock
                        ? 'Transition Blocked — No Successor Detected'
                        : 'Migration Risk — No Successor Detected'}
                </Typography>
                <Typography variant='body2' sx={{ mb: 1 }}>
                    {riskMsg}
                </Typography>
                {isBlock && (
                    <Typography
                        variant='body2'
                        sx={{ fontWeight: 600, color: 'error.dark' }}
                    >
                        A valid PUBLISHED successor must be assigned
                        before this API can be {actionLabel.toLowerCase()}d.
                    </Typography>
                )}
            </Box>
        );
    }

    /**
     * @inheritdoc
     * @memberof LifeCycleUpdate
     */
    render() {
        const {
            api, lcState, theme, handleChangeCheckList, checkList, certList, isAPIProduct, intl,
        } = this.props;
        const type = isAPIProduct ? 'API Product ' : 'API ';
        const version = ' - ' + api.version;
        const lifecycleStates = [...lcState.availableTransitions];
        const { newState, pageError, isOpen, deploymentsAvailable, isMandatoryPropertiesAvailable,
            isMandatoryPropertiesConfigured, governanceError, isGovernanceViolation } = this.state;
        const isWorkflowPending = api.workflowStatus && api.workflowStatus === this.WORKFLOW_STATUS.CREATED;
        const lcMap = new Map();
        lcMap.set('Published', 'Publish');
        lcMap.set('Prototyped', 'Deploy as a prototype');
        lcMap.set('Deprecated', 'Deprecate');
        lcMap.set('Blocked', 'Block');
        lcMap.set('Created', 'Create');
        lcMap.set('Retired', 'Retire');

        const lifeCycleUpdateEvents = {
            Deprecate: intl.formatMessage({
                id: 'Apis.Details.LifeCycle.LifeCycleUpdate.State.Deprecate',
                defaultMessage: 'Deprecate',
            }),
            Block: intl.formatMessage({
                id: 'Apis.Details.LifeCycle.LifeCycleUpdate.State.Block',
                defaultMessage: 'Block',
            }),
            'Demote to Created': intl.formatMessage({
                id: 'Apis.Details.LifeCycle.LifeCycleUpdate.State.Demote.to.Created',
                defaultMessage: 'Demote to Created',
            }),
            Publish: intl.formatMessage({
                id: 'Apis.Details.LifeCycle.LifeCycleUpdate.State.Publish',
                defaultMessage: 'Publish',
            }),
            'Pre-Release': intl.formatMessage({
                id: 'Apis.Details.LifeCycle.LifeCycleUpdate.State.Pre-Release',
                defaultMessage: 'Pre-Release',
            }),
            'Re-Publish': intl.formatMessage({
                id: 'Apis.Details.LifeCycle.LifeCycleUpdate.State.Re.Publish',
                defaultMessage: 'Re-Publish',
            }),
            Retire: intl.formatMessage({
                id: 'Apis.Details.LifeCycle.LifeCycleUpdate.State.Retire',
                defaultMessage: 'Retire',
            }),
        };

        const isMutualSSLEnabled = api.securityScheme.includes(API_SECURITY_MUTUAL_SSL_MANDATORY);
        const isMutualSslOnly = api.securityScheme.length === 2 && api.securityScheme.includes('mutualssl')
            && api.securityScheme.includes(API_SECURITY_MUTUAL_SSL_MANDATORY);
        const isAppLayerSecurityMandatory = api.securityScheme.includes(
            API_SECURITY_OAUTH_BASIC_AUTH_API_KEY_MANDATORY,
        );
        const isCertAvailable = certList.length !== 0;
        const isBusinessPlanAvailable = api.policies.length !== 0;
        const lifeCycleStatus = isAPIProduct ? api.state : api.lifeCycleStatus;
        const lifecycleButtons = lifecycleStates.map((item) => {
            const lifecycleState = { ...item, displayName: item.event };
            if (lifecycleState.event === 'Deploy as a Prototype') {
                if (lifecycleState.displayName === 'Deploy as a Prototype') {
                    lifecycleState.displayName = 'Pre-Release';
                }
                return {
                    ...lifecycleState,
                    disabled:
                        (api.type !== 'WEBSUB' && !this.state.isEndpointAvailable && !isAPIProduct
                            && !api.initiatedFromGateway),
                };
            }
            if (lifecycleState.event === 'Publish') {
                const buttonDisabled = (isMutualSSLEnabled && !isCertAvailable)
                                    || (!isMutualSslOnly && deploymentsAvailable && !isBusinessPlanAvailable
                                        && !api.initiatedFromGateway)
                                    || (isAPIProduct && !isBusinessPlanAvailable)
                                    || (deploymentsAvailable && !isMandatoryPropertiesAvailable);
                // When business plans are not assigned and deployments available

                return {
                    ...lifecycleState,
                    disabled: buttonDisabled,
                };
            }
            if (lifecycleState.event === 'Retire') {
                const buttonDisabled = api.initiatedFromGateway ?? false;

                return {
                    ...lifecycleState,
                    disabled: buttonDisabled,
                };
            }
            return {
                ...lifecycleState,
                disabled: false,
            };
        });

        if (this.state.loading) {
            return (
                <Progress />
            )
        }

        return (
            <StyledGrid container>
                {isWorkflowPending ? (
                    <Grid item xs={12}>
                        <LifecyclePending currentState={lcState.state} />
                    </Grid>
                ) : (
                    <Grid item xs={12}>
                        {theme.custom.lifeCycleImage ? (
                            <img
                                src={Configurations.app.context + theme.custom.lifeCycleImage}
                                alt='life cycles'
                            />
                        ) : (
                            <Grid container spacing={3}>
                                <Grid item xs={8}>
                                    <LifeCycleImage lifeCycleStatus={newState || lifeCycleStatus} />
                                </Grid>
                                {(lifeCycleStatus === 'CREATED' || lifeCycleStatus === 'PROTOTYPED')
                                    && (!api.advertiseInfo || !api.advertiseInfo.advertised)
                                    && !api.initiatedFromGateway && (
                                    <Grid item xs={3}>
                                        <CheckboxLabels
                                            api={api}
                                            isMutualSSLEnabled={isMutualSSLEnabled}
                                            isAppLayerSecurityMandatory={isAppLayerSecurityMandatory}
                                            isCertAvailable={isCertAvailable}
                                            isBusinessPlanAvailable={isBusinessPlanAvailable}
                                            isAPIProduct={isAPIProduct}
                                            isMandatoryPropertiesAvailable={isMandatoryPropertiesAvailable}
                                            isMandatoryPropertiesConfigured={isMandatoryPropertiesConfigured}
                                            isEndpointAvailable={this.state.isEndpointAvailable}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        )}
                    </Grid>
                )}
                <Grid item xs={12}>
                    {!isWorkflowPending && (
                        <FormGroup row>
                            {checkList.map((checkItem, index) => (
                                <FormControlLabel
                                    key={checkList[index].value}
                                    control={(
                                        <Checkbox
                                            checked={checkList[index].checked}
                                            onChange={handleChangeCheckList(index)}
                                            value={checkList[index].value}
                                            color='primary'
                                        />
                                    )}
                                    label={checkList[index].label}
                                />
                            ))}
                        </FormGroup>
                    )}
                    <ScopeValidation resourcePath={resourcePath.API_CHANGE_LC} resourceMethod={resourceMethod.POST}>
                        <div className={classes.buttonsWrapper}>
                            {!isWorkflowPending
                            && lifecycleButtons.map((transitionState) => {
                                /* Skip when transitions available for current state, this occurs in states
                                where have allowed re-publishing in prototype and published sates */
                                const needConfirmation = transitionState.displayName === 'Deprecate'
                                                   || transitionState.displayName === 'Retire';
                                return (
                                    <Button
                                        disabled={transitionState.disabled
                                        || this.state.isUpdating || api.isRevision}
                                        variant='contained'
                                        color='primary'
                                        className={classes.stateButton}
                                        key={transitionState.event}
                                        data-value={transitionState.event}
                                        onClick={needConfirmation? this.handleRequestOpen: this.updateLifeCycleState}
                                        data-testid={transitionState.event + '-btn'}
                                    >
                                        { transitionState.displayName in lifeCycleUpdateEvents
                                            ? lifeCycleUpdateEvents[transitionState.displayName]
                                            : transitionState.displayName }
                                        {this.state.isUpdating === transitionState.event && (
                                            <CircularProgress size={18} />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                        <Dialog open={this.state.openMenu} maxWidth='sm' fullWidth>
                            <DialogTitle>
                                <FormattedMessage
                                    id='Apis.Details.components.TransitionStateApiButton.title'
                                    defaultMessage='{selectedState} {type}'
                                    values={{ 
                                        selectedState: this.state.selectedTransitionState,
                                        type,
                                    }}
                                />
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    <FormattedMessage
                                        id='Apis.Details.components.TransitionStateApiButton.text.description'
                                        defaultMessage='{type} <b> {name} {version} </b> will be {selectedState}d 
                                            permanently.'
                                        values={{
                                            b: (msg) => <b>{msg}</b>,
                                            type,
                                            name: api.name,
                                            version,
                                            selectedState: this.state.selectedTransitionState ? 
                                                this.state.selectedTransitionState.toLowerCase() : ''
                                        }}
                                    />
                                </DialogContentText>

                                {/* Deprecation / Retirement Guide Panel */}
                                {(this.state.selectedTransitionState === 'Deprecate'
                                    || this.state.selectedTransitionState === 'Retire') && (
                                    <Box sx={{ mt: 2 }}>
                                        {this.renderDeprecationGuide()}
                                    </Box>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button dense onClick={this.handleRequestClose}>
                                    <FormattedMessage
                                        id='Apis.Details.components.TransitionStateApiButton.button.cancel'
                                        defaultMessage='CANCEL'
                                    />
                                </Button>
                                <Button
                                    id='itest-id-conf'
                                    key={this.state.selectedTransitionState}
                                    data-value={this.state.selectedTransitionState}
                                    disabled={
                                        this.state.deprecationGuideLoading
                                        || (
                                            (this.state.selectedTransitionState === 'Deprecate'
                                                || this.state.selectedTransitionState === 'Retire')
                                            && this.state.deprecationGuide
                                            && !this.state.deprecationGuide.successorFound
                                            && this.state.deprecationGuide.enforcementMode === 'block'
                                        )
                                    }
                                    onClick={(event) => {
                                        this.updateLifeCycleState(event);
                                        this.handleRequestClose();
                                    }}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.components.TransitionStateApiButton.button.confirm'
                                        defaultMessage='{selectedState}'
                                        values={{ 
                                            selectedState:this.state.selectedTransitionState ? 
                                                this.state.selectedTransitionState.toUpperCase() : ''
                                        }}
                                    />
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </ScopeValidation>
                </Grid>
                {/* Page error banner */}
                {isGovernanceViolation ? (
                    <Grid item xs={12}>
                        <GovernanceViolations violations={governanceError} />
                    </Grid>
                ) : pageError && (
                    <Grid item xs={11}>
                        <Banner
                            onClose={() => this.setState({ pageError: null })}
                            disableActions
                            dense
                            paperProps={{ elevation: 1 }}
                            type='error'
                            message={pageError}
                        />
                    </Grid>
                )}
                {/* end of Page error banner */}
                {isAPIProduct ? <PublishWithoutDeployProduct
                    classes={classes}
                    api={api}
                    handleClick={this.handleClick}
                    handleClose={() => this.setIsOpen(false)}
                    open={isOpen}
                /> : <PublishWithoutDeploy
                    classes={classes}
                    api={api}
                    handleClick={this.handleClick}
                    handleClose={() => this.setIsOpen(false)}
                    open={isOpen}
                /> }
            </StyledGrid>
        );
    }
}

LifeCycleUpdate.propTypes = {
    api: PropTypes.shape({}).isRequired,
    checkList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    lcState: PropTypes.shape({}).isRequired,
    handleChangeCheckList: PropTypes.func.isRequired,
    theme: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    handleUpdate: PropTypes.func.isRequired,
};

LifeCycleUpdate.contextType = ApiContext;

export default (injectIntl((props) => {
    const theme = useTheme();
    return <LifeCycleUpdate {...props} theme={theme} />;
}));
