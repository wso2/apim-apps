import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import API from 'AppData/api';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ClearIcon from '@mui/icons-material/Clear';
import Alert from 'AppComponents/Shared/Alert';
import { FormattedMessage } from 'react-intl';

const PLAN_MAPPING_PROPERTY_PREFIX = 'plan_mapping.';
const PLAN_MAPPING_TABLE_MAX_HEIGHT = 400;
const NON_MAPPABLE_SUBSCRIPTION_POLICIES = [
    'Unauthenticated',
    'DefaultSubscriptionless',
    'AsyncDefaultSubscriptionless',
];
const PLAN_MAPPING_API_TYPES = {
    EVENTCOUNTLIMIT: 'async',
    AIAPIQUOTALIMIT: 'ai-api',
};

const resolveSubscriptionPolicyApiType = (policy) => {
    const quotaType = String(policy?.defaultLimit?.type || '').toUpperCase();
    return PLAN_MAPPING_API_TYPES[quotaType] || 'rest';
};

const buildPlanMappingValues = (subscriptionPolicies, supportedApiTypes) => {
    const supportedApiTypeSet = new Set(supportedApiTypes || []);
    return (subscriptionPolicies || []).reduce((values, policy) => {
        const policyName = policy?.policyName || policy?.name || policy?.displayName;
        if (!policyName || NON_MAPPABLE_SUBSCRIPTION_POLICIES.includes(policyName)) {
            return values;
        }
        const apiType = resolveSubscriptionPolicyApiType(policy);
        if (!supportedApiTypeSet.has(apiType)) {
            return values;
        }
        return [
            ...values,
            {
                policyName,
                label: policy.displayName || policyName,
                apiType,
            },
        ];
    }, []);
};

/**
 * Gateway plan mapping configuration.
 * @param {Object} props component props.
 * @returns {JSX.Element} rendered gateway plan mapping section.
 */
