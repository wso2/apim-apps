import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';

const PLAN_MAPPING_PROPERTY_PREFIX = 'plan_mapping.';

/**
 * Gateway plan mapping configuration.
 * @param {Object} props component props.
 * @returns {JSX.Element} rendered gateway plan mapping section.
 */
export default function GatewayPlanMapping(props) {
    const {
        gatewayConfiguration,
        additionalProperties = {},
        setAdditionalProperties = () => {},
        isReadOnly = false,
    } = props;

    const leftLabel = gatewayConfiguration?.labels?.left || 'Key';
    const rightLabel = gatewayConfiguration?.labels?.right || gatewayConfiguration.label || 'Value';
    const values = Array.isArray(gatewayConfiguration.values) ? gatewayConfiguration.values : [];
    const groupedValues = values.reduce((groups, mappingValue) => {
        if (!mappingValue || typeof mappingValue !== 'object' || !mappingValue.id) {
            return groups;
        }
        const apiType = mappingValue.apiType || 'other';
        return {
            ...groups,
            [apiType]: [...(groups[apiType] || []), mappingValue],
        };
    }, {});
    const groupedValuesForDisplay = {
        ...groupedValues,
        ...(!groupedValues.async && groupedValues.rest ? { async: groupedValues.rest } : {}),
    };
    const apiTypeOrder = ['rest', 'async', 'ai-api', 'other'];
    const apiTypeLabels = {
        rest: (
            <FormattedMessage
                id='GatewayEnvironments.PlanMapping.apiType.rest'
                defaultMessage='REST APIs'
            />
        ),
        async: (
            <FormattedMessage
                id='GatewayEnvironments.PlanMapping.apiType.async'
                defaultMessage='Async APIs'
            />
        ),
        'ai-api': (
            <FormattedMessage
                id='GatewayEnvironments.PlanMapping.apiType.ai'
                defaultMessage='AI APIs'
            />
        ),
        other: (
            <FormattedMessage
                id='GatewayEnvironments.PlanMapping.apiType.other'
                defaultMessage='Other APIs'
            />
        ),
    };
    const orderedApiTypes = [
        ...apiTypeOrder.filter((apiType) => groupedValuesForDisplay[apiType]?.length > 0),
        ...Object.keys(groupedValuesForDisplay).filter((apiType) => !apiTypeOrder.includes(apiType)),
    ];

    const getPlanMappingValue = (localPolicyId) => {
        return additionalProperties[`${PLAN_MAPPING_PROPERTY_PREFIX}${localPolicyId}`] || '';
    };
    const tableStyles = {
        '& .MuiTableCell-head': {
            fontWeight: 500,
            color: '#8A94A6',
            fontSize: '0.8rem',
            borderBottom: '1px solid #EEF1F6',
            px: 2,
            py: 1,
        },
        '& .MuiTableCell-body': {
            fontSize: '0.75rem',
            borderBottom: '1px solid #EEF1F6',
            color: '#2F3441',
            px: 2,
            py: 1.5,
            verticalAlign: 'middle',
        },
        '& .MuiTableRow-root:last-of-type .MuiTableCell-body': {
            borderBottom: 'none',
        },
    };

    return (
        <Box mt={1}>
            <Stack direction='row' spacing={1} alignItems='center' mb={0.75}>
                {gatewayConfiguration.label && (
                    <FormLabel component='legend'>{gatewayConfiguration.label}</FormLabel>
                )}
                {gatewayConfiguration.tooltip && (
                    <Tooltip title={gatewayConfiguration.tooltip} placement='right-end' interactive>
                        <HelpOutline fontSize='small' color='action' />
                    </Tooltip>
                )}
            </Stack>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.helper'
                    defaultMessage='Map each local subscription plan to the corresponding gateway plan identifier.'
                />
            </Typography>
            {orderedApiTypes.length === 0 ? (
                <FormHelperText>
                    <FormattedMessage
                        id='GatewayEnvironments.PlanMapping.noCompatibleLocalPlans'
                        defaultMessage='No local subscription plans match the supported API types of this gateway.'
                    />
                </FormHelperText>
            ) : orderedApiTypes.map((apiType) => (
                <Box
                    key={apiType}
                    mb={2}
                    sx={{
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        overflow: 'hidden',
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Box
                        display='flex'
                        alignItems='center'
                        px={2}
                        py={1.25}
                        sx={{ backgroundColor: 'action.hover' }}
                    >
                        <Typography variant='subtitle2'>
                            {apiTypeLabels[apiType] || apiType}
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table size='small' sx={tableStyles}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{leftLabel}</TableCell>
                                    <TableCell>{rightLabel}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groupedValuesForDisplay[apiType].map((mappingValue) => (
                                    <TableRow key={`${apiType}.${mappingValue.id}`}>
                                        <TableCell component='th' scope='row'>
                                            <Typography variant='body2' fontWeight={500}>
                                                {mappingValue.label || mappingValue.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                id={`${gatewayConfiguration.name}.${mappingValue.id}`}
                                                margin='dense'
                                                name={mappingValue.id}
                                                fullWidth
                                                variant='outlined'
                                                value={getPlanMappingValue(mappingValue.id)}
                                                onChange={(event) => setAdditionalProperties(
                                                    `${PLAN_MAPPING_PROPERTY_PREFIX}${mappingValue.id}`,
                                                    event.target.value || undefined,
                                                )}
                                                disabled={isReadOnly}
                                                placeholder={mappingValue.label || mappingValue.id}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ))}
        </Box>
    );
}

GatewayPlanMapping.propTypes = {
    gatewayConfiguration: PropTypes.shape({
        name: PropTypes.string,
        label: PropTypes.string,
        tooltip: PropTypes.string,
        labels: PropTypes.shape({
            left: PropTypes.string,
            right: PropTypes.string,
        }),
        values: PropTypes.arrayOf(PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                id: PropTypes.string,
                label: PropTypes.string,
                apiType: PropTypes.string,
            }),
        ])),
    }).isRequired,
    additionalProperties: PropTypes.objectOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ])),
    setAdditionalProperties: PropTypes.func,
    isReadOnly: PropTypes.bool,
};

GatewayPlanMapping.defaultProps = {
    additionalProperties: {},
    setAdditionalProperties: () => {},
    isReadOnly: false,
};
