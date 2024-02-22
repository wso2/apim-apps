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

import React, { CSSProperties, FC } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Utils from 'AppData/Utils';
import type { AttachedPolicy, PolicySpec } from './Types';

const PREFIX = 'AttachedPolicyCardShared';

const classes = {
    actionsBox: `${PREFIX}-actionsBox`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(() => ({
    [`& .${classes.actionsBox}`]: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1em',
    }
}));

interface AttachedPolicyCardSharedProps {
    policyObj: AttachedPolicy;
    currentFlow: string;
    verb: string;
    target: string;
    allPolicies: PolicySpec[] | null;
    isAPILevelPolicy: boolean;
    drawerOpen: any;
    handleDrawerOpen: () => void;
    handlePolicyDownload: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    handleDelete: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    setDrawerOpen: React.Dispatch<React.SetStateAction<any>>;
    PolicyConfigurationEditDrawer: any;
}

/**
 * Renders a single sortable policy card.
 * @param {any} AttachedPolicyCardProps Input props from parent components.
 * @returns {TSX} Sortable attached policy card UI.
 */
const AttachedPolicyCardShared: FC<AttachedPolicyCardSharedProps> = ({
    policyObj,
    currentFlow,
    verb,
    target,
    allPolicies,
    isAPILevelPolicy,
    drawerOpen,
    handleDrawerOpen,
    handlePolicyDownload,
    handleDelete,
    setDrawerOpen,
    PolicyConfigurationEditDrawer
}) => {

    const policyColor = Utils.stringToColor(policyObj.displayName);
    const policyBackgroundColor = drawerOpen
        ? `rgba(${Utils.hexToRGB(policyColor)}, 0.2)`
        : 'rgba(0, 0, 0, 0)';
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: policyObj.uniqueKey.toString() });
    
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
    return (
        (<Root>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={handleDrawerOpen}
                onKeyDown={handleDrawerOpen}
            >
                <Tooltip
                    key={policyObj.id}
                    title={`${policyObj.displayName} : ${policyObj.version}`}
                    placement='top'
                >
                    <Avatar
                        style={{
                            margin: '0.2em',
                            backgroundColor: policyColor,
                        }}
                    >
                        {Utils.stringAvatar(
                            policyObj.displayName.toUpperCase(),
                        )}
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
                        disabled={policyObj.id === ''} // Disabling policy download for migrated policy
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
                    isAPILevelPolicy={isAPILevelPolicy}
                />
            )}
        </Root>)
    );
}

export default AttachedPolicyCardShared;
