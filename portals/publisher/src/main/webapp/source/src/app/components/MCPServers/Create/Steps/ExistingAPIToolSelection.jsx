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

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import MethodView from 'AppComponents/Apis/Details/ProductResources/MethodView';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';

const PREFIX = 'ExistingAPIToolSelection';

const classes = {
    methodView: `${PREFIX}-methodView`,
    apiSelectionContainer: `${PREFIX}-apiSelectionContainer`,
    apiSelectionCard: `${PREFIX}-apiSelectionCard`,
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.methodView}`]: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    [`& .${classes.apiSelectionContainer}`]: {
        marginBottom: theme.spacing(3),
    },
    [`& .${classes.apiSelectionCard}`]: {
        padding: theme.spacing(2),
    },
}));

// Helper functions for managing lists and selections
// `listA` is the array of actual items (objects in this case)
// `selectedKeys` is the array of IDs that are currently checked
// `itemKeyExtractor` extracts the unique key (ID) from an item in `listA`
const getSelectedItems = (listA, selectedKeys, itemKeyExtractor = (item) => item) => {
    const selectedKeysSet = new Set(selectedKeys);
    return listA.filter(item => selectedKeysSet.has(itemKeyExtractor(item)));
};

// `listA` is the array of actual items (objects)
// `keysToRemove` is the array of IDs to remove from `listA`
// `itemKeyExtractor` extracts the unique key (ID) from an item in `listA`
const getRemainingItems = (listA, keysToRemove, itemKeyExtractor = (item) => item) => {
    const keysToRemoveSet = new Set(keysToRemove);
    return listA.filter(item => !keysToRemoveSet.has(itemKeyExtractor(item)));
};

// `currentCheckedKeys` is the array of currently checked IDs
// `keysToAdd` is the array of IDs to add to `currentCheckedKeys`
const addKeys = (currentCheckedKeys, keysToAdd) => {
    const newSet = new Set(currentCheckedKeys);
    keysToAdd.forEach(key => newSet.add(key));
    return Array.from(newSet);
};

// `currentCheckedKeys` is the array of currently checked IDs
// `keysToRemove` is the array of IDs to remove from `currentCheckedKeys`
const removeKeys = (currentCheckedKeys, keysToRemove) => {
    const keysToRemoveSet = new Set(keysToRemove);
    return currentCheckedKeys.filter(key => !keysToRemoveSet.has(key));
};

const ExistingAPIToolSelection = ({ 
    onValidate, 
    inputsDispatcher, 
    selectedAPI = null,
    onAPIChange = null,
}) => {
    const [checked, setChecked] = useState([]);
    const [availableOperations, setAvailableOperations] = useState([]);
    const [selectedOperations, setSelectedOperations] = useState([]);
    
    // API selection state
    const [apiList, setApiList] = useState([]);
    const [loadingAPIs, setLoadingAPIs] = useState(false);
    const [loadingOperations, setLoadingOperations] = useState(false);
    const [selectedAPIOption, setSelectedAPIOption] = useState(selectedAPI);

    const fetchAvailableAPIs = async () => {
        setLoadingAPIs(true);
        try {
            const response = await API.all({});
            const apis = response.body.list || [];
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
            
            setAvailableOperations(apiOperations);
            
            // Update the selected API in parent component
            if (onAPIChange) {
                onAPIChange(selectedAPIOption);
            }
        } catch (error) {
            console.error('Error fetching API operations:', error);
            Alert.error('Failed to fetch API operations');
        } finally {
            setLoadingOperations(false);
        }
    };

    const handleAPISelection = (event, newValue) => {
        setSelectedAPIOption(newValue);
        setSelectedOperations([]);
        setChecked([]);
        if (onAPIChange) {
            onAPIChange(newValue);
        }
    };

    // Fetch available APIs when component mounts
    useEffect(() => {
        fetchAvailableAPIs();
    }, []);

    // Fetch operations when API is selected
    useEffect(() => {
        if (selectedAPIOption) {
            fetchOperationsFromAPI(selectedAPIOption.id);
        }
    }, [selectedAPIOption]);

    const getCheckedItemsInList = (items, keyExtractor = (item) => item) => {
        const itemKeys = items.map(keyExtractor);
        return getSelectedItems(itemKeys, checked);
    };

    // Update validation based on selected operations and dispatch to reducer
    useEffect(() => {
        const isValid = selectedOperations.length > 0;
        onValidate(isValid);

        // Clean operations by removing display properties before dispatching
        const cleanOperations = selectedOperations.map(operation => {
            const { verb, target, id, ...cleanOperation } = operation;
            return cleanOperation;
        });

        // Dispatch cleaned operations to the reducer
        inputsDispatcher({ action: 'operations', value: cleanOperations });
    }, [selectedOperations, onValidate, inputsDispatcher]);

    const handleToggle = (value, keyExtractor = (item) => item) => () => {
        const valueKey = keyExtractor(value);
        if (checked.includes(valueKey)) {
            setChecked(removeKeys(checked, [valueKey]));
        } else {
            setChecked(addKeys(checked, [valueKey]));
        }
    };

    const numberOfChecked = (items, keyExtractor = (item) => item) => {
        const itemKeys = items.map(keyExtractor);
        return getSelectedItems(itemKeys, checked).length;
    };

    const handleToggleAll = (items, keyExtractor = (item) => item) => () => {
        const itemKeys = items.map(keyExtractor);
        if (numberOfChecked(items, keyExtractor) === items.length) {
            // All are checked, uncheck all of them from this list
            setChecked(removeKeys(checked, itemKeys));
        } else {
            // Not all are checked, check all of them from this list
            setChecked(addKeys(checked, itemKeys));
        }
    };

    const handleCheckedObjectsRight = () => {
        const keyExtractor = (obj) => `${obj.verb}-${obj.target}`;
        const itemsToMove = getSelectedItems(availableOperations, checked, keyExtractor);
        setSelectedOperations(selectedOperations.concat(itemsToMove));
        // When removing from leftObjects, we need to pass the keys of the items to remove
        setAvailableOperations(getRemainingItems(availableOperations, itemsToMove.map(keyExtractor), keyExtractor));
        // When updating 'checked', remove the keys of the moved objects
        setChecked(removeKeys(checked, itemsToMove.map(keyExtractor)));
    };

    const handleCheckedObjectsLeft = () => {
        const keyExtractor = (obj) => `${obj.verb}-${obj.target}`;
        const itemsToMove = getSelectedItems(selectedOperations, checked, keyExtractor);
        setAvailableOperations(availableOperations.concat(itemsToMove));
        // When removing from rightObjects, we need to pass the keys of the items to remove
        setSelectedOperations(getRemainingItems(selectedOperations, itemsToMove.map(keyExtractor), keyExtractor));
        // When updating 'checked', remove the keys of the moved objects
        setChecked(removeKeys(checked, itemsToMove.map(keyExtractor)));
    };

    const customList = (title, items) => {
        const keyExtractor = (item) => `${item.verb}-${item.target}`;
        const checkedItemsInList = getCheckedItemsInList(items, keyExtractor);

        return (
            <Card>
                <CardHeader
                    sx={{ px: 2, py: 1 }}
                    avatar={
                        <Checkbox
                            onClick={handleToggleAll(items, keyExtractor)}
                            checked={numberOfChecked(items, keyExtractor) === items.length && items.length !== 0}
                            indeterminate={
                                numberOfChecked(items, keyExtractor) !== items.length
                                && numberOfChecked(items, keyExtractor) !== 0
                            }
                            disabled={items.length === 0}
                            inputProps={{
                                'aria-label': 'all items selected',
                            }}
                        />
                    }
                    title={title}
                    subheader={`${checkedItemsInList.length}/${items.length} selected`}
                />
                <Divider />
                <List
                    sx={{
                        width: '100%',
                        height: 300,
                        bgcolor: 'background.paper',
                        overflow: 'auto',
                    }}
                    dense
                    component='div'
                    role='list'
                >
                    {items.map((value) => {
                        const labelId = `transfer-list-object-item-${keyExtractor(value)}-label`;
                        const isChecked = checked.includes(keyExtractor(value));

                        return (
                            <ListItemButton
                                key={keyExtractor(value)}
                                role='listitem'
                                onClick={handleToggle(value, keyExtractor)}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        checked={isChecked}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{
                                            'aria-labelledby': labelId,
                                        }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={(
                                        <div>
                                            <MethodView
                                                method={value.verb}
                                                className={classes.methodView}
                                            />
                                            <span>{value.target}</span>
                                        </div>
                                    )}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Card>
        )
    };

    const renderAPISelection = () => {
        return (
            <Box className={classes.apiSelectionContainer}>
                <Card className={classes.apiSelectionCard}>
                    <Typography variant='h6' gutterBottom>
                        Select API
                    </Typography>
                    <Autocomplete
                        id='api-selection-autocomplete'
                        options={apiList}
                        getOptionLabel={(option) => `${option.name} (${option.version})`}
                        value={selectedAPIOption}
                        onChange={handleAPISelection}
                        loading={loadingAPIs}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label='Select an API'
                                variant='outlined'
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
                </Card>
            </Box>
        );
    };

    return (
        <Root>
            {renderAPISelection()}
            <Grid container spacing={2} py={2}>
                <Grid item xs={5}>
                    {customList('Available Operations', availableOperations)}
                </Grid>
                <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Grid container direction='column' spacing={1} px={2}>
                        <Grid item>
                            <Button
                                variant='outlined'
                                size='small'
                                onClick={handleCheckedObjectsRight}
                                disabled={getCheckedItemsInList(
                                    availableOperations,
                                    (obj) => `${obj.verb}-${obj.target}`
                                ).length === 0}
                                aria-label='move selected right'
                                fullWidth
                            >
                                &gt;
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant='outlined'
                                size='small'
                                onClick={handleCheckedObjectsLeft}
                                disabled={getCheckedItemsInList(
                                    selectedOperations,
                                    (obj) => `${obj.verb}-${obj.target}`
                                ).length === 0}
                                aria-label='move selected left'
                                fullWidth
                            >
                                &lt;
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={5}>
                    {customList('Selected Operations', selectedOperations)}
                </Grid>
            </Grid>
        </Root>
    );
}

ExistingAPIToolSelection.propTypes = {
    onValidate: PropTypes.func.isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
    selectedAPI: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        version: PropTypes.string,
        context: PropTypes.string,
    }),
    onAPIChange: PropTypes.func,
};

ExistingAPIToolSelection.defaultProps = {
    selectedAPI: null,
    onAPIChange: null,
};

export default ExistingAPIToolSelection;
