/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import { ScopeValidation, resourceMethods, resourcePaths } from 'AppComponents/Shared/ScopeValidation';
import PropTypes from 'prop-types';
import AuthManager from 'AppData/AuthManager';

const PREFIX = 'AppsTableContent';

const classes = {
    head: `${PREFIX}-head`,
    body: `${PREFIX}-body`,
    root: `${PREFIX}-root`,
    root2: `${PREFIX}-root2`,
    fullHeight: `${PREFIX}-fullHeight`,
    tableRow: `${PREFIX}-tableRow`,
    appOwner: `${PREFIX}-appOwner`,
    appName: `${PREFIX}-appName`,
};

const StyledTableBody = styled(TableBody)((
    {
        theme,
    },
) => ({
    [`&.${classes.fullHeight}`]: {
        height: '100%',
    },

    [`& .${classes.tableRow}`]: {
        height: theme.spacing(5),
        '& td': {
            padding: theme.spacing(0.5),
        },
    },

    [`& .${classes.appOwner}`]: {
        pointerEvents: 'none',
    },

    [`& .${classes.appName}`]: {
        '& a': {
            color: '#1b9ec7 !important',
        },
    },
}));

const StyledTableCell = TableCell;

const StyledTableRow = TableRow;
/**
 *
 *
 * @class AppsTableContent
 * @extends {Component}
 */
