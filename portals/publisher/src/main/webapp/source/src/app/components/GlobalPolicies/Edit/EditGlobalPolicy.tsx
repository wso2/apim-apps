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

import React from 'react';
import Policies from 'AppComponents/GlobalPolicies/Policies/GlobalSpecificComponents/Policies';
import { useParams } from 'react-router-dom';

interface RouteParams {
    policyId: string;
}

/**
 * Global Policies Editing Page.
 * @returns {JSX} - Editing Page.
 */
const EditGlobalPolicy: React.FC = () => {
    const { policyId } = useParams<RouteParams>();
    return (
        <Policies isCreateNew={false} policyID={policyId} disabled={false}/>
    );
};

export default EditGlobalPolicy;