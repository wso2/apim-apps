import React from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import {
    Grid, FormControl, FormControlLabel, RadioGroup, Radio, Typography,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const PREFIX = 'SelectAppPanel';

const classes = {
    centerItems: `${PREFIX}-centerItems`,
    tryoutHeading: `${PREFIX}-tryoutHeading`,
    menuItem: `${PREFIX}-menuItem`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.centerItems}`]: {
        margin: 'auto',
    },

    [`& .${classes.tryoutHeading}`]: {
        display: 'block',
        fontWeight: 400,
    },

    [`& .${classes.menuItem}`]: {
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },
}));

const SelectAppPanel = (props) => {
    let {
        selectedApplication, selectedKeyType,
    } = props;

    const {
        subscriptions, handleChanges,
    } = props;

    /**
     * This method is used to handle the updating of key generation
     * request object.
     * @param {*} event event fired
     */
    const handleSelectPanelChange = (event) => {
        const { target } = event;
        const { name, value } = target;
        switch (name) {
            case 'selectedApplication':
                selectedApplication = value;
                break;
            case 'selectedKeyType':
                selectedKeyType = value;
                break;
            default:
                break;
        }
        handleChanges(event);
    };
    return (
        <Root>
            <Grid x={12} md={6} className={classes.centerItems}>
                <TextField
                    fullWidth
                    id='selected-application'
                    select
                    label={(
                        <FormattedMessage
                            defaultMessage='Applications'
                            id='Apis.Details.ApiConsole.SelectAppPanel.applications'
                        />
                    )}
                    value={selectedApplication}
                    name='selectedApplication'
                    onChange={handleSelectPanelChange}
                    SelectProps={subscriptions}
                    helperText={(
                        <FormattedMessage
                            defaultMessage='Subscribed applications'
                            id='Apis.Details.ApiConsole.SelectAppPanel.select.subscribed.application'
                        />
                    )}
                    margin='normal'
                    variant='outlined'
                >
                    {subscriptions.map((sub) => (
                        <MenuItem
                            value={sub.applicationInfo.applicationId}
                            key={sub.applicationInfo.applicationId}
                            className={classes.menuItem}
                        >
                            {sub.applicationInfo.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid x={12} md={6} className={classes.centerItems}>
                <Typography variant='h6' component='label' id='key-type' color='textSecondary' className={classes.tryoutHeading}>
                    <FormattedMessage
                        id='Apis.Details.ApiConsole.SelectAppPanel.select.key.type.heading'
                        defaultMessage='Key Type'
                    />
                </Typography>
                <FormControl variant='standard' component='fieldset'>
                    <RadioGroup
                        name='selectedKeyType'
                        value={selectedKeyType}
                        onChange={handleSelectPanelChange}
                        aria-labelledby='key-type'
                        row
                    >
                        {(subscriptions !== null && (subscriptions.find((sub) => sub.applicationId
                                === selectedApplication).status === 'UNBLOCKED'
                                || subscriptions.find((sub) => sub.applicationId
                                === selectedApplication).status === 'TIER_UPDATE_PENDING'))
                                && (
                                    <FormControlLabel
                                        value='PRODUCTION'
                                        control={<Radio />}
                                        label={(
                                            <FormattedMessage
                                                id='Apis.Details.ApiConsole.SelectAppPanel.production.radio'
                                                defaultMessage='Production'
                                            />
                                        )}
                                    />
                                )}
                        <FormControlLabel
                            value='SANDBOX'
                            control={<Radio />}
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.ApiConsole.SelectAppPanel.sandbox.radio'
                                    defaultMessage='Sandbox'
                                />
                            )}
                        />
                    </RadioGroup>
                </FormControl>
            </Grid>
        </Root>
    );
};

export default (SelectAppPanel);
