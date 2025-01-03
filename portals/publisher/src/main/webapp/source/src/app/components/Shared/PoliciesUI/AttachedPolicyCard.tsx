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
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Utils from 'AppData/Utils';
import type { AttachedPolicy, PolicySpec } from './Types';

const PREFIX = 'AttachedPolicyCardShared';

const classes = {
    actionsBox: `${PREFIX}-actionsBox`
};

const COMMON_POLICY = "Common Policy";
const API_POLICY = "API Policy";

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(() => ({
    [`& .${classes.actionsBox}`]: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1em',
    }
}));

interface AttachedPolicyCardSharedBaseProps {
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

// Option 1: `listOriginatedFromCommonPolicies` and `isApiRevision` are provided
interface AttachedPolicyCardWithCommonProps extends AttachedPolicyCardSharedBaseProps {
    listOriginatedFromCommonPolicies: string[];
    isApiRevision: boolean;
}

// Option 2: Neither `listOriginatedFromCommonPolicies` nor `isApiRevision` are provided
interface AttachedPolicyCardWithoutCommonProps extends AttachedPolicyCardSharedBaseProps {
    listOriginatedFromCommonPolicies?: undefined;
    isApiRevision?: undefined;
}

// Combine the two using a union type
type AttachedPolicyCardSharedProps = AttachedPolicyCardWithCommonProps | AttachedPolicyCardWithoutCommonProps;

/**
 * Renders a single sortable policy card.
 * @param {any} AttachedPolicyCardProps Input props from parent components.
 * @returns {TSX} Sortable attached policy card UI.
 */
const AttachedPolicyCardShared: FC<AttachedPolicyCardSharedProps> = (props) => {

    const policyColor = Utils.stringToColor(props.policyObj.displayName);
    const policyBackgroundColor = props.drawerOpen
        ? `rgba(${Utils.hexToRGB(policyColor)}, 0.2)`
        : 'rgba(0, 0, 0, 0)';
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.policyObj.uniqueKey.toString() });
    
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

    if ('listOriginatedFromCommonPolicies' in props) {
        // Props were passed, use `listOriginatedFromCommonPolicies` and `isApiRevision`
        let policyType = COMMON_POLICY;
        if (props.isApiRevision) {
            policyType = "API Policy";
        } else if (props.policyObj.isAPISpecific) {
            if (props.listOriginatedFromCommonPolicies && props.listOriginatedFromCommonPolicies.includes(props.policyObj.id)) {
                policyType = COMMON_POLICY;
            } else {
                policyType = API_POLICY;
            }
        }
        return (
            <Root>
                <div
                    ref={setNodeRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                    onClick={props.handleDrawerOpen}
                    onKeyDown={props.handleDrawerOpen}
                >
                    <Tooltip
                        key={props.policyObj.id}
                        title={
                            <Typography style={{ whiteSpace: 'pre-line' }} variant='caption'>
                                {`*${policyType}\n${props.policyObj.displayName} : ${props.policyObj.version}`}
                            </Typography>
                        }
                        placement='top'
                    >
                        <Avatar
                            style={{
                                margin: '0.2em',
                                backgroundColor: policyColor,
                            }}
                        >
                            {Utils.stringAvatar(
                                props.policyObj.displayName.toUpperCase(),
                            )}
                        </Avatar>
                    </Tooltip>
                    <Box className={classes.actionsBox}>
                        <IconButton
                            key={`${props.policyObj.id}-download`}
                            aria-label='Download policy'
                            size='small'
                            onClick={props.handlePolicyDownload}
                            disableFocusRipple
                            disableRipple
                            disabled={props.policyObj.id === ''} // Disabling policy download for migrated policy
                        >
                            <CloudDownloadIcon />
                        </IconButton>
                        <IconButton
                            key={`${props.policyObj.id}-delete`}
                            aria-label='delete attached policy'
                            size='small'
                            onClick={props.handleDelete}
                            disableFocusRipple
                            disableRipple
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </div>
                {props.drawerOpen && (
                    <props.PolicyConfigurationEditDrawer
                        policyObj={props.policyObj}
                        drawerOpen={props.drawerOpen}
                        setDrawerOpen={props.setDrawerOpen}
                        currentFlow={props.currentFlow}
                        target={props.target}
                        verb={props.verb}
                        allPolicies={props.allPolicies}
                        isAPILevelPolicy={props.isAPILevelPolicy}
                    />
                )}
            </Root>
        );
    } else {
        return (
            <Root>
                <div
                    ref={setNodeRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                    onClick={props.handleDrawerOpen}
                    onKeyDown={props.handleDrawerOpen}
                >
                    <Tooltip
                        key={props.policyObj.id}
                        title={`${props.policyObj.displayName} : ${props.policyObj.version}`}
                        placement='top'
                    >
                        <Avatar
                            style={{
                                margin: '0.2em',
                                backgroundColor: policyColor,
                            }}
                        >
                            {Utils.stringAvatar(
                                props.policyObj.displayName.toUpperCase(),
                            )}
                        </Avatar>
                    </Tooltip>
                    <Box className={classes.actionsBox}>
                        <IconButton
                            key={`${props.policyObj.id}-download`}
                            aria-label='Download policy'
                            size='small'
                            onClick={props.handlePolicyDownload}
                            disableFocusRipple
                            disableRipple
                            disabled={props.policyObj.id === ''} // Disabling policy download for migrated policy
                        >
                            <CloudDownloadIcon />
                        </IconButton>
                        <IconButton
                            key={`${props.policyObj.id}-delete`}
                            aria-label='delete attached policy'
                            size='small'
                            onClick={props.handleDelete}
                            disableFocusRipple
                            disableRipple
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </div>
                {props.drawerOpen && (
                    <props.PolicyConfigurationEditDrawer
                        policyObj={props.policyObj}
                        drawerOpen={props.drawerOpen}
                        setDrawerOpen={props.setDrawerOpen}
                        currentFlow={props.currentFlow}
                        target={props.target}
                        verb={props.verb}
                        allPolicies={props.allPolicies}
                        isAPILevelPolicy={props.isAPILevelPolicy}
                    />
                )}
            </Root>
        );
    }
}

export default AttachedPolicyCardShared;
