/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useMemo, useState } from 'react';
import API from 'AppData/api';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import Alert from 'AppComponents/Shared/Alert';
import {
    Alert as MuiAlert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    IconButton,
    Link,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorIcon from '@mui/icons-material/Error';
import { MuiChipsInput } from 'mui-chips-input';
import base64url from 'base64url';
import { red } from '@mui/material/colors';
import Configurations from 'Config';

const PERMISSION_TYPE_OPTIONS = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'ALLOW', label: 'Allow for role(s)' },
    { value: 'DENY', label: 'Deny for role(s)' },
];
const DEFAULT_PLATFORM_GATEWAY_RELEASES_URL = 'https://github.com/wso2/api-platform/releases';
const DEFAULT_PLATFORM_GATEWAY_VERSION = 'v0.9.0';

const trimTrailingSlashes = (value) => {
    const normalized = (value || '').trim();
    let end = normalized.length;
    while (end > 0 && normalized.charCodeAt(end - 1) === 47) {
        end -= 1;
    }
    return normalized.slice(0, end);
};

const normalizeReleaseBaseUrl = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
        return DEFAULT_PLATFORM_GATEWAY_RELEASES_URL;
    }
    return trimTrailingSlashes(trimmed);
};

const getPlatformGatewayReleaseConfig = () => {
    const platformGatewayConfig = Configurations?.app?.platformGateway || {};
    const releasesUrl = normalizeReleaseBaseUrl(platformGatewayConfig.releasesUrl);
    const version = (platformGatewayConfig.version || DEFAULT_PLATFORM_GATEWAY_VERSION).trim();
    const browserHost = typeof window !== 'undefined' ? window.location.host : '';
    const configuredControlPlaneHost = (platformGatewayConfig.controlPlaneHost || '').trim();
    const controlPlaneHost = configuredControlPlaneHost || browserHost;
    const artifactName = `gateway-${version}`;
    const downloadCommand = `curl -sLO ${releasesUrl}/download/gateway/${version}/${artifactName}.zip && \\\n`
        + `unzip ${artifactName}.zip`;

    return {
        artifactName,
        controlPlaneHost,
        downloadCommand,
    };
};

const slugifyName = (value) => {
    const normalized = (value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-');
    let start = 0;
    let end = normalized.length;
    while (start < end && normalized.charCodeAt(start) === 45) {
        start += 1;
    }
    while (end > start && normalized.charCodeAt(end - 1) === 45) {
        end -= 1;
    }
    return normalized.slice(start, end).slice(0, 64);
};

const normalizeBaseUrl = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
        return '';
    }
    if (/^https?:\/\//i.test(trimmed)) {
        return trimTrailingSlashes(trimmed);
    }
    return trimTrailingSlashes(`https://${trimmed}`);
};

const getVhostFromBaseUrl = (baseUrl) => {
    try {
        return new URL(baseUrl).host;
    } catch (error) {
        return '';
    }
};

/**
 * Code block component with copy functionality
 */
function CodeBlock({ code, copyCode }) {
    const [copied, setCopied] = useState(false);
    const copiedText = copyCode || code;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(copiedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = copiedText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                bgcolor: '#1e1e1e',
                borderRadius: 1,
                p: 2,
                my: 1,
                overflow: 'auto',
            }}
        >
            <Button
                size='small'
                onClick={handleCopy}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    minWidth: 'auto',
                    p: 0.5,
                    color: 'grey.400',
                    '&:hover': { color: 'white' },
                }}
            >
                {copied ? <CheckIcon fontSize='small' /> : <ContentCopyIcon fontSize='small' />}
            </Button>
            <Typography
                component='pre'
                sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#d4d4d4',
                    m: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                }}
            >
                {code}
            </Typography>
        </Box>
    );
}

/**
 * Quick Start Guide component
 */