class AppsTableContent extends Component {
    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            notFound: false,
        };
        this.APPLICATION_STATES = {
            CREATED: 'CREATED',
            APPROVED: 'APPROVED',
            REJECTED: 'REJECTED',
            DELETE_PENDING: 'DELETE_PENDING',
        };
    }

    /**
     * @inheritdoc
     * @memberof AppsTableContent
     */
    render() {
        const {
            apps, toggleDeleteConfirmation,
        } = this.props;
        const { notFound } = this.state;
        let appsTableData = [];

        if (apps) {
            appsTableData = [...apps.values()].map((app) => {
                const appInner = app;
                appInner.deleting = false;
                return appInner;
            });
        }
        if (notFound) {
            return <ResourceNotFound />;
        }
        return (
            <StyledTableBody className={classes.fullHeight}>
                {appsTableData
                    .map((app) => {
                        const isAppOwner = app.owner.toLowerCase() === AuthManager.getUser().name.toLowerCase();
                        return (
                            <StyledTableRow
                                className={classes.tableRow}
                                key={app.applicationId}
                                data-testid={'row-' + app.name}
                                classes={{
                                    root: classes.root2,
                                }}
                            >
                                <StyledTableCell
                                    align='left'
                                    className={classes.appName}
                                    classes={{
                                        head: classes.head,
                                        body: classes.body,
                                        root: classes.root,
                                    }}
                                >
                                    {app.status === this.APPLICATION_STATES.APPROVED
                                        || app.status === this.APPLICATION_STATES.DELETE_PENDING ? (
                                            <Link to={'/applications/' + app.applicationId}>{app.name}</Link>
                                        ) : (
                                            app.name
                                        )}
                                </StyledTableCell>
                                <StyledTableCell
                                    align='left'
                                    classes={{
                                        head: classes.head,
                                        body: classes.body,
                                        root: classes.root,
                                    }}
                                >
                                    {app.owner.toLowerCase()}
                                </StyledTableCell>
                                <StyledTableCell
                                    align='left'
                                    classes={{
                                        head: classes.head,
                                        body: classes.body,
                                        root: classes.root,
                                    }}
                                >
                                    {app.throttlingPolicy}
                                </StyledTableCell>
                                <StyledTableCell
                                    align='left'
                                    classes={{
                                        head: classes.head,
                                        body: classes.body,
                                        root: classes.root,
                                    }}
                                >
                                    {app.status === this.APPLICATION_STATES.APPROVED && (
                                        <Typography variant='subtitle1' component='label' gutterBottom>
                                            <FormattedMessage
                                                id='Applications.Listing.AppsTableContent.active'
                                                defaultMessage='ACTIVE'
                                            />
                                        </Typography>
                                    )}
                                    {app.status === this.APPLICATION_STATES.CREATED && (
                                        <>
                                            <Typography
                                                variant='subtitle1'
                                                component='label'
                                                gutterBottom
                                            >
                                                <FormattedMessage
                                                    id='Applications.Listing.AppsTableContent.inactive'
                                                    defaultMessage='INACTIVE'
                                                />

                                            </Typography>
                                            <Typography variant='caption' style={{ textIndent: '10px', display: 'inline-block' }}>
                                                <FormattedMessage
                                                    id='Applications.Listing.AppsTableContent.wait.approval'
                                                    defaultMessage='waiting for approval'
                                                />
                                            </Typography>
                                        </>
                                    )}
                                    {app.status === this.APPLICATION_STATES.REJECTED && (
                                        <Typography variant='subtitle1' component='label' gutterBottom>
                                            <FormattedMessage
                                                id='Applications.Listing.AppsTableContent.rejected'
                                                defaultMessage='REJECTED'
                                            />
                                        </Typography>
                                    )}
                                    {app.status === this.APPLICATION_STATES.DELETE_PENDING && (
                                        <Typography variant='subtitle1' component='label' gutterBottom>
                                            <FormattedMessage
                                                id='Applications.Listing.AppsTableContent.deletePending'
                                                defaultMessage='DELETE PENDING'
                                            />
                                        </Typography>
                                    )}
                                </StyledTableCell>
                                <StyledTableCell
                                    align='left'
                                    classes={{
                                        head: classes.head,
                                        body: classes.body,
                                        root: classes.root,
                                    }}
                                >
                                    {app.subscriptionCount}
                                </StyledTableCell>
                                <StyledTableCell
                                    align='left'
                                    classes={{
                                        head: classes.head,
                                        body: classes.body,
                                        root: classes.root,
                                    }}
                                >
                                    <ScopeValidation
                                        resourcePath={resourcePaths.SINGLE_APPLICATION}
                                        resourceMethod={resourceMethods.PUT}
                                    >
                                        {(app.status === this.APPLICATION_STATES.APPROVED
                                        || app.status === this.APPLICATION_STATES.DELETE_PENDING) && (
                                            <Tooltip title={isAppOwner
                                                ? (
                                                    <FormattedMessage
                                                        id='Applications.Listing.AppsTableContent.edit.tooltip'
                                                        defaultMessage='Edit'
                                                    />
                                                ) : (
                                                    <FormattedMessage
                                                        id='Applications.Listing.AppsTableContent.edit.tooltip.disabled.button'
                                                        defaultMessage='Not allowed to modify shared applications'
                                                    />
                                                )}
                                            >
                                                <span>
                                                    <Link
                                                        to={`/applications/${app.applicationId}/edit/`}
                                                        className={!isAppOwner && classes.appOwner}
                                                    >
                                                        <IconButton disabled={!isAppOwner} aria-label={'Edit' + app.name} size='large'>
                                                            <Icon>
                                                                edit
                                                            </Icon>
                                                        </IconButton>
                                                    </Link>
                                                </span>
                                            </Tooltip>
                                        )}
                                    </ScopeValidation>
                                    <ScopeValidation
                                        resourcePath={resourcePaths.SINGLE_APPLICATION}
                                        resourceMethod={resourceMethods.DELETE}
                                    >
                                        <Tooltip title={isAppOwner ? (
                                            <FormattedMessage
                                                id='Applications.Listing.AppsTableContent.delete.tooltip'
                                                defaultMessage='Delete'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='Applications.Listing.AppsTableContent.delete.tooltip.disabled.button'
                                                defaultMessage='Not allowed to delete shared applications'
                                            />
                                        )}
                                        >
                                            <span>
                                                <IconButton
                                                    className='itest-application-delete-button'
                                                    disabled={app.deleting || !isAppOwner
                                                        || app.status === this.APPLICATION_STATES.DELETE_PENDING}
                                                    data-appid={app.applicationId}
                                                    onClick={toggleDeleteConfirmation}
                                                    color='default'
                                                    aria-label={'Delete' + app.name}
                                                    id={'delete-' + app.name + '-btn'}
                                                    size='large'
                                                >
                                                    <Icon>delete</Icon>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </ScopeValidation>
                                    {app.deleting && <CircularProgress size={24} />}
                                </StyledTableCell>
                            </StyledTableRow>
                        );
                    })}
            </StyledTableBody>
        );
    }
}
AppsTableContent.propTypes = {
    toggleDeleteConfirmation: PropTypes.func.isRequired,
    apps: PropTypes.instanceOf(Map).isRequired,
};
export default (AppsTableContent);
