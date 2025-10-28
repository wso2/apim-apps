/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React from 'react';
import Api from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import Typography from '@mui/material/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText } from '@mui/material';
import AddCircle from '@mui/icons-material/AddCircle';
import MUIDataTable from 'mui-datatables';
import Icon from '@mui/material/Icon';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import Grid from '@mui/material/Grid';
import { isRestricted } from 'AppData/AuthManager';
import { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { getBasePath, getTypeToDisplay } from 'AppComponents/Shared/Utils';
import Delete from './Delete';

const PREFIX = 'Scopes';

const classes = {
    root: `${PREFIX}-root`,
    buttonProgress: `${PREFIX}-buttonProgress`,
    headline: `${PREFIX}-headline`,
    heading: `${PREFIX}-heading`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    content: `${PREFIX}-content`,
    head: `${PREFIX}-head`
};

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        paddingTop: 0,
        paddingLeft: 0,
    },

    [`& .${classes.buttonProgress}`]: {
        position: 'relative',
        margin: theme.spacing(1),
    },

    [`& .${classes.headline}`]: { paddingTop: theme.spacing(1.25), paddingLeft: theme.spacing(2.5) },

    [`& .${classes.heading}`]: {
        flexGrow: 1,
        marginTop: 10,
        '& table td:nth-child(2)': {
            wordBreak: 'break-word',
        },
        '& table td button span, & table th': {
            'white-space': 'nowrap',
        },
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.content}`]: {
        margin: `${theme.spacing(2)} 0 ${theme.spacing(2)} 0`,
    },

    [`& .${classes.head}`]: {
        // fontWeight: 200,
    }
}));

/**
 * Generate the scopes UI in API details page.
 * @class Scopes
 * @extends {React.Component}
 */
class Scopes extends React.Component {
    /**
     * Creates an instance of Scopes.
     * @param {any} props Generic props
     * @memberof Scopes
     */
    constructor(props) {
        super(props);
        this.api = new Api();
        this.api_uuid = props.match.params.api_uuid;
        this.api_data = props.api;
        this.state = {
            enableReadOnly: false
        };
    }

    /**
     * Lifecycle method to fetch API settings
     */
    componentDidMount() {
        const { api } = this.props;
        api.getSettings().then((settings) => {
            this.setState({ enableReadOnly: settings.portalConfigurationOnlyModeEnabled });
        });
    }

    /**
     * Get the allowed scopes
     * @returns {string[]} The allowed scopes
     */
    getAllowedScopes() {
        const { api } = this.props;
        if (api.apiType && api.apiType.toUpperCase() === 'MCP') {
            return ['apim:mcp_server_create', 'apim:mcp_server_manage', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_create'];
        }
    }

    /**
     * Check if the action is restricted
     * @returns {boolean} True if the action is restricted, false otherwise
     */
    isAccessRestricted() {
        const { api } = this.props;
        return isRestricted(this.getAllowedScopes(), api);
    }

    /**
     * Render Scopes section
     * @returns {React.Component} React Component
     * @memberof Scopes
     */
    render() {
        const { intl, api } = this.props;
        const { enableReadOnly } = this.state;
        const urlPrefix = getBasePath(api.apiType);
        const { scopes } = api;
        const url = `${urlPrefix}${api.id}/scopes/create`;
        const editUrl = `${urlPrefix}${api.id}/scopes/edit`;
        const columns = [
            intl.formatMessage({
                id: 'Apis.Details.Scopes.Scopes.table.header.name',
                defaultMessage: 'Name',
            }),
            intl.formatMessage({
                id: 'Apis.Details.Scopes.Scopes.table.header.description',
                defaultMessage: 'Description',
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
                        if (value && tableMeta.rowData) {
                            const scopeName = tableMeta.rowData[0];
                            return (
                                <List component='nav' aria-label={scopeName + ' Used in'} className={classes.root}>
                                    {value.map((resource) => (
                                        <ListItem button>
                                            <ListItemText primary={resource} />
                                        </ListItem>
                                    ))}
                                </List>
                            );
                        }
                        return false;
                    },
                    filter: false,
                    sort: false,
                    label: (
                        <FormattedMessage
                            id='Apis.Details.Scopes.Scopes.table.header.usages'
                            defaultMessage='Used In'
                        />
                    ),
                },
            },
            {
                options: {
                    customBodyRender: (value, tableMeta) => {
                        if (tableMeta.rowData) {
                            const scopeName = tableMeta.rowData[0];
                            return (
                                <table className={classes.actionTable}>
                                    <tr>
                                        <td>
                                            <Tooltip
                                                title={
                                                    this.isAccessRestricted() || api.isRevision
                                                        ? (
                                                            <FormattedMessage
                                                                id='Apis.Details.Scopes.Scopes.edit.disabled.tooltip'
                                                                defaultMessage={'You do not have permission to ' + 
                                                                    'edit scopes'}
                                                            />
                                                        )
                                                        : ''
                                                }
                                            >
                                                <span>
                                                    <Button
                                                        disabled={this.isAccessRestricted() || api.isRevision}
                                                        to={
                                                            !this.isAccessRestricted() && !api.isRevision && {
                                                                pathname: editUrl,
                                                                state: {
                                                                    scopeName,
                                                                },
                                                            }
                                                        }
                                                        component={Link}
                                                        aria-label={'Edit ' + scopeName}
                                                    >
                                                        <Icon>edit</Icon>
                                                        <FormattedMessage
                                                            id='Apis.Details.scopes.Edit.text.editor.edit'
                                                            defaultMessage='Edit'
                                                        />
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </td>
                                        {!enableReadOnly && (
                                            <td>
                                                <Delete scopeName={scopeName} api={api} isAPIProduct />
                                            </td>
                                        )}
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
            textLabels: {
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

        const scopesList = api.scopes.filter((apiScope) => {
            return !apiScope.shared;
        }).map((apiScope) => {
            const aScope = [];
            aScope.push(apiScope.scope.name);
            aScope.push(apiScope.scope.description);
            aScope.push(apiScope.scope.bindings);
            const resources = api.operations && api.operations
                .filter((op) => {
                    return op.scopes.includes(apiScope.scope.name);
                })
                .map((op) => {
                    return api.isMCPServer() ? `${op.feature} ${op.target}` : `${op.verb} ${op.target}`;
                });
            aScope.push(resources);
            return aScope;
        });

        if (!scopes) {
            return <Progress />;
        }

        // Check if there are no scopes OR if all scopes are shared (no local scopes)
        const hasLocalScopes = scopes.some(scope => !scope.shared);
        if (scopes.length === 0 || !hasLocalScopes) {
            return (
                <Root className={classes.root}>
                    <div className={classes.titleWrapper}>
                        <Typography
                            id='itest-api-details-scopes-onboarding-head'
                            variant='h4'
                            component='h2'
                            align='left'
                            className={classes.mainTitle}
                        >
                            <FormattedMessage
                                id='Apis.Details.local.Scopes.heading.scope.heading'
                                defaultMessage='Local Scopes'
                            />
                        </Typography>
                        <Tooltip
                            title={(
                                <FormattedMessage
                                    id='Apis.Details.Scopes.Scopes.heading.scope.title.tooltip'
                                    defaultMessage='Manage scopes that are local to this {type}'
                                    values ={{
                                        type: getTypeToDisplay(api.apiType)
                                    }}
                                />
                            )}
                            placement='top-end'
                        >
                            <IconButton size='small' aria-label='Local Scopes help text'>
                                <HelpOutlineIcon fontSize='small' />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <InlineMessage type='info' height={140}>
                        <div className={classes.contentWrapper}>
                            <Typography variant='h5' component='h3' className={classes.head}>
                                <FormattedMessage
                                    id='Apis.Details.Scopes.Scopes.create.scopes.title'
                                    defaultMessage='Create Local Scopes'
                                />
                            </Typography>
                            <Typography component='p' className={classes.content}>
                                <FormattedMessage
                                    id='Apis.Details.Scopes.Scopes.scopes.enable.fine.gained.access.control'
                                    defaultMessage='Scopes enable fine-grained access control based on user roles.'
                                />
                            </Typography>
                            <div className={classes.actions}>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    className={classes.button}
                                    disabled={this.isAccessRestricted() || api.isRevision
                                    || enableReadOnly}
                                    component={Link}
                                    to={!this.isAccessRestricted() && !api.isRevision && url}
                                    id='create-scope-btn'
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Scopes.Scopes.create.scopes.button'
                                        defaultMessage='Create Scope'
                                    />
                                </Button>
                            </div>
                        </div>
                    </InlineMessage>
                </Root>
            );
        }

        return (
            <Root className={classes.heading}>
                <div className={classes.titleWrapper}>
                    <Typography variant='h4' component='h2' align='left' className={classes.mainTitle}>
                        <FormattedMessage
                            id='Apis.Details.local.Scopes.heading.edit.heading'
                            defaultMessage='Local Scopes'
                        />
                    </Typography>
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id='Apis.Details.Scopes.Scopes.heading.scope.title.tooltip2'
                                defaultMessage='Manage scopes that are local to this {type}'
                                values ={{
                                    type: getTypeToDisplay(api.apiType)
                                }}
                            />
                        )}
                        placement='top-end'
                    >
                        <IconButton size='small' aria-label='Local Scopes help text'>
                            <HelpOutlineIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant='outlined'
                        color='primary'
                        size='small'
                        disabled={this.isAccessRestricted() || api.isRevision || enableReadOnly}
                        component={Link}
                        to={!this.isAccessRestricted() && !api.isRevision && url}
                    >
                        <AddCircle className={classes.buttonIcon} />
                        <FormattedMessage
                            id='Apis.Details.Scopes.Scopes.heading.scope.add_new'
                            defaultMessage='Add New Local Scope'
                        />
                    </Button>
                    {this.isAccessRestricted() && (
                        <Grid item>
                            <Typography variant='body2' color='primary'>
                                <FormattedMessage
                                    id='Apis.Details.Scopes.Scopes.update.not.allowed'
                                    defaultMessage={
                                        '*You are not authorized to update scopes of'
                                        + ' the {type} due to insufficient permissions'
                                    }
                                    values={{
                                        type: getTypeToDisplay(api.apiType)
                                    }}
                                />
                            </Typography>
                        </Grid>
                    )}
                </div>

                <MUIDataTable title={false} data={scopesList} columns={columns} options={options}/>
            </Root>
        );
    }
}

Scopes.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({}),
    }),
    api: PropTypes.instanceOf(Object).isRequired,
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
};

Scopes.defaultProps = {
    match: { params: {} },
};

export default injectIntl(withAPI((Scopes)));