export function QuickStartGuide({
    gateway, showReconfigureAction = false, onReconfigureRequested = null, reconfigureLoading = false,
    showTokenCommands = true,
}) {
    const [selectedTab, setSelectedTab] = useState('quick-start');
    const { artifactName, controlPlaneHost, downloadCommand } = useMemo(
        () => getPlatformGatewayReleaseConfig(),
        [],
    );
    const displayRegistrationToken = '<your-gateway-token>';
    const actualRegistrationToken = gateway?.registrationToken || displayRegistrationToken;
    const displayKeysCommand = `cat > ${artifactName}/configs/keys.env << 'ENVFILE'
GATEWAY_CONTROLPLANE_HOST=${controlPlaneHost}
GATEWAY_REGISTRATION_TOKEN=${displayRegistrationToken}
GATEWAY_CONTROLPLANE_ON_PREM=true
ENVFILE`;
    const copyKeysCommand = `cat > ${artifactName}/configs/keys.env << 'ENVFILE'
GATEWAY_CONTROLPLANE_HOST=${controlPlaneHost}
GATEWAY_REGISTRATION_TOKEN=${actualRegistrationToken}
GATEWAY_CONTROLPLANE_ON_PREM=true
ENVFILE`;

    const renderTokenConfigurationStep = () => (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                Step 2: Configure the Gateway
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                The registration token is single-use. If you need to reconfigure the gateway, generate a new
                token. This will revoke the old token and disconnect the gateway from the control plane.
            </Typography>
            {!showTokenCommands && showReconfigureAction && (
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant='contained'
                        color='warning'
                        onClick={onReconfigureRequested}
                        disabled={reconfigureLoading}
                        startIcon={reconfigureLoading && <CircularProgress size={16} color='inherit' />}
                    >
                        {reconfigureLoading ? 'Generating New Token...' : 'Reconfigure Gateway'}
                    </Button>
                </Box>
            )}
            {showTokenCommands && (
                <>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        To configure analytics, add your existing Moesif key as
                        {' '}
                        <code>MOESIF_KEY=&lt;your-moesif-key&gt;</code>
                        {' '}
                        to the keys.env file after creating it with the command below.
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        Run this command to create
                        {' '}
                        <code>{`${artifactName}/configs/keys.env`}</code>
                        {' '}
                        with the required environment variables:
                    </Typography>
                    <CodeBlock
                        code={displayKeysCommand}
                        copyCode={copyKeysCommand}
                    />
                </>
            )}
        </>
    );

    const renderQuickStartOverview = () => (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                Prerequisites
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li>
                    <Typography variant='body2'>
                        cURL installed
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        unzip installed
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        Docker installed and running
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        Docker Compose installed
                    </Typography>
                </li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                Step 1: Download the Gateway
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Run this command in your terminal to download the gateway:
            </Typography>
            <CodeBlock code={downloadCommand} />

            {renderTokenConfigurationStep()}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                Step 3: Start the Gateway
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                1. Navigate to the gateway folder.
            </Typography>
            <CodeBlock code={`cd ${artifactName}`} />
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                2. Run this command to start the gateway using the
                {' '}
                <code>configs/keys.env</code>
                {' '}
                file created in Step 2:
            </Typography>
            <CodeBlock code='docker compose --env-file configs/keys.env up' />
        </>
    );

    const renderVirtualMachineGuide = () => (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                Prerequisites
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li><Typography variant='body2'>cURL installed</Typography></li>
                <li><Typography variant='body2'>unzip installed</Typography></li>
                <li><Typography variant='body2'>Java 17 or later installed</Typography></li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                Step 1: Download the Gateway
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Download and extract the self-hosted gateway package:
            </Typography>
            <CodeBlock code={downloadCommand} />

            {renderTokenConfigurationStep()}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                Step 3: Start the Gateway
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Start the gateway on your virtual machine after you complete the configuration:
            </Typography>
            <CodeBlock code={`cd ${artifactName} && ./bin/gateway`} />
        </>
    );

    const renderDockerGuide = () => (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                Prerequisites
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li><Typography variant='body2'>cURL installed</Typography></li>
                <li><Typography variant='body2'>unzip installed</Typography></li>
                <li><Typography variant='body2'>Docker installed and running</Typography></li>
                <li><Typography variant='body2'>Docker Compose installed</Typography></li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                Step 1: Download the Gateway
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Run this command in your terminal to download the gateway:
            </Typography>
            <CodeBlock code={downloadCommand} />

            {renderTokenConfigurationStep()}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                Step 3: Start the Gateway
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                1. Navigate to the gateway folder.
            </Typography>
            <CodeBlock code={`cd ${artifactName}`} />
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                2. Run this command to start the gateway using the
                {' '}
                <code>configs/keys.env</code>
                {' '}
                file created in Step 2:
            </Typography>
            <CodeBlock code='docker compose --env-file configs/keys.env up' />
        </>
    );

    const renderKubernetesGuide = () => (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                Prerequisites
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li><Typography variant='body2'>kubectl configured for your cluster</Typography></li>
                <li><Typography variant='body2'>A namespace for the gateway deployment</Typography></li>
                <li><Typography variant='body2'>Helm or your preferred manifest deployment workflow</Typography></li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                Step 1: Create the Runtime Namespace
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Create a dedicated namespace for the gateway resources:
            </Typography>
            <CodeBlock code='kubectl create namespace wso2-gateway' />

            {renderTokenConfigurationStep()}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                Step 3: Create the Registration Secret
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Store the control plane host and registration token in a secret before applying the deployment:
            </Typography>
            <CodeBlock
                code={'kubectl create secret generic gateway-keys \\\n'
                    + `  --from-literal=GATEWAY_CONTROLPLANE_HOST=${controlPlaneHost} \\\n`
                    + `  --from-literal=GATEWAY_REGISTRATION_TOKEN=${displayRegistrationToken} \\\n`
                    + '  --from-literal=GATEWAY_CONTROLPLANE_ON_PREM=true \\\n'
                    + '  -n wso2-gateway'}
                copyCode={'kubectl create secret generic gateway-keys \\\n'
                    + `  --from-literal=GATEWAY_CONTROLPLANE_HOST=${controlPlaneHost} \\\n`
                    + `  --from-literal=GATEWAY_REGISTRATION_TOKEN=${actualRegistrationToken} \\\n`
                    + '  --from-literal=GATEWAY_CONTROLPLANE_ON_PREM=true \\\n'
                    + '  -n wso2-gateway'}
            />
        </>
    );

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'virtual-machine':
                return renderVirtualMachineGuide();
            case 'docker':
                return renderDockerGuide();
            case 'kubernetes':
                return renderKubernetesGuide();
            case 'quick-start':
            default:
                return renderQuickStartOverview();
        }
    };

    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                    Quick Start Guide
                </Typography>
                <Tabs
                    value={selectedTab}
                    onChange={(_, nextTab) => setSelectedTab(nextTab)}
                    variant='scrollable'
                    scrollButtons='auto'
                    sx={{ mb: 2 }}
                >
                    <Tab value='quick-start' label='Quick Start' />
                    <Tab value='virtual-machine' label='Virtual Machine' />
                    <Tab value='docker' label='Docker' />
                    <Tab value='kubernetes' label='Kubernetes' />
                </Tabs>
                <Divider sx={{ mb: 3 }} />
                {renderTabContent()}
            </CardContent>
        </Card>
    );
}

