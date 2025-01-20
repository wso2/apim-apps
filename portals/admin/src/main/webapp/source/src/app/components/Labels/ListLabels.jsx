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

import React, { useState } from 'react';
import API from 'AppData/api';
import { useIntl, FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import ListBase from 'AppComponents/AdminPages/Addons/ListBase';
import Delete from 'AppComponents/Labels/DeleteLabel';
import AddEdit from 'AppComponents/Labels/AddEditLabel';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
} from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ListLabelUsages from './ListLabelUsages';

/**
 * API call to get Label list
 * @returns {Promise}.
 */
function apiCall() {
    const restApi = new API();
    return restApi
        .labelsListGet()
        .then((result) => {
            return result.body.list;
        })
        .catch((error) => {
            throw error;
        });
}
const TruncatedNameCell = ({ children }) => {
    return (
        <Box sx={{ maxWidth: '200px' }}>
            <Typography
                noWrap
                sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {children}
            </Typography>
        </Box>
    );
};
/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
export default function ListLabels() {
    const intl = useIntl();
    const [selectedArtifactId, setSelectedArtifactId] = useState(null);
    const [selectedLabelName, setSelectedLabelName] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const openDialog = (artifactId, LabelName) => {
        setSelectedArtifactId(artifactId);
        setSelectedLabelName(LabelName);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setSelectedArtifactId(null);
        setDialogOpen(false);
    };

    const columProps = [
        { name: 'id', options: { display: false } },
        {
            name: 'name',
            label: intl.formatMessage({
                id: 'AdminPages.Labels.table.header.label.name',
                defaultMessage: 'Label Name',
            }),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (data) => {
                    return <TruncatedNameCell>{data}</TruncatedNameCell>;
                },
            },
        },
        {
            name: 'description',
            label: intl.formatMessage({
                id: 'AdminPages.Labels.table.header.label.description',
                defaultMessage: 'Description',
            }),
            options: {
                filter: true,
                sort: false,
            },
        },
        {
            name: 'usage',
            label: intl.formatMessage({
                id: 'AdminPages.Labels.table.header.label.usage',
                defaultMessage: 'Usage',
            }),
            options: {
                customBodyRender: (value, tableMeta) => {
                    if (typeof tableMeta.rowData === 'object') {
                        const artifactId = tableMeta.rowData[0];
                        const LabelName = tableMeta.rowData[1];
                        return (
                            <IconButton
                                onClick={() => openDialog(artifactId, LabelName)}
                            >
                                <FormatListBulletedIcon aria-label='label-usage-icon' />
                            </IconButton>
                        );
                    } else {
                        return <div />;
                    }
                },
            },
        },
    ];
    const addButtonProps = {
        triggerButtonText: intl.formatMessage({
            id: 'AdminPages.Labels.List.addButtonProps.triggerButtonText',
            defaultMessage: 'Add Label',
        }),
        /* This title is what as the title of the popup dialog box */
        title: intl.formatMessage({
            id: 'AdminPages.Labels.List.addButtonProps.title',
            defaultMessage: 'Add Label',
        }),
    };
    const searchProps = {
        searchPlaceholder: intl.formatMessage({
            id: 'AdminPages.Labels.List.search.default',
            defaultMessage: 'Search by Label name',
        }),
        active: true,
    };
    const pageProps = {
        pageStyle: 'half',
        title: intl.formatMessage({
            id: 'AdminPages.Labels.List.title.labels',
            defaultMessage: 'Labels',
        }),
    };

    const emptyBoxProps = {
        content: (
            <Typography variant='body2' color='textSecondary' component='p'>
                <FormattedMessage
                    id='AdminPages.Labels.List.empty.content.labels'
                    defaultMessage={'Labels help you organize and group your artifacts, such as APIs, '
                        + 'in a simple and flexible way. You can define labels to tag your artifacts based '
                        + 'on usecases, categories, domains, or any criteria you choose.'}
                />
            </Typography>
        ),
        title: (
            <Typography gutterBottom variant='h5' component='h2'>
                <FormattedMessage
                    id='AdminPages.Labels.List.empty.title.labels'
                    defaultMessage='Labels'
                />
            </Typography>
        ),
    };

    return (
        <>
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                maxWidth='md'
                fullWidth
            >
                <DialogTitle>
                    <FormattedMessage
                        id='AdminPages.Labels.Usages.dialog.title'
                        defaultMessage='Labels Usages - '
                    />
                    {' '}
                    {selectedLabelName}
                </DialogTitle>
                <DialogContent>
                    <ListLabelUsages id={selectedArtifactId} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>
                        <FormattedMessage
                            id='AdminPages.Labels.Usages.dialog.close.btn'
                            defaultMessage='Close'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
            <ListBase
                columProps={columProps}
                pageProps={pageProps}
                addButtonProps={addButtonProps}
                searchProps={searchProps}
                emptyBoxProps={emptyBoxProps}
                apiCall={apiCall}
                EditComponent={AddEdit}
                editComponentProps={{
                    icon: <EditIcon />,
                    title: 'Edit Label',
                }}
                DeleteComponent={Delete}
            />
        </>
    );
}
