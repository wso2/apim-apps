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

/* global globalThis */

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
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
    Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorIcon from '@mui/icons-material/Error';
import { MuiChipsInput } from 'mui-chips-input';
import base64url from 'base64url';
import { red } from '@mui/material/colors';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import { Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';

const PERMISSION_TYPE_OPTIONS = [
    {
        value: 'PUBLIC',
        labelKey: 'Gateways.PlatformGatewayManagement.permission.public',
        defaultMessage: 'Public',
    },
    {
        value: 'ALLOW',
        labelKey: 'Gateways.PlatformGatewayManagement.permission.allow',
        defaultMessage: 'Allow for role(s)',
    },
    {
        value: 'DENY',
        labelKey: 'Gateways.PlatformGatewayManagement.permission.deny',
        defaultMessage: 'Deny for role(s)',
    },
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

const getPlatformGatewayReleaseConfig = (settings) => {
    const platformGatewayConfig = settings?.platformGateway || {};
    const releasesUrl = normalizeReleaseBaseUrl(platformGatewayConfig.releasesUrl);
    const version = (platformGatewayConfig.version || DEFAULT_PLATFORM_GATEWAY_VERSION).trim();
    const browserHost = globalThis.window?.location.host || '';
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
        .replaceAll(/[^a-z0-9]+/g, '-');
    let start = 0;
    let end = normalized.length;
    while (start < end && normalized.codePointAt(start) === 45) {
        start += 1;
    }
    while (end > start && normalized.codePointAt(end - 1) === 45) {
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
    if (!URL.canParse(baseUrl)) {
        return '';
    }
    return new URL(baseUrl).host;
};

const tryParseJson = (value) => {
    if (typeof value !== 'string') {
        return value;
    }
    try {
        return JSON.parse(value);
    } catch (error) {
        return value;
    }
};

const normalizeProperties = (properties) => {
    if (!properties) {
        return {};
    }
    if (Array.isArray(properties)) {
        const mapped = {};
        properties.forEach((property) => {
            if (property && property.key) {
                mapped[property.key] = tryParseJson(property.value);
            }
        });
        return mapped;
    }
    if (typeof properties === 'string') {
        const parsed = tryParseJson(properties);
        return (parsed && typeof parsed === 'object') ? parsed : {};
    }
    if (typeof properties === 'object') {
        return properties;
    }
    return {};
};

const getAdditionalProperty = (additionalProperties, key) => {
    if (!additionalProperties || !key) {
        return '';
    }
    if (Array.isArray(additionalProperties)) {
        const matched = additionalProperties.find((property) => property?.key === key);
        return matched?.value || '';
    }
    if (typeof additionalProperties === 'object') {
        return additionalProperties[key] || '';
    }
    return '';
};

const getPlatformGatewayUrl = (gateway) => {
    const properties = normalizeProperties(gateway?.properties);
    const gatewayController = tryParseJson(properties.gatewayController);
    const controllerBaseUrl = gatewayController?.baseUrl || properties?.baseUrl;
    if (controllerBaseUrl && String(controllerBaseUrl).trim()) {
        return String(controllerBaseUrl).trim();
    }
    const additionalBaseUrl = getAdditionalProperty(gateway?.additionalProperties, 'platformGatewayBaseUrl');
    if (additionalBaseUrl && String(additionalBaseUrl).trim()) {
        return String(additionalBaseUrl).trim();
    }
    if (gateway?.vhost) {
        return `https://${gateway.vhost}`;
    }
    return '-';
};

const resolveGatewayStatus = (value) => {
    if (typeof value === 'undefined' || value === null || value === '') {
        return null;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toUpperCase();
        if (normalized === 'ACTIVE' || normalized === 'INACTIVE') {
            return normalized;
        }
        if (normalized === 'TRUE') {
            return 'ACTIVE';
        }
        if (normalized === 'FALSE') {
            return 'INACTIVE';
        }
    }
    return value ? 'ACTIVE' : 'INACTIVE';
};

const getGatewayStatusChipProps = (status) => {
    if (status === 'ACTIVE') {
        return {
            color: 'success',
            variant: 'filled',
        };
    }

    return {
        color: 'error',
        variant: 'outlined',
    };
};

const QUICK_START_TABS = [
    {
        value: 'quick-start',
        labelKey: 'Gateways.PlatformGatewayManagement.quick.start.tab.quick.start',
        defaultMessage: 'Quick Start',
    },
    {
        value: 'virtual-machine',
        labelKey: 'Gateways.PlatformGatewayManagement.quick.start.tab.virtual.machine',
        defaultMessage: 'Virtual Machine',
    },
    {
        value: 'docker',
        labelKey: 'Gateways.PlatformGatewayManagement.quick.start.tab.docker',
        defaultMessage: 'Docker',
    },
    {
        value: 'kubernetes',
        labelKey: 'Gateways.PlatformGatewayManagement.quick.start.tab.kubernetes',
        defaultMessage: 'Kubernetes',
    },
];

function QuickStartTokenConfigurationStep({
    t,
    showTokenCommands,
    showReconfigureAction,
    onReconfigureRequested,
    reconfigureLoading,
    artifactName,
    displayKeysCommand,
    copyKeysCommand,
}) {
    return (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.step.configure.title',
                    'Step 2: Configure the Gateway',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.step.configure.description',
                    'The registration token is single-use. If you need to reconfigure the gateway, '
                        + 'generate a new token. This will revoke the old token and disconnect the '
                        + 'gateway from the control plane.',
                )}
            </Typography>
            {!showTokenCommands && showReconfigureAction && (
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={onReconfigureRequested}
                        disabled={reconfigureLoading}
                        sx={{ bgcolor: 'common.white' }}
                        startIcon={reconfigureLoading && <CircularProgress size={16} color='inherit' />}
                    >
                        {reconfigureLoading
                            ? t(
                                'Gateways.PlatformGatewayManagement.quick.start.reconfigure.generating',
                                'Generating New Token...',
                            )
                            : t(
                                'Gateways.PlatformGatewayManagement.quick.start.reconfigure.action',
                                'Reconfigure Gateway',
                            )}
                    </Button>
                </Box>
            )}
            {showTokenCommands && (
                <>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.analytics.description',
                            'To configure analytics, add your existing Moesif key as {key} to the '
                                + 'keys.env file after creating it with the command below.',
                            { key: 'MOESIF_KEY=<your-moesif-key>' },
                        )}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.keys.command.description',
                            'Run this command to create {path} with the required environment variables:',
                            { path: `${artifactName}/configs/keys.env` },
                        )}
                    </Typography>
                    <CodeBlock
                        code={displayKeysCommand}
                        copyCode={copyKeysCommand}
                    />
                </>
            )}
        </>
    );
}

