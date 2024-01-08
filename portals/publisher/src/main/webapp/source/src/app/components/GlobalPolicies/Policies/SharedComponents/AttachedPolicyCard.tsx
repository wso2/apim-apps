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

import React, { FC, useContext, useState } from 'react';
import { Alert } from 'AppComponents/Shared';
import API from 'AppData/api.js';
import Utils from 'AppData/Utils';
import { FormattedMessage } from 'react-intl';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import AttachedPolicyCardShared from 'AppComponents/Shared/PoliciesUI/AttachedPolicyCard';
import type { AttachedPolicy, PolicySpec } from '../Types';
import PolicyConfigurationEditDrawer from '../GlobalSpecificComponents/PolicyConfigurationEditDrawer';
import GlobalPolicyContext from '../GlobalPolicyContext';

interface AttachedPolicyCardProps {
    policyObj: AttachedPolicy;
    currentPolicyList: AttachedPolicy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    currentFlow: string;
    verb: string;
    target: string;
    allPolicies: PolicySpec[] | null;
    isAPILevelPolicy: boolean;
}

/**
 * Renders a single sortable policy card.
 * @param {any} AttachedPolicyCardProps Input props from parent components.
 * @returns {TSX} Sortable attached policy card UI.
 */
const AttachedPolicyCard: FC<AttachedPolicyCardProps> = ({
    policyObj,
    currentPolicyList,
    setCurrentPolicyList,
    currentFlow,
    verb,
    target,
    allPolicies,
    isAPILevelPolicy,
}) => {
    
    const { api } = useContext<any>(ApiContext);
    const { deleteGlobalOperation } = useContext<any>(GlobalPolicyContext);
    const [drawerOpen, setDrawerOpen] = useState(false);
    

    /**
     * Handle policy delete
     * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event event
     */
    const handleDelete = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const filteredList = currentPolicyList.filter(
            (policy) => policy.uniqueKey !== policyObj.uniqueKey,
        );
        const policyToDelete = currentPolicyList.find(
            (policy) => policy.uniqueKey === policyObj.uniqueKey,
        );
        setCurrentPolicyList(filteredList);
        deleteGlobalOperation(
            policyToDelete?.uniqueKey,
            currentFlow,
        );
        event.stopPropagation();
        event.preventDefault();
    };

    /**
     * Handle policy download
     * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event event
     */
    const handlePolicyDownload = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        event.preventDefault();
        if (policyObj.isAPISpecific) {
            const globalPolicyContentPromise = API.getOperationPolicyContent(
                policyObj.id,
                api.id,
            );
            globalPolicyContentPromise
                .then((globalPolicyResponse) => {
                    Utils.forceDownload(globalPolicyResponse);
                })
                .catch(() => {
                    Alert.error(
                        <FormattedMessage
                            id='Global.Details.Policies.AttachedPolicyCard.apiSpecificPolicy.download.error'
                            defaultMessage='Something went wrong while downloading the policy'
                        />,
                    );
                });
        } else {
            const commonPolicyContentPromise = API.getCommonOperationPolicyContent(
                policyObj.id,
            );
            commonPolicyContentPromise
                .then((commonPolicyResponse) => {
                    Utils.forceDownload(commonPolicyResponse);
                })
                .catch(() => {
                    Alert.error(
                        <FormattedMessage
                            id='Global.Details.Policies.AttachedPolicyCard.commonPolicy.download.error'
                            defaultMessage='Something went wrong while downloading the policy'
                        />,
                    );
                });
        }
    };

    const handleDrawerOpen = () => {
        if (policyObj.id !== '') {
            /**
             * Drawer will only appear for policies that have an ID.
             * Note that a migrated policy will have an empty string as the ID at the initial stage.
             */
            setDrawerOpen(true);
        }
    };

    return (
        <AttachedPolicyCardShared
            policyObj={policyObj}
            currentFlow={currentFlow}
            verb={verb}
            target={target}
            allPolicies={allPolicies}
            isAPILevelPolicy={isAPILevelPolicy}
            drawerOpen={drawerOpen}
            handleDrawerOpen={handleDrawerOpen}
            handlePolicyDownload={handlePolicyDownload}
            handleDelete={handleDelete}
            setDrawerOpen={setDrawerOpen}
            PolicyConfigurationEditDrawer={PolicyConfigurationEditDrawer}
        />
    );
};

export default AttachedPolicyCard;
