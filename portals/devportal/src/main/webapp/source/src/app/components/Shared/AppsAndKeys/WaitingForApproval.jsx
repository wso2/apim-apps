import React from 'react';
import { styled } from '@mui/material/styles';
import { injectIntl } from 'react-intl';

const PREFIX = 'WaitingForApproval';

const classes = {
    root: `${PREFIX}-root`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`&.${classes.root}`]: {
        padding: theme.spacing(3),
    }
}));

const waitingForApproval = (props) => {
    const {
        keyState, states, intl,
    } = props;
    let message = intl.formatMessage({
        defaultMessage: 'A request to register this application has been sent and is pending approval.',
        id: 'Shared.AppsAndKeys.WaitingForApproval.msg.ok',
    });
    if (keyState === states.REJECTED) {
        message = intl.formatMessage({
            defaultMessage: 'This application has been rejected from generating keys',
            id: 'Shared.AppsAndKeys.WaitingForApproval.msg.reject',
        });
    }
    return <Root className={classes.root}>{message}</Root>;
};

export default injectIntl((waitingForApproval));
