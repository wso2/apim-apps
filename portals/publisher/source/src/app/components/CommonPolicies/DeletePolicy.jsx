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
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Alert from 'AppComponents/Shared/Alert';
import ConfirmDialog from 'AppComponents/Shared/ConfirmDialog';
import { isRestricted } from 'AppData/AuthManager';
// import API from 'AppData/api';

// const styles = {
//     appBar: {
//         position: 'relative',
//     },
//     flex: {
//         flex: 1,
//     },
//     popupHeader: {
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     splitWrapper: {
//         padding: 0,
//     },
//     docName: {
//         alignItems: 'center',
//         display: 'flex',
//     },
//     button: {
//         height: 30,
//         marginLeft: 30,
//     },
// };

// interface Policy {
//     id: number,
//     name: string,
//     description: string,
//     flows: string[],
//     usageCount: number,
// }

// interface IProps {
//     policyId: number,
//     policyName: string,
//     policies: Policy[],
//     setPolicies: React.Dispatch<SetStateAction<{
//         id: number;
//         name: string;
//         description: string;
//         flows: string[];
//         usageCount: number;
//     }[]>>,
//     usageCount: number,
//     //  (updatedPolicyList: ) => void,
// }

/**
 * Renders the policy management page.
 * @param {any} props Input props needed for common policy deletion.
 * @returns {JSX} Returns the rendered UI for common policy delete.
 */
const DeletePolicy = ({
    policyId, policyName, policies, setPolicies,
}) => {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => {
        setOpen(!open);
    };
    const deletePolicy = () => {
        // const restApi = new API();
        // const setOpenLocal = setOpen; // Need to copy this to access inside the promise.then
        // const deleteResponse = restApi.deletePolicyTemplate(policyId);
        // deleteResponse
        //     .then(() => {
        //         Alert.info('Policy Template deleted successfully!');
        //         setOpenLocal(!open);
        //         fetchScopeData();
        //     })
        //     .catch((errorResponse: any) => {
        //         console.error(errorResponse);
        //         Alert.error('Error occurred while deleting the policy template');
        //         setOpenLocal(!open);
        //     });
        setPolicies(policies.filter((policy) => policy.id !== policyId));
        const alertMessage = policyName + ' policy deleted successfully!';
        Alert.info(alertMessage);
    };

    const runAction = (confirm) => {
        if (confirm) {
            deletePolicy();
        } else {
            setOpen(!open);
        }
    };

    return (
        <>
            <Button
                onClick={toggleOpen}
                disabled={isRestricted(['apim:shared_scope_manage']) > 0}
                aria-label={'Delete ' + policyName}
            >
                <Icon>delete_forever</Icon>
                <FormattedMessage
                    id='Policies.Delete.Delete.policy.delete'
                    defaultMessage='Delete'
                />
            </Button>
            <ConfirmDialog
                key='key-dialog'
                labelCancel={(
                    <FormattedMessage
                        id='Policies.Delete.Delete.policy.listing.label.cancel'
                        defaultMessage='Cancel'
                    />
                )}
                title={(
                    <FormattedMessage
                        id='Policies.Delete.Delete.scope.listing.delete.confirm'
                        defaultMessage='Confirm Delete'
                    />
                )}
                message={(
                    <FormattedMessage
                        id='Policies.Delete.Delete.document.policy.label.ok.confirm'
                        defaultMessage='Are you sure you want to delete {policy} policy ?'
                        values={{ policy: policyName }}
                    />
                )}
                labelOk={(
                    <FormattedMessage
                        id='Policies.Delete.Delete.policy.listing.label.ok.yes'
                        defaultMessage='Yes'
                    />
                )}
                callback={runAction}
                open={open}
            />
        </>
    );
};

DeletePolicy.propTypes = {
    policyId: PropTypes.number.isRequired,
    policyName: PropTypes.string.isRequired,
    policies: PropTypes.shape({}).isRequired,
    setPolicies: PropTypes.func.isRequired,
};

export default DeletePolicy;
