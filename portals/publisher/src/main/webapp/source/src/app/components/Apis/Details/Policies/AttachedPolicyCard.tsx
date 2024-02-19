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

import React, { CSSProperties, FC, useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Alert } from 'AppComponents/Shared';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import API from 'AppData/api.js';
import Utils from 'AppData/Utils';
import { FormattedMessage } from 'react-intl';
import AttachedPolicyCardShared from 'AppComponents/Shared/PoliciesUI/AttachedPolicyCard';
import ApiContext from '../components/ApiContext';
import type { AttachedPolicy, PolicySpec } from './Types';
import PolicyConfigurationEditDrawer from './PolicyConfigurationEditDrawer';
import ApiOperationContext from './ApiOperationContext';

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
    const { deleteApiOperation } = useContext<any>(ApiOperationContext);
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
        deleteApiOperation(
            policyToDelete?.uniqueKey,
            target,
            verb,
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
            const apiPolicyContentPromise = API.getOperationPolicyContent(
                policyObj.id,
                api.id,
            );
            apiPolicyContentPromise
                .then((apiPolicyResponse) => {
                    Utils.forceDownload(apiPolicyResponse);
                })
                .catch((error) => {
                    console.error(error);
                    Alert.error(
                        <FormattedMessage
                            id='Apis.Details.Policies.AttachedPolicyCard.apiSpecificPolicy.download.error'
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
                .catch((error) => {
                    console.error(error);
                    Alert.error(
                        <FormattedMessage
                            id='Apis.Details.Policies.AttachedPolicyCard.commonPolicy.download.error'
                            defaultMessage='Something went wrong while downloading the policy'
                        />,
                    );
                });
        }
    };

    const handleDrawerOpen = () => {
        if (policyObj.id !== '') {
            // Drawer will only appear for policies that have an ID
            // Note that a migrated policy will have an empty string as the ID at the initial stage
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