/**
 * Success view after gateway creation
 */
function GatewaySuccessView({
    gateway,
    onAddAnother,
    onReconfigureRequested,
    reconfigureLoading,
    isViewMode = false,
    showTokenCommands = true,
    hideHeader = false,
}) {
    const gatewayUrl = gateway?.properties?.gatewayController?.baseUrl || '-';
    const permissionTypeValue = gateway?.permissions?.permissionType || 'PUBLIC';
    const permissionRoles = gateway?.permissions?.roles || [];

    const getVisibilityLabel = () => {
        const option = PERMISSION_TYPE_OPTIONS.find((o) => o.value === permissionTypeValue);
        return option ? option.label : permissionTypeValue;
    };

    return (
        <>
            {!hideHeader && (
                <Box sx={{ mb: 3 }}>
                    <Link
                        href='/admin/settings/environments'
                        underline='none'
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2,
                        }}
                    >
                        <ArrowBackIcon fontSize='small' />
                        Back to Gateways
                    </Link>
                    <Typography variant='h4' sx={{ fontWeight: 700 }}>
                        {gateway.displayName || gateway.name}
                    </Typography>
                    {!isViewMode && (
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                            Gateway created successfully
                        </Typography>
                    )}
                </Box>
            )}

            {!isViewMode && (
                <MuiAlert severity='success' sx={{ mb: 3 }}>
                    Your gateway has been registered. Follow the quick start guide below.
                </MuiAlert>
            )}

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        Configuration
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant='body2' color='text.secondary'>
                                URL
                            </Typography>
                            <Typography variant='body1' sx={{ fontWeight: 500 }}>
                                {gatewayUrl}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant='body2' color='text.secondary'>
                                Visibility
                            </Typography>
                            <Typography variant='body1' sx={{ fontWeight: 500 }}>
                                {getVisibilityLabel()}
                            </Typography>
                        </Grid>
                        {permissionRoles.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant='body2' color='text.secondary'>
                                    Roles
                                </Typography>
                                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                                    {permissionRoles.join(', ')}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            <QuickStartGuide
                key={showTokenCommands ? 'with-token' : 'no-token'}
                gateway={gateway}
                showReconfigureAction={isViewMode}
                onReconfigureRequested={onReconfigureRequested}
                reconfigureLoading={reconfigureLoading}
                showTokenCommands={showTokenCommands}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant='outlined' href='/admin/settings/environments'>
                    View All Gateways
                </Button>
                {onAddAnother && (
                    <Button variant='contained' onClick={onAddAnother}>
                        Add Another Gateway
                    </Button>
                )}
            </Box>
        </>
    );
}

