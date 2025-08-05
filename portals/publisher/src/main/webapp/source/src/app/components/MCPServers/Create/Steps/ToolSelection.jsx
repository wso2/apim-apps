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
import MethodView from 'AppComponents/Apis/Details/ProductResources/MethodView';

const PREFIX = 'ToolSelection';

const classes = {
    methodView: `${PREFIX}-methodView`,
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

const ToolSelection = ({ operations, onValidate, inputsDispatcher }) => {
    const [checked, setChecked] = useState([]);
    const [availableOperations, setAvailableOperations] = useState(operations || []);
    const [selectedOperations, setSelectedOperations] = useState([]);

    const getCheckedItemsInList = (items, keyExtractor = (item) => item) => {
        const itemKeys = items.map(keyExtractor);
        return getSelectedItems(itemKeys, checked);
    };

    // Update validation based on selected operations and dispatch to reducer
    useEffect(() => {
        const isValid = selectedOperations.length > 0;
        onValidate(isValid);

        // Dispatch selected operations to the reducer
        inputsDispatcher({ action: 'operations', value: selectedOperations });
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

    return (
        <Root>
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
