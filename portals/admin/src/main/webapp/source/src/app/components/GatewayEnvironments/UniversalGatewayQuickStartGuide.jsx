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
import Alert from 'AppComponents/Shared/Alert';
import {
    Box, Button, Card, CardContent, CircularProgress, Tab, Tabs, Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ComputerIcon from '@mui/icons-material/Computer';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import { useIntl } from 'react-intl';
import Configurations from 'Config';
import { gatewayShape, getPlatformGatewayReleaseConfig } from './UniversalGatewayUtils';

const DockerIcon = `${Configurations.app.context}/site/public/images/docker-icon.svg`;
const KubernetesIcon = `${Configurations.app.context}/site/public/images/Kubernetes_logo.svg`;

const QUICK_START_TAB = {
    quickStart: 'quick-start',
    virtualMachine: 'virtual-machine',
    docker: 'docker',
    kubernetes: 'kubernetes',
};

const QUICK_START_TABS = [
    {
        value: QUICK_START_TAB.quickStart,
        labelKey: 'Gateways.UniversalGatewayManagement.quick.start.tab.quick.start',
        defaultMessage: 'Quick Start',
        icon: <RocketLaunchIcon sx={{ fontSize: 20 }} />,
    },
    {
        value: QUICK_START_TAB.virtualMachine,
        labelKey: 'Gateways.UniversalGatewayManagement.quick.start.tab.virtual.machine',
        defaultMessage: 'Virtual Machine',
        icon: <ComputerIcon />,
    },
    {
        value: QUICK_START_TAB.docker,
        labelKey: 'Gateways.UniversalGatewayManagement.quick.start.tab.docker',
        defaultMessage: 'Docker',
        icon: <img src={DockerIcon} alt='Docker' width={20} height={20} />,
    },
    {
        value: QUICK_START_TAB.kubernetes,
        labelKey: 'Gateways.UniversalGatewayManagement.quick.start.tab.kubernetes',
        defaultMessage: 'Kubernetes',
        icon: <img src={KubernetesIcon} alt='Kubernetes' width={20} height={20} />,
    },
];

const QuickStartTokenConfigurationStep = ({
    t,
    showTokenCommands,
    showReconfigureAction,
    onReconfigureRequested,
    reconfigureLoading,
    artifactName,
    displayKeysCommand,
    copyKeysCommand,
}) => {
    return (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.step.configure.title',
                    'Step 2: Configure the Gateway',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.step.configure.description',
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
                                'Gateways.UniversalGatewayManagement.quick.start.reconfigure.generating',
                                'Generating New Token...',
                            )
                            : t(
                                'Gateways.UniversalGatewayManagement.quick.start.reconfigure.action',
                                'Reconfigure Gateway',
                            )}
                    </Button>
                </Box>
            )}
            {showTokenCommands && (
                <>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.analytics.description',
                            'To configure analytics, add your existing Moesif key as {key} to the '
                                + 'keys.env file after creating it with the command below.',
                            { key: 'MOESIF_KEY=<your-moesif-key>' },
                        )}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.keys.command.description',
                            'Run this command to create {path} with the required environment variables:',
                            { path: `${artifactName}/configs/keys.env` },
                        )}
                    </Typography>
                    <CodeBlock code={displayKeysCommand} copyCode={copyKeysCommand} />
                </>
            )}
        </>
    );
};

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

const renderQuickStartOverview = ({
    t, downloadCommand, artifactName, tokenConfigurationStep,
}) => {
    return (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                {t('Gateways.UniversalGatewayManagement.quick.start.prerequisites', 'Prerequisites')}
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li>
                    <Typography variant='body2'>
                        {t('Gateways.UniversalGatewayManagement.quick.start.prerequisite.curl', 'cURL installed')}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t('Gateways.UniversalGatewayManagement.quick.start.prerequisite.unzip', 'unzip installed')}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.prerequisite.docker',
                            'Docker installed and running',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.prerequisite.docker.compose',
                            'Docker Compose installed',
                        )}
                    </Typography>
                </li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.step.download.title',
                    'Step 1: Download the Gateway',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.step.download.description',
                    'Run this command in your terminal to download the gateway:',
                )}
            </Typography>
            <CodeBlock code={downloadCommand} />

            {tokenConfigurationStep}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t('Gateways.UniversalGatewayManagement.quick.start.step.start.title', 'Step 3: Start the Gateway')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.step.start.navigate',
                    '1. Navigate to the gateway folder.',
                )}
            </Typography>
            <CodeBlock code={`cd ${artifactName}`} />
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.step.start.command',
                    '2. Run this command to start the gateway using the configs/keys.env file created in Step 2:',
                )}
            </Typography>
            <CodeBlock code='docker compose --env-file configs/keys.env up' />
        </>
    );
};

