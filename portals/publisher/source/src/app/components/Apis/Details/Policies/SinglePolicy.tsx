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

import React, { useEffect, useState } from "react";
import { useRef } from "react";
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import Avatar from '@material-ui/core/Avatar';
import DeleteIcon from '@material-ui/icons/Delete';
import { Draggable } from "react-beautiful-dnd";

interface Policy {
  id: number;
  policy: string;
  description: string;
  flows: string[];
  isDone: boolean;
}

const SinglePolicy: React.FC<{
  index: number;
  policy: Policy;
  policies: Array<Policy>;
  setPolicies: React.Dispatch<React.SetStateAction<Array<Policy>>>;
}> = ({ index, policy, policies, setPolicies }) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [editPolicy, setEditPolicy] = useState<string>(policy.policy);
  const [policyName, setPolicyName] = useState<string>(policy.policy);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [edit]);

  const handleEdit = (e: React.FormEvent, id: number) => {
    e.preventDefault();
    setPolicies(
      policies.map((policy) => (policy.id === id ? { ...policy, todo: editPolicy } : policy))
    );
    setEdit(false);
  };

  const handleDelete = (id: number) => {
    setPolicies(policies.filter((policy) => policy.id !== id));
  };

  const handleDone = (id: number) => {
    setPolicies(
      policies.map((policy) =>
      policy.id === id ? { ...policy, isDone: !policy.isDone } : policy
      )
    );
  };

  const stringToColor = (word:string) => {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < word.length; i += 1) {
      hash = word.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.substr(-2);
    }
    /* eslint-enable no-bitwise */
  
    return color;
  }
  
  const stringAvatar = (name:string)  => {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
  }

  return (
    <Draggable draggableId={policy.id.toString()} index={index}>
      {(provided, snapshot) => (
        <form
          onSubmit={(e) => handleEdit(e, policy.id)}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className={`policy__single ${snapshot.isDragging ? "drag" : ""}`}
        >
          {edit ? (
            <input
              value={editPolicy}
              onChange={(e) => setEditPolicy(e.target.value)}
              className="todos__single--text"
              ref={inputRef}
            />
          ) : policy.isDone ? (
            <s className="todos__single--text">{policy.policy}</s>
          ) : (
            // <span className="todos__single--text">{policy.policy}</span>
            <Avatar {...stringAvatar(policyName)} />
          )}
          <div>
            <span
              className="icon"
              onClick={() => {
                if (!edit && !policy.isDone) {
                  setEdit(!edit);
                }
              }}
            >
              <EditIcon />
            </span>
            <span className="icon" onClick={() => handleDelete(policy.id)}>
              <DeleteIcon />
            </span>
            <span className="icon" onClick={() => handleDone(policy.id)}>
              <SaveIcon />
            </span>
          </div>
        </form>
      )}
    </Draggable>
  );
};

export default SinglePolicy;