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

import React, { useState } from 'react';
import DraggablePolicyCardShared from 'AppComponents/Shared/PoliciesUI/DraggablePolicyCard';
import type { Policy } from './Types';
import ViewPolicy from './ViewPolicy';

interface DraggablePolicyCardProps {
    policyObj: Policy;
    showCopyIcon?: boolean;
    isLocalToAPI: boolean;
    fetchPolicies: () => void;
}

/**
 * Renders a single draggable policy block.
 * @param {any} DraggablePolicyCardProps Input props from parent components.
 * @returns {TSX} Draggable Policy card UI.
 */
const DraggablePolicyCard: React.FC<DraggablePolicyCardProps> = ({
    policyObj,
    showCopyIcon,
    isLocalToAPI,
    fetchPolicies,
}) => {
    const [hovered, setHovered] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);


    const handleViewPolicy = () => {
        setDialogOpen(true);
    };

    const handleViewPolicyClose = () => {
        setDialogOpen(false);
    };

    // If the policy is local to the API, we don't need to render the draggable card since this is global policies.
    if (isLocalToAPI) {
        return null;
    }

    return (
        <DraggablePolicyCardShared
            policyObj={policyObj}
            showCopyIcon={showCopyIcon}
            isLocalToAPI={isLocalToAPI}
            fetchPolicies={fetchPolicies}
            setHovered={setHovered}
            hovered={hovered}
            handleViewPolicy={handleViewPolicy}
            dialogOpen={dialogOpen}
            handleViewPolicyClose={handleViewPolicyClose}
            ViewPolicy={ViewPolicy} 
            DeletePolicy={null}
        />
    );
};

export default DraggablePolicyCard;
