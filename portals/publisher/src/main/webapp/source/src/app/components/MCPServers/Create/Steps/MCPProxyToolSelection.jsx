/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import MethodView from 'AppComponents/Apis/Details/ProductResources/MethodView';
import TransferList from './components/TransferList';

const PREFIX = 'MCPProxyToolSelection';

const classes = {
    root: `${PREFIX}-root`,
    methodView: `${PREFIX}-methodView`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        width: '100%',
    },
    [`& .${classes.methodView}`]: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
}));

/**
 * MCP Proxy Tool Selection Component
 * Handles tool selection for MCP Proxy servers
 * @param {Object} props - Component props
 * @param {Function} props.onValidate - Callback to inform parent about validation status
 * @param {Object} props.apiInputs - Current API input values from parent
 * @param {Function} props.inputsDispatcher - Dispatcher function to update API inputs in parent
 * @param {Object} props.toolInfo - Tool information from validation
 * @returns {JSX.Element} - The MCPProxyToolSelection component
 */
const MCPProxyToolSelection = ({ onValidate, apiInputs, inputsDispatcher, toolInfo }) => {
    // Operation cleaner function to remove display properties and add backendOperationMapping
    const operationCleaner = (operations) => {
        return operations.map(operation => {
            const { verb, target, id, ...cleanOperation } = operation;
            return {
                ...cleanOperation,
                backendOperationMapping: {
                    backendId: "",
                    backendOperation: {
                        target: operation.target,
                        verb: "TOOL"
                    }
                }
            };
        });
    };

    // Custom hook state for tool selection without validation side effects
    const [checked, setChecked] = useState([]);
    const [availableOperations, setAvailableOperations] = useState([]);
    const [selectedOperations, setSelectedOperations] = useState([]);

    // Initialize available operations from toolInfo prop
    useEffect(() => {
        if (toolInfo && toolInfo.operations) {
            const tools = toolInfo.operations.map(operation => ({
                id: `${operation.target}`,
                target: operation.target,
                verb: 'TOOL',
                description: operation.description,
                feature: operation.feature,
            }));
            setAvailableOperations(tools);
            setSelectedOperations([]);
            setChecked([]);
        }
    }, [toolInfo]);

    const getCheckedItemsInList = (items, itemKeyExtractor = (obj) => `${obj.verb}-${obj.target}`) => {
        const itemKeys = items.map(itemKeyExtractor);
        return itemKeys.filter(key => checked.includes(key));
    };

    const handleToggle = (value, itemKeyExtractor = (obj) => `${obj.verb}-${obj.target}`) => () => {
        const valueKey = itemKeyExtractor(value);
        if (checked.includes(valueKey)) {
            setChecked(prev => prev.filter(key => key !== valueKey));
        } else {
            setChecked(prev => [...prev, valueKey]);
        }
    };

    const numberOfChecked = (items, itemKeyExtractor = (obj) => `${obj.verb}-${obj.target}`) => {
        const itemKeys = items.map(itemKeyExtractor);
        return itemKeys.filter(key => checked.includes(key)).length;
    };

    const handleToggleAll = (items, itemKeyExtractor = (obj) => `${obj.verb}-${obj.target}`) => () => {
        const itemKeys = items.map(itemKeyExtractor);
        const currentChecked = numberOfChecked(items, itemKeyExtractor);
        
        if (currentChecked === items.length) {
            // All are checked, uncheck all of them from this list
            setChecked(prev => prev.filter(key => !itemKeys.includes(key)));
        } else {
            // Not all are checked, check all of them from this list
            setChecked(prev => [...new Set([...prev, ...itemKeys])]);
        }
    };

    const handleCheckedObjectsRight = () => {
        const itemsToMove = availableOperations.filter(item => 
            checked.includes(`${item.verb}-${item.target}`)
        );
        setSelectedOperations(prev => [...prev, ...itemsToMove]);
        setAvailableOperations(prev => 
            prev.filter(item => !checked.includes(`${item.verb}-${item.target}`))
        );
        setChecked(prev => 
            prev.filter(key => !itemsToMove.some(item => `${item.verb}-${item.target}` === key))
        );
    };

    const handleCheckedObjectsLeft = () => {
        const itemsToMove = selectedOperations.filter(item => 
            checked.includes(`${item.verb}-${item.target}`)
        );
        setAvailableOperations(prev => [...prev, ...itemsToMove]);
        setSelectedOperations(prev => 
            prev.filter(item => !checked.includes(`${item.verb}-${item.target}`))
        );
        setChecked(prev => 
            prev.filter(key => !itemsToMove.some(item => `${item.verb}-${item.target}` === key))
        );
    };

    // Dispatch selected operations to parent and validate form
    useEffect(() => {
        const cleanedOperations = operationCleaner(selectedOperations);
        inputsDispatcher({ action: 'operations', value: cleanedOperations });

        const hasSelectedOperations = selectedOperations.length > 0;
        onValidate(hasSelectedOperations);
    }, [selectedOperations, onValidate, inputsDispatcher]);

    // Custom render function for MCP tools - using same style as default renderItem
    const renderToolItem = (tool) => (
        <div>
            <MethodView
                method='TOOL'
                className={classes.methodView}
            />
            <span>{tool.target}</span>
        </div>
    );

    // Safety check to prevent crashes if apiInputs is undefined
    if (!apiInputs) {
        console.warn('MCPProxyToolSelection: apiInputs is undefined');
        return null;
    }

    return (
        <Root>
            {(availableOperations.length > 0 || selectedOperations.length > 0) && (
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
                    leftTitle='Available Tools'
                    rightTitle='Selected Tools'
                    renderItem={renderToolItem}
                    keyExtractor={(item) => `${item.verb}-${item.target}`}
                />
            )}
        </Root>
    );
};

MCPProxyToolSelection.propTypes = {
    onValidate: PropTypes.func.isRequired,
    apiInputs: PropTypes.shape({
        inputValue: PropTypes.string,
        endpointUrl: PropTypes.string,
        mcpServerUrl: PropTypes.string,
        operations: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string,
            parameters: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string,
            })),
        })),
    }).isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
    toolInfo: PropTypes.shape({
        operations: PropTypes.arrayOf(PropTypes.shape({
            target: PropTypes.string,
            description: PropTypes.string,
            feature: PropTypes.string,
        })),
    }),
};

MCPProxyToolSelection.defaultProps = {
    toolInfo: null,
};

export default MCPProxyToolSelection;
