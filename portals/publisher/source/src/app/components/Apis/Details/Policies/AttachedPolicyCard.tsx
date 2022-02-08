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
import { useDrag, useDrop, DropTargetMonitor, DragSourceMonitor } from 'react-dnd';
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
import { XYCoord } from 'dnd-core'
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

// interface MovableItem {
//     index: number;
//     id: string;
//     type: string;
// }

interface AttachedPolicyCardProps {
    index: number;
    policyObj: Policy;
    movePolicyCard: (dragIndex: number, hoverIndex: number) => void;
    currentPolicyList: Policy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<Policy[]>>;
    currentFlow: string;
}

/**
 * Renders a single draggable policy card.
 * @param {any} AttachedPolicyCardProps Input props from parent components.
 * @returns {TSX} Draggable Policy card UI.
 */
const AttachedPolicyCard: FC<AttachedPolicyCardProps> = ({
    index, policyObj, movePolicyCard, currentPolicyList, setCurrentPolicyList, currentFlow
}) => {
    const classes = useStyles();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null)
    const policyColor = Utils.stringToColor(policyObj.displayName);
    const policyBackgroundColor = drawerOpen ? `rgba(${Utils.hexToRGB(policyColor)}, 0.2)` : 'rgba(0, 0, 0, 0)';

    const [, drop] = useDrop({
        accept: `attachedPolicyCard-${currentFlow}`,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item: any, monitor: DropTargetMonitor) {
            if (!ref.current) {
                return
            }
            const dragIndex = item.index;
            const hoverIndex = index;
        
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
        
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
        
            // Get vertical middle
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
        
            // Get pixels to the top
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
        
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
        
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
        
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
        
            // Time to actually perform the action
            movePolicyCard(dragIndex, hoverIndex);
        
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
        },
    })

    const [{ isDragging }, drag] = useDrag({
        type: `attachedPolicyCard-${currentFlow}`,
        item: { index, droppedPolicy: policyObj },
        collect: (monitor: DragSourceMonitor) => ({
          isDragging: monitor.isDragging(),
        }),
      })

    const opacity = isDragging ? 0 : 1;

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

    drag(drop(ref));

    return (
        <>
            <div
                ref={drag}
                style={{
                    ...style,
                    borderColor: policyColor,
                    marginLeft: '0.2em',
                    marginRight: '0.2em',
                    backgroundColor: policyBackgroundColor,
                }}
                onClick={toggleDrawer(true)}
            >
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
