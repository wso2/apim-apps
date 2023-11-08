/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
* 
* WSO2 LLC. licenses this file to you under the Apache License,
* Version 2.0 (the "License"); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
* 
* http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { FC, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import Utils from 'AppData/Utils';
import API from 'AppData/api.js';
import { Alert } from 'AppComponents/Shared';
import CONSTS from 'AppData/Constants';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import SourceDetailsShared from 'AppComponents/Shared/PoliciesUI/SourceDetails';
import { ACTIONS } from './PolicyCreateForm';
import UploadPolicyDropzone from './UploadPolicyDropzone';

interface SourceDetailsProps {
    supportedGateways: string[];
    synapsePolicyDefinitionFile?: any[];
    setSynapsePolicyDefinitionFile?: React.Dispatch<React.SetStateAction<any[]>>;
    ccPolicyDefinitionFile?: any[];
    setCcPolicyDefinitionFile?: React.Dispatch<React.SetStateAction<any[]>>;
    dispatch?: React.Dispatch<any>;
    isViewMode?: boolean;
    policyId?: string;
    isAPISpecific?: boolean;
}

/**
 * Renders the general details section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} General details of the policy.
 */
const SourceDetails: FC<SourceDetailsProps> = ({
    supportedGateways,
    synapsePolicyDefinitionFile,
    setSynapsePolicyDefinitionFile,
    ccPolicyDefinitionFile,
    setCcPolicyDefinitionFile,
    dispatch,
    isViewMode,
    policyId,
    isAPISpecific,
}) => {
    const { api } = useContext<any>(ApiContext);

    // Validates whether atleast one gateway type (i.e. synapse, or CC ) is selected
    // True if none of the available gateways are selected.
    const supportedGatewaysError = supportedGateways.length === 0;

    /**
     * Function to handle supported gateways related checkbox changes
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_SUPPORTED_GATEWAYS,
                name:
                    event.target.name === 'regularGateway'
                        ? CONSTS.GATEWAY_TYPE.synapse
                        : CONSTS.GATEWAY_TYPE.choreoConnect,
                checked: event.target.checked,
            });
        }
    };

    /**
     * Hanlde policy download
     */
    const handlePolicyDownload = () => {
        if (policyId) {
            if (isAPISpecific) {
                const globalPolicyContentPromise = API.getOperationPolicyContent(
                    policyId,
                    api.id,
                );
                globalPolicyContentPromise
                    .then((globalPolicyResponse) => {
                        Utils.forceDownload(globalPolicyResponse);
                    })
                    .catch((error) => {
                        console.error(error);
                        Alert.error(
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.SourceDetails.apiSpecificPolicy.download.error'
                                defaultMessage='Something went wrong while downloading the policy'
                            />,
                        );
                    });
            } else {
                const commonPolicyContentPromise =
                    API.getCommonOperationPolicyContent(policyId);
                commonPolicyContentPromise
                    .then((commonPolicyResponse) => {
                        Utils.forceDownload(commonPolicyResponse);
                    })
                    .catch((error) => {
                        console.error(error);
                        Alert.error(
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.SourceDetails.commonPolicy.download.error'
                                defaultMessage='Something went wrong while downloading the policy'
                            />,
                        );
                    });
            }
        }
    };

    return(
        <SourceDetailsShared
            supportedGateways={supportedGateways}
            synapsePolicyDefinitionFile={synapsePolicyDefinitionFile}
            setSynapsePolicyDefinitionFile={setSynapsePolicyDefinitionFile}
            ccPolicyDefinitionFile={ccPolicyDefinitionFile}
            setCcPolicyDefinitionFile={setCcPolicyDefinitionFile}
            isViewMode={isViewMode}
            handlePolicyDownload={handlePolicyDownload}
            supportedGatewaysError={supportedGatewaysError}
            handleChange={handleChange}
            UploadPolicyDropzone={UploadPolicyDropzone}
        />
    );
};

export default React.memo(SourceDetails);
