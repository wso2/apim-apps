import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Paper from '@mui/material/Paper';
import Icon from '@mui/material/Icon';
import VerticalDivider from './VerticalDivider';
import { Alert, AlertTitle } from '@mui/material';

/**
 * Main style object
 *
 * @param {*} theme
 */
const styles = theme => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
});
/**
 *  Renders a inline massage
 *
 * @class InlineMessage
 * @extends {React.Component}
 */
function InlineMessage(props) {
    const { type, title } = props;
    const messageType = type || 'info';
    return (
        <Alert severity={messageType}>
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