QuickStartTokenConfigurationStep.propTypes = {
    t: PropTypes.func.isRequired,
    showTokenCommands: PropTypes.bool.isRequired,
    showReconfigureAction: PropTypes.bool.isRequired,
    onReconfigureRequested: PropTypes.func,
    reconfigureLoading: PropTypes.bool.isRequired,
    artifactName: PropTypes.string.isRequired,
    displayKeysCommand: PropTypes.string.isRequired,
    copyKeysCommand: PropTypes.string.isRequired,
};

QuickStartTokenConfigurationStep.defaultProps = {
    onReconfigureRequested: null,
};

function renderQuickStartOverview({
    t,
    downloadCommand,
    artifactName,
    tokenConfigurationStep,
}) {
    return (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.prerequisites',
                    'Prerequisites',
                )}
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.curl',
                            'cURL installed',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.unzip',
                            'unzip installed',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.docker',
                            'Docker installed and running',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.docker.compose',
                            'Docker Compose installed',
                        )}
                    </Typography>
                </li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.step.download.title',
                    'Step 1: Download the Gateway',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.step.download.description',
                    'Run this command in your terminal to download the gateway:',
                )}
            </Typography>
            <CodeBlock code={downloadCommand} />

            {tokenConfigurationStep}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.step.start.title',
                    'Step 3: Start the Gateway',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.step.start.navigate',
                    '1. Navigate to the gateway folder.',
                )}
            </Typography>
            <CodeBlock code={`cd ${artifactName}`} />
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.step.start.command',
                    '2. Run this command to start the gateway using the configs/keys.env file created in Step 2:',
                )}
            </Typography>
            <CodeBlock code='docker compose --env-file configs/keys.env up' />
        </>
    );
}

function renderVirtualMachineGuide({
    t,
    downloadCommand,
    artifactName,
    tokenConfigurationStep,
}) {
    return (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.prerequisites',
                    'Prerequisites',
                )}
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.curl',
                            'cURL installed',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.unzip',
                            'unzip installed',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.java',
                            'Java 17 or later installed',
                        )}
                    </Typography>
                </li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.step.download.title',
                    'Step 1: Download the Gateway',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.virtual.machine.download',
                    'Download and extract the self-hosted gateway package:',
                )}
            </Typography>
            <CodeBlock code={downloadCommand} />

            {tokenConfigurationStep}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.step.start.title',
                    'Step 3: Start the Gateway',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.virtual.machine.start',
                    'Start the gateway on your virtual machine after you complete the configuration:',
                )}
            </Typography>
            <CodeBlock code={`cd ${artifactName} && ./bin/gateway`} />
        </>
    );
}

