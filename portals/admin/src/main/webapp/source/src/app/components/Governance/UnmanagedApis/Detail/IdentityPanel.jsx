/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardContent, Typography, Box, Chip, Stack,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';

// Maps env_kind (case-insensitive) to a MUI Chip color name. The BFF
// returns these in uppercase (K8S / LEGACY / UNKNOWN); we lowercase
// the lookup so future server-side casing changes don't break the UI.
const envKindColor = {
    k8s: 'info',
    legacy: 'default',
    unknown: 'warning',
};

/**
 * Renders one labeled key/value row inside the identity panel. Keeps the
 * layout consistent and keyboard-readable (no table-flex alignment hacks).
 *
 * @param {object} props component props
 * @param {React.Node} props.label translated label
 * @param {React.Node} props.value rendered value
 * @returns {JSX} a single key/value row
 */
const Row = ({ label, value }) => (
    <Box sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'baseline',
        py: 0.5,
    }}
    >
        <Typography
            variant='caption'
            color='text.secondary'
            sx={{ minWidth: 140, textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
            {label}
        </Typography>
        <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
            {value || '—'}
        </Typography>
    </Box>
);

Row.propTypes = {
    label: PropTypes.node.isRequired,
    value: PropTypes.node,
};

Row.defaultProps = { value: null };

/**
 * IdentityPanel renders the "what service is this" half of the detail
 * page. Same layout for k8s and legacy services; the variant just
 * changes which fields appear (namespace+service for k8s, host
 * literal for legacy; samplePod/sampleWorkload only when populated).
 *
 * @param {object} props component props
 * @param {object} props.detail the /apis/{id} response payload
 * @returns {JSX} card with identity fields
 */
const IdentityPanel = ({ detail }) => {
    if (!detail) {
        return null;
    }
    const envKindRaw = detail.envKind || 'unknown';
    const envKind = String(envKindRaw).toLowerCase();

    return (
        <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
                <Typography
                    variant='body1'
                    sx={{ fontWeight: 'bold', mb: 2 }}
                >
                    <FormattedMessage
                        id='Discovery.detail.identity.title'
                        defaultMessage='Identity'
                    />
                </Typography>
                <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
                    <Chip
                        size='small'
                        label={envKind}
                        color={envKindColor[envKind] || 'warning'}
                        variant='outlined'
                    />
                </Stack>
                <Row
                    label={(
                        <FormattedMessage
                            id='Discovery.detail.identity.serviceIdentity'
                            defaultMessage='Service identity'
                        />
                    )}
                    value={detail.serviceIdentity}
                />
                {envKind === 'k8s' && (
                    <>
                        <Row
                            label={(
                                <FormattedMessage
                                    id='Discovery.detail.identity.namespace'
                                    defaultMessage='Namespace'
                                />
                            )}
                            value={detail.namespace}
                        />
                        <Row
                            label={(
                                <FormattedMessage
                                    id='Discovery.detail.identity.serviceName'
                                    defaultMessage='Service name'
                                />
                            )}
                            value={detail.serviceName}
                        />
                        <Row
                            label={(
                                <FormattedMessage
                                    id='Discovery.detail.identity.samplePod'
                                    defaultMessage='Sample pod'
                                />
                            )}
                            value={detail.samplePod}
                        />
                        <Row
                            label={(
                                <FormattedMessage
                                    id='Discovery.detail.identity.sampleWorkload'
                                    defaultMessage='Sample workload'
                                />
                            )}
                            value={detail.sampleWorkload}
                        />
                    </>
                )}
                <Row
                    label={(
                        <FormattedMessage
                            id='Discovery.detail.identity.method'
                            defaultMessage='Method'
                        />
                    )}
                    value={detail.method}
                />
                <Row
                    label={(
                        <FormattedMessage
                            id='Discovery.detail.identity.path'
                            defaultMessage='Normalized path'
                        />
                    )}
                    value={detail.normalizedPath}
                />
            </CardContent>
        </Card>
    );
};

IdentityPanel.propTypes = {
    detail: PropTypes.shape({
        serviceIdentity: PropTypes.string,
        envKind: PropTypes.string,
        namespace: PropTypes.string,
        serviceName: PropTypes.string,
        samplePod: PropTypes.string,
        sampleWorkload: PropTypes.string,
        method: PropTypes.string,
        normalizedPath: PropTypes.string,
    }),
};

IdentityPanel.defaultProps = { detail: null };

export default IdentityPanel;
