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

import React, { CSSProperties, useMemo, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { useDrag } from 'react-dnd';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { Box, makeStyles, Theme, Tooltip } from '@material-ui/core';
import Utils from 'AppData/Utils';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IconButton from '@material-ui/core/IconButton';
import { FormattedMessage } from 'react-intl';
import Backdrop from '@material-ui/core/Backdrop';
import classNames from 'classnames';
import type { Policy } from './Types';
import ViewPolicy from './ViewPolicy';
import DeletePolicy from './DeletePolicy';

const useStyles = makeStyles((theme: Theme) => ({
    policyCardText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    outerDiv: {
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'center',
    },
    listItem: {
        maxHeight: '100%',
        overflow: 'auto',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        backdropFilter: 'blur(1px)',
    },
    policyActions: {
        visibility: 'hidden',
        '&:hover': {
            visibility: 'inherit',
        }
    }
}));

const style: CSSProperties = {
    border: '2px solid',
    marginTop: '0.4rem',
    cursor: 'move',
    borderRadius: '0.3em',
};

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
    fetchPolicies
}) => {
    const classes = useStyles();
    const [hovered, setHovered] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: `policyCard-${policyObj.id}`,
            item: {droppedPolicy: policyObj},
            options: {
                dropEffect: showCopyIcon ? 'copy' : 'move',
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [showCopyIcon],
    );

    const containerStyle = useMemo(
        () => ({
            ...style,
            opacity: (isDragging) ? 0.4 : 1,
            borderColor: Utils.stringToColor(policyObj.displayName),
            width: '100%',
        }),
        [isDragging],
    )

    const handleViewPolicy = () => {
        setDialogOpen(true);
    }

    const handleViewPolicyClose = () => {
        setDialogOpen(false);
    }

    return (
        <>
            <div className={classes.outerDiv}>
                <div
                    ref={drag}
                    style={containerStyle}
                >
                    <ListItem
                        key={policyObj.id}
                        className={classes.listItem}
                        onMouseOver={() => setHovered(true)}
                        onMouseOut={() => setHovered(false)}
                    >
                        <ListItemAvatar>
                            <Avatar
                                style={{
                                    backgroundColor: Utils.stringToColor(policyObj.displayName),
                                }}
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                { ...Utils.stringAvatar(policyObj.displayName.toUpperCase())}
                            />
                        </ListItemAvatar>
                        <ListItemText
                            id={policyObj.displayName}
                            primary={policyObj.displayName}
                            classes={{
                                primary: classes.policyCardText
                            }} 
                        />
                        <Box
                            display='flex'
                            justifyContent='flex-end'
                            height='35px'
                            className={classNames({
                                [classes.policyActions]: !hovered,
                            })}
                        >
                            <Tooltip
                                placement='top'
                                title={
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PolicyList.Policy.View'
                                        defaultMessage='View'
                                    />
                                }
                            >
                                <IconButton
                                    onClick={handleViewPolicy}
                                    aria-label={'view-' + policyObj.name}
                                >
                                    <VisibilityIcon />
                                </IconButton>
                            </Tooltip>
                            {isLocalToAPI && (
                                <DeletePolicy
                                    policyId={policyObj.id}
                                    policyName={policyObj.displayName}
                                    fetchPolicies={fetchPolicies}
                                />
                            )}
                        </Box>
                    </ListItem>
                </div>
            </div>
            <Backdrop
                className={classes.backdrop}
                open={dialogOpen}
                onClick={handleViewPolicyClose}    
            >
                <ViewPolicy
                    dialogOpen={dialogOpen}
                    handleDialogClose={handleViewPolicyClose}
                    policyObj={policyObj}
                    isLocalToAPI={isLocalToAPI}
                />
            </Backdrop>
        </>
    );
};

export default DraggablePolicyCard;
