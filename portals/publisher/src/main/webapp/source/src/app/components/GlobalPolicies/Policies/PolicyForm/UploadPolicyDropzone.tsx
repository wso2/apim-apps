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

import React, { FC } from 'react';
import UploadPolicyDropzoneShared from 'AppComponents/Shared/PoliciesUI/UploadPolicyDropzone';

interface UploadPolicyDropzoneProps {
    policyDefinitionFile: any[];
    setPolicyDefinitionFile: React.Dispatch<React.SetStateAction<any[]>>;
    gateway: string;
}

/**
 * Handles the policy file upload.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy file upload managing UI.
 */
const UploadPolicyDropzone: FC<UploadPolicyDropzoneProps> = ({
    policyDefinitionFile,
    setPolicyDefinitionFile,
    gateway,
}) => {

    const handleDrop = (policyDefinition: any) => {
        setPolicyDefinitionFile(policyDefinition);
    };

    return (
        <UploadPolicyDropzoneShared 
            policyDefinitionFile={policyDefinitionFile}
            setPolicyDefinitionFile={setPolicyDefinitionFile}
            gateway={gateway}
            handleDrop={handleDrop}
        />
    );
};

export default UploadPolicyDropzone;
