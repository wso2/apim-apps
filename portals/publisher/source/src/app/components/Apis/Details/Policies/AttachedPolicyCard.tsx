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

import React, { CSSProperties, FC, KeyboardEvent, MouseEvent, useRef, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { useDrag } from 'react-dnd';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Icon, ListItemIcon } from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { Drawer, makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import { Settings, Close } from '@material-ui/icons';
import Divider from '@material-ui/core/Divider';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Utils from 'AppData/Utils';
import type { Policy } from './Types';

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

const style: CSSProperties = {
    border: '2px solid',
    height: '90%',
    cursor: 'move',
    borderRadius: '0.3em',
    padding: '0.2em'
};

interface DragItem {
    index: number;
    policy: Policy
}

interface AttachedPolicyCardProps {
    policyObj: Policy;
    movePolicyCard: (dragIndex: number, hoverIndex: number) => void;
    currentPolicyList: Policy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<Policy[]>>;
}

/**
 * Renders a single draggable policy card.
 * @param {any} AttachedPolicyCardProps Input props from parent components.
 * @returns {TSX} Draggable Policy card UI.
 */
const AttachedPolicyCard: FC<AttachedPolicyCardProps> = ({
    policyObj, movePolicyCard, currentPolicyList, setCurrentPolicyList
}) => {
    const classes = useStyles();

    // const [{ handlerId }, drag] = useDrag(
    //     () => ({
    //         type: 'policy',
    //         options: {
    //             dropEffect: showCopyIcon ? 'copy' : 'move',
    //         },
    //         collect: (monitor) => ({
    //             opacity: monitor.isDragging() ? 0.4 : 1,
    //         }),
    //     }),
    //     [showCopyIcon],
    // );

    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        const filteredList = currentPolicyList.filter((policy) => policy.timestamp !== policyObj.timestamp);
        setCurrentPolicyList(filteredList);
        event.stopPropagation();
        event.preventDefault();
    };

    const handlePolicyDownload = () => {

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

    const policyColor = Utils.stringToColor(policyObj.name);
    const policyBackgroundColor = drawerOpen ? `rgba(${Utils.hexToRGB(policyColor)}, 0.2)` : 'rgba(0, 0, 0, 0)';

    return (
        <>
            <div
                // ref={drag}
                style={{
                    ...style,
                    borderColor: policyColor,
                    marginLeft: '0.2em',
                    marginRight: '0.2em',
                    backgroundColor: policyBackgroundColor,
                }}
                onClick={toggleDrawer(true)}
            >
                <Tooltip key={policyObj.id} title={policyObj.name} placement='top'>
                    <Avatar
                        style={{
                            margin: '0.2em',
                            backgroundColor: policyColor,
                        }}
                        { ...Utils.stringAvatar(policyObj.name.toUpperCase())}
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
                        {/* <Icon onClick={handlePolicyDownload}>vertical_align_bottom</Icon> */}
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
