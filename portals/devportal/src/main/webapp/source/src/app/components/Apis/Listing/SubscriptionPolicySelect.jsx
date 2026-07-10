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
import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { FormattedMessage } from 'react-intl';
import { Typography, useTheme } from '@mui/material';
import { ScopeValidation, resourceMethods, resourcePaths } from '../../Shared/ScopeValidation';

const PREFIX = 'SubscriptionPolicySelectLegacy';

const classes = {
    root: `${PREFIX}-root`,
    buttonGap: `${PREFIX}-buttonGap`,
    select: `${PREFIX}-select`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`&.${classes.root}`]: {
        display: 'flex',
    },

    [`& .${classes.buttonGap}`]: {
        background: theme.palette.grey[300],
        marginLeft: 20,
        '& span span': {
            color: theme.palette.getContrastText(theme.palette.primary.main),
        },
    },

    [`& .${classes.select}`]: {
        width: 100,
    },
}));

/**
 * @class SubscriptionPolicySelectLegacy
 * @extends {React.Component}
 */
class SubscriptionPolicySelectLegacy extends React.Component {
    /**
     * Create instance of SubscriptionPolicySelectLegacy
     * @param {JSON} props Props pass from the parent.
     * @returns {void}
     */
    constructor(props) {
        super(props);
        this.state = {
            selectedPolicy: null,
        };
    }

    /**
     * Calls when component did mount.
     * @returns {void}
     */
    componentDidMount() {
        const { policies } = this.props;

        this.setState({ selectedPolicy: this.getGovernedPolicy() || policies[0] });
    }

    componentDidUpdate(prevProps) {
        const governedPolicy = this.getGovernedPolicy();
        const previousGovernedPolicy = this.getGovernedPolicy(prevProps);
        if (governedPolicy !== previousGovernedPolicy || this.props.policies !== prevProps.policies) {
            this.setState({ selectedPolicy: governedPolicy || this.props.policies[0] });
        }
    }

    getGovernedPolicy(props = this.props) {
        const tierConfig = props.formConfig?.subscription?.throttlingPolicy;
        const hidden = tierConfig?.hidden === true || tierConfig?.hidden === 'true';
        return hidden ? tierConfig?.defaultValue : null;
    }

    /**
     * renders method.
     * @returns {JSX} Policy selection component.
     */
    render() {
        const {
            policies, apiId, handleSubscribe, applicationId,
        } = this.props;
        const { selectedPolicy } = this.state;
        const governedPolicy = this.getGovernedPolicy();
        const effectivePolicy = governedPolicy || selectedPolicy;

        return (
            policies
            && (
                <Root className={classes.root}>
                    {governedPolicy ? (
                        <Typography variant='body2' sx={{ minWidth: 150, alignSelf: 'center' }}>
                            <FormattedMessage
                                id='Apis.Listing.SubscriptionPolicySelect.governed.policy'
                                defaultMessage='Business Plan: {policy}'
                                values={{ policy: governedPolicy }}
                            />
                        </Typography>
                    ) : (
                        <Autocomplete
                            id='policy-select'
                            disableClearable
                            options={policies}
                            value={selectedPolicy}
                            onChange={(e, value) => {
                                this.setState({ selectedPolicy: value });
                            }}
                            style={{ width: 150 }}
                            renderInput={(params) => (<TextField size='small' variant='standard' {...params} />)}
                            renderOption={(props, policy) => (
                                <MenuItem
                                    {...props}
                                    value={policy}
                                    key={policy}
                                    id={'policy-select-' + policy}
                                >
                                    {policy}
                                </MenuItem>
                            )}
                        />
                    )}
                    <ScopeValidation
                        resourcePath={resourcePaths.SUBSCRIPTIONS}
                        resourceMethod={resourceMethods.POST}
                    >
                        <Button
                            variant='contained'
                            size='small'
                            color='grey'
                            className={classes.buttonGap}
                            onClick={() => {
                                handleSubscribe(applicationId, apiId, effectivePolicy);
                            }}
                            id={'policy-subscribe-btn-' + apiId}
                        >
                            <FormattedMessage
                                defaultMessage='Subscribe'
                                id='Apis.Listing.SubscriptionPolicySelect.subscribe'
                            />
                        </Button>
                    </ScopeValidation>
                </Root>
            )
        );
    }
}

SubscriptionPolicySelectLegacy.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    policies: PropTypes.shape({}).isRequired,
    apiId: PropTypes.string.isRequired,
    handleSubscribe: PropTypes.func.isRequired,
    applicationId: PropTypes.string.isRequired,
    formConfig: PropTypes.shape({}),
};

SubscriptionPolicySelectLegacy.defaultProps = {
    formConfig: null,
};

function SubscriptionPolicySelect(props) {
    const {
        key, policies, apiId, handleSubscribe, applicationId, formConfig,
    } = props;
    const theme = useTheme();
    return (
        <SubscriptionPolicySelectLegacy
            key={key}
            policies={policies}
            apiId={apiId}
            handleSubscribe={handleSubscribe}
            applicationId={applicationId}
            formConfig={formConfig}
            theme={theme}
        />
    );
}

export default (SubscriptionPolicySelect);
