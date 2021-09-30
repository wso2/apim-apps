import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import { ListItem } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
    mandatoryStar: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },
}));

/**
 * Trottling Policies dropdown selector used in minimized API Create form
 * @export
 * @param {*} props
 * @returns {React.Component}
 */
export default function SelectGateways(props) {
    const { settings: { environment: environments } } = useAppContext();

    const {
        onChange, multiple, helperText, isAPIProduct,
    } = props;
    const [selectedGatewayVendor, setGatewayVendor] = useState('wso2');
    const [gatewayVendors, setGatewayVendors] = useState([]);
    const classes = useStyles();

    useEffect(() => {
        const entries = [];
        environments.forEach((env) => {
            if (!entries.includes(env.provider)) {
                entries.push(env.provider);
            }
        });
        setGatewayVendors(entries);
    }, [environments]);

    const handleOnChange = (event) => {
        setGatewayVendor(event.target.value);
    };

    const handleValidateAndChange = ({ target: { value, name } }) => {
        onChange({ target: { name, value } });
    };

    if (gatewayVendors.length === 0) {
        return '';
    } else {
        return (
            <Grid item md={12}>
                <TextField
                    fullWidth
                    select
                    label={(
                        <>
                            <FormattedMessage
                                id='Apis.Create.Components.SelectGateways.Vendor'
                                defaultMessage='Gateway Vendor'
                            />
                            {isAPIProduct && (<sup className={classes.mandatoryStar}>*</sup>)}
                        </>
                    )}
                    value={selectedGatewayVendor}
                    name='gatewayVendor'
                    onClick={handleOnChange}
                    onChange={handleValidateAndChange}
                    helperText={isAPIProduct ? helperText + 'API Product' : helperText + 'API'}
                    margin='normal'
                    variant='outlined'
                    InputProps={{
                        id: 'itest-id-gateway-input',
                    }}
                >
                    {gatewayVendors.map((vendor) => (
                        <MenuItem
                            dense
                            disableGutters={multiple}
                            value={vendor}
                        >
                            <ListItem>
                                <ListItemText primary={vendor} />
                            </ListItem>
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
        );
    }
}

SelectGateways.defaultProps = {
    gatewayVendor: 'wso2',
    multiple: false,
    required: false,
    isAPIProduct: PropTypes.bool.isRequired,
    helperText: 'Select the Vendor of the Gateway to publish the ',
};
