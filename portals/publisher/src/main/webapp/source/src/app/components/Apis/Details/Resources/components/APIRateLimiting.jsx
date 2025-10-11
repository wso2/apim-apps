/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import CircularProgress from '@mui/material/CircularProgress';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { FormattedMessage, useIntl } from 'react-intl';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { Progress } from 'AppComponents/Shared';

const PREFIX = 'APIRateLimiting';

const classes = {
    focusLabel: `${PREFIX}-focusLabel`
};

const StyledPaper = styled(Paper)((
    {
        theme
    }
) => ({
    [`& .${classes.focusLabel}`]: {
        boxShadow: '1px 1px 1px 1px #efefef',
        paddingRight: theme.spacing(1),
    }
}));

const RateLimitingLevels = {
    API: 'api',
    RESOURCE: 'resource',
};

/**
 *
 * Handles the resource level and API level throttling UI switch
 * @export
 * @param {*} props
 * @returns
 */
function APIRateLimiting(props) {
    const {
        api, updateAPI, operationRateLimits, onChange, value: currentApiThrottlingPolicy, isAPIProduct,
        setFocusOperationLevel, focusOperationLevel,
    } = props;
    const intl = useIntl();
    const { data: publisherSettings, isLoading } = usePublisherSettings();
    const [apiThrottlingPolicy, setApiThrottlingPolicy] = useState(currentApiThrottlingPolicy);
    const [isSaving, setIsSaving] = useState(false);
    const [componentValidator, setComponentValidator] = useState([]);
    const [isResourceLevel, setIsResourceLevel] = useState(true);
    const [rateLimitingLevel, setRateLimitingLevel] = useState(RateLimitingLevels.RESOURCE);
    const [apiFromContext] = useAPI();

    const getAllowedScopes = () => {
        if (apiFromContext.apiType && apiFromContext.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_manage', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_create'];
        }
    };
    const isAccessRestricted = () => isRestricted(getAllowedScopes(), apiFromContext);

    // Following effect is used to handle the controlled component case, If user provide onChange handler to
    // control this component, Then we accept the props as the valid input and update the current state value from props
    useEffect(() => {
        if (onChange) {
            if (currentApiThrottlingPolicy === '' && apiFromContext.apiThrottlingPolicy) {
                setApiThrottlingPolicy(apiFromContext.apiThrottlingPolicy);
            } else {
                setApiThrottlingPolicy(currentApiThrottlingPolicy);
            }
        }
    }, [onChange, currentApiThrottlingPolicy]); // Do not expect to change the onChange during the runtime

    useEffect(() => {
        const isResource = apiThrottlingPolicy === null;
        setIsResourceLevel(isResource);
        setRateLimitingLevel(isResource ? RateLimitingLevels.RESOURCE : RateLimitingLevels.API);
    }, [apiThrottlingPolicy, isLoading]);


    useEffect(() => {
        if (!isLoading) {
            const validator = publisherSettings.gatewayFeatureCatalog
                .gatewayFeatures[api.gatewayType ? api.gatewayType : 'wso2/synapse'].resources
            setComponentValidator(validator);
        }
    }, [isLoading]);

    /**
     *
     *
     * @param {*} event
     */
    function updateRateLimitingPolicy(event) {
        // If the selected option is resource, we set the api level rate limiting to null
        const userSelection = event.target.value === RateLimitingLevels.RESOURCE
            ? null : '';
        if (onChange) {
            // Assumed controlled component
            onChange(userSelection);
        } else {
            setApiThrottlingPolicy(userSelection);
        }
        if (event.target.value === RateLimitingLevels.RESOURCE && setFocusOperationLevel) {
            setFocusOperationLevel(false);
        }
    }
    /**
     *
     *
     */
    function saveChanges() {
        setIsSaving(true);
        updateAPI({ apiThrottlingPolicy }).finally(() => setIsSaving(false));
    }

    /**
     *
     *
     */
    function resetChanges() {
        setApiThrottlingPolicy(currentApiThrottlingPolicy);
    }

    let operationRateLimitMessage = (
        <Typography variant='body1' gutterBottom>
            <FormattedMessage
                id='Apis.Details.Rate.Limiting.operations.message.body'
                defaultMessage='You may change the rate limiting policies per operation'
            />
            <Typography variant='caption' display='block' gutterBottom>
                <FormattedMessage
                    id='Apis.Details.Rate.Limiting.operations.message.caption'
                    defaultMessage='Expand an operation below to select a rate limiting policy for an operation'
                />
            </Typography>
        </Typography>
    );
    if (isAPIProduct) {
        operationRateLimitMessage = (
            <Typography variant='body1' gutterBottom>
                <FormattedMessage
                    id='Apis.Details.Rate.Limiting.operations.api.product.message.body'
                    defaultMessage='Rate limiting polices of the source operation will be applied'
                />
                <Typography variant='caption' display='block' gutterBottom>
                    <FormattedMessage
                        id='Apis.Details.Rate.Limiting.operations.api.product.message.caption'
                        defaultMessage={'Rate limiting policy of an individual operation will be'
                            + ' govern by the policy specified in the source operation'}
                    />
                </Typography>
            </Typography>
        );
    }
    if (isLoading) {
        return <Progress per={80} message='Loading app settings ...' />;
    }
    return (
        ["apiLevelRateLimiting", "operationLevelRateLimiting"]
            .some(type => componentValidator.includes(type)) &&
            <StyledPaper>
                <Grid container direction='row' justifyContent='flex-start' alignItems='flex-start'>
                    <Grid item md={12} xs={12} sx={{ p: 1 }}>
                        <Box>
                            <Typography variant='subtitle1' component='h3' gutterBottom>
                                <FormattedMessage
                                    id='Apis.Details.Rate.Limiting.operations.configuration'
                                    defaultMessage='Operations Configuration'
                                />
                                <Tooltip
                                    fontSize='small'
                                    title={intl.formatMessage({
                                        id: 'Apis.Details.Rate.Limiting.operations.configuration.tooltip',
                                        defaultMessage: 'Configurations that affects on all the resources',
                                    })}
                                    placement='right-end'
                                    interactive
                                >
                                    <IconButton aria-label='Operations Configuration help text' size='large'>
                                        <HelpOutline />
                                    </IconButton>
                                </Tooltip>
                            </Typography>
                        </Box>
                        <Divider variant='middle' />
                    </Grid>
                    <Grid item md={6} xs={12} sx={{ p: 1 }}>
                        <FormControl component='fieldset' sx={{ px: 3 }}>
                            <FormLabel component='legend'>
                                <FormattedMessage
                                    id='Apis.Details.Resources.components.APIRateLimiting.rate.limiting.level'
                                    defaultMessage='Rate limiting level'
                                />
                            </FormLabel>
                            <RadioGroup
                                aria-label='Apply rate limiting in'
                                value={rateLimitingLevel}
                                onChange={updateRateLimitingPolicy}
                                row
                            >
                                {componentValidator.includes('apiLevelRateLimiting') &&
                                    <FormControlLabel
                                        value={RateLimitingLevels.API}
                                        control={(
                                            <Radio
                                                color='primary'
                                                disabled={isAccessRestricted()}
                                            />
                                        )}
                                        label={intl.formatMessage({
                                            id: 'Apis.Details.Rate.Limiting.rate.limiting.level.api.level',
                                            defaultMessage: 'API Level',
                                        })}
                                        labelPlacement='end'
                                        id='api-rate-limiting-api-level'
                                    />
                                }
                                {componentValidator.includes('operationLevelRateLimiting') &&
                                    <FormControlLabel
                                        value={RateLimitingLevels.RESOURCE}
                                        control={(
                                            <Radio
                                                color='primary'
                                                disabled={isAccessRestricted()}
                                            />
                                        )}
                                        className={focusOperationLevel && classes.focusLabel}
                                        label={intl.formatMessage({
                                            id: 'Apis.Details.Rate.Limiting.rate.limiting.level.operation.level',
                                            defaultMessage: 'Operation Level',
                                        })}
                                        labelPlacement='end'
                                        id='api-rate-limiting-operation-level'
                                    />
                                }
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item md={6} xs={12} sx={{ p: 1 }}>
                        <Box minHeight={70} pl={10} sx={{ borderLeft: '1px solid rgba(0, 0, 0, 0.2)' }}>
                            {isResourceLevel ? (
                                operationRateLimitMessage
                            ) : (
                                <TextField
                                    disabled={isAccessRestricted()}
                                    id='operation_throttling_policy'
                                    select
                                    label={intl.formatMessage({
                                        id: 'Apis.Details.Rate.Limiting.rate.limiting.policies',
                                        defaultMessage: 'Rate limiting policies',
                                    })}
                                    value={apiThrottlingPolicy}
                                    onChange={({ target: { value } }) => (
                                        onChange ? onChange(value) : setApiThrottlingPolicy(value))}
                                    helperText={intl.formatMessage({
                                        id: 'Apis.Details.Rate.Limiting.rate.limiting.policies.helper.text',
                                        defaultMessage: 'Selected rate limiting policy will be applied to whole API',
                                    })}
                                    margin='dense'
                                    variant='outlined'
                                >
                                    {operationRateLimits.map((rateLimit) => (
                                        <MenuItem
                                            key={rateLimit.name}
                                            value={rateLimit.name}
                                            id={'api-rate-limiting-api-level-' + rateLimit.name}
                                        >
                                            {rateLimit.displayName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </Box>
                    </Grid>
                    {/* If onChange handler is provided we assume that component is getting controlled by its parent
                    so that, hide the save cancel action */}
                    {!onChange && (
                        <>
                            <Grid item md={12}>
                                <Divider />
                            </Grid>
                            <Grid item>
                                <Box ml={1}>
                                    <Button
                                        onClick={saveChanges}
                                        disabled={false}
                                        variant='outlined'
                                        size='small'
                                        color='primary'
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Rate.Limiting.operations.save.btn'
                                            defaultMessage='Save'
                                        />
                                        {isSaving && <CircularProgress size={24} />}
                                    </Button>
                                    <Box display='inline' ml={1}>
                                        <Button size='small' onClick={resetChanges}>
                                            <FormattedMessage
                                                id='Apis.Details.Rate.Limiting.operations.reset.btn'
                                                defaultMessage='Reset'
                                            />
                                        </Button>
                                    </Box>
                                </Box>
                            </Grid>
                        </>
                    )}
                </Grid>
            </StyledPaper>
    );
}
APIRateLimiting.defaultProps = {
    onChange: null,
    isAPIProduct: false,
};
APIRateLimiting.propTypes = {
    updateAPI: PropTypes.func.isRequired,
    onChange: PropTypes.oneOf([null, PropTypes.func]),
    operationRateLimits: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    disabledAction: PropTypes.shape({}).isRequired,
    value: PropTypes.string.isRequired,
    isAPIProduct: PropTypes.bool,
};

export default React.memo(APIRateLimiting);
