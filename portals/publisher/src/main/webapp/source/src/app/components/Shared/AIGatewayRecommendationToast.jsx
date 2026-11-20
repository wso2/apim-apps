/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const AI_GATEWAY_DOCS_URL = 'https://apim.docs.wso2.com/en/latest/ai-gateway/choreo-ai-gateway/';

// Clicking any of these anywhere on the page (the user moving on) closes the toast.
const DISMISS_ON_CLICK_SELECTOR = 'button, a[href], [role="button"]';
// Keep the dismissed toast mounted only long enough for its fade-out.
const REMOVE_DELAY_MS = 200;

export const TOAST_TYPES = {
    AI_API: 'aiApi',
    MCP_SERVER: 'mcpServer',
};

const TOAST_BACKGROUND = '#324148';
const TOAST_ACCENT = '#79CAFF';
const TOAST_TEXT = '#FFFFFF';

/**
 * Toast body recommending the API Platform AI Gateway.
 * @param {Object} props Component props.
 * @returns {JSX.Element} Toast content.
 */
const RecommendationToast = ({
    toastId, visible, type, title, message, actionLabel, closeLabel,
}) => {
    // Close the toast when the user clicks any button or link (e.g. Create AI API) to carry on.
    useEffect(() => {
        if (!visible) {
            return undefined;
        }
        const onDocumentClick = (event) => {
            const { target } = event;
            if (target instanceof Element && target.closest(DISMISS_ON_CLICK_SELECTOR)) {
                toast.dismiss(toastId);
            }
        };
        // Attach after the click that opened the toast has finished, so that click does not close it.
        const timer = setTimeout(() => document.addEventListener('click', onDocumentClick, true), 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', onDocumentClick, true);
        };
    }, [toastId, visible]);

    return (
        <Box
            role='status'
            aria-live='polite'
            data-testid={`ai-gateway-toast-${type}`}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                width: 420,
                maxWidth: 'calc(100vw - 32px)',
                backgroundColor: TOAST_BACKGROUND,
                color: TOAST_TEXT,
                borderRadius: '4px',
                boxShadow: 6,
                padding: '12px 8px 4px 16px',
                fontSize: '13px',
                opacity: visible ? 1 : 0,
                transition: 'opacity 150ms ease',
            }}
        >
            <Box display='flex' alignItems='flex-start'>
                <InfoIcon sx={{ color: TOAST_ACCENT, fontSize: 22, mr: 1.5, mt: '1px' }} />
                <Box flexGrow={1} pr={1}>
                    <Typography
                        component='div'
                        sx={{
                            color: TOAST_TEXT, fontWeight: 600, fontSize: '14px', lineHeight: 1.5,
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        component='div'
                        sx={{
                            color: TOAST_TEXT, fontSize: '13px', lineHeight: 1.5, mt: 0.5,
                        }}
                    >
                        {message}
                    </Typography>
                </Box>
                <IconButton
                    size='small'
                    aria-label={closeLabel}
                    data-testid='ai-gateway-toast-close'
                    onClick={() => toast.dismiss(toastId)}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: '-4px' }}
                >
                    <CloseIcon fontSize='small' />
                </IconButton>
            </Box>
            <Box display='flex' justifyContent='flex-end'>
                <Button
                    component='a'
                    href={AI_GATEWAY_DOCS_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                    size='small'
                    data-testid='ai-gateway-toast-get-started'
                    sx={{
                        color: TOAST_ACCENT,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        '&:hover': { backgroundColor: 'rgba(121, 202, 255, 0.08)' },
                    }}
                >
                    {actionLabel}
                </Button>
            </Box>
        </Box>
    );
};

RecommendationToast.propTypes = {
    toastId: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(Object.values(TOAST_TYPES)).isRequired,
    title: PropTypes.node.isRequired,
    message: PropTypes.node.isRequired,
    actionLabel: PropTypes.node.isRequired,
    closeLabel: PropTypes.string.isRequired,
};

/**
 * Returns a callback that shows the API Platform AI Gateway recommendation toast.
 * The toast uses a fixed id per type, so repeated calls while it is visible do not stack,
 * and it is shown again after the user dismisses it. It closes with its close button or when the
 * user clicks any button or link on the page, and never blocks the user.
 * @param {string} type One of TOAST_TYPES.
 * @returns {Function} Callback that shows the toast.
 */
export const useAIGatewayRecommendationToast = (type) => {
    const intl = useIntl();

    return useCallback(() => {
        const title = type === TOAST_TYPES.MCP_SERVER
            ? intl.formatMessage({
                id: 'Apis.Shared.AIGatewayRecommendationToast.mcpServer.title',
                defaultMessage: 'Creating an MCP Server?',
            })
            : intl.formatMessage({
                id: 'Apis.Shared.AIGatewayRecommendationToast.aiApi.title',
                defaultMessage: 'Creating an AI API?',
            });
        const message = intl.formatMessage(
            {
                id: 'Apis.Shared.AIGatewayRecommendationToast.message',
                defaultMessage: 'We recommend the <b>Choreo AI Gateway</b>, managed through the '
                    + '<b>Choreo Agent Control Plane</b>, for all new AI APIs and MCP Servers.',
            },
            { b: (chunks) => <strong>{chunks}</strong> },
        );
        const actionLabel = intl.formatMessage({
            id: 'Apis.Shared.AIGatewayRecommendationToast.getStarted',
            defaultMessage: 'Get Started',
        });
        const closeLabel = intl.formatMessage({
            id: 'Apis.Shared.AIGatewayRecommendationToast.close',
            defaultMessage: 'Close',
        });
        const toastId = `ai-gateway-recommendation-${type}`;

        toast.custom(
            (t) => (
                <RecommendationToast
                    toastId={toastId}
                    visible={t.visible}
                    type={type}
                    title={title}
                    message={message}
                    actionLabel={actionLabel}
                    closeLabel={closeLabel}
                />
            ),
            {
                id: toastId, duration: Infinity, position: 'bottom-right', removeDelay: REMOVE_DELAY_MS,
            },
        );
    }, [intl, type]);
};