function renderDockerGuide({
    t,
    downloadCommand,
    artifactName,
    tokenConfigurationStep,
}) {
    return renderQuickStartOverview({
        t,
        downloadCommand,
        artifactName,
        tokenConfigurationStep,
    });
}

function renderKubernetesGuide({
    t,
    controlPlaneHost,
    displayRegistrationToken,
    actualRegistrationToken,
    tokenConfigurationStep,
}) {
    return (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.prerequisites',
                    'Prerequisites',
                )}
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.kubectl',
                            'kubectl configured for your cluster',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.namespace',
                            'A namespace for the gateway deployment',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.PlatformGatewayManagement.quick.start.prerequisite.helm',
                            'Helm or your preferred manifest deployment workflow',
                        )}
                    </Typography>
                </li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.kubernetes.namespace.title',
                    'Step 1: Create the Runtime Namespace',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.kubernetes.namespace.description',
                    'Create a dedicated namespace for the gateway resources:',
                )}
            </Typography>
            <CodeBlock code='kubectl create namespace wso2-gateway' />

            {tokenConfigurationStep}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.kubernetes.secret.title',
                    'Step 3: Create the Registration Secret',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.PlatformGatewayManagement.quick.start.kubernetes.secret.description',
                    'Store the control plane host and registration token in a secret before applying the deployment:',
                )}
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
}

const renderQuickStartTabLabel = (tabConfig, t) => (
    <Tab
        key={tabConfig.value}
        value={tabConfig.value}
        label={t(tabConfig.labelKey, tabConfig.defaultMessage)}
    />
);

/**
 * Code block component with copy functionality
 */
