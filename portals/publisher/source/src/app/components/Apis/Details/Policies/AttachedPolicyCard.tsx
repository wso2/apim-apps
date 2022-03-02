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
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Alert } from 'AppComponents/Shared';
import { makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import API from 'AppData/api.js';
import Utils from 'AppData/Utils';
import { FormattedMessage } from 'react-intl';
import ApiContext from '../components/ApiContext';
import type { AttachedPolicy, PolicySpec } from './Types';
import PolicyConfigurationEditDrawer from './PolicyConfigurationEditDrawer';
import ApiOperationContext from "./ApiOperationContext";

const useStyles = makeStyles(() => ({
    drawerPaper: {
        backgroundColor: 'white',
    },
    actionsBox: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1em',
    },
}));

interface AttachedPolicyCardProps {
    policyObj: AttachedPolicy;
    currentPolicyList: AttachedPolicy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    currentFlow: string;
    verb: string;
    target: string;
    allPolicies: PolicySpec[] | null;
}

/**
 * Renders a single sortable policy card.
 * @param {any} AttachedPolicyCardProps Input props from parent components.
 * @returns {TSX} Sortable attached policy card UI.
 */
const AttachedPolicyCard: FC<AttachedPolicyCardProps> = ({
    policyObj, currentPolicyList, setCurrentPolicyList, currentFlow, verb, target,
    allPolicies
}) => {
    const classes = useStyles();
    const { api } = useContext<any>(ApiContext);
    const { deleteApiOperation } = useContext<any>(ApiOperationContext);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const policyColor = Utils.stringToColor(policyObj.displayName);
    const policyBackgroundColor = drawerOpen ? `rgba(${Utils.hexToRGB(policyColor)}, 0.2)` : 'rgba(0, 0, 0, 0)';
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: policyObj.uniqueKey.toString()});
    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: '2px solid',
        height: '90%',
        cursor: 'move',
        borderRadius: '0.3em',
        padding: '0.2em',
        borderColor: policyColor,
        marginLeft: '0.2em',
        marginRight: '0.2em',
        backgroundColor: policyBackgroundColor,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDelete = (event: any) => {
        const filteredList = currentPolicyList.filter((policy) => policy.uniqueKey !== policyObj.uniqueKey);
        const policyToDelete = currentPolicyList.find((policy) => policy.uniqueKey === policyObj.uniqueKey);
        setCurrentPolicyList(filteredList);
        deleteApiOperation(policyToDelete?.uniqueKey, target, verb, currentFlow);
        event.stopPropagation();
        event.preventDefault();
    };

    const handlePolicyDownload = (event: any) => {
        event.stopPropagation();
        event.preventDefault();
        const commonPolicyContentPromise = API.getCommonOperationPolicyContent(policyObj.id);
        commonPolicyContentPromise
            .then((commonPolicyResponse) => {
                Utils.forceDownload(commonPolicyResponse);
            })
            .catch(() => {
                const apiPolicyContentPromise = API.getOperationPolicyContent(policyObj.id, api.id);
                apiPolicyContentPromise
                    .then((apiPolicyResponse) => {
                        Utils.forceDownload(apiPolicyResponse);
                    })
                    .catch((error) => {
                        if (process.env.NODE_ENV !== 'production') {
                            console.log(error);
                            Alert.error(
                                <FormattedMessage
                                    id='Policies.ViewPolicy.download.error'
                                    defaultMessage='Something went wrong while downloading the policy'
                                />
                            );
                        }
                    });
            });
    }

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={handleDrawerOpen}
                onKeyDown={handleDrawerOpen}
            >
                <Tooltip key={policyObj.id} title={policyObj.displayName} placement='top'>
                    <Avatar
                        style={{
                            margin: '0.2em',
                            backgroundColor: policyColor,
                        }}
                    >
                        {Utils.stringAvatar(policyObj.displayName.toUpperCase())}
                    </Avatar>
                </Tooltip>
                <Box className={classes.actionsBox}>
                    <IconButton
                        key={`${policyObj.id}-download`}
                        aria-label='Download policy'
                        size='small'
                        onClick={handlePolicyDownload}
                        disableFocusRipple
                        disableRipple
                    >
                        <CloudDownloadIcon />
                    </IconButton>
                    <IconButton
                        key={`${policyObj.id}-delete`}
                        aria-label='delete attached policy'
                        size='small'
                        onClick={handleDelete}
                        disableFocusRipple
                        disableRipple
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </div>
            {drawerOpen && (
                <PolicyConfigurationEditDrawer
                    policyObj={policyObj}
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                    currentFlow={currentFlow}
                    target={target}
                    verb={verb}
                    allPolicies={allPolicies}
                />
            )}
        </>
    );
};

export default AttachedPolicyCard;
