import React from 'react';
import Grid from '@mui/material/Grid';
import Alert from 'AppComponents/Shared/MuiAlert';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';

/**
 *
 *
 * @export
 * @param {*} props
 * @return {*}
 */
export default function TaskState(props) {
    const {
        pending, completed, errors, inProgress, children, pendingMessage, completedMessage, inProgressMessage,
    } = props;
    let severity;
    let message = children;
    if (pending) {
        severity = 'pending';
        if (pendingMessage) {
            message = pendingMessage;
        }
    } else if (completed) {
        severity = 'success';
        if (completedMessage) {
            message = completedMessage;
        }
    } else if (inProgress) {
        severity = 'info';
        if (inProgressMessage) {
            message = inProgressMessage;
        }
    } else {
        severity = 'waiting';
    }
    if (errors) {
        severity = 'error';
        if (errors.response) {
            const { body } = errors.response;
            message = (
                <>
                    <b>
                        [
                        {body.code}
                        ]
                    </b>
                    {' '}
                    :
                    {body.description}
                </>
            );
        } else {
            message = (
                <>
                    <FormattedMessage
                        id='Apis.Listing.TaskState.generic.error.prefix'
                        defaultMessage='Error while'
                    />
                    {' '}
                    {inProgressMessage}
                </>
            );
        }
    }

    return (
        <>
            <Grid item xs={12}>
                <Alert
                    icon={inProgress ? <CircularProgress size={20} thickness={2} /> : null}
                    variant={errors ? 'standard' : 'plain'}
                    severity={severity}
                >
                    {message}
                </Alert>
            </Grid>
        </>
    );
}
