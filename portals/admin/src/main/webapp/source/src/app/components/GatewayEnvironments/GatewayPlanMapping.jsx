import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
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
        ...apiTypeOrder.filter((apiType) => groupedValues[apiType]?.length > 0),
        ...Object.keys(groupedValues).filter((apiType) => !apiTypeOrder.includes(apiType)),
    ];

    const getPlanMappingValue = (localPolicyId) => {
        return additionalProperties[`${PLAN_MAPPING_PROPERTY_PREFIX}${localPolicyId}`] || '';
    };

    return (
        <Box mt={1}>
            <Box display='flex' alignItems='center' mb={1}>
                {gatewayConfiguration.label && (
                    <FormLabel component='legend'>{gatewayConfiguration.label}</FormLabel>
                )}
                {gatewayConfiguration.tooltip && (
                    <Tooltip title={gatewayConfiguration.tooltip} placement='right-end' interactive>
                        <HelpOutline fontSize='small' sx={{ ml: 0.5 }} />
                    </Tooltip>
                )}
            </Box>
            {orderedApiTypes.length === 0 ? (
                <FormHelperText>
                    <FormattedMessage
                        id='GatewayEnvironments.PlanMapping.noCompatibleLocalPlans'
                        defaultMessage='No local subscription plans match the supported API types of this gateway.'
                    />
                </FormHelperText>
            ) : orderedApiTypes.map((apiType) => (
                <Box key={apiType} mb={2}>
                    <Box fontWeight={500} mb={1}>
                        {apiTypeLabels[apiType] || apiType}
                    </Box>
                    <Box
                        display='grid'
                        gridTemplateColumns='minmax(0, 1fr) minmax(0, 1fr)'
                        columnGap={2}
                        rowGap={1.5}
                    >
                        <Box fontWeight={500}>{leftLabel}</Box>
                        <Box fontWeight={500}>{rightLabel}</Box>
                        {groupedValues[apiType].map((mappingValue) => (
                            <React.Fragment key={mappingValue.id}>
                                <Box display='flex' alignItems='center' minHeight={56}>
                                    {mappingValue.label || mappingValue.id}
                                </Box>
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
                                />
                            </React.Fragment>
                        ))}
                    </Box>
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
