import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Button,
    Divider,
    TextField,
    CircularProgress,
    Box,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Select,
} from '@material-ui/core';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from 'AppComponents/Shared/MuiAlert';
import Policies from '../../LifeCycle/Policies';

const useStyles = makeStyles(theme => ({
    titleCta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatar: {
        width: theme.spacing(14),
        height: theme.spacing(15),
    },
}));

const General = () => {
    const intl = useIntl();
    const classes = useStyles();
    const [saving, setSaving] = useState(false);
    const policySpec = {
        "category": "Mediation",
        "name": "add-request-header",
        "displayName": "Add Header",
        "description": "With this policy, user can add a new header to the request",
        "attributes": [
            {
                "name": "headerName",
                "displayName": "Header Name",
                "description": "Name of the header to be added",
                "validationRegex": "^([a-zA-Z_$][a-zA-Z\\d_$]*)$",
                "type": "String",
                "required": true
            },
            {
                "name": "headerValue",
                "displayName": "Header Value",
                "description": "Value of the header",
                "validationRegex": "^([a-zA-Z_$][a-zA-Z\\d_$]*)$",
                "type": "String",
                "required": true
            },
            {
                "name": "includeQueryParameters",
                "displayName": "Include Query Parameters?",
                "type": "Boolean",
            },
            {
                "name": "httpMethod",
                "displayName": "HTTP Method",
                "values": ["GET", "POST"],
                "type": "Enum",
                "required": true
            },
            {
                "name": "callInterceptService",
                "displayName": "Call Intercept Service",
                "type": "Map",
                "required": true
            }
        ],
        "applicableFlows": [
            "request",
            "response",
            "fault"
        ],
        "supportedGateways": [
            "Synapse",
            "CC"
        ],
        "supportedApiTypes": [
            "REST",
            "GRAPHQL",
            "Streaming"
        ],
        "multipleAllowed": true
    };
    // const policies =  [
    //     {
    //         "policyName": "addQueryParams",
    //         "parameters": {
    //             "paramKey": "cheese",
    //             "paramValue": "mozeralla"
    //         }
    //     },
    //     {
    //         "policyName": "setHeader",
    //         "parameters": {
    //             "headerName": "Pizza Header",
    //             "headerValue": "Double chicken;afsafa;asf-asasf"
    //         }
    //     }
    // ];
    const policy = {
        "policyName": "setHeader",
        "parameters": {
            "headerName": "Pizza Header",
            "headerValue": "Double chicken;afsafa;asf-asasf",
            "includeQueryParameters": true,
            "httpMethod": "GET",
        }
    };
    const initState = {};
    policySpec.attributes.forEach(attr => { initState[attr.name] = null });
    const [state, setState] = useState(initState);

    const onInputChange = (event, specType) => {
        if (specType === 'Boolean') {
            setState({ ...state, [event.target.name]: event.target.checked });
        } else if (specType === 'String' || specType === 'Enum') {
            setState({ ...state, [event.target.name]: event.target.value });
        }
    }

    const getValueOfPolicyParam = (policyParamName) => {
        return policy.parameters[policyParamName];
    }

    const submitForm = async (event) => {
        event.preventDefault();
        setSaving(true);
        const updateCandidates = {};
        Object.keys(state).forEach((key) => {
            const value = state[key];
            if (value === null && getValueOfPolicyParam(key) && getValueOfPolicyParam(key) !== '') {
                updateCandidates[key] = getValueOfPolicyParam(key);
            } else {
                updateCandidates[key] = value;
            }
        });
        // Saving field changes to backend
        // eslint-disable-next-line no-alert
        alert(`saving ${JSON.stringify(updateCandidates)}`);
    };
    const getError = (specInCheck) => {
        let error = '';
        const value = state[specInCheck.name];
        if (specInCheck.required && value === '') {
            error = intl.formatMessage({
                id: 'Apis.Details.Policies.PolicyForm.General.required.error',
                defaultMessage: 'Required field is empty',
            });
        } else if (specInCheck.validationRegex && !(new RegExp(specInCheck.validationRegex)).test(value)) {
            error = intl.formatMessage({
                id: 'Apis.Details.Policies.PolicyForm.General.regex.error',
                defaultMessage: 'Not a valid input',
            });
        }
        return error;
    }
    const supportAllGateways = () => {
        return policySpec.supportedGateways && policySpec.supportedGateways.length === 2;
    }

    const getValue = (specName) => {
        const prviousVal = getValueOfPolicyParam(specName);
        if (state[specName] !== null) {
            return state[specName];
        } else if (prviousVal) {
            return prviousVal;
        } else {
            return '';
        }
    }
    // Reset the content
    const resetAll = () => {
        setState(initState);
    }

    const resetDisabled = Object.keys(state).filter(k => !!state[k]).length === 0;

    if (!policySpec || !Policies) {
        return <CircularProgress />
    }
    return (
        <Box px={2}>
            <form onSubmit={submitForm}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div className={classes.titleCta}>
                            <Typography variant='h6' color='textPrimary'>
                                {policySpec.displayName}
                            </Typography>
                            <Button variant='outlined' color='primary' disabled={resetDisabled} onClick={resetAll}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyForm.General.reset'
                                    defaultMessage='Reset all'
                                />
                            </Button>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    {policySpec.attributes && policySpec.attributes.map((spec) => (<Grid item xs={12}>
                        {(spec.type === 'String' || spec.type === 'Enum') && (<Typography
                            variant='subtitle1'
                            color='textPrimary'
                            className={classes.inputTitle}
                        >
                            {spec.displayName}
                        </Typography>)}
                        {spec.type === 'String' && (<TextField
                            placeholder={spec.displayName}
                            helperText={getError(spec) === '' ? spec.description : getError(spec)}
                            error={getError(spec) !== ''}
                            variant='outlined'
                            name={spec.name}
                            value={getValue(spec.name)}
                            onChange={(e) => onInputChange(e, spec.type)}
                            fullWidth
                        />)}
                        {spec.type === 'Boolean' && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={getValue(spec.name)}
                                        onChange={(e) => onInputChange(e, spec.type)}
                                        name={spec.name}
                                        color='primary'
                                    />
                                }
                                label={spec.displayName}
                            />
                        )}
                        {spec.type === 'Enum' && (
                            <Select
                                placeholder={spec.displayName}
                                helperText={spec.description}
                                variant='outlined'
                                name={spec.name}
                                value={getValue(spec.name)}
                                onChange={(e) => onInputChange(e, spec.type)}
                                fullWidth
                            >
                                {spec.values && spec.values.map((enumVal) => (<MenuItem 
                                    value={enumVal}>{enumVal}</MenuItem>))}
                            </Select>
                        )}
                    </Grid>))}
                    {supportAllGateways() && (<Alert severity='info' variant='outlined'>
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.General.supported.in.all.gw'
                            defaultMessage='Supported in all Gateways'
                        /></Alert>)}
                    <Grid item container justify='flex-start' xs={12}>
                        <Button
                            variant='contained'
                            type='submit'
                            color='primary'
                            size='large'
                            disabled={resetDisabled || saving}
                        >
                            {saving ? <><CircularProgress size='small' /><FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.General.saving'
                                defaultMessage='Saving'
                            /></> : <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.General.save'
                                defaultMessage='Save'
                            />}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

General.propTypes = {
    /**
   * External classes
   */
};

export default General;