export default function GatewayPlanMapping(props) {
    const {
        gatewayConfiguration,
        supportedApiTypes = [],
        additionalProperties = {},
        setAdditionalProperties = () => {},
        planMappingErrors = {},
    } = props;
    const restApi = useMemo(() => new API(), []);
    const [subscriptionPolicies, setSubscriptionPolicies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [selectedPolicyName, setSelectedPolicyName] = useState('');
    const [newRemotePlanName, setNewRemotePlanName] = useState('');
    const [validationError, setValidationError] = useState({});

    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        setLoadError('');
        restApi.getSubscritionPolicyList()
            .then((result) => {
                if (isActive) {
                    setSubscriptionPolicies(result.body?.list || []);
                }
            })
            .catch((error) => {
                if (isActive) {
                    setSubscriptionPolicies([]);
                    setLoadError(error?.response?.body?.description || error.message);
                }
            })
            .finally(() => {
                if (isActive) {
                    setIsLoading(false);
                }
            });
        return () => {
            isActive = false;
        };
    }, [restApi]);

    const leftLabel = gatewayConfiguration?.labels?.left || 'Key';
    const rightLabel = gatewayConfiguration?.labels?.right || gatewayConfiguration.label || 'Value';
    const values = useMemo(() => {
        const generatedValues = buildPlanMappingValues(subscriptionPolicies, supportedApiTypes);
        if (generatedValues.length > 0) {
            return generatedValues;
        }
        return Array.isArray(gatewayConfiguration.values) ? gatewayConfiguration.values : [];
    }, [gatewayConfiguration.values, subscriptionPolicies, supportedApiTypes]);
    const compatibleValues = useMemo(() => {
        return values.filter((mappingValue) => (
            mappingValue && typeof mappingValue === 'object' && mappingValue.policyName
        ));
    }, [values]);

    const getPlanMappingError = (localPolicyName) => {
        return planMappingErrors[`${PLAN_MAPPING_PROPERTY_PREFIX}${localPolicyName}`] || '';
    };
    const getPlanMappingPropertyKey = (localPolicyName) => `${PLAN_MAPPING_PROPERTY_PREFIX}${localPolicyName}`;
    const mappedValues = compatibleValues.filter((mappingValue) => {
        const propertyKey = getPlanMappingPropertyKey(mappingValue.policyName);
        return Boolean((additionalProperties[propertyKey] || '').trim());
    });
    const availableValues = compatibleValues.filter((mappingValue) => {
        const propertyKey = getPlanMappingPropertyKey(mappingValue.policyName);
        return !(additionalProperties[propertyKey] || '').trim();
    });

    const clearValues = () => {
        setSelectedPolicyName('');
        setNewRemotePlanName('');
        setValidationError({});
    };
    const isAddDisabled = availableValues.length === 0 || !selectedPolicyName || !newRemotePlanName.trim();
    const validateNewMapping = () => {
        const nextValidationError = {};
        if (!selectedPolicyName) {
            nextValidationError.selectedPolicyName = (
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.localPolicyRequired'
                    defaultMessage='Select a local subscription policy.'
                />
            );
        }
        if (!newRemotePlanName.trim()) {
            nextValidationError.newRemotePlanName = (
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.remotePlanRequired'
                    defaultMessage='Enter a remote plan name.'
                />
            );
        }
        if (selectedPolicyName
            && !availableValues.some((mappingValue) => mappingValue.policyName === selectedPolicyName)) {
            nextValidationError.selectedPolicyName = (
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.alreadyExists'
                    defaultMessage='Plan Mapping already exists.'
                />
            );
        }
        setValidationError(nextValidationError);
        return Object.keys(nextValidationError).length === 0;
    };
    const handleAddToList = () => {
        if (!validateNewMapping()) {
            Alert.error(
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.addValidationError'
                    defaultMessage='Provide a local subscription policy and remote plan name.'
                />,
            );
            return;
        }
        setAdditionalProperties(getPlanMappingPropertyKey(selectedPolicyName), newRemotePlanName.trim());
        clearValues();
    };
    const onDelete = (localPolicyName) => {
        setAdditionalProperties(getPlanMappingPropertyKey(localPolicyName), undefined);
    };
    let planMappingContent;
    if (isLoading) {
        planMappingContent = (
            <Stack direction='row' spacing={1} alignItems='center'>
                <CircularProgress size={16} />
                <FormHelperText>
                    <FormattedMessage
                        id='GatewayEnvironments.PlanMapping.loadingPolicies'
                        defaultMessage='Loading local subscription plans...'
                    />
                </FormHelperText>
            </Stack>
        );
    } else if (loadError) {
        planMappingContent = <FormHelperText error>{loadError}</FormHelperText>;
    } else if (compatibleValues.length === 0) {
        planMappingContent = (
            <FormHelperText>
                <FormattedMessage
                    id='GatewayEnvironments.PlanMapping.noCompatibleLocalPlans'
                    defaultMessage='No local subscription plans match the supported API types of this gateway.'
                />
            </FormHelperText>
        );
    } else {
        planMappingContent = (
            <TableContainer
                sx={{
                    maxHeight: PLAN_MAPPING_TABLE_MAX_HEIGHT,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >
                <Table
                    sx={{
                        width: '100%',
                        '& tr td, & tr th': {
                            padding: 0.5,
                            margin: 0,
                        },
                    }}
                    aria-label='gateway plan mapping table'
                >
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '45%' }}>{leftLabel}</TableCell>
                            <TableCell align='left' sx={{ width: '55%' }}>{rightLabel}</TableCell>
                            <TableCell align='right' sx={{ width: 50 }}>
                                <FormattedMessage
                                    id='GatewayEnvironments.PlanMapping.action'
                                    defaultMessage='Action'
                                />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow key='Add new'>
                            <TableCell component='th' scope='row' sx={{ width: '45%' }}>
                                <TextField
                                    id='planMappingLocalPolicy'
                                    select
                                    label={leftLabel}
                                    variant='outlined'
                                    margin='dense'
                                    value={selectedPolicyName}
                                    onChange={(event) => {
                                        setSelectedPolicyName(event.target.value);
                                        setValidationError((currentErrors) => ({
                                            ...currentErrors,
                                            selectedPolicyName: '',
                                        }));
                                    }}
                                    error={Boolean(validationError.selectedPolicyName)}
                                    helperText={validationError.selectedPolicyName || undefined}
                                    fullWidth
                                >
                                    {availableValues.length === 0 && (
                                        <MenuItem value='' disabled>
                                            <FormattedMessage
                                                id='GatewayEnvironments.PlanMapping.noPoliciesLeft'
                                                defaultMessage='No local subscription policies left to map'
                                            />
                                        </MenuItem>
                                    )}
                                    {availableValues.map((mappingValue) => (
                                        <MenuItem key={mappingValue.policyName} value={mappingValue.policyName}>
                                            {mappingValue.label || mappingValue.policyName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </TableCell>
                            <TableCell align='right' sx={{ width: '55%' }}>
                                <TextField
                                    id='planMappingRemotePlan'
                                    label={rightLabel}
                                    value={newRemotePlanName}
                                    onChange={(event) => {
                                        setNewRemotePlanName(event.target.value);
                                        setValidationError((currentErrors) => ({
                                            ...currentErrors,
                                            newRemotePlanName: '',
                                        }));
                                    }}
                                    error={Boolean(validationError.newRemotePlanName)}
                                    helperText={validationError.newRemotePlanName || undefined}
                                    variant='outlined'
                                    margin='dense'
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell>
                                <Box display='flex'>
                                    <IconButton
                                        id='addPlanMapping'
                                        aria-label='Add'
                                        onClick={handleAddToList}
                                        disabled={isAddDisabled}
                                        size='large'
                                    >
                                        <AddCircleIcon />
                                    </IconButton>
                                    <IconButton
                                        id='clearPlanMapping'
                                        aria-label='Clear'
                                        onClick={clearValues}
                                        size='large'
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>
                        {mappedValues.map((mappingValue) => {
                            const propertyKey = getPlanMappingPropertyKey(mappingValue.policyName);
                            const displayValue = (additionalProperties[propertyKey] || '').trim();
                            return (
                                <TableRow key={mappingValue.policyName}>
                                    <TableCell component='th' scope='row' sx={{ width: '45%' }}>
                                        <Typography
                                            variant='body1'
                                            gutterBottom
                                            id={`gateway.plan.mapping.local.policy.${mappingValue.policyName}`}
                                        >
                                            {mappingValue.label || mappingValue.policyName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align='right' sx={{ width: '55%' }}>
                                        <Typography
                                            variant='body1'
                                            gutterBottom
                                            id={`gateway.plan.mapping.remote.value.${mappingValue.policyName}`}
                                        >
                                            {displayValue}
                                        </Typography>
                                        {getPlanMappingError(mappingValue.policyName) && (
                                            <FormHelperText error sx={{ textAlign: 'right' }}>
                                                {getPlanMappingError(mappingValue.policyName)}
                                            </FormHelperText>
                                        )}
                                    </TableCell>
                                    <TableCell align='right'>
                                        <IconButton
                                            id='deletePlanMapping'
                                            aria-label='Remove'
                                            onClick={() => { onDelete(mappingValue.policyName); }}
                                            size='large'
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <Box mt={2}>
            <Stack direction='row' spacing={1} alignItems='center' mb={0.75}>
                {gatewayConfiguration.label && (
                    <FormLabel component='legend'>{gatewayConfiguration.label}</FormLabel>
                )}
            </Stack>
            {gatewayConfiguration.tooltip && (
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    {gatewayConfiguration.tooltip}
                </Typography>
            )}
            {planMappingContent}
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
    supportedApiTypes: PropTypes.arrayOf(PropTypes.string),
    additionalProperties: PropTypes.objectOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ])),
    setAdditionalProperties: PropTypes.func,
    planMappingErrors: PropTypes.objectOf(PropTypes.string),
};

GatewayPlanMapping.defaultProps = {
    supportedApiTypes: [],
    additionalProperties: {},
    setAdditionalProperties: () => {},
    planMappingErrors: {},
};
