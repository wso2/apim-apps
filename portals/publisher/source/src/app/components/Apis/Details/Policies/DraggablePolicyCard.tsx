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

import React, { CSSProperties } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { useDrag } from 'react-dnd';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { makeStyles } from '@material-ui/core';
import type { Policy } from './Types';

const useStyles = makeStyles(() => ({
    policyCardText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
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
}

/**
 * Renders a single draggable policy block.
 * @param {any} DraggablePolicyCardProps Input props from parent components.
 * @returns {TSX} Draggable Policy card UI.
 */
const DraggablePolicyCard: React.FC<DraggablePolicyCardProps> = ({
    policyObj,
    showCopyIcon,
}) => {
    const classes = useStyles();
    const [{ opacity }, drag] = useDrag(
        () => ({
            type: `policyCard-${policyObj.id}`,
            item: {droppedPolicy: policyObj},
            options: {
                dropEffect: showCopyIcon ? 'copy' : 'move',
            },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? 0.4 : 1,
            }),
        }),
        [showCopyIcon],
    );

    const stringToColor = (string: string) => {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xaa;
            color += `00${value.toString(16)}`.substr(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    };

    const stringAvatar = (name: string) => {
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: name.split(' ').length > 1 
                ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`
                : `${name.split(' ')[0][0]}`,
        };
    };

    return (
        <div
            ref={drag}
            style={{
                ...style,
                opacity,
                borderColor: stringToColor(policyObj.name),
            }}
        >
            <ListItem key={policyObj.id} style={{ maxHeight: '100%', overflow: 'auto'}}>
                <ListItemAvatar>
                    <Avatar
                        style={{
                            backgroundColor: stringToColor(policyObj.name),
                        }}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        { ...stringAvatar(policyObj.name.toUpperCase())}
                    />
                </ListItemAvatar>
                <ListItemText
                    id={policyObj.name}
                    primary={policyObj.name}
                    classes={{
                        primary: classes.policyCardText
                    }} 
                    // primaryTypographyProps={{ variant: 'subtitle2' }}
                />
            </ListItem>
        </div>
    );
};

export default DraggablePolicyCard;
