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

import React, { useState, CSSProperties, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Utils from 'AppData/Utils';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import { FormattedMessage } from 'react-intl';
import { useDrag } from 'react-dnd';
import type { Policy } from '../Types';

const PREFIX = 'DraggablePolicyCard';

const classes = {
    policyCardText: `${PREFIX}-policyCardText`,
    listItem: `${PREFIX}-listItem`,
    policyActions: `${PREFIX}-policyActions`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
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
}

/**
 * Renders a single draggable policy block.
 * @param {any} DraggablePolicyCardProps - Input props from parent components.
 * @returns {TSX} - Draggable Policy card UI.
 */
const DraggablePolicyCard: React.FC<DraggablePolicyCardProps> = ({
    policyObj,
    showCopyIcon,
    isLocalToAPI,
}) => {
    const [hovered, setHovered] = useState(false);

    /**
     * React DnD Library has been used here.
     * React DnD hook to make the policy card draggable.
     */
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: `policyCard-${policyObj.id}`,
            item: { droppedPolicy: policyObj },
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
            opacity: isDragging ? 0.4 : 1,
            borderColor: Utils.stringToColor(policyObj.displayName),
            width: '100%',
        }),
        [isDragging],
    );

    /**
     * Policy List of the Global Policies component only contains global policies (No policies local to API).
     * Policy Lists each single Policy's isAPISpecific will be false in that case. 
     * This additional layer is added to avoid rendering if something went wrong.
     */
    if (isLocalToAPI) {
        return null;
    }

    return (
        (<Root>
            <Box display='flex' flexDirection='row' alignItems='center'>
                <div ref={drag} style={containerStyle}>
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
                            <Link to={`/policies/${policyObj.id}/view`}>
                                <Tooltip
                                    placement='top'
                                    title={
                                        <FormattedMessage
                                            id='Global.Details.Policies.DraggablePolicyCard.policy.view'
                                            defaultMessage='View'
                                        />
                                    }
                                >                         
                                    <IconButton
                                        aria-label={'view-' + policyObj.name}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>      
                                </Tooltip>
                            </Link>
                        </Box>
                    </ListItem>
                </div>
            </Box>
        </Root>)
    );
};

export default DraggablePolicyCard;
