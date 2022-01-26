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

import React, {
    useState, useEffect, CSSProperties, FC, useRef
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Box, Grid,
} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import DeleteIcon from '@material-ui/icons/Delete';
import { useDrag } from 'react-dnd'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Policy {
  id: number;
  name: string;
  description: string;
  flows: string[];
}

interface DraggablePolicyCardProps {
  policyObj: Policy;
}

/**
 * Renders a single draggable policy block.
 * @param {any} DraggablePolicyCardProps Input props from parent components.
 * @returns {TSX} Draggable Policy card UI.
 */
const DraggablePolicyCard: React.FC<DraggablePolicyCardProps> = ({
    policyObj
}) => {
    // const [{ isDragging }, drag] = useDrag(() => ({
    //     type: 'box',
    //     item: { policyObj.name },
    //     end: (item, monitor) => {
    //         const dropResult = monitor.getDropResult<Policy>()
    //         if (item && dropResult) {
    //             alert(`You dropped ${item.name} into ${dropResult.name}!`)
    //         }
    //     },
    //     collect: (monitor) => ({
    //         isDragging: monitor.isDragging(),
    //         handlerId: monitor.getHandlerId(),
    //     }),
    // }))
    // const opacity = isDragging ? 0.5 : 1

    return (
        <>
            {/* <Draggable draggableId={policy.id.toString()} index={index}>
                {(provided, snapshot) => (
                    <form
                    // onSubmit={(e) => handleEdit(e, policy.id)}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className={`policy__single ${snapshot.isDragging ? "drag" : ""}`}
                    >
                        <Avatar {...stringAvatar(policyName)} />
                        <div>
                            <span className='icon' onClick={() => handleDelete(policy.id)}>
                                <DeleteIcon />
                            </span>
                        </div>
                    </form>
                )}
            </Draggable> */}
            <h2>{policyObj.name}</h2>
        </>
    );
};

export default DraggablePolicyCard;

// import { forwardRef, useImperativeHandle, useRef } from 'react'
// import {
//   ConnectDropTarget,
//   ConnectDragSource,
//   DropTargetMonitor,
//   DragSourceMonitor,
// } from 'react-dnd'
// import {
//   DragSource,
//   DropTarget,
//   DropTargetConnector,
//   DragSourceConnector,
// } from 'react-dnd'
// import { ItemTypes } from './ItemTypes'
// import { XYCoord } from 'dnd-core'
// import { CardDragObject } from './ItemTypes'

// const style = {
//   border: '1px dashed gray',
//   padding: '0.5rem 1rem',
//   marginBottom: '.5rem',
//   backgroundColor: 'white',
//   cursor: 'move',
// }

// export interface CardProps {
//   id: any
//   text: string
//   index: number
//   moveCard: (dragIndex: number, hoverIndex: number) => void

//   isDragging: boolean
//   connectDragSource: ConnectDragSource
//   connectDropTarget: ConnectDropTarget
// }

// interface CardInstance {
//   getNode(): HTMLDivElement | null
// }

// const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
//   { text, isDragging, connectDragSource, connectDropTarget },
//   ref,
// ) {
//   const elementRef = useRef(null)
//   connectDragSource(elementRef)
//   connectDropTarget(elementRef)

//   const opacity = isDragging ? 0 : 1
//   useImperativeHandle<any, CardInstance>(ref, () => ({
//     getNode: () => elementRef.current,
//   }))
//   return (
//     <div ref={elementRef} style={{ ...style, opacity }}>
//       {text}
//     </div>
//   )
// })

// export default DropTarget(
//   ItemTypes.CARD,
//   {
//     hover(
//       props: CardProps,
//       monitor: DropTargetMonitor,
//       component: CardInstance,
//     ) {
//       if (!component) {
//         return null
//       }
//       // node = HTML Div element from imperative API
//       const node = component.getNode()
//       if (!node) {
//         return null
//       }

//       const dragIndex = monitor.getItem<CardDragObject>().index
//       const hoverIndex = props.index

//       // Don't replace items with themselves
//       if (dragIndex === hoverIndex) {
//         return
//       }

//       // Determine rectangle on screen
//       const hoverBoundingRect = node.getBoundingClientRect()

//       // Get vertical middle
//       const hoverMiddleY =
//         (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

//       // Determine mouse position
//       const clientOffset = monitor.getClientOffset()

//       // Get pixels to the top
//       const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

//       // Only perform the move when the mouse has crossed half of the items height
//       // When dragging downwards, only move when the cursor is below 50%
//       // When dragging upwards, only move when the cursor is above 50%

//       // Dragging downwards
//       if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
//         return
//       }

//       // Dragging upwards
//       if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
//         return
//       }

//       // Time to actually perform the action
//       props.moveCard(dragIndex, hoverIndex)

//       // Note: we're mutating the monitor item here!
//       // Generally it's better to avoid mutations,
//       // but it's good here for the sake of performance
//       // to avoid expensive index searches.
//       monitor.getItem<CardDragObject>().index = hoverIndex
//     },
//   },
//   (connect: DropTargetConnector) => ({
//     connectDropTarget: connect.dropTarget(),
//   }),
// )(
//   DragSource(
//     ItemTypes.CARD,
//     {
//       beginDrag: (props: CardProps) => ({
//         id: props.id,
//         index: props.index,
//       }),
//     },
//     (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
//       connectDragSource: connect.dragSource(),
//       isDragging: monitor.isDragging(),
//     }),
//   )(Card),
// )