function PlatformGatewayManagement(props) {
    const { match: { params: { gatewayId } = {} } = {} } = props;
    const restApi = useMemo(() => new API(), []);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [permissionType, setPermissionType] = useState('PUBLIC');

    // Role management state
    const [validRoles, setValidRoles] = useState([]);
    const [invalidRoles, setInvalidRoles] = useState([]);
    const [roleValidity, setRoleValidity] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdGateway, setCreatedGateway] = useState(null);
    const [confirmReconfigureOpen, setConfirmReconfigureOpen] = useState(false);
    const [platformTokenRegenerating, setPlatformTokenRegenerating] = useState(false);

    // State for viewing existing gateway
    const [existingGateway, setExistingGateway] = useState(null);
    const [loadingExisting, setLoadingExisting] = useState(false);
    const [updatingExisting, setUpdatingExisting] = useState(false);
    const [showTokenCommands, setShowTokenCommands] = useState(false);
    const [existingHeaderEditMode, setExistingHeaderEditMode] = useState(false);

    // Load existing gateway if gatewayId is provided
    React.useEffect(() => {
        if (gatewayId) {
            setShowTokenCommands(false);
            setLoadingExisting(true);
            restApi.getPlatformGatewayList()
                .then((result) => {
                    const gateways = result?.body?.list || [];
                    const found = gateways.find((gw) => gw.id === gatewayId || gw.name === gatewayId);
                    if (found) {
                        setExistingGateway(found);
                        setName(found.displayName || found.name || '');
                        setDescription(found.description || '');
                        setExistingHeaderEditMode(false);
                    } else {
                        setError('Gateway not found');
                    }
                })
                .catch((e) => {
                    setError(e.message || 'Failed to load gateway');
                })
                .finally(() => {
                    setLoadingExisting(false);
                });
        }
    }, [gatewayId, restApi]);

    const handleRoleDeletion = (role) => {
        if (invalidRoles.includes(role)) {
            const invalidRolesArray = invalidRoles.filter((existingRole) => existingRole !== role);
            setInvalidRoles(invalidRolesArray);
            if (invalidRolesArray.length === 0) {
                setRoleValidity(true);
            }
        } else {
            setValidRoles(validRoles.filter((existingRole) => existingRole !== role));
        }
    };

    const handleRoleAddition = (role) => {
        const promise = restApi.validateSystemRole(base64url.encode(role));
        promise
            .then(() => {
                // Check if the role is already added
                if (validRoles.includes(role) || invalidRoles.includes(role)) {
                    return;
                }
                setValidRoles(validRoles.concat(role));
                if (invalidRoles.length === 0) {
                    setRoleValidity(true);
                } else {
                    setRoleValidity(false);
                }
            })
            .catch((err) => {
                if (err.status === 404) {
                    setInvalidRoles(invalidRoles.concat(role));
                    setRoleValidity(false);
                }
            });
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setBaseUrl('');
        setPermissionType('PUBLIC');
        setValidRoles([]);
        setInvalidRoles([]);
        setRoleValidity(true);
        setError('');
    };

    const handleAddAnother = () => {
        setCreatedGateway(null);
        setConfirmReconfigureOpen(false);
        setPlatformTokenRegenerating(false);
        setShowTokenCommands(false);
        resetForm();
    };

    const openReconfigureConfirm = () => {
        setConfirmReconfigureOpen(true);
    };

    const closeReconfigureConfirm = () => {
        if (!platformTokenRegenerating) {
            setConfirmReconfigureOpen(false);
        }
    };

    const handleRegeneratePlatformKey = async () => {
        if (!createdGateway?.id) {
            return;
        }
        setPlatformTokenRegenerating(true);
        try {
            const result = await restApi.regeneratePlatformGatewayToken(createdGateway.id);
            const regeneratedGateway = result?.body || result;
            if (regeneratedGateway) {
                setCreatedGateway(regeneratedGateway);
            }
            setConfirmReconfigureOpen(false);
            Alert.success('Gateway registration token regenerated successfully.');
        } catch (regenError) {
            const errorMessage = regenError?.response?.body?.description || regenError.message
                || 'Failed to regenerate gateway registration token.';
            Alert.error(errorMessage);
        } finally {
            setPlatformTokenRegenerating(false);
        }
    };

    const pageProps = {
        pageStyle: 'paperLess',
        title: createdGateway
            ? (createdGateway.displayName || createdGateway.name)
            : 'Add Self-Hosted Gateway',
    };

    const addPlatformGateway = async () => {
        setLoading(true);
        setError('');
        try {
            const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
            const computedVhost = getVhostFromBaseUrl(normalizedBaseUrl);
            if (!computedVhost) {
                throw new Error('A valid gateway URL is required.');
            }

            const displayName = name.trim();
            const gatewayName = slugifyName(displayName);
            if (!gatewayName || gatewayName.length < 3) {
                throw new Error('Gateway name must have at least 3 letters or numbers.');
            }

            const properties = {
                gatewayController: {
                    enabled: true,
                    baseUrl: normalizedBaseUrl,
                },
            };

            // Build permissions object
            const permissions = {
                permissionType,
                roles: validRoles,
            };

            const result = await restApi.createPlatformGateway({
                name: gatewayName,
                displayName,
                description: description.trim(),
                vhost: computedVhost,
                functionalityType: 'regular',
                isCritical: false,
                properties,
                permissions,
            });

            const gateway = result && result.body ? result.body : result;
            setCreatedGateway(gateway);
        } catch (e) {
            setError(e.message || 'Failed to add platform gateway.');
        } finally {
            setLoading(false);
        }
    };

    const isAddDisabled = loading
        || !name.trim()
        || !baseUrl.trim()
        || !roleValidity
        || ((permissionType === 'ALLOW' || permissionType === 'DENY')
            && validRoles.length === 0);

    // Handler for regenerating token for existing gateway
    const handleRegenerateExistingGatewayToken = async () => {
        if (!existingGateway?.id) {
            return;
        }
        setPlatformTokenRegenerating(true);
        try {
            const result = await restApi.regeneratePlatformGatewayToken(existingGateway.id);
            const updatedGateway = result?.body || result;
            if (updatedGateway) {
                setExistingGateway(updatedGateway);
            } else {
                const gatewayListResponse = await restApi.getPlatformGatewayList();
                const gateways = gatewayListResponse?.body?.list || [];
                const reloadedGateway = gateways.find((gw) => gw.id === existingGateway.id);
                if (reloadedGateway) {
                    setExistingGateway(reloadedGateway);
                }
            }
            setShowTokenCommands(true);
            Alert.success('Gateway registration token regenerated successfully.');
        } catch (e) {
            const errorMessage = e?.response?.body?.description || e.message
                || 'Failed to regenerate token';
            setError(errorMessage);
            Alert.error(errorMessage);
        } finally {
            setPlatformTokenRegenerating(false);
            setConfirmReconfigureOpen(false);
        }
    };

    const isExistingGatewaySaveDisabled = updatingExisting
        || !name.trim()
        || (name.trim() === (existingGateway?.displayName || existingGateway?.name || '').trim()
            && description.trim() === (existingGateway?.description || '').trim());

    const handleUpdateExistingGateway = async () => {
        if (!existingGateway?.id) {
            return;
        }

        setUpdatingExisting(true);
        setError('');
        try {
            const result = await restApi.updatePlatformGateway(existingGateway.id, {
                name: existingGateway.name,
                displayName: name.trim(),
                description: description.trim(),
                vhost: existingGateway.vhost,
                functionalityType: existingGateway.functionalityType,
                isCritical: existingGateway.isCritical,
                properties: existingGateway.properties,
                permissions: existingGateway.permissions,
            });
            const updatedGateway = result?.body || result;
            if (updatedGateway) {
                setExistingGateway(updatedGateway);
                setName(updatedGateway.displayName || updatedGateway.name || '');
                setDescription(updatedGateway.description || '');
            }
            setExistingHeaderEditMode(false);
            Alert.success('Gateway updated successfully.');
        } catch (e) {
            const errorMessage = e?.response?.body?.description || e.message || 'Failed to update gateway';
            setError(errorMessage);
            Alert.error(errorMessage);
        } finally {
            setUpdatingExisting(false);
        }
    };

    const handleStartExistingGatewayHeaderEdit = () => {
        setExistingHeaderEditMode(true);
    };

    const handleCancelExistingGatewayHeaderEdit = () => {
        setName(existingGateway?.displayName || existingGateway?.name || '');
        setDescription(existingGateway?.description || '');
        setExistingHeaderEditMode(false);
    };

    // Show loading state when fetching existing gateway
    if (loadingExisting) {
        return (
            <ContentBase {...pageProps}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            </ContentBase>
        );
    }

    // Show existing gateway quick start view
    if (existingGateway) {
        const gatewayDisplayName = existingGateway.displayName || existingGateway.name || '';
        const gatewayInitials = gatewayDisplayName
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'GW';
        const isActiveProperty = (existingGateway.additionalProperties || [])
            .find((property) => property.key === 'isActive')?.value;
        const hasStatus = typeof isActiveProperty !== 'undefined' && isActiveProperty !== null;
        const isActive = isActiveProperty === 'true' || isActiveProperty === true;

        return (
            <ContentBase {...pageProps}>
                <Box sx={{ mb: 3 }}>
                    <Link
                        href='/admin/settings/environments'
                        underline='none'
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 3,
                        }}
                    >
                        <ArrowBackIcon fontSize='small' />
                        Back to Gateways
                    </Link>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: { xs: 'column', md: 'row' },
                        }}
                    >
                        <Box
                            sx={{
                                width: 96,
                                height: 96,
                                borderRadius: 2,
                                bgcolor: 'primary.dark',
                                color: 'primary.contrastText',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            {gatewayInitials}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            {existingHeaderEditMode ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <TextField
                                        fullWidth
                                        size='small'
                                        label='Gateway Name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={updatingExisting}
                                    />
                                    <TextField
                                        fullWidth
                                        size='small'
                                        multiline
                                        minRows={2}
                                        label='Description'
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={updatingExisting}
                                    />
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Button
                                            variant='contained'
                                            onClick={handleUpdateExistingGateway}
                                            disabled={isExistingGatewaySaveDisabled}
                                            startIcon={updatingExisting && (
                                                <CircularProgress size={16} color='inherit' />
                                            )}
                                        >
                                            {updatingExisting ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button
                                            variant='outlined'
                                            onClick={handleCancelExistingGatewayHeaderEdit}
                                            disabled={updatingExisting}
                                        >
                                            Close
                                        </Button>
                                        {hasStatus && (
                                            <Chip
                                                size='small'
                                                label={isActive ? 'Active' : 'Inactive'}
                                                color={isActive ? 'success' : 'error'}
                                                variant='outlined'
                                            />
                                        )}
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                            mb: 1,
                                        }}
                                    >
                                        <Typography variant='h5' sx={{ fontWeight: 700 }}>
                                            {gatewayDisplayName}
                                        </Typography>
                                        <IconButton
                                            size='small'
                                            onClick={handleStartExistingGatewayHeaderEdit}
                                            aria-label='edit gateway details'
                                        >
                                            <EditOutlinedIcon fontSize='small' />
                                        </IconButton>
                                        {hasStatus && (
                                            <Chip
                                                size='small'
                                                label={isActive ? 'Active' : 'Inactive'}
                                                color={isActive ? 'success' : 'error'}
                                                variant='outlined'
                                            />
                                        )}
                                    </Box>
                                    <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
                                        {existingGateway.description
                                            || 'No description provided for this gateway yet.'}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>

                {error && (
                    <MuiAlert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </MuiAlert>
                )}

                <GatewaySuccessView
                    gateway={existingGateway}
                    onAddAnother={null}
                    onReconfigureRequested={openReconfigureConfirm}
                    reconfigureLoading={platformTokenRegenerating}
                    isViewMode
                    showTokenCommands={showTokenCommands}
                    hideHeader
                />
                <Dialog
                    open={confirmReconfigureOpen}
                    onClose={closeReconfigureConfirm}
                    aria-labelledby='reconfigure-existing-gateway-dialog-title'
                >
                    <DialogTitle id='reconfigure-existing-gateway-dialog-title'>
                        Generate New Registration Token?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            The older registration key will be revoked immediately and the connected gateway will be
                            disconnected from the control plane. You must reconfigure the gateway with the new key.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeReconfigureConfirm} disabled={platformTokenRegenerating}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRegenerateExistingGatewayToken}
                            variant='contained'
                            color='warning'
                            disabled={platformTokenRegenerating}
                        >
                            {platformTokenRegenerating ? 'Generating...' : 'Generate Key'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </ContentBase>
        );
    }

    if (createdGateway) {
        return (
            <ContentBase {...pageProps}>
                <GatewaySuccessView
                    gateway={createdGateway}
                    onAddAnother={handleAddAnother}
                    onReconfigureRequested={openReconfigureConfirm}
                    reconfigureLoading={platformTokenRegenerating}
                />
                <Dialog
                    open={confirmReconfigureOpen}
                    onClose={closeReconfigureConfirm}
                    aria-labelledby='reconfigure-created-gateway-dialog-title'
                >
                    <DialogTitle id='reconfigure-created-gateway-dialog-title'>
                        Generate New Registration Token?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            The older registration key will be revoked immediately and the connected gateway will be
                            disconnected from the control plane. You must reconfigure the gateway with the new key.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeReconfigureConfirm} disabled={platformTokenRegenerating}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRegeneratePlatformKey}
                            variant='contained'
                            color='warning'
                            disabled={platformTokenRegenerating}
                        >
                            {platformTokenRegenerating ? 'Generating...' : 'Generate Key'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </ContentBase>
        );
    }

    return (
        <ContentBase {...pageProps}>
            <Box sx={{ mb: 3 }}>
                <Link
                    href='/admin/settings/environments'
                    underline='none'
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                    }}
                >
                    <ArrowBackIcon fontSize='small' />
                    Back to Gateways
                </Link>
                <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
                    Add Self-Hosted Gateway
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    Register a new API Gateway to manage your APIs
                </Typography>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        Gateway Details
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size='small'
                                label='Name'
                                placeholder='Enter gateway name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                helperText='A unique name for your gateway'
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size='small'
                                label='URL'
                                placeholder='https://gateway.example.com:8443'
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                required
                                helperText='The base URL where your gateway will be accessible'
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size='small'
                                label='Description'
                                placeholder='Enter description (optional)'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant='outlined' size='small'>
                                <InputLabel id='permission-type-label'>Visibility</InputLabel>
                                <Select
                                    labelId='permission-type-label'
                                    id='permission-type-select'
                                    value={permissionType}
                                    label='Visibility'
                                    onChange={(e) => setPermissionType(e.target.value)}
                                >
                                    {PERMISSION_TYPE_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>Who can access APIs deployed to this gateway</FormHelperText>
                            </FormControl>
                        </Grid>
                        {(permissionType === 'ALLOW' || permissionType === 'DENY') && (
                            <Grid item xs={12}>
                                <MuiChipsInput
                                    fullWidth
                                    label='Roles'
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    name='GatewayEnvironmentPermissions'
                                    variant='outlined'
                                    size='small'
                                    value={validRoles.concat(invalidRoles)}
                                    alwaysShowPlaceholder={false}
                                    placeholder='Enter roles and press Enter'
                                    blurBehavior='clear'
                                    data-testid='gateway-permission-roles'
                                    InputProps={{
                                        endAdornment: !roleValidity && (
                                            <InputAdornment
                                                position='end'
                                                sx={{
                                                    position: 'absolute',
                                                    right: '25px',
                                                    top: '50%',
                                                }}
                                            >
                                                <ErrorIcon color='error' />
                                            </InputAdornment>
                                        ),
                                    }}
                                    onAddChip={handleRoleAddition}
                                    renderChip={(ChipComponent, key, ChipProps) => (
                                        <ChipComponent
                                            key={`${ChipProps.label}-${key}`}
                                            label={ChipProps.label}
                                            onDelete={() => handleRoleDeletion(ChipProps.label)}
                                            data-testid={ChipProps.label}
                                            style={{
                                                backgroundColor:
                                                    invalidRoles.includes(ChipProps.label)
                                                        ? red[300] : null,
                                                margin: '8px 8px 8px 0',
                                                float: 'left',
                                            }}
                                        />
                                    )}
                                    error={!roleValidity}
                                    helperText={(() => {
                                        if (!roleValidity) {
                                            return 'Invalid Role(s) Found';
                                        }
                                        if (permissionType === 'ALLOW') {
                                            return 'Use of this Gateway is "Allowed" for above roles.'
                                                + ' Enter a valid role and press Enter.';
                                        }
                                        return 'Use of this Gateway is "Denied" for above roles.'
                                            + ' Enter a valid role and press Enter.';
                                    })()}
                                />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {error && (
                <MuiAlert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </MuiAlert>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant='outlined' href='/admin/settings/environments'>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    disabled={isAddDisabled}
                    onClick={addPlatformGateway}
                    startIcon={loading && <CircularProgress size={16} color='inherit' />}
                >
                    {loading ? 'Adding...' : 'Add Gateway'}
                </Button>
            </Box>
        </ContentBase>
    );
}

export default PlatformGatewayManagement;
