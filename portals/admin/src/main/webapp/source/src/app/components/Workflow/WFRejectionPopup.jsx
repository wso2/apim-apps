import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';
import PropTypes from 'prop-types';
import ClearIcon from '@mui/icons-material/Clear';
import { FormattedMessage } from 'react-intl';

/**
 * Render a pop-up dialog to get the reason for WF rejection
 * @param {JSON} props .
 * @returns {JSX}.
 */
function WFRejectionPopup(props) {
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
        color: 'error',
        variant: 'contained',
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
                label={
                    (
                        <FormattedMessage
                            id='Workflow.WFRejectionPopup.dialogBox.label'
                            defaultMessage='Reason for rejection'
                        />
                    )
                }
                fullWidth
                multiline
                variant='outlined'
                maxRows={4}
                icon={<ClearIcon />}
                helperText={
                    (
                        <FormattedMessage
                            id='Workflow.WFRejectionPopup.dialogBox.helperText'
                            defaultMessage='Please provide a reason for rejection (optional)'
                        />
                    )
                }
            />
        </FormDialogBase>
    );
}

WFRejectionPopup.propTypes = {
    referenceId: PropTypes.string.isRequired,
    updateStatus: PropTypes.func.isRequired,
};

export default WFRejectionPopup;
