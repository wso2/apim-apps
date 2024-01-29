import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';
import PropTypes from 'prop-types';
import ClearIcon from '@material-ui/icons/Clear';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    rejectButton: {
        textDecoration: 'none',
        backgroundColor: theme.palette.error.light,
    },
}));
/**
 * Render a pop-up dialog to get the reason for WF rejection
 * @param {JSON} props .
 * @returns {JSX}.
 */
function WFRejectionPopup(props) {
    const classes = useStyles();
    const { referenceId, updateStatus } = props;
    const [reason, setReason] = useState('');
    const onChange = (e) => {
        setReason(e.target.value);
    };

    useEffect(() => {
        setReason('');
    }, []);

    const formSaveCallback = () => {
        if (typeof updateStatus !== 'function') {
            console.error('updateStatus prop is not a function:', updateStatus);
        }
        updateStatus(referenceId, 'REJECTED', reason);
    };

    const triggerButtonProps = {
        size: 'small',
        className: classes.rejectButton,
    };

    return (
        <FormDialogBase
            title={
                (
                    <FormattedMessage
                        id='Workflow.WFRejectionPopup.dialog.title'
                        defaultMessage='Workflow Rejection'
                    />
                )
            }
            saveButtonText='Confirm Reject'
            triggerButtonText={(
                <>
                    <ClearIcon />
                    <FormattedMessage
                        id='Workflow.WFRejectionPopup.dialog.open.button.reject'
                        defaultMessage='Reject'
                    />
                </>
            )}
            formSaveCallback={formSaveCallback}
            triggerButtonProps={triggerButtonProps}
            setToFullWidth
        >
            <TextField
                margin='dense'
                name='rejectReason'
                onChange={onChange}
                label='Reason for rejection'
                fullWidth
                multiline
                variant='outlined'
                maxRows={4}
                icon={<ClearIcon />}
                helperText='Please provide a reason for rejection'
            />
        </FormDialogBase>
    );
}

WFRejectionPopup.propTypes = {
    referenceId: PropTypes.string.isRequired,
    updateStatus: PropTypes.func.isRequired,
};

export default WFRejectionPopup;
