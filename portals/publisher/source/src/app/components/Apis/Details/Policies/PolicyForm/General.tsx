import React, { useState, FC, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Button,
    TextField,
    CircularProgress,
    Box,
} from '@material-ui/core';
import { FormattedMessage, useIntl } from 'react-intl';
import Policies from '../../LifeCycle/Policies';
import { Policy, PolicySpec, ApiPolicy } from '../Types';
import ApiOperationContext from "../ApiOperationContext";

const useStyles = makeStyles(theme => ({
    titleCta: {
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
    },
    avatar: {
        width: theme.spacing(14),
        height: theme.spacing(15),
    },
    btn: {
        marginRight: '1em',
    }
}));
interface GeneralProps {
    policyObj: Policy;
    currentFlow: string;
    target: string;
    verb: string;
    apiPolicy: ApiPolicy;
    policySpec: PolicySpec;
    handleDrawerClose: () => void;
}

const General: FC<GeneralProps> = ({
    currentFlow, target, verb, apiPolicy, policySpec, handleDrawerClose
}) => {
    const intl = useIntl();
    const classes = useStyles();
    const [saving, setSaving] = useState(false);
    const initState: any = {};
    const { updateApiOperations } = useContext<any>(ApiOperationContext);
    policySpec.policyAttributes.forEach(attr => { initState[attr.name] = null });
    const [state, setState] = useState(initState);

    const onInputChange = (event: any, specType: any) => {
        if (specType === 'Boolean') {
            setState({ ...state, [event.target.name]: event.target.checked });
        } else if (specType === 'String' || specType === 'Enum') {
            setState({ ...state, [event.target.name]: event.target.value });
        }
    }

    const getValueOfPolicyParam = (policyParamName: any) => {
        return apiPolicy.parameters[policyParamName];
    }

    const submitForm = async (event: any) => {
        event.preventDefault();
        setSaving(true);
        const updateCandidates: any = {};
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
        const apiPolicyToSave = {...apiPolicy};
        apiPolicyToSave.parameters = updateCandidates;
        updateApiOperations(apiPolicyToSave, target, verb, currentFlow);
    };
    const getError = (specInCheck: any) => {
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
    // const supportAllGateways = () => {
    //     return policySpec.supportedGateways && policySpec.supportedGateways.length === 2;
    // }

    const getValue = (specName: any) => {
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

    const formHasErrors = () => {
        let formHasAnError = false;
        policySpec.policyAttributes.forEach((spec) => {
            if(getError(spec) !== '') {
                formHasAnError = true
            }
        })
        return formHasAnError;
    }

    const resetDisabled = Object.keys(state).filter(k => !!state[k]).length === 0;
    

    if (!policySpec || !Policies) {
        return <CircularProgress />
    }
    return (
        <Box p={2}>
            <form onSubmit={submitForm}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div className={classes.titleCta}>
                            <Button variant='outlined' color='primary' disabled={resetDisabled} onClick={resetAll}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyForm.General.reset'
                                    defaultMessage='Reset'
                                />
                            </Button>
                        </div>
                    </Grid>
                    {policySpec.policyAttributes && policySpec.policyAttributes.map((spec) => (<Grid item xs={12}>
                        {(spec.type === 'String' || spec.type === 'Enum') && (<Typography
                            variant='subtitle1'
                            color='textPrimary'
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
                        {/* {spec.type === 'Boolean' && (
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
                        )} */}
                    </Grid>))}
                    {/* {supportAllGateways() && (<Alert severity='info' variant='outlined'>
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.General.supported.in.all.gw'
                            defaultMessage='Supported in all Gateways'
                        /></Alert>)} */}
                    <Grid item container justify='flex-end' xs={12}>
                        <Button
                            variant='outlined'
                            color='primary'
                            onClick={handleDrawerClose}
                            className={classes.btn}
                        >
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.General.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                        <Button
                            variant='contained'
                            type='submit'
                            color='primary'
                            disabled={resetDisabled || formHasErrors() || saving}
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


export default General;
