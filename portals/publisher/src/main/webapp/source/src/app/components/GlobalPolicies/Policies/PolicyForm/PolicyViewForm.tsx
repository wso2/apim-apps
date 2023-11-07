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
import PolicyViewFormShared from 'AppComponents/Shared/PoliciesUI/PolicyViewForm';
import type { PolicySpec, PolicySpecAttribute } from '../Types';
import PolicyAttributes from './PolicyAttributes';
import GeneralDetails from './GeneralDetails';
import SourceDetails from './SourceDetails';
import uuidv4 from '../Utils';

interface PolicyViewFormProps {
    policySpec: PolicySpec;
    onDone: () => void;
}

/**
 * Renders the policy view form.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const PolicyViewForm: FC<PolicyViewFormProps> = ({ policySpec, onDone }) => {
    const getPolicyAttributes = () => {
        const policyAttributeList = policySpec.policyAttributes.map(
            (attribute: PolicySpecAttribute) => {
                return { ...attribute, id: uuidv4() };
            },
        );
        return policyAttributeList;
    };

    return (
        <PolicyViewFormShared
            policySpec={policySpec}
            onDone={onDone}
            getPolicyAttributes={getPolicyAttributes}
            PolicyAttributes={PolicyAttributes}
            GeneralDetails={GeneralDetails}
            SourceDetails={SourceDetails}
        />
    );
};

export default PolicyViewForm;