const renderVirtualMachineGuide = ({
    t, downloadCommand, artifactName, tokenConfigurationStep,
}) => {
    return (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                {t('Gateways.UniversalGatewayManagement.quick.start.prerequisites', 'Prerequisites')}
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li>
                    <Typography variant='body2'>
                        {t('Gateways.UniversalGatewayManagement.quick.start.prerequisite.curl', 'cURL installed')}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t('Gateways.UniversalGatewayManagement.quick.start.prerequisite.unzip', 'unzip installed')}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.prerequisite.java',
                            'Java 17 or later installed',
                        )}
                    </Typography>
                </li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.step.download.title',
                    'Step 1: Download the Gateway',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.virtual.machine.download',
                    'Download and extract the self-hosted gateway package:',
                )}
            </Typography>
            <CodeBlock code={downloadCommand} />

            {tokenConfigurationStep}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t('Gateways.UniversalGatewayManagement.quick.start.step.start.title', 'Step 3: Start the Gateway')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.virtual.machine.start',
                    'Start the gateway on your virtual machine after you complete the configuration:',
                )}
            </Typography>
            <CodeBlock code={`cd ${artifactName} && ./bin/gateway`} />
        </>
    );
};

const renderDockerGuide = ({
    t, downloadCommand, artifactName, tokenConfigurationStep,
}) => {
    return renderQuickStartOverview({
        t,
        downloadCommand,
        artifactName,
        tokenConfigurationStep,
    });
};

const renderKubernetesGuide = ({
    t,
    controlPlaneHost,
    displayRegistrationToken,
    actualRegistrationToken,
    showTokenCommands,
    showReconfigureAction,
    onReconfigureRequested,
    reconfigureLoading,
    helmChartOciUrl,
    helmChartVersion,
}) => {
    const displayHelmInstallCommand = `helm install gateway ${helmChartOciUrl} --version ${helmChartVersion} \\\n`
        + `  --set gateway.controller.controlPlane.host="${controlPlaneHost}" \\\n`
        + '  --set gateway.controller.controlPlane.port=443 \\\n'
        + `  --set gateway.controller.controlPlane.token.value="${displayRegistrationToken}" \\\n`
        + '  --set gateway.config.analytics.publishers.moesif.application_id=<your-moesif-key> \\\n'
        + '  --set gateway.config.analytics.enabled=true';

    const copyHelmInstallCommand = `helm install gateway ${helmChartOciUrl} --version ${helmChartVersion} \\\n`
        + `  --set gateway.controller.controlPlane.host="${controlPlaneHost}" \\\n`
        + '  --set gateway.controller.controlPlane.port=443 \\\n'
        + `  --set gateway.controller.controlPlane.token.value="${actualRegistrationToken}" \\\n`
        + '  --set gateway.config.analytics.publishers.moesif.application_id=<your-moesif-key> \\\n'
        + '  --set gateway.config.analytics.enabled=true';

    return (
        <>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                {t('Gateways.UniversalGatewayManagement.quick.start.prerequisites', 'Prerequisites')}
            </Typography>
            <Box component='ul' sx={{ mt: 0, mb: 2, pl: 2 }}>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.prerequisite.kubernetes',
                            'Kubernetes 1.32+ cluster',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.prerequisite.helm',
                            'Helm 3.18+ installed',
                        )}
                    </Typography>
                </li>
                <li>
                    <Typography variant='body2'>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.prerequisite.certmanager',
                            'Either permissions to install cert-manager in the cluster or an existing '
                                + 'cert-manager installation',
                        )}
                    </Typography>
                </li>
            </Box>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.kubernetes.certmanager.title',
                    'Install cert-manager (optional)',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.kubernetes.certmanager.description',
                    'If cert-manager is not already installed, run these commands before installing the gateway chart:',
                )}
            </Typography>
            <CodeBlock
                code={
                    'helm repo add jetstack https://charts.jetstack.io --force-update\n'
                        + 'helm repo update\n\n'
                        + 'helm install cert-manager jetstack/cert-manager \\\n'
                        + '  --namespace cert-manager \\\n'
                        + '  --create-namespace \\\n'
                        + '  --set crds.enabled=true'
                }
            />

            {!showTokenCommands && showReconfigureAction && (
                <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.kubernetes.reconfigure.description',
                            'The registration token is single-use. If you need to reconfigure the gateway, '
                                + 'generate a new token. This will revoke the old token and disconnect the '
                                + 'gateway from the control plane.',
                        )}
                    </Typography>
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
                                'Gateways.UniversalGatewayManagement.quick.start.reconfigure.generating',
                                'Generating New Token...',
                            )
                            : t(
                                'Gateways.UniversalGatewayManagement.quick.start.reconfigure.action',
                                'Reconfigure Gateway',
                            )}
                    </Button>
                </Box>
            )}

            {showTokenCommands && showReconfigureAction && (
                <Box
                    sx={{
                        mt: 3,
                        mb: 2,
                        p: 1.5,
                        borderLeft: '4px solid',
                        borderColor: 'success.main',
                        bgcolor: 'success.lighter',
                        borderRadius: 1,
                    }}
                >
                    <Typography variant='body2' color='text.primary'>
                        {t(
                            'Gateways.UniversalGatewayManagement.quick.start.kubernetes.token.generated',
                            'Successfully generated new configurations. Use the updated command below '
                                + 'to install the gateway chart.',
                        )}
                    </Typography>
                </Box>
            )}

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                {t(
                    'Gateways.UniversalGatewayManagement.quick.start.kubernetes.install.title',
                    'Installing the Chart',
                )}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {
                    t(
                        'Gateways.UniversalGatewayManagement.quick.start.kubernetes.install.description',
                        'Run this command to install the gateway chart with control plane configurations:',
                    )
                }
            </Typography>
            <CodeBlock code={displayHelmInstallCommand} copyCode={copyHelmInstallCommand} />
        </>
    );
};

