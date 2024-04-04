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
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import ListItemText from '@mui/material/ListItemText';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';
import FormHelperText from '@mui/material/FormHelperText';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

const PREFIX = 'SubscribeToApi';

const classes = {
    titleBar: `${PREFIX}-titleBar`,
    buttonLeft: `${PREFIX}-buttonLeft`,
    buttonRight: `${PREFIX}-buttonRight`,
    title: `${PREFIX}-title`,
    buttonsWrapper: `${PREFIX}-buttonsWrapper`,
    legend: `${PREFIX}-legend`,
    inputText: `${PREFIX}-inputText`,
    buttonRightLink: `${PREFIX}-buttonRightLink`,
    FormControl: `${PREFIX}-FormControl`,
    fullWidth: `${PREFIX}-fullWidth`,
    FormControlOdd: `${PREFIX}-FormControlOdd`,
    quotaHelp: `${PREFIX}-quotaHelp`,
    subscribeRoot: `${PREFIX}-subscribeRoot`,
    subscribeRootSmall: `${PREFIX}-subscribeRootSmall`,
    smallDisplay: `${PREFIX}-smallDisplay`,
    smallDisplayFix: `${PREFIX}-smallDisplayFix`,
    selectMenuRoot: `${PREFIX}-selectMenuRoot`,
    appDropDown: `${PREFIX}-appDropDown`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.titleBar}`]: {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderColor: theme.palette.text.secondary,
        marginBottom: 20,
    },

    [`& .${classes.buttonLeft}`]: {
        alignSelf: 'flex-start',
        display: 'flex',
    },

    [`& .${classes.buttonRight}`]: {
        alignSelf: 'flex-end',
        display: 'flex',
        marginLeft: 20,
    },

    [`& .${classes.title}`]: {
        display: 'inline-block',
        marginLeft: 20,
    },

    [`& .${classes.buttonsWrapper}`]: {
        marginTop: 40,
    },

    [`& .${classes.legend}`]: {
        marginBottom: 0,
        borderBottomStyle: 'none',
        marginTop: 20,
        fontSize: 12,
    },

    [`& .${classes.inputText}`]: {
        marginTop: 20,
    },

    [`& .${classes.buttonRightLink}`]: {
        textDecoration: 'none',
    },

    [`& .${classes.FormControl}`]: {
        padding: theme.spacing(2),
        width: '100%',
    },

    [`& .${classes.fullWidth}`]: {
        '& .MuiFormControl-root':{
            width: '100%',
        }
    },

    [`& .${classes.FormControlOdd}`]: {
        backgroundColor: theme.palette.background.paper,
    },

    [`& .${classes.quotaHelp}`]: {
        position: 'relative',
    },

    [`&.${classes.subscribeRoot}`]: {
        paddingLeft: theme.spacing(2),
    },

    [`&.${classes.subscribeRootSmall}`]: {
        marginLeft: theme.spacing(-4),
    },

    [`& .${classes.smallDisplay}`]: {
        width: 240,
        '& .MuiInput-formControl': {
            marginTop: 0,
        },
    },

    [`& .${classes.smallDisplayFix}`]: {
        '& .MuiSelect-selectMenu': {
            padding: 0,
        },
    },

    [`& .${classes.selectMenuRoot}`]: {
        margin: 0,
        padding: 0,
    },

    [`& .${classes.appDropDown}`]: {
        color: theme.palette.getContrastText(theme.palette.background.paper),
        '&:hover': {
            backgroundColor: 'unset',
        },
    }
}));

const subscribeToApi = (props) => {
    const [appSelected, setAppSelected] = useState('');
    const [policySelected, setPolicySelected] = useState({tierName:''});
    const [applicationsList, setApplicationsList] = useState([]);
    const {
        throttlingPolicyList,
        applicationsAvailable,
        subscriptionRequest,
        updateSubscriptionRequest,
        renderSmall,
    } = props;

    useEffect(() => {
        if (throttlingPolicyList && throttlingPolicyList[0]) {
            setPolicySelected(throttlingPolicyList[0]);
        }
    }, [throttlingPolicyList]);

    useEffect(() => {
        if (applicationsAvailable && applicationsAvailable[0]) {
            setApplicationsList(applicationsAvailable);
            setAppSelected(applicationsAvailable[0]);
            const newRequest = { ...subscriptionRequest };
            newRequest.applicationId = applicationsAvailable[0].value;
        }
    }, [applicationsAvailable]);

    /**
     * This method is used to handle the updating of subscription
     * request object and selected fields.
     * @param {*} field field that should be updated in subscription request
     * @param {*} event event fired
     */
    const handleChange = (field, event,value = null) => {
        const newRequest = { ...subscriptionRequest };
        const { target } = event;
        switch (field) {
            case 'application':
                newRequest.applicationId = value.value;
                setAppSelected(value);
                break;
            case 'throttlingPolicy':
                newRequest.throttlingPolicy = value.tierName;
                setPolicySelected(value);
                break;
            default:
                break;
        }
        updateSubscriptionRequest(newRequest);
    };

    return (
        <StyledGrid container className={classNames(classes.subscribeRoot, { [classes.subscribeRootSmall]: renderSmall })}>
            <Grid item xs={12} md={renderSmall ? 12 : 6}>
                {appSelected && (
                    <FormControl
                        variant="standard"
                        className={classNames(classes.FormControl, { [classes.smallDisplay]: renderSmall })}>
                        <InputLabel shrink for='application-subscribe' className={classes.quotaHelp}>
                            <FormattedMessage
                                id='Shared.AppsAndKeys.SubscribeToApi.application'
                                defaultMessage='Application'
                            />
                        </InputLabel>
                        <Autocomplete
                           id="application-subscribe"
                           aria-describedby='application-helper-text'
                           options={applicationsList}
                           disableClearable
                           value={(applicationsList.length !== 0 && appSelected === '') ?
                                applicationsList[0] : appSelected}
                           onChange={(e, value) => handleChange('application', e, value)}
                           getOptionLabel={(option) => option.label}
                           classes={{root:classes.fullWidth}}
                           renderInput={(params) => <TextField variant="standard" {...params} />}
                         />
                        <FormHelperText id='application-helper-text'>
                            <FormattedMessage
                                id='Shared.AppsAndKeys.SubscribeToApi.select.an.application.to.subscribe'
                                defaultMessage='Select an Application to subscribe'
                            />
                        </FormHelperText>
                    </FormControl>
                )}
                {throttlingPolicyList && (
                    <FormControl
                        variant="standard"
                        className={classNames(classes.FormControl, classes.smallDisplayFix, {
                            [classes.smallDisplay]: renderSmall,
                            [classes.FormControlOdd]: !renderSmall,
                        })}
                    >
                        <InputLabel shrink htmlFor='policy-label-placeholder' className={classes.quotaHelp}>
                            <FormattedMessage
                                id='Shared.AppsAndKeys.SubscribeToApi.business.plan'
                                defaultMessage='Business Plan'
                            />
                        </InputLabel>
                        <Autocomplete
                            id='application-policy'
                            aria-describedby='policies-helper-text'
                            options={throttlingPolicyList}
                            disableClearable
                            value={policySelected}
                            getOptionLabel={(option) => option.tierName}
                            getOptionSelected={(option, value) => option.tierName === value.tierName}
                            onChange={(e, value) => handleChange('throttlingPolicy', e, value)}
                            classes={{ root: classes.fullWidth }}
                            renderInput={(params) => <TextField variant="standard" {...params} />}
                            groupBy={(option) => option.tierPlan === 'COMMERCIAL'  ? 'Commercial' : 'Free'}
                            renderOption={(props, policy) => (
                                <MenuItem {...props} value={policy.tierName} key={policy.tierName} className={classes.appDropDown}>
                                    {policy.tierPlan === 'COMMERCIAL' ? (
                                        <React.Fragment>
                                            <ListItemText
                                                classes={{ root: classes.selectMenuRoot }}
                                                primary={policy.tierName}
                                                secondary={
                                                    policy.monetizationAttributes.pricePerRequest ? (
                                                        <Typography>
                                                            {policy.monetizationAttributes.pricePerRequest}{' '}
                                                            {policy.monetizationAttributes.currencyType}
                                                            {' per Request'}
                                                        </Typography>
                                                    ) : (
                                                        <Typography>
                                                            {policy.monetizationAttributes.fixedPrice}{' '}
                                                            {policy.monetizationAttributes.currencyType}
                                                            {' per '}
                                                            {policy.monetizationAttributes.billingCycle}
                                                        </Typography>
                                                    )
                                                }
                                            />
                                        </React.Fragment>
                                    ) : (
                                        <ListItemText primary={policy.tierName} />
                                    )}
                                </MenuItem>
                            )}
                        />
                    </FormControl>
                )}
            </Grid>
        </StyledGrid>
    );
};
subscribeToApi.propTypes = {
    classes: PropTypes.shape({
        FormControl: PropTypes.string,
        quotaHelp: PropTypes.string,
        selectEmpty: PropTypes.string,
        FormControlOdd: PropTypes.string,
        subscribeRoot: PropTypes.string,
        subscribeRootSmall: PropTypes.string,
        smallDisplayFix: PropTypes.string,
        selectMenuRoot: PropTypes.string,
        smallDisplay: PropTypes.string,
    }).isRequired,
    applicationsAvailable: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
    })).isRequired,
    throttlingPolicyList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    subscriptionRequest: PropTypes.shape({}).isRequired,
    updateSubscriptionRequest: PropTypes.func.isRequired,
    renderSmall: PropTypes.bool,
};
subscribeToApi.defaultProps = {
    renderSmall: false,
};

export default (subscribeToApi);