function CodeBlock({ code, copyCode }) {
    const [copied, setCopied] = useState(false);
    const copiedText = copyCode || code;

    const handleCopy = async () => {
        if (!globalThis.navigator?.clipboard?.writeText) {
            Alert.error('Clipboard access is not available in this browser.');
            return;
        }

        try {
            await globalThis.navigator.clipboard.writeText(copiedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            Alert.error('Failed to copy the command to the clipboard.');
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

CodeBlock.propTypes = {
    code: PropTypes.string.isRequired,
    copyCode: PropTypes.string,
};

CodeBlock.defaultProps = {
    copyCode: '',
};

const gatewayShape = PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    displayName: PropTypes.string,
    description: PropTypes.string,
    vhost: PropTypes.string,
    registrationToken: PropTypes.string,
    properties: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
    additionalProperties: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    permissions: PropTypes.shape({
        permissionType: PropTypes.string,
        roles: PropTypes.arrayOf(PropTypes.string),
    }),
});

/**
 * Quick Start Guide component
 */
export function QuickStartGuide({
    gateway, showReconfigureAction = false, onReconfigureRequested = null, reconfigureLoading = false,
    showTokenCommands = true, embedded = false,
}) {
    const intl = useIntl();
    const t = (id, defaultMessage, values) => intl.formatMessage({ id, defaultMessage }, values);
    const [selectedTab, setSelectedTab] = useState('quick-start');
    const { settings } = useAppContext();
    const { artifactName, controlPlaneHost, downloadCommand } = useMemo(
        () => getPlatformGatewayReleaseConfig(settings),
        [settings],
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
    const tokenConfigurationStep = (
        <QuickStartTokenConfigurationStep
            t={t}
            showTokenCommands={showTokenCommands}
            showReconfigureAction={showReconfigureAction}
            onReconfigureRequested={onReconfigureRequested}
            reconfigureLoading={reconfigureLoading}
            artifactName={artifactName}
            displayKeysCommand={displayKeysCommand}
            copyKeysCommand={copyKeysCommand}
        />
    );

    let tabContent;
    switch (selectedTab) {
        case 'virtual-machine':
            tabContent = renderVirtualMachineGuide({
                t,
                downloadCommand,
                artifactName,
                tokenConfigurationStep,
            });
            break;
        case 'docker':
            tabContent = renderDockerGuide({
                t,
                downloadCommand,
                artifactName,
                tokenConfigurationStep,
            });
            break;
        case 'kubernetes':
            tabContent = renderKubernetesGuide({
                t,
                controlPlaneHost,
                displayRegistrationToken,
                actualRegistrationToken,
                tokenConfigurationStep,
            });
            break;
        case 'quick-start':
        default:
            tabContent = renderQuickStartOverview({
                t,
                downloadCommand,
                artifactName,
                tokenConfigurationStep,
            });
            break;
    }

    const content = (
        <>
            <Typography variant='h6' sx={{ mb: 2 }}>
                {t('Gateways.PlatformGatewayManagement.quick.start.title', 'Quick Start Guide')}
            </Typography>
            <Tabs
                value={selectedTab}
                onChange={(_, nextTab) => setSelectedTab(nextTab)}
                variant='scrollable'
                scrollButtons='auto'
                aria-label='quick-start-tabs'
                sx={{
                    mb: 2,
                    minHeight: 40,
                    borderBottom: '1px solid #D8DDE6',
                    '& .MuiTabs-flexContainer': {
                        justifyContent: 'flex-start',
                    },
                    '& .MuiTabs-indicator': {
                        height: 2,
                        backgroundColor: '#0E4A72',
                    },
                    '& .MuiTab-root': {
                        minHeight: 40,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        mr: 1,
                        px: 2,
                        minWidth: 'auto',
                        border: 'none',
                    },
                    '& .Mui-selected': {
                        color: '#0E4A72',
                        fontWeight: 700,
                    },
                }}
            >
                {QUICK_START_TABS.map((tabConfig) => renderQuickStartTabLabel(tabConfig, t))}
            </Tabs>
            <Divider sx={{ mb: 3 }} />
            {tabContent}
        </>
    );

    if (embedded) {
        return content;
    }

    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    );
}

QuickStartGuide.propTypes = {
    gateway: gatewayShape,
    showReconfigureAction: PropTypes.bool,
    onReconfigureRequested: PropTypes.func,
    reconfigureLoading: PropTypes.bool,
    showTokenCommands: PropTypes.bool,
    embedded: PropTypes.bool,
};

QuickStartGuide.defaultProps = {
    gateway: null,
    showReconfigureAction: false,
    onReconfigureRequested: null,
    reconfigureLoading: false,
    showTokenCommands: true,
    embedded: false,
};

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
    const intl = useIntl();
    const t = (id, defaultMessage, values) => intl.formatMessage({ id, defaultMessage }, values);
    const gatewayUrl = getPlatformGatewayUrl(gateway);
    const permissionTypeValue = gateway?.permissions?.permissionType || 'PUBLIC';
    const permissionRoles = gateway?.permissions?.roles || [];

    const getVisibilityLabel = () => {
        const option = PERMISSION_TYPE_OPTIONS.find((o) => o.value === permissionTypeValue);
        return option ? t(option.labelKey, option.defaultMessage) : permissionTypeValue;
    };

    return (
        <>
            {!hideHeader && (
                <Box sx={{ mb: 3 }}>
                    <Link
                        component={RouterLink}
                        to='/settings/environments'
                        underline='none'
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2,
                        }}
                    >
                        <ArrowBackIcon fontSize='small' />
                        {t('Gateways.PlatformGatewayManagement.navigation.back', 'Back to Gateways')}
                    </Link>
                    <Typography variant='h4' sx={{ fontWeight: 700 }}>
                        {gateway.displayName || gateway.name}
                    </Typography>
                    {!isViewMode && (
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                            {t(
                                'Gateways.PlatformGatewayManagement.create.success.title',
                                'Gateway created successfully',
                            )}
                        </Typography>
                    )}
                </Box>
            )}

            {!isViewMode && (
                <MuiAlert severity='success' sx={{ mb: 3 }}>
                    {t(
                        'Gateways.PlatformGatewayManagement.create.success.banner',
                        'Your gateway has been registered. Follow the quick start guide below.',
                    )}
                </MuiAlert>
            )}

            <Paper elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        {t('Gateways.PlatformGatewayManagement.configuration.title', 'Configuration')}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant='body2' color='text.secondary'>
                                {t('Gateways.PlatformGatewayManagement.configuration.url', 'URL')}
                            </Typography>
                            <Typography variant='body1' sx={{ fontWeight: 500 }}>
                                {gatewayUrl}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant='body2' color='text.secondary'>
                                {t('Gateways.PlatformGatewayManagement.configuration.visibility', 'Visibility')}
                            </Typography>
                            <Typography variant='body1' sx={{ fontWeight: 500 }}>
                                {getVisibilityLabel()}
                            </Typography>
                        </Grid>
                        {permissionRoles.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant='body2' color='text.secondary'>
                                    {t('Gateways.PlatformGatewayManagement.configuration.roles', 'Roles')}
                                </Typography>
                                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                                    {permissionRoles.join(', ')}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>
                <Divider sx={{ mx: 3, mb: 3 }} />
                <Box sx={{ px: 3, pb: 3 }}>
                    <QuickStartGuide
                        key={showTokenCommands ? 'with-token' : 'no-token'}
                        gateway={gateway}
                        showReconfigureAction={isViewMode}
                        onReconfigureRequested={onReconfigureRequested}
                        reconfigureLoading={reconfigureLoading}
                        showTokenCommands={showTokenCommands}
                        embedded
                    />
                </Box>
                <Divider sx={{ mx: 3 }} />
                <Box
                    sx={{
                        p: 3,
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <Button
                        component={RouterLink}
                        to='/settings/environments'
                        variant='contained'
                        color='primary'
                    >
                        {t('Gateways.PlatformGatewayManagement.action.view.all', 'View All Gateways')}
                    </Button>
                    {onAddAnother && (
                        <Button variant='outlined' color='primary' onClick={onAddAnother}>
                            {t('Gateways.PlatformGatewayManagement.action.add.another', 'Add Another Gateway')}
                        </Button>
                    )}
                </Box>
            </Paper>
        </>
    );
}

GatewaySuccessView.propTypes = {
    gateway: gatewayShape,
    onAddAnother: PropTypes.func,
    onReconfigureRequested: PropTypes.func,
    reconfigureLoading: PropTypes.bool,
    isViewMode: PropTypes.bool,
    showTokenCommands: PropTypes.bool,
    hideHeader: PropTypes.bool,
};

GatewaySuccessView.defaultProps = {
    gateway: null,
    onAddAnother: null,
    onReconfigureRequested: null,
    reconfigureLoading: false,
    isViewMode: false,
    showTokenCommands: true,
    hideHeader: false,
};

function RegenerateTokenDialog({
    open,
    titleId,
    onClose,
    onConfirm,
    loading,
    t,
}) {
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby={titleId}>
            <DialogTitle id={titleId}>
                {t(
                    'Gateways.PlatformGatewayManagement.token.dialog.title',
                    'Generate New Registration Token?',
                )}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t(
                        'Gateways.PlatformGatewayManagement.token.dialog.description',
                        'The older registration key will be revoked immediately and the '
                            + 'connected gateway will be disconnected from the control plane. '
                            + 'You must reconfigure the gateway with the new key.',
                    )}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    {t('Gateways.PlatformGatewayManagement.action.cancel', 'Cancel')}
                </Button>
                <Button onClick={onConfirm} variant='contained' color='primary' disabled={loading}>
                    {loading
                        ? t('Gateways.PlatformGatewayManagement.action.generating', 'Generating...')
                        : t('Gateways.PlatformGatewayManagement.action.generate.key', 'Generate Key')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

RegenerateTokenDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    titleId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
};

function PlatformGatewayManagement(props) {
    const intl = useIntl();
    const t = React.useCallback(
        (id, defaultMessage, values) => intl.formatMessage({ id, defaultMessage }, values),
        [intl],
    );
    const {
        match: { params: { gatewayId } = {} } = {},
        location,
    } = props;
    const restApi = useMemo(() => new API(), []);
    const preloadedGateway = useMemo(() => {
        const createdGateway = location?.state?.createdGateway;
        if (!createdGateway) {
            return null;
        }
        if (!gatewayId) {
            return createdGateway;
        }
        if (createdGateway.id === gatewayId || createdGateway.name === gatewayId) {
            return createdGateway;
        }
        return null;
    }, [gatewayId, location?.state]);
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

    const applyExistingGateway = React.useCallback((gatewayToApply) => {
        setExistingGateway(gatewayToApply);
        setName(gatewayToApply?.displayName || gatewayToApply?.name || '');
        setDescription(gatewayToApply?.description || '');
        setExistingHeaderEditMode(false);
    }, []);

    const getMergedGateway = React.useCallback((gatewayToApply) => {
        if (preloadedGateway?.registrationToken) {
            return { ...gatewayToApply, registrationToken: preloadedGateway.registrationToken };
        }
        return gatewayToApply;
    }, [preloadedGateway]);

    const loadExistingGateway = React.useCallback(async () => {
        const result = await restApi.getPlatformGatewayList();
        const gateways = result?.body?.list || [];
        const foundGateway = gateways.find((gw) => gw.id === gatewayId || gw.name === gatewayId);

        if (!foundGateway) {
            setError(t('Gateways.PlatformGatewayManagement.error.not.found', 'Gateway not found'));
            return;
        }

        applyExistingGateway(getMergedGateway(foundGateway));
    }, [applyExistingGateway, gatewayId, getMergedGateway, restApi, t]);

    // Load existing gateway if gatewayId is provided
    React.useEffect(() => {
        if (!gatewayId) {
            return undefined;
        }

        let isMounted = true;
        const hasPreloadedToken = Boolean(preloadedGateway?.registrationToken);

        if (preloadedGateway) {
            applyExistingGateway(preloadedGateway);
        }

        setShowTokenCommands(hasPreloadedToken);
        setLoadingExisting(true);
        setError('');

        loadExistingGateway()
            .catch((e) => {
                if (isMounted) {
                    setError(e.message || t('Gateways.PlatformGatewayManagement.error.load', 'Failed to load gateway'));
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingExisting(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [applyExistingGateway, gatewayId, loadExistingGateway, preloadedGateway, t]);

    React.useEffect(() => {
        setRoleValidity(invalidRoles.length === 0);
    }, [invalidRoles]);

    const handleRoleDeletion = (role) => {
        setInvalidRoles((existingInvalidRoles) => {
            return existingInvalidRoles.filter((existingRole) => existingRole !== role);
        });
        setValidRoles((existingValidRoles) => {
            return existingValidRoles.filter((existingRole) => existingRole !== role);
        });
    };

    const handleRoleAddition = (role) => {
        const normalizedRole = role.trim();
        if (!normalizedRole) {
            return;
        }

        const promise = restApi.validateSystemRole(base64url.encode(normalizedRole));
        promise
            .then(() => {
                setInvalidRoles((existingInvalidRoles) => {
                    return existingInvalidRoles.filter((existingRole) => existingRole !== normalizedRole);
                });
                setValidRoles((existingValidRoles) => {
                    if (existingValidRoles.includes(normalizedRole)) {
                        return existingValidRoles;
                    }
                    return existingValidRoles.concat(normalizedRole);
                });
            })
            .catch((err) => {
                if (err.status === 404) {
                    setValidRoles((existingValidRoles) => {
                        return existingValidRoles.filter((existingRole) => existingRole !== normalizedRole);
                    });
                    setInvalidRoles((existingInvalidRoles) => {
                        if (existingInvalidRoles.includes(normalizedRole)) {
                            return existingInvalidRoles;
                        }
                        return existingInvalidRoles.concat(normalizedRole);
                    });
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
            Alert.success(t(
                'Gateways.PlatformGatewayManagement.token.regenerate.success',
                'Gateway registration token regenerated successfully.',
            ));
        } catch (regenError) {
            const errorMessage = regenError?.response?.body?.description || regenError.message
                || t(
                    'Gateways.PlatformGatewayManagement.token.regenerate.error',
                    'Failed to regenerate gateway registration token.',
                );
            Alert.error(errorMessage);
        } finally {
            setPlatformTokenRegenerating(false);
        }
    };

    const pageProps = {
        pageStyle: 'paperLess',
        title: createdGateway
            ? (createdGateway.displayName || createdGateway.name)
            : t('Gateways.PlatformGatewayManagement.page.title.new', 'Add WSO2 Gateway'),
    };

    const addPlatformGateway = async () => {
        setLoading(true);
        setError('');
        try {
            const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
            const computedVhost = getVhostFromBaseUrl(normalizedBaseUrl);
            if (!computedVhost) {
                throw new Error(t(
                    'Gateways.PlatformGatewayManagement.validation.url.required',
                    'A valid gateway URL is required.',
                ));
            }

            const displayName = name.trim();
            const gatewayName = slugifyName(displayName);
            if (!gatewayName || gatewayName.length < 3) {
                throw new Error(t(
                    'Gateways.PlatformGatewayManagement.validation.name.invalid',
                    'Gateway name must have at least 3 letters or numbers.',
                ));
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
                properties,
                permissions,
            });

            const gateway = result && result.body ? result.body : result;
            setCreatedGateway(gateway);
        } catch (e) {
            setError(e.message || t(
                'Gateways.PlatformGatewayManagement.error.create',
                'Failed to add platform gateway.',
            ));
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
            Alert.success(t(
                'Gateways.PlatformGatewayManagement.token.regenerate.success',
                'Gateway registration token regenerated successfully.',
            ));
        } catch (e) {
            const errorMessage = e?.response?.body?.description || e.message
                || t('Gateways.PlatformGatewayManagement.token.regenerate.error.short', 'Failed to regenerate token');
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
                properties: normalizeProperties(existingGateway.properties),
                permissions: existingGateway.permissions,
            });
            const updatedGateway = result?.body || result;
            if (updatedGateway) {
                setExistingGateway(updatedGateway);
                setName(updatedGateway.displayName || updatedGateway.name || '');
                setDescription(updatedGateway.description || '');
            }
            setExistingHeaderEditMode(false);
            Alert.success(t('Gateways.PlatformGatewayManagement.update.success', 'Gateway updated successfully.'));
        } catch (e) {
            const errorMessage = e?.response?.body?.description || e.message
                || t('Gateways.PlatformGatewayManagement.update.error', 'Failed to update gateway');
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
        const gatewayStatus = resolveGatewayStatus(
            getAdditionalProperty(existingGateway.additionalProperties, 'isActive') || existingGateway.isActive,
        );
        const hasStatus = Boolean(gatewayStatus);
        const isActive = gatewayStatus === 'ACTIVE';

        return (
            <ContentBase {...pageProps}>
                <Box sx={{ mb: 3 }}>
                    <Link
                        component={RouterLink}
                        to='/settings/environments'
                        underline='none'
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 3,
                        }}
                    >
                        <ArrowBackIcon fontSize='small' />
                        {t('Gateways.PlatformGatewayManagement.navigation.back', 'Back to Gateways')}
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
                                        label={t(
                                            'Gateways.PlatformGatewayManagement.form.gateway.name',
                                            'Gateway Name',
                                        )}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={updatingExisting}
                                    />
                                    <TextField
                                        fullWidth
                                        size='small'
                                        multiline
                                        minRows={2}
                                        label={t(
                                            'Gateways.PlatformGatewayManagement.form.description',
                                            'Description',
                                        )}
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
                                            {updatingExisting
                                                ? t(
                                                    'Gateways.PlatformGatewayManagement.action.saving',
                                                    'Saving...',
                                                )
                                                : t(
                                                    'Gateways.PlatformGatewayManagement.action.save',
                                                    'Save',
                                                )}
                                        </Button>
                                        <Button
                                            variant='outlined'
                                            onClick={handleCancelExistingGatewayHeaderEdit}
                                            disabled={updatingExisting}
                                        >
                                            {t('Gateways.PlatformGatewayManagement.action.close', 'Close')}
                                        </Button>
                                        {hasStatus && (
                                            <Chip
                                                size='small'
                                                label={isActive
                                                    ? t(
                                                        'Gateways.PlatformGatewayManagement.status.active',
                                                        'Active',
                                                    )
                                                    : t(
                                                        'Gateways.PlatformGatewayManagement.status.inactive',
                                                        'Inactive',
                                                    )}
                                                {...getGatewayStatusChipProps(isActive ? 'ACTIVE' : 'INACTIVE')}
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
                                            aria-label={t(
                                                'Gateways.PlatformGatewayManagement.action.edit.details',
                                                'edit gateway details',
                                            )}
                                        >
                                            <EditOutlinedIcon fontSize='small' />
                                        </IconButton>
                                        {hasStatus && (
                                            <Chip
                                                size='small'
                                                label={isActive
                                                    ? t(
                                                        'Gateways.PlatformGatewayManagement.status.active',
                                                        'Active',
                                                    )
                                                    : t(
                                                        'Gateways.PlatformGatewayManagement.status.inactive',
                                                        'Inactive',
                                                    )}
                                                {...getGatewayStatusChipProps(isActive ? 'ACTIVE' : 'INACTIVE')}
                                            />
                                        )}
                                    </Box>
                                    <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
                                        {existingGateway.description
                                            || t(
                                                'Gateways.PlatformGatewayManagement.description.empty',
                                                'No description provided for this gateway yet.',
                                            )}
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
                <RegenerateTokenDialog
                    open={confirmReconfigureOpen}
                    titleId='reconfigure-existing-gateway-dialog-title'
                    onClose={closeReconfigureConfirm}
                    onConfirm={handleRegenerateExistingGatewayToken}
                    loading={platformTokenRegenerating}
                    t={t}
                />
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
                <RegenerateTokenDialog
                    open={confirmReconfigureOpen}
                    titleId='reconfigure-created-gateway-dialog-title'
                    onClose={closeReconfigureConfirm}
                    onConfirm={handleRegeneratePlatformKey}
                    loading={platformTokenRegenerating}
                    t={t}
                />
            </ContentBase>
        );
    }

    return (
        <ContentBase {...pageProps}>
            <Box sx={{ mb: 3 }}>
                <Link
                    component={RouterLink}
                    to='/settings/environments'
                    underline='none'
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                    }}
                >
                    <ArrowBackIcon fontSize='small' />
                    {t('Gateways.PlatformGatewayManagement.navigation.back', 'Back to Gateways')}
                </Link>
                <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
                    {t(
                        'Gateways.PlatformGatewayManagement.page.title.new',
                        'Add WSO2 Gateway',
                    )}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    {t(
                        'Gateways.PlatformGatewayManagement.page.description.new',
                        'Register a new API Gateway to manage your APIs',
                    )}
                </Typography>
            </Box>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        {t(
                            'Gateways.PlatformGatewayManagement.form.title',
                            'Gateway Details',
                        )}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size='small'
                                label={t('Gateways.PlatformGatewayManagement.form.name', 'Name')}
                                placeholder={t(
                                    'Gateways.PlatformGatewayManagement.form.name.placeholder',
                                    'Enter gateway name',
                                )}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                helperText={t(
                                    'Gateways.PlatformGatewayManagement.form.name.help',
                                    'A unique name for your gateway',
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size='small'
                                label={t('Gateways.PlatformGatewayManagement.form.url', 'URL')}
                                placeholder='https://gateway.example.com:8443'
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                required
                                helperText={t(
                                    'Gateways.PlatformGatewayManagement.form.url.help',
                                    'The base URL where your gateway will be accessible',
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size='small'
                                label={t(
                                    'Gateways.PlatformGatewayManagement.form.description',
                                    'Description',
                                )}
                                placeholder={t(
                                    'Gateways.PlatformGatewayManagement.form.description.placeholder',
                                    'Enter description (optional)',
                                )}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant='outlined' size='small'>
                                <InputLabel id='permission-type-label'>
                                    {t('Gateways.PlatformGatewayManagement.form.visibility', 'Visibility')}
                                </InputLabel>
                                <Select
                                    labelId='permission-type-label'
                                    id='permission-type-select'
                                    value={permissionType}
                                    label={t('Gateways.PlatformGatewayManagement.form.visibility', 'Visibility')}
                                    onChange={(e) => setPermissionType(e.target.value)}
                                >
                                    {PERMISSION_TYPE_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {t(option.labelKey, option.defaultMessage)}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    {t(
                                        'Gateways.PlatformGatewayManagement.form.visibility.help',
                                        'Who can access APIs deployed to this gateway',
                                    )}
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        {(permissionType === 'ALLOW' || permissionType === 'DENY') && (
                            <Grid item xs={12}>
                                <MuiChipsInput
                                    fullWidth
                                    label={t('Gateways.PlatformGatewayManagement.form.roles', 'Roles')}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    name='GatewayEnvironmentPermissions'
                                    variant='outlined'
                                    size='small'
                                    value={validRoles.concat(invalidRoles)}
                                    alwaysShowPlaceholder={false}
                                    placeholder={t(
                                        'Gateways.PlatformGatewayManagement.form.roles.placeholder',
                                        'Enter roles and press Enter',
                                    )}
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
                                            return t(
                                                'Gateways.PlatformGatewayManagement.form.roles.invalid',
                                                'Invalid Role(s) Found',
                                            );
                                        }
                                        if (permissionType === 'ALLOW') {
                                            return t(
                                                'Gateways.PlatformGatewayManagement.form.roles.allow.help',
                                                'Use of this Gateway is "Allowed" for above roles. '
                                                    + 'Enter a valid role and press Enter.',
                                            );
                                        }
                                        return t(
                                            'Gateways.PlatformGatewayManagement.form.roles.deny.help',
                                            'Use of this Gateway is "Denied" for above roles. '
                                                + 'Enter a valid role and press Enter.',
                                        );
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
                <Button
                    component={RouterLink}
                    to='/settings/environments'
                    variant='outlined'
                >
                    {t('Gateways.PlatformGatewayManagement.action.cancel', 'Cancel')}
                </Button>
                <Button
                    variant='contained'
                    disabled={isAddDisabled}
                    onClick={addPlatformGateway}
                    startIcon={loading && <CircularProgress size={16} color='inherit' />}
                >
                    {loading
                        ? t('Gateways.PlatformGatewayManagement.action.adding', 'Adding...')
                        : t('Gateways.PlatformGatewayManagement.action.add', 'Add Gateway')}
                </Button>
            </Box>
        </ContentBase>
    );
}

export default PlatformGatewayManagement;

PlatformGatewayManagement.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            gatewayId: PropTypes.string,
        }),
    }),
    location: PropTypes.shape({
        state: PropTypes.shape({
            createdGateway: gatewayShape,
        }),
    }),
};

PlatformGatewayManagement.defaultProps = {
    match: {
        params: {},
    },
    location: {},
};
