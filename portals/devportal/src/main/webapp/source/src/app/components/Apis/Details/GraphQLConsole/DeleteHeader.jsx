/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DialogContentText from '@material-ui/core/DialogContentText';
import DeleteIcon from '@material-ui/icons/Delete';
import FormDialogBase from 'AppComponents/Apis/Details/GraphQLConsole/FormDialogBase';

/**
 * Render delete dialog box.
 * @param {JSON} props component props.
 * @returns {JSX} Loading animation.
 */
function DeleteHeader({ item, callBack }) {
    const formSaveCallback = () => {
        return (setOpen) => {
            callBack(item);
            setOpen(false);
        };
    };
    return (
        <FormDialogBase
            title='Delete Additional Header'
            saveButtonText='Delete'
            icon={<DeleteIcon />}
            formSaveCallback={formSaveCallback}
        >
            <DialogContentText>
                {item.name}
                <FormattedMessage
                    id='Throttling.Advanced.Delete.will.be.deleted'
                    defaultMessage=' will be deleted.'
                />

            </DialogContentText>
        </FormDialogBase>
    );
}
DeleteHeader.propTypes = {
    row: PropTypes.shape({}).isRequired,
    callBack: PropTypes.func.isRequired,
    item: PropTypes.shape({
        name: PropTypes.shape({}).isRequired,
    }).isRequired,
};
export default DeleteHeader;
