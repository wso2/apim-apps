import React from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

/**
 * React component for handling confirmation dialog box.
 * @class ConfirmDialog
 * @extends {React.Component}
 */
export default function ConfirmDialog(props) {
    const {
        title, message, labelCancel, labelOk, open, callback, idOk, idCancel,
        confirmPrimary = false,
    } = props;

    /**
     * If user confirms the action invoke the callback with true else false
     * @param {String} action One of ConfirmDialog.Action actions
     * @memberof ConfirmDialog
     */
    function handleRequestClose(action) {
        if (action === ConfirmDialog.Action.OK) {
            callback(true);
        } else {
            callback(false);
        }
    }

    return (
        <Dialog onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} open={open} onClose={handleRequestClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button id={idCancel} onClick={() => handleRequestClose(ConfirmDialog.Action.CANCEL)} color='primary'>
                    {labelCancel}
                </Button>
                <Button id={idOk} onClick={() => handleRequestClose(ConfirmDialog.Action.OK)} color='primary'
                    variant={confirmPrimary ? 'contained' : 'text'} >
                    {labelOk}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ConfirmDialog.defaultProps = {
    title: <FormattedMessage id='Apis.Shared.ConfirmDialog.please.confirm' defaultMessage='Please Confirm' />,
    message: <FormattedMessage id='Apis.Shared.ConfirmDialog.are.you.sure' defaultMessage='Are you sure?' />,
    labelOk: <FormattedMessage id='Apis.Shared.ConfirmDialog.ok' defaultMessage='OK' />,
    labelCancel: <FormattedMessage id='Apis.Shared.ConfirmDialog.cancel' defaultMessage='Cancel' />,
    callback: () => {},
    confirmPrimary: false,
};
ConfirmDialog.propTypes = {
    title: PropTypes.element,
    message: PropTypes.element,
    labelOk: PropTypes.element,
    labelCancel: PropTypes.element,
    open: PropTypes.bool.isRequired,
    callback: PropTypes.func,
    confirmPrimary: PropTypes.bool,
};
ConfirmDialog.Action = {
    OK: 'ok',
    CANCEL: 'cancel',
};
