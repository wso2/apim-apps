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

import React, { useEffect, useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import queryString from 'query-string';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import { useToolSelection } from './hooks/useToolSelection';
import TransferList from './components/TransferList';

const PREFIX = 'ExistingAPIToolSelection';

const classes = {
    apiSelectionContainer: `${PREFIX}-apiSelectionContainer`,
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.apiSelectionContainer}`]: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
    },
}));

const ExistingAPIToolSelection = ({ 
    onValidate, 
    inputsDispatcher, 
    selectedAPI = null,
}) => {
    const isPreSelected = selectedAPI && selectedAPI.id;
    const [apiList, setApiList] = useState([]);
    const [loadingAPIs, setLoadingAPIs] = useState(false);
    const [loadingOperations, setLoadingOperations] = useState(false);
    const [selectedAPIOption, setSelectedAPIOption] = useState(selectedAPI);
    const [searchInput, setSearchInput] = useState('');
    const processedSelectedAPIRef = useRef(null);

    // Operation cleaner function to remove display properties before dispatching
    const operationCleaner = (operations) => {
        return operations.map(operation => {
            const { verb, target, id, ...cleanOperation } = operation;
            return cleanOperation;
        });
    };

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
        updateAvailableOperations,
    } = useToolSelection([], onValidate, inputsDispatcher, 
        (obj) => `${obj.verb}-${obj.target}`, operationCleaner);

    const fetchAvailableAPIs = async (searchTerm = '') => {
        setLoadingAPIs(true);
        try {
            // Use search query to get only REST APIs (excluding MCP Servers and API Products)
            // This ensures we only show APIs that can be used to create MCP Servers
            let composeQuery = '?query=type:http vendor:wso2';
            // Append name search if search term is provided
            if (searchTerm && searchTerm.trim()) {
                composeQuery += ` name:${searchTerm.trim()}`;
            }

            const composeQueryJSON = queryString.parse(composeQuery);
            composeQueryJSON.limit = 100; // Set a reasonable limit for the dropdown
            composeQueryJSON.offset = 0;
            
            const response = await API.search(composeQueryJSON);
            const data = JSON.parse(response.data);
            const apis = data.list || [];
            setApiList(apis);
        } catch (error) {
            console.error('Error fetching APIs:', error);
            Alert.error('Failed to fetch available APIs');
        } finally {
            setLoadingAPIs(false);
        }
    };

    const fetchOperationsFromAPI = async (apiId) => {
        setLoadingOperations(true);
        try {
            const api = await API.get(apiId);

            // Format operations in the correct structure from the beginning
            const apiOperations = [];
            if (api.operations && Array.isArray(api.operations)) {
                api.operations.forEach((operation) => {
                    apiOperations.push({
                        feature: 'TOOL',
                        apiOperationMapping: {
                            apiId: api.id,
                            apiName: api.name,
                            apiVersion: api.version,
                            apiContext: api.context,
                            backendOperation: {
                                target: operation.target,
                                verb: operation.verb,
                            }
                        },
                        // Add display properties for the UI
                        verb: operation.verb,
                        target: operation.target,
                        id: `${operation.verb}-${operation.target}`,
                    });
                });
            }
            updateAvailableOperations(apiOperations);
        } catch (error) {
            console.error('Error fetching API operations:', error);
            Alert.error('Failed to fetch API operations');
        } finally {
            setLoadingOperations(false);
        }
    };

    // Debounced search function to avoid too many API calls
    const debouncedSearch = useRef(null);

    const handleSearchInputChange = (event, newInputValue) => {
        setSearchInput(newInputValue);

        // Clear previous timeout
        if (debouncedSearch.current) {
            clearTimeout(debouncedSearch.current);
        }

        // Set new timeout for search
        debouncedSearch.current = setTimeout(() => {
            fetchAvailableAPIs(newInputValue);
        }, 300);
    };

    const handleAPISelection = (event, newValue) => {
        // Prevent changes when API is pre-selected (read-only mode)
        if (isPreSelected) {
            return;
        }

        setSelectedAPIOption(newValue);
        updateAvailableOperations([]);
        
        // Reset the processed ref when API is deselected
        if (!newValue) {
            processedSelectedAPIRef.current = null;
        }
    };

    // Fetch available APIs when component mounts
    useEffect(() => {
        fetchAvailableAPIs();

        // Cleanup function to reset state when component unmounts
        return () => {
            processedSelectedAPIRef.current = null;
            // Clear any pending search timeout
            if (debouncedSearch.current) {
                clearTimeout(debouncedSearch.current);
            }
        };
    }, []);

    // Handle selectedAPI prop - fetch full API details if only ID is provided
    useEffect(() => {
        if (selectedAPI && selectedAPI.id && !selectedAPI.name) {
            // If we only have an ID, fetch the full API details
            const fetchSelectedAPI = async () => {
                try {
                    const api = await API.get(selectedAPI.id);
                    setSelectedAPIOption(api);
                } catch (error) {
                    console.error('Error fetching selected API:', error);
                    Alert.error('Failed to fetch selected API details');
                }
            };
            fetchSelectedAPI();
        } else if (selectedAPI) {
            // If we have full API details, set it directly
            setSelectedAPIOption(selectedAPI);
        } else {
            // Reset when selectedAPI is null
            setSelectedAPIOption(null);
            processedSelectedAPIRef.current = null;
        }
    }, [selectedAPI]);

    // Fetch operations when API is selected (only when API actually changes)
    useEffect(() => {
        if (selectedAPIOption && selectedAPIOption.id !== processedSelectedAPIRef.current) {
            processedSelectedAPIRef.current = selectedAPIOption.id;
            fetchOperationsFromAPI(selectedAPIOption.id);
        } else if (!selectedAPIOption) {
            // Clear the ref when no API is selected
            processedSelectedAPIRef.current = null;
            // Also clear operations when no API is selected
            updateAvailableOperations([]);
        }
    }, [selectedAPIOption]);

    const renderAPISelection = () => {
        return (
            <Box className={classes.apiSelectionContainer}>
                <Autocomplete
                    id='api-selection-autocomplete'
                    options={apiList}
                    getOptionLabel={(option) => `${option.name} (${option.version})`}
                    value={selectedAPIOption}
                    inputValue={searchInput}
                    onInputChange={handleSearchInputChange}
                    onChange={handleAPISelection}
                    loading={loadingAPIs}
                    disabled={isPreSelected}
                    readOnly={isPreSelected}
                    freeSolo={false}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={
                                <Typography variant='subtitle1' gutterBottom>
                                    {isPreSelected ? (
                                        <FormattedMessage
                                            id='MCPServers.Create.Steps.ExistingAPIToolSelection.api.selection.label'
                                            defaultMessage='Selected API'
                                        />
                                    ) : (
                                        <FormattedMessage
                                            id='MCPServers.Create.Steps.ExistingAPIToolSelection.api.selection.label'
                                            defaultMessage='Select an API to create MCP Server from'
                                        />
                                    )}
                                </Typography>
                            }
                            variant='outlined'
                            disabled={isPreSelected}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loadingAPIs ? <CircularProgress color='inherit' size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    renderOption={(props, option) => (
                        <Box component='li' {...props}>
                            <Box>
                                <Typography variant='body1'>
                                    {option.name}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                    Version: {option.version} | Context: {option.context}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                />
                {loadingOperations && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress size={24} />
                        <Typography variant='body2' sx={{ ml: 1 }}>
                            Loading operations...
                        </Typography>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Root>
            {renderAPISelection()}
            {selectedAPIOption !== null && (
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
            )}
        </Root>
    );
};

ExistingAPIToolSelection.propTypes = {
    onValidate: PropTypes.func.isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
    selectedAPI: PropTypes.oneOfType([
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
            version: PropTypes.string,
            context: PropTypes.string,
        }),
        PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
    ]),
};

ExistingAPIToolSelection.defaultProps = {
    selectedAPI: null,
};

export default ExistingAPIToolSelection;
