/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useToolSelection } from './hooks/useToolSelection';
import TransferList from './components/TransferList';

const ToolSelection = ({ operations, onValidate, inputsDispatcher }) => {
    const {
        checked,
        availableOperations,
        selectedOperations,
        getCheckedItemsInList,
        handleToggle,
        numberOfChecked,
        handleToggleAll,
        handleCheckedObjectsRight,
        handleCheckedObjectsLeft,
    } = useToolSelection(operations || [], onValidate, inputsDispatcher);

    return (
        <TransferList
            availableOperations={availableOperations}
            selectedOperations={selectedOperations}
            checked={checked}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            onMoveRight={handleCheckedObjectsRight}
            onMoveLeft={handleCheckedObjectsLeft}
            getCheckedItemsInList={getCheckedItemsInList}
            numberOfChecked={numberOfChecked}
        />
    );
};

ToolSelection.propTypes = {
    operations: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        target: PropTypes.string,
        verb: PropTypes.string,
    })),
    onValidate: PropTypes.func.isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
};

ToolSelection.defaultProps = {
    operations: [],
};

export default ToolSelection;