const renderQuickStartTabLabel = (tabConfig, t) => (
    <Tab
        key={tabConfig.value}
        value={tabConfig.value}
        label={t(tabConfig.labelKey, tabConfig.defaultMessage)}
        icon={tabConfig.icon}
        iconPosition='start'
    />
);

const CodeBlock = ({ code, copyCode }) => {
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
};

CodeBlock.propTypes = {
    code: PropTypes.string.isRequired,
    copyCode: PropTypes.string,
};

CodeBlock.defaultProps = {
    copyCode: '',
};

const QuickStartGuide = ({
    gateway,
    showReconfigureAction = false,
    onReconfigureRequested = null,
    reconfigureLoading = false,
    showTokenCommands = true,
    embedded = false,
}) => {
    const intl = useIntl();
    const t = (id, defaultMessage, values) => intl.formatMessage({ id, defaultMessage }, values);
    const [selectedTab, setSelectedTab] = useState(QUICK_START_TAB.quickStart);
    const { settings } = useAppContext();
    const {
        artifactName, controlPlaneHost, downloadCommand, helmChartOciUrl, helmChartVersion,
    } = useMemo(
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
        case QUICK_START_TAB.virtualMachine:
            tabContent = renderVirtualMachineGuide({
                t,
                downloadCommand,
                artifactName,
                tokenConfigurationStep,
            });
            break;
        case QUICK_START_TAB.docker:
            tabContent = renderDockerGuide({
                t,
                downloadCommand,
                artifactName,
                tokenConfigurationStep,
            });
            break;
        case QUICK_START_TAB.kubernetes:
            tabContent = renderKubernetesGuide({
                t,
                controlPlaneHost,
                displayRegistrationToken,
                actualRegistrationToken,
                showTokenCommands,
                showReconfigureAction,
                onReconfigureRequested,
                reconfigureLoading,
                helmChartOciUrl,
                helmChartVersion,
            });
            break;
        case QUICK_START_TAB.quickStart:
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
                {t('Gateways.UniversalGatewayManagement.quick.start.title', 'Quick Start Guide')}
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
            {tabContent}
        </>
    );

    if (embedded) {
        return content;
    }

    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>{content}</CardContent>
        </Card>
    );
};

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

export default QuickStartGuide;
