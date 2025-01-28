import React from 'react';
import GovernanceAPI from 'AppData/GovernanceAPI';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogContentText from '@mui/material/DialogContentText';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';

/**
 * Renders delete dialog box
 * @param {JSON} props component properties
 * @returns {JSX} Delete dialog box
 */
function DeleteRuleset({ updateList, dataRow }) {
    const { id } = dataRow;
    const intl = useIntl();

    const formSaveCallback = () => {
        return new GovernanceAPI()
            .deleteRuleset(id)
            .then(() => (
                <FormattedMessage
                    id='AdminPages.Governance.Ruleset.Delete.form.delete.successful'
                    defaultMessage='Ruleset deleted successfully'
                />
            ))
            .catch((error) => {
                throw new Error(error.response.body.description);
            })
            .finally(() => {
                updateList();
            });
    };

    return (
        <FormDialogBase
            title={intl.formatMessage({
                id: 'AdminPages.Governance.Ruleset.Delete.form.delete.dialog.title',
                defaultMessage: 'Delete Ruleset?',
            })}
            saveButtonText={intl.formatMessage({
                id: 'AdminPages.Governance.Ruleset.Delete.form.delete.dialog.btn',
                defaultMessage: 'Delete',
            })}
            icon={<DeleteForeverIcon />}
            formSaveCallback={formSaveCallback}
        >
            <DialogContentText>
                <FormattedMessage
                    id='AdminPages.Governance.Ruleset.Delete.form.delete.confirmation.message'
                    defaultMessage='Are you sure you want to delete this Ruleset?'
                />
            </DialogContentText>
        </FormDialogBase>
    );
}

DeleteRuleset.propTypes = {
    updateList: PropTypes.func.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
};

export default DeleteRuleset;
