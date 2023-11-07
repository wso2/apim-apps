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

import React, { FC } from 'react';
import GeneralDetailsShared from 'AppComponents/Shared/PoliciesUI/GeneralDetails';
import { ACTIONS } from './PolicyCreateForm';

interface GeneralDetailsProps {
    displayName: string | null;
    version: string | null;
    description: string;
    applicableFlows: string[];
    supportedApiTypes: string[];
    dispatch?: React.Dispatch<any>;
    isViewMode: boolean;
}

/**
 * Renders the general details section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} General details of the policy.
 */
const GeneralDetails: FC<GeneralDetailsProps> = ({
    displayName,
    version,
    description,
    applicableFlows,
    supportedApiTypes,
    dispatch,
    isViewMode,
}) => {
    // Validates whether atleast one flow (i.e. request, response or fault) is selected
    // True if none of the flows are selected.
    const applicableFlowsError = applicableFlows.length === 0;

    // Validates whether atleast one Api Type (i.e. HTTP, SOAP or SOAPTOREST) is selected
    // True if none of the API types are selected.
    const supportedApiTypesError = supportedApiTypes.length === 0;

    // Name validation
    const nameError = displayName === '';

    // Version validation
    const versionError = version === '';

    /**
     * Function to handle text field inputs
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_METADATA,
                field: event.target.name,
                value: event.target.value,
            });
        }
    };

    /**
     * Function to handle applicable flows related checkbox changes
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_APPLICALBLE_FLOWS,
                name: event.target.name,
                checked: event.target.checked,
            });
        }
    };

    /**
     * Function to handle supported Api Type related checkbox changes
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleApiTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_SUPPORTED_API_TYPES,
                name: event.target.name,
                checked: event.target.checked,
            });
        }
    };

    return (
        <GeneralDetailsShared 
            displayName={displayName}
            version={version}
            description={description}
            applicableFlows={applicableFlows}
            supportedApiTypes={supportedApiTypes}
            isViewMode={isViewMode}
            nameError={nameError}
            versionError={versionError}
            handleInputChange={handleInputChange}
            applicableFlowsError={applicableFlowsError}
            handleChange={handleChange}
            supportedApiTypesError={supportedApiTypesError}
            handleApiTypeChange={handleApiTypeChange}
        />
    );
};

export default React.memo(GeneralDetails);
