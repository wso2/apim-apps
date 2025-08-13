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

import { useState, useEffect } from 'react';

// Helper functions for managing lists and selections
// `listA` is the array of actual items (objects in this case)
// `selectedKeys` is the array of IDs that are currently checked
// `itemKeyExtractor` extracts the unique key (ID) from an item in `listA`
export const getSelectedItems = (listA, selectedKeys, itemKeyExtractor = (item) => item) => {
    const selectedKeysSet = new Set(selectedKeys);
    return listA.filter(item => selectedKeysSet.has(itemKeyExtractor(item)));
};

// `listA` is the array of actual items (objects)
// `keysToRemove` is the array of IDs to remove from `listA`
// `itemKeyExtractor` extracts the unique key (ID) from an item in `listA`
export const getRemainingItems = (listA, keysToRemove, itemKeyExtractor = (item) => item) => {
    const keysToRemoveSet = new Set(keysToRemove);
    return listA.filter(item => !keysToRemoveSet.has(itemKeyExtractor(item)));
};

// `currentCheckedKeys` is the array of currently checked IDs
// `keysToAdd` is the array of IDs to add to `currentCheckedKeys`
export const addKeys = (currentCheckedKeys, keysToAdd) => {
    const newSet = new Set(currentCheckedKeys);
    keysToAdd.forEach(key => newSet.add(key));
    return Array.from(newSet);
};

// `currentCheckedKeys` is the array of currently checked IDs
// `keysToRemove` is the array of IDs to remove from `currentCheckedKeys`
export const removeKeys = (currentCheckedKeys, keysToRemove) => {
    const keysToRemoveSet = new Set(keysToRemove);
    return currentCheckedKeys.filter(key => !keysToRemoveSet.has(key));
};

/**
 * Custom hook for managing tool selection state and operations
 * @param {Array} initialAvailableOperations - Initial list of available operations
 * @param {Function} onValidate - Validation callback function
 * @param {Function} inputsDispatcher - Dispatcher function for form inputs
 * @param {Function} keyExtractor - Function to extract unique key from operation items
 * @param {Function} operationCleaner - Optional function to clean operations before dispatching
 * @returns {Object} Object containing state and handlers for tool selection
 */
export const useToolSelection = (
    initialAvailableOperations = [],
    onValidate,
    inputsDispatcher,
    keyExtractor = (obj) => `${obj.verb}-${obj.target}`,
    operationCleaner = (operations) => operations
) => {
    const [checked, setChecked] = useState([]);
    const [availableOperations, setAvailableOperations] = useState(initialAvailableOperations);
    const [selectedOperations, setSelectedOperations] = useState([]);

    const getCheckedItemsInList = (items, itemKeyExtractor = keyExtractor) => {
        const itemKeys = items.map(itemKeyExtractor);
        return getSelectedItems(itemKeys, checked);
    };

    // Update validation based on selected operations and dispatch to reducer
    useEffect(() => {
        const isValid = selectedOperations.length > 0;
        onValidate(isValid);

        // Clean operations if cleaner function is provided
        const operationsToDispatch = operationCleaner(selectedOperations);

        // Dispatch operations to the reducer
        inputsDispatcher({ action: 'operations', value: operationsToDispatch });
    }, [selectedOperations, onValidate, inputsDispatcher, operationCleaner]);

    const handleToggle = (value, itemKeyExtractor = keyExtractor) => () => {
        const valueKey = itemKeyExtractor(value);
        if (checked.includes(valueKey)) {
            setChecked(removeKeys(checked, [valueKey]));
        } else {
            setChecked(addKeys(checked, [valueKey]));
        }
    };

    const numberOfChecked = (items, itemKeyExtractor = keyExtractor) => {
        const itemKeys = items.map(itemKeyExtractor);
        return getSelectedItems(itemKeys, checked).length;
    };

    const handleToggleAll = (items, itemKeyExtractor = keyExtractor) => () => {
        const itemKeys = items.map(itemKeyExtractor);
        if (numberOfChecked(items, itemKeyExtractor) === items.length) {
            // All are checked, uncheck all of them from this list
            setChecked(removeKeys(checked, itemKeys));
        } else {
            // Not all are checked, check all of them from this list
            setChecked(addKeys(checked, itemKeys));
        }
    };

    const handleCheckedObjectsRight = () => {
        const itemsToMove = getSelectedItems(availableOperations, checked, keyExtractor);
        setSelectedOperations(selectedOperations.concat(itemsToMove));
        // When removing from leftObjects, we need to pass the keys of the items to remove
        setAvailableOperations(
            getRemainingItems(availableOperations, itemsToMove.map(keyExtractor), keyExtractor)
        );
        // When updating 'checked', remove the keys of the moved objects
        setChecked(removeKeys(checked, itemsToMove.map(keyExtractor)));
    };

    const handleCheckedObjectsLeft = () => {
        const itemsToMove = getSelectedItems(selectedOperations, checked, keyExtractor);
        setAvailableOperations(availableOperations.concat(itemsToMove));
        // When removing from rightObjects, we need to pass the keys of the items to remove
        setSelectedOperations(
            getRemainingItems(selectedOperations, itemsToMove.map(keyExtractor), keyExtractor)
        );
        // When updating 'checked', remove the keys of the moved objects
        setChecked(removeKeys(checked, itemsToMove.map(keyExtractor)));
    };

    const updateAvailableOperations = (newOperations) => {
        setAvailableOperations(newOperations);
        setSelectedOperations([]);
        setChecked([]);
    };

    return {
        checked,
        availableOperations,
        selectedOperations,
        getCheckedItemsInList,
        handleToggle,
        numberOfChecked,
        handleToggleAll,
        handleCheckedObjectsRight,
        handleCheckedObjectsLeft,
        updateAvailableOperations,
    };
};
