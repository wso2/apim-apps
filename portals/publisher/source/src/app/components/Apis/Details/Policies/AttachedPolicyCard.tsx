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

import React, { CSSProperties, FC, KeyboardEvent, MouseEvent, useContext, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListItemIcon } from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import { Alert } from 'AppComponents/Shared';
import { Drawer, makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import { Settings, Close } from '@material-ui/icons';
import Divider from '@material-ui/core/Divider';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import API from 'AppData/api.js';
import ApiContext from '../components/ApiContext';
import Utils from 'AppData/Utils';
import type { Policy } from './Types';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme: any) => ({
    drawerPaper: {
        backgroundColor: 'white',
    },
    actionsBox: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1em',
    },
}));

interface DragItem {
    index: number;
    id: string;
    type: string;
}

interface AttachedPolicyCardProps {
    policyObj: Policy;
    currentPolicyList: Policy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<Policy[]>>;
    currentFlow: string;
}

/**
 * Renders a single sortable policy card.
 * @param {any} AttachedPolicyCardProps Input props from parent components.
 * @returns {TSX} Sortable attached policy card UI.
 */
const AttachedPolicyCard: FC<AttachedPolicyCardProps> = ({
    policyObj, currentPolicyList, setCurrentPolicyList, currentFlow
}) => {
    const classes = useStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { api } = useContext<any>(ApiContext);
    const policyColor = Utils.stringToColor(policyObj.displayName);
    const policyBackgroundColor = drawerOpen ? `rgba(${Utils.hexToRGB(policyColor)}, 0.2)` : 'rgba(0, 0, 0, 0)';
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: policyObj.id});
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

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        const filteredList = currentPolicyList.filter((policy) => policy.timestamp !== policyObj.timestamp);
        setCurrentPolicyList(filteredList);
        event.stopPropagation();
        event.preventDefault();
    };

    const handlePolicyDownload = (event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
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

    const toggleDrawer =
        (open: boolean) =>
        (event: KeyboardEvent | MouseEvent) => {
            if (
                event.type === 'keydown' &&
                ((event as KeyboardEvent).key === 'Tab' ||
                    (event as KeyboardEvent).key === 'Shift')
            ) {
                return;
            }

            setDrawerOpen(open);
        };

    return (
        <>
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={toggleDrawer(true)}>
                <Tooltip key={policyObj.id} title={policyObj.displayName} placement='top'>
                    <Avatar
                        style={{
                            margin: '0.2em',
                            backgroundColor: policyColor,
                        }}
                        { ...Utils.stringAvatar(policyObj.displayName.toUpperCase())}
                    />
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
            <Drawer
                anchor={'right'}
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                classes={{ paper: classes.drawerPaper }}
                key={policyObj.id}
            >
                <Box role='presentation'>
                    <List>
                        <ListItem key={'policy-config'}>
                        <ListItemIcon>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText primary={'Configure'} />
                        <ListItemIcon>
                            <IconButton onClick={toggleDrawer(false)}>
                                <Close />
                            </IconButton>
                        </ListItemIcon>
                        </ListItem>
                    </List>
                    <Divider />
                </Box>
            </Drawer>
        </>
    );
};

export default AttachedPolicyCard;
