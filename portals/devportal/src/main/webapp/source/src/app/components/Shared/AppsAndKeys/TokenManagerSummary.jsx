
import React from 'react';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import WaitingForApproval from './WaitingForApproval';
import ViewKeys from './ViewKeys';

/**
 * Render a compressed view of the key gneration view.
 * @param {JSON} props Input params.
 * @returns {JSX} Rendered output.
 */
export default function TokenManagerSummary(props) {
    const { keys, keyStates, key, selectedApp, keyType, isKeyJWT, isUserOwner, selectedTab } = props;
    if (keys.size > 0 && key && key.keyState === 'APPROVED' && !key.consumerKey) {
        return (
            <div className={{
                background: '#ffffff55',
                color: theme.palette.getContrastText(theme.palette.background.paper),
                border: 'solid 1px #fff',
                padding: theme.spacing(2),
                width: '100%',
            }}>
                <Typography variant="h5" component="h3">
                    Error
                </Typography>
                <Typography variant='body2'>
                    <FormattedMessage
                        id='Shared.AppsAndKeys.TokenManagerSummary'
                        defaultMessage='Error! You have partially-created keys. Use `Clean Up` option.'
                    />
                </Typography>
            </div>
        );
    }
    if (key && (key.keyState === keyStates.CREATED || key.keyState === keyStates.REJECTED)) {
        return (
            <div className={{
                background: '#ffffff55',
                color: theme.palette.getContrastText(theme.palette.background.paper),
                border: 'solid 1px #fff',
                padding: theme.spacing(2),
                width: '100%',
            }}>
                <Typography variant='body2'>
                    <WaitingForApproval keyState={key.keyState} states={keyStates} />
                </Typography>
            </div>
        );
    }
    const keyGrantTypes = key ? key.supportedGrantTypes : [];

    return (
        <ViewKeys
            selectedApp={selectedApp}
            selectedTab={selectedTab}
            keyType={keyType}
            keys={keys}
            isKeyJWT={isKeyJWT}
            selectedGrantTypes={keyGrantTypes}
            isUserOwner={isUserOwner}
            summary
        />
    );
}
