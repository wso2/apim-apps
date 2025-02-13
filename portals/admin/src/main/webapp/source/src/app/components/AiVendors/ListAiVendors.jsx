/*
 * Copyright (c) 2024, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import API from 'AppData/api';
import { useIntl, FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import DeleteAiVendor from 'AppComponents/AiVendors/DeleteAiVendor';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { styled } from '@mui/material';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import AppBar from '@mui/material/AppBar';
import MUIDataTable from 'mui-datatables';
import InlineProgress from 'AppComponents/AdminPages/Addons/InlineProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

const styles = {
    searchBar: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    },
    block: {
        display: 'block',
    },
    contentWrapper: {
        margin: '40px 16px',
    },
    button: {
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    tableCellWrapper: {
        '& td': {
            'word-break': 'break-all',
            'white-space': 'normal',
        },
    },
};

const StyledDiv = styled('div')({});

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
export default function ListAiVendors() {
    // eslint-disable-next-line no-unused-vars
    const intl = useIntl();
    const [aiVendorsList, setAiVendorsList] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState(null);

    const fetchData = async () => {
        // Fetch data from backend when an apiCall is provided
        setAiVendorsList(null);

        try {
            const result = await new API().getAiVendorsList();
            console.log(result);
            if (result) {
                setError(null);
                setAiVendorsList(result.body.list);
            } else {
                setError(intl.formatMessage({
                    id: 'AdminPages.Addons.ListBase.noDataError',
                    defaultMessage: 'Error while retrieving data.',
                }));
            }
        } catch (e) {
            // throw error;
            setError(e.message);
        }
        setSearchText('');
    };

    const addCreateButton = () => {
        return (
            <Button
                component={RouterLink}
                to='/settings/ai-vendors/create'
                variant='contained'
                color='primary'
                size='small'
            >
                {intl.formatMessage({
                    id: 'AiVendors.ListAiVendors.addNewAiVendor',
                    defaultMessage: 'Add AI/LLM Vendor',
                })}
            </Button>
        );
    };

    const columns = [
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'AiVendors.ListAiVendors.table.header.label.aiVendorName',
                defaultMessage: 'AI/LLM Vendor Name',
            }),
            options: {
                customBodyRender: (value, tableMeta) => {
                    if (typeof tableMeta.rowData === 'object') {
                        const dataRow = aiVendorsList[tableMeta.rowIndex];
                        const artifactId = dataRow.id;
                        return (
                            <RouterLink
                                to={{
                                    pathname: `/settings/ai-vendors/${artifactId}`,
                                }}
                            >
                                {value}
                            </RouterLink>
                        );
                    } else {
                        return <div />;
                    }
                },
            },
        },
        {
            name: 'description',
            label: intl.formatMessage({
                id: 'AiVendors.ListAiVendors.table.header.label.description',
                defaultMessage: 'Description',
            }),
            options: {
                sort: false,
                setCellProps: () => {
                    return {
                        style: {
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                        },
                    };
                },
                customBodyRender: (value) => {
                    return (
                        <div
                            style={{
                                maxWidth: 200,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {value}
                        </div>
                    );
                },
            },
        },
        {
            name: 'apiVersion',
            label: intl.formatMessage({
                id: 'AiVendors.ListAiVendors.table.header.label.apiVersion',
                defaultMessage: 'API Version',
            }),
            options: {
                sort: false,
            },
        },
        {
            name: 'builtInSupport',
            label: intl.formatMessage({
                id: 'AiVendors.ListAiVendors.table.header.label.builtInSupport',
                defaultMessage: 'Type',
            }),
            options: {
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = aiVendorsList[tableMeta.rowIndex];
                    if (typeof tableMeta.rowData === 'object') {
                        return dataRow.builtInSupport ? 'Default' : 'Custom';
                    }
                    return '';
                },
            },
        },
        { name: 'id', options: { display: false } },
        {
            name: '',
            label: 'Actions',
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = aiVendorsList[tableMeta.rowIndex];
                    const itemName = (typeof tableMeta.rowData === 'object') ? tableMeta.rowData[0] : '';
                    let tooltipTitle = '';
                    if (dataRow.builtInSupport) {
                        tooltipTitle = intl.formatMessage({
                            id: 'AiVendors.ListAiVendors.table.is.used.delete.tooltip',
                            defaultMessage: 'Default AI/LLM Vendors cannot be deleted',
                        });
                    }
                    return (
                        <div data-testid={`${itemName}-actions`}>
                            <Tooltip
                                title={tooltipTitle}
                            >
                                <span>
                                    <DeleteAiVendor
                                        dataRow={dataRow}
                                        updateList={fetchData}
                                    />
                                </span>
                            </Tooltip>
                        </div>

                    );
                },
            },
        },
    ];

    const pageProps = {
        pageStyle: 'paperLess',
        title: intl.formatMessage({
            id: 'AiVendors.ListAiVendors.List.title',
            defaultMessage: 'AI/LLM Vendors',
        }),
    };

    const emptyBoxProps = {
        content: (
            <Typography
                variant='body2'
                color='textSecondary'
                component='p'
                id='AdminPages.AiVendors.List.empty.content.Aivendors.body'
            >
                <FormattedMessage
                    id='AdminPages.AiVendors.List.empty.content.Aivendors'
                    defaultMessage='It is possible to register an AI/LLM Vendor.'
                />
            </Typography>
        ),
        title: (
            <Typography
                gutterBottom
                variant='h5'
                component='h2'
                id='AiVendors.ListAiVendors.empty.header'
            >
                <FormattedMessage
                    id='AiVendors.ListAiVendors.empty.title'
                    defaultMessage='AI/LLM Vendors'
                />
            </Typography>
        ),
    };

    useEffect(() => {
        fetchData();
    }, []);

    const sortBy = (field, reverse, primer) => {
        const key = primer
            ? (x) => {
                return primer(x[field]);
            }
            : (x) => {
                return x[field];
            };
        // eslint-disable-next-line no-param-reassign
        reverse = !reverse ? 1 : -1;

        return (a, b) => {
            const aValue = key(a);
            const bValue = key(b);
            return reverse * ((aValue > bValue) - (bValue > aValue));
        };
    };

    const onColumnSortChange = (changedColumn, direction) => {
        const sorted = [...aiVendorsList].sort(sortBy(changedColumn, direction === 'descending'));
        setAiVendorsList(sorted);
    };

    const options = {
        filterType: 'checkbox',
        selectableRows: 'none',
        filter: false,
        search: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: null,
        responsive: 'stacked',
        searchText,
        onColumnSortChange,
        textLabels: {
            body: {
                noMatch: intl.formatMessage({
                    id: 'Mui.data.table.search.no.records.found',
                    defaultMessage: 'Sorry, no matching records found',
                }),
            },
            pagination: {
                rowsPerPage: intl.formatMessage({
                    id: 'Mui.data.table.pagination.rows.per.page',
                    defaultMessage: 'Rows per page:',
                }),
                displayRows: intl.formatMessage({
                    id: 'Mui.data.table.pagination.display.rows',
                    defaultMessage: 'of',
                }),
            },
        },
    };

    const filterData = (event) => {
        setSearchText(event.target.value);
    };

    // If no apiCall is provided OR,
    // retrieved data is empty, display an information card.
    if (aiVendorsList && aiVendorsList.length === 0) {
        return (
            <ContentBase
                {...pageProps}
                pageStyle='small'
            >
                <Card sx={styles.root}>
                    <CardContent>
                        {emptyBoxProps.title}
                        {emptyBoxProps.content}
                    </CardContent>
                    <CardActions>
                        {addCreateButton()}
                    </CardActions>
                </Card>
            </ContentBase>
        );
    }
    // If apiCall is provided and aiVendorsList is not retrieved yet, display progress component
    if (!error && !aiVendorsList) {
        return (
            <ContentBase pageStyle='paperLess'>
                <InlineProgress />
            </ContentBase>

        );
    }
    if (error) {
        return (
            <ContentBase {...pageProps}>
                <Alert severity='error'>{error}</Alert>
            </ContentBase>
        );
    }

    return (
        <>
            <ContentBase {...pageProps}>
                <div>
                    <AppBar sx={styles.searchBar} position='static' color='default' elevation={0}>
                        <Toolbar>
                            <Grid container spacing={2} alignItems='center'>
                                <Grid item>
                                    <SearchIcon sx={styles.block} color='inherit' />
                                </Grid>
                                <Grid item xs>
                                    <TextField
                                        variant='standard'
                                        fullWidth
                                        placeholder=''
                                        sx={(theme) => ({
                                            '& .search-input': {
                                                fontSize: theme.typography.fontSize,
                                            },
                                        })}
                                        InputProps={{
                                            disableUnderline: true,
                                            className: 'search-input',
                                        }}
                                        onChange={filterData}
                                        value={searchText}
                                    />
                                </Grid>
                                <Grid item>
                                    {addCreateButton()}
                                    <Tooltip title={(
                                        <FormattedMessage
                                            id='AdminPages.Addons.ListBase.reload'
                                            defaultMessage='Reload'
                                        />
                                    )}
                                    >
                                        <IconButton onClick={fetchData}>
                                            <RefreshIcon sx={styles.block} color='inherit' />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <StyledDiv sx={styles.tableCellWrapper}>
                        {aiVendorsList && aiVendorsList.length > 0 && (
                            <MUIDataTable
                                title={null}
                                data={aiVendorsList}
                                columns={columns}
                                options={options}
                            />
                        )}
                    </StyledDiv>
                    {aiVendorsList && aiVendorsList.length === 0 && (
                        <StyledDiv sx={styles.contentWrapper}>
                            <Typography color='textSecondary' align='center'>
                                <FormattedMessage
                                    id='AdminPages.Addons.ListBase.nodata.message'
                                    defaultMessage='No items yet'
                                />
                            </Typography>
                        </StyledDiv>
                    )}
                </div>
            </ContentBase>
        </>
    );
}
