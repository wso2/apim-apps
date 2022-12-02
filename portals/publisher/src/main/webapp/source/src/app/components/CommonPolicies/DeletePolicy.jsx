/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Alert from 'AppComponents/Shared/Alert';
import ConfirmDialog from 'AppComponents/Shared/ConfirmDialog';
import { isRestricted } from 'AppData/AuthManager';
import API from 'AppData/api';

/**
 * Renders the policy management page.
 * @param {any} props Input props needed for common policy deletion.
 * @returns {JSX} Returns the rendered UI for common policy delete.
 */
const DeletePolicy = ({ policyId, policyName, fetchCommonPolicies }) => {
    const [open, setOpen] = useState(false);
    const api = new API();
    const setOpenLocal = setOpen; // Need to copy this to access inside the promise.then
    const toggleOpen = () => {
        setOpen(!open);
    };

    const deleteCommonPolicy = () => {
        const promisedCommonPolicyDelete =
            api.deleteCommonOperationPolicy(policyId);
        promisedCommonPolicyDelete
            .then(() => {
                Alert.info(`${policyName} policy deleted successfully!`);
                setOpenLocal(!open);
                fetchCommonPolicies();
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                Alert.error('Error occurred while deleteting policy');
                setOpenLocal(!open);
            });
    };

    const runAction = (confirm) => {
        if (confirm) {
            deleteCommonPolicy();
        } else {
            setOpen(!open);
        }
    };

    return (
        <>
            <Button
                onClick={toggleOpen}
                disabled={
                    isRestricted([
                        'apim:api_create',
                        'apim:api_manage',
                        'apim:mediation_policy_manage',
                        'apim:api_mediation_policy_manage',
                    ]) > 0
                }
                aria-label={'Delete ' + policyName}
            >
                <Icon>delete_forever</Icon>
                <FormattedMessage
                    id='CommonPolicies.DeletePolicy.policy.delete'
                    defaultMessage='Delete'
                />
            </Button>
            <ConfirmDialog
                key='key-dialog'
                labelCancel={
                    <FormattedMessage
                        id='CommonPolicies.DeletePolicy.confirm.dialog.cancel.delete'
                        defaultMessage='Cancel'
                    />
                }
                title={
                    <FormattedMessage
                        id='CommonPolicies.DeletePolicy.confirm.dialog.confirm.title'
                        defaultMessage='Confirm Delete'
                    />
                }
                message={
                    <FormattedMessage
                        id='CommonPolicies.DeletePolicy.confirm.dialog.confirm.content'
                        defaultMessage='Are you sure you want to delete {policy} policy ?'
                        values={{ policy: policyName }}
                    />
                }
                labelOk={
                    <FormattedMessage
                        id='CommonPolicies.DeletePolicy.confirm.dialog.confirm.delete'
                        defaultMessage='Yes'
                    />
                }
                callback={runAction}
                open={open}
            />
        </>
    );
};

DeletePolicy.propTypes = {
    policyId: PropTypes.number.isRequired,
    policyName: PropTypes.string.isRequired,
    fetchCommonPolicies: PropTypes.func.isRequired,
};

export default DeletePolicy;
