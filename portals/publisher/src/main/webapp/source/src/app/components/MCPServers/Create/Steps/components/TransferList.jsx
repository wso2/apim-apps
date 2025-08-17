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

const PREFIX = 'TransferList';

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

/**
 * Reusable transfer list component for tool selection
 */
const TransferList = ({
    availableOperations,
    selectedOperations,
    checked,
    onToggle,
    onToggleAll,
    onMoveRight,
    onMoveLeft,
    getCheckedItemsInList,
    numberOfChecked,
    keyExtractor = (item) => `${item.verb}-${item.target}`,
    leftTitle = 'Available Operations',
    rightTitle = 'Selected Operations',
    renderItem = (value) => (
        <div>
            <MethodView
                method={value.verb}
                className={classes.methodView}
            />
            <span>{value.target}</span>
        </div>
    ),
}) => {
    const customList = (title, items) => {
        const checkedItemsInList = getCheckedItemsInList(items, keyExtractor);

        return (
            <Card>
                <CardHeader
                    sx={{ px: 2, py: 1 }}
                    avatar={
                        <Checkbox
                            onClick={onToggleAll(items, keyExtractor)}
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
                                onClick={onToggle(value, keyExtractor)}
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
                                    primary={renderItem(value)}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Card>
        );
    };

    return (
        <Root>
            <Grid container spacing={2} py={2}>
                <Grid item xs={5}>
                    {customList(leftTitle, availableOperations)}
                </Grid>
                <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Grid container direction='column' spacing={1} px={2}>
                        <Grid item>
                            <Button
                                variant='contained'
                                size='small'
                                onClick={onMoveRight}
                                disabled={getCheckedItemsInList(
                                    availableOperations,
                                    keyExtractor
                                ).length === 0}
                                aria-label='move selected right'
                                fullWidth
                            >
                                &gt;
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant='contained'
                                size='small'
                                onClick={onMoveLeft}
                                disabled={getCheckedItemsInList(
                                    selectedOperations,
                                    keyExtractor
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
                    {customList(rightTitle, selectedOperations)}
                </Grid>
            </Grid>
        </Root>
    );
};

TransferList.propTypes = {
    availableOperations: PropTypes.isRequired,
    selectedOperations: PropTypes.isRequired,
    checked: PropTypes.arrayOf(PropTypes.string).isRequired,
    onToggle: PropTypes.func.isRequired,
    onToggleAll: PropTypes.func.isRequired,
    onMoveRight: PropTypes.func.isRequired,
    onMoveLeft: PropTypes.func.isRequired,
    getCheckedItemsInList: PropTypes.func.isRequired,
    numberOfChecked: PropTypes.func.isRequired,
    keyExtractor: PropTypes.func,
    leftTitle: PropTypes.string,
    rightTitle: PropTypes.string,
    renderItem: PropTypes.func,
};

TransferList.defaultProps = {
    leftTitle: '',
    rightTitle: '',
    renderItem: undefined,
    keyExtractor: (item) => `${item.verb}-${item.target}`,
};

export default TransferList;
