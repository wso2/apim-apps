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
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Utils from 'AppData/Utils';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import { FormattedMessage } from 'react-intl';
import { useDrag } from 'react-dnd';
import type { Policy } from './Types';
import ViewPolicy from './ViewPolicy';
import DeletePolicy from './DeletePolicy';

const PREFIX = 'DraggablePolicyCard';

const classes = {
    policyCardText: `${PREFIX}-policyCardText`,
    listItem: `${PREFIX}-listItem`,
    policyActions: `${PREFIX}-policyActions`
};


const Root = styled('div')(() => ({
    [`& .${classes.policyCardText}`]: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },

    [`& .${classes.listItem}`]: {
        maxHeight: '100%',
        overflow: 'auto',
    },

    [`& .${classes.policyActions}`]: {
        visibility: 'hidden',
        '&:hover': {
            visibility: 'inherit',
        },
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
    isReadOnly?: boolean;
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
    isReadOnly = false,
}) => {

    const [hovered, setHovered] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: `policyCard-${policyObj.id}`,
            item: { droppedPolicy: policyObj },
            canDrag: !isReadOnly,
            options: {
                dropEffect: showCopyIcon ? 'copy' : 'move',
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [showCopyIcon, isReadOnly],
    );

    const containerStyle = useMemo(
        () => ({
            ...style,
            opacity: isDragging ? 0.4 : 1,
            borderColor: Utils.stringToColor(policyObj.displayName),
            width: '100%',
            cursor: isReadOnly ? 'default' : 'move',
        }),
        [isDragging, isReadOnly],
    );

    const handleViewPolicy = () => {
        setDialogOpen(true);
    };

    const handleViewPolicyClose = () => {
        setDialogOpen(false);
    };

    return (
        <Root>
            <Box display='flex' flexDirection='row' alignItems='center'>
                <div ref={isReadOnly ? null : drag} style={containerStyle}>
                    <ListItem
                        key={policyObj.id}
                        className={classes.listItem}
                        onMouseOver={() => setHovered(true)}
                        onMouseOut={() => setHovered(false)}
                    >
                        <ListItemAvatar>
                            <Avatar
                                style={{
                                    backgroundColor: Utils.stringToColor(
                                        policyObj.displayName,
                                    ),
                                }}
                            >
                                {Utils.stringAvatar(
                                    policyObj.displayName.toUpperCase(),
                                )}
                            </Avatar>
                        </ListItemAvatar>
                        <Box
                            display='flex-inline'
                            flexDirection='column'
                            sx={{ flexGrow: 1 }}
                            className={classes.policyCardText}
                        >
                            <ListItemText
                                id={policyObj.displayName}
                                primary={policyObj.displayName}
                                classes={{
                                    primary: classes.policyCardText,
                                }}
                            />
                            <ListItemText
                                id={policyObj.version}
                                secondary={policyObj.version}
                                classes={{
                                    secondary: classes.policyCardText,
                                }}
                            />
                        </Box>
                        <Box
                            display='flex'
                            justifyContent='flex-end'
                            className={!hovered ? classes.policyActions : ''}
                        >
                            <Tooltip
                                placement='top'
                                title={
                                    <FormattedMessage
                                        id='Apis.Details.Policies.DraggablePolicyCard.policy.view'
                                        defaultMessage='View'
                                    />
                                }
                            >
                                <IconButton
                                    onClick={handleViewPolicy}
                                    aria-label={'view-' + policyObj.name}
                                    size='large'>
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
            </Box>
            <ViewPolicy
                dialogOpen={dialogOpen}
                handleDialogClose={handleViewPolicyClose}
                policyObj={policyObj}
                isLocalToAPI={isLocalToAPI}
            />
        </Root>
    );
};

export default DraggablePolicyCard;
