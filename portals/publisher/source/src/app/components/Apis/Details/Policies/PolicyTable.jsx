/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import 'react-tagsinput/react-tagsinput.css';
import PropTypes from 'prop-types';
import React from 'react';
import Api from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText } from '@material-ui/core';
import AddCircle from '@material-ui/icons/AddCircle';
import MUIDataTable from 'mui-datatables';
import Icon from '@material-ui/core/Icon';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import Grid from '@material-ui/core/Grid';
import { isRestricted } from 'AppData/AuthManager';
import { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';

const styles = (theme) => ({
    root: {
        paddingTop: 0,
        paddingLeft: 0,
    },
    buttonProgress: {
        position: 'relative',
        margin: theme.spacing(1),
    },
    headline: { paddingTop: theme.spacing(1.25), paddingLeft: theme.spacing(2.5) },
    heading: {
        flexGrow: 1,
        marginTop: 10,
        '& table td:nth-child(2)': {
            'word-break': 'break-word',
        },
        '& table td button span, & table th': {
            'white-space': 'nowrap',
        },
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    mainTitle: {
        paddingLeft: 0,
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
    content: {
        margin: `${theme.spacing(2)}px 0 ${theme.spacing(2)}px 0`,
    },
    head: {
        fontWeight: 200,
    },
});

/**
 * Renders the policy table.
 * @param {JSON} props Input props from parent components.
 * @returns {JSX} Policy table component.
 */
function PolicyTable(props) {
    const { policies, setPolicies, intl } = props;

    const columns = [
        intl.formatMessage({
            id: 'Apis.Details.Policies.PolicyTable.header.name',
            defaultMessage: 'Policy Name',
        }),
        intl.formatMessage({
            id: 'Apis.Details.Policies.PolicyTable.header.description',
            defaultMessage: 'Description',
        }),
        intl.formatMessage({
            id: 'Apis.Details.Policies.PolicyTable.header.flows',
            defaultMessage: 'Flows',
        }),
        {
            options: {
                customBodyRender: (value, tableMeta) => {
                    if (tableMeta.rowData) {
                        const roles = value || [];
                        return roles.join(',');
                    }
                    return false;
                },
                filter: false,
                sort: false,
                label: (
                    <FormattedMessage
                        id='Apis.Details.Scopes.Scopes.table.header.roles'
                        defaultMessage='Roles'
                    />
                ),
            },
        },
        {
            options: {
                customBodyRender: (value, tableMeta) => {
                    if (tableMeta.rowData) {
                        const policyName = tableMeta.rowData[0];
                        return (
                            <table className={classes.actionTable}>
                                <tr>
                                    <td>
                                        <Button
                                            disabled={isRestricted(
                                                ['apim:api_create'],
                                                api,
                                            ) || api.isRevision}
                                            to={
                                                !isRestricted(['apim:api_create'], api) && !api.isRevision && {
                                                    pathname: editUrl,
                                                    state: {
                                                        scopeName,
                                                    },
                                                }
                                            }
                                            aria-label={'Edit ' + scopeName}
                                        >
                                            <Icon>edit</Icon>
                                            <FormattedMessage
                                                id='Apis.Details.scopes.Edit.text.editor.edit'
                                                defaultMessage='Edit'
                                            />
                                        </Button>
                                    </td>
                                    <td>
                                        <Delete scopeName={scopeName} api={api} isAPIProduct />
                                    </td>
                                </tr>
                            </table>
                        );
                    }
                    return false;
                },
                filter: false,
                sort: false,
                label: (
                    <FormattedMessage
                        id='Apis.Details.Scopes.Scopes.table.header.actions'
                        defaultMessage='Actions'
                    />
                ),
            },
        },
    ];
    const options = {
        filterType: 'multiselect',
        selectableRows: false,
        title: false,
        filter: false,
        sort: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: false,
    };
}

PolicyTable.PropTypes = {
    policies: PropTypes.shape({}).isRequired,
    setPolicies: PropTypes.func.isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
};

export default injectIntl(PolicyTable);
