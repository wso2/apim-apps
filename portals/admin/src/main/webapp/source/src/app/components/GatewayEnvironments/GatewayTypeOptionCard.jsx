/*
 *  Copyright (c) 2026, WSO2 LLC. (https://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 LLC. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const GatewayTypeCardRoot = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'disabled',
})(({ theme, selected, disabled }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.25),
    width: '100%',
    minHeight: 84,
    padding: theme.spacing(1.25),
    borderRadius: theme.spacing(1.25),
    border: `1px solid ${
        selected ? theme.palette.primary.main : theme.palette.divider
    }`,
    backgroundColor: selected
        ? 'rgba(25, 118, 210, 0.08)'
        : theme.palette.background.paper,
    cursor: disabled ? 'default' : 'pointer',
    transition:
        'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: selected ? '0 0 0 1px rgba(25, 118, 210, 0.12)' : 'none',
    '&:hover': disabled
        ? {}
        : {
            borderColor: theme.palette.primary.main,
            backgroundColor: selected
                ? 'rgba(25, 118, 210, 0.12)'
                : 'rgba(25, 118, 210, 0.04)',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
        },
}));

function GatewayTypeOptionCard(props) {
    const {
        title,
        description,
        selected,
        disabled,
        onSelect,
    } = props;

    return (
        <GatewayTypeCardRoot
            selected={selected ? 1 : 0}
            disabled={disabled ? 1 : 0}
            onClick={disabled ? undefined : onSelect}
            onKeyDown={(event) => {
                if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onSelect?.();
                }
            }}
            role='radio'
            aria-checked={selected}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
        >
            <Radio
                checked={selected}
                disableRipple
                tabIndex={-1}
                disabled={disabled}
                onChange={onSelect}
                sx={{
                    padding: 0,
                    marginTop: '1px',
                    color: 'text.secondary',
                    '& .MuiSvgIcon-root': {
                        fontSize: '1.35rem',
                    },
                    '&.Mui-checked': {
                        color: 'primary.main',
                    },
                }}
            />
            <Box sx={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                <Typography
                    variant='subtitle1'
                    component='div'
                    sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        textAlign: 'left',
                        color: 'text.primary',
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant='body2'
                    component='div'
                    sx={{
                        mt: 0.5,
                        color: 'text.secondary',
                        fontSize: '0.55rem',
                        lineHeight: 1.25,
                        textAlign: 'left',
                    }}
                >
                    {description}
                </Typography>
            </Box>
        </GatewayTypeCardRoot>
    );
}

GatewayTypeOptionCard.propTypes = {
    description: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    selected: PropTypes.bool,
    title: PropTypes.string.isRequired,
};

GatewayTypeOptionCard.defaultProps = {
    disabled: false,
    selected: false,
};

export default GatewayTypeOptionCard;
