import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle } from '@mui/material';

/**
 *  Renders a inline massage
 *
 * @class InlineMessage
 * @extends {React.Component}
 */
function InlineMessage(props) {
    const { type, title, variant } = props;
    const messageType = type || 'info';
    return (
        <Alert variant={variant || "standard"} severity={messageType}>
            {title && (<AlertTitle>{title}</AlertTitle>)}
            {props.children}
        </Alert>

    );
}

InlineMessage.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    type: PropTypes.string.isRequired,
};

export default InlineMessage;
