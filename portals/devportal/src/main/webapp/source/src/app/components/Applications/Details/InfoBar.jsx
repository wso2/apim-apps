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

import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import { FormattedMessage, injectIntl } from 'react-intl';
import Loading from 'AppComponents/Base/Loading/Loading';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import Grid from '@mui/material/Grid';
import Application from 'AppData/Application';
import Alert from 'AppComponents/Shared/Alert';
import AuthManager from 'AppData/AuthManager';
import Box from '@mui/material/Box';
import DeleteConfirmation from '../Listing/DeleteConfirmation';

/**
 *
 *
 * @class InfoBar
 * @extends {React.Component}
 */
class InfoBar extends React.Component {
    /**
     * @param {Object} props props passed from above
     */
    constructor(props) {
        super(props);
        this.state = {
            notFound: false,
            showOverview: true,
            isDeleteOpen: false,
        };
        this.toggleOverview = this.toggleOverview.bind(this);
        this.handleAppDelete = this.handleAppDelete.bind(this);
        this.handleDeleteConfimation = this.handleDeleteConfimation.bind(this);
        this.toggleDeleteConfirmation = this.toggleDeleteConfirmation.bind(this);
    }

    toggleDeleteConfirmation = () => {
        this.setState(({ isDeleteOpen }) => ({ isDeleteOpen: !isDeleteOpen }));
    }

    /**
     * Handles application deletion
     * @memberof InfoBar
     */
    handleAppDelete() {
        const { applicationId, intl, application } = this.props;
        const promisedDelete = Application.deleteApp(applicationId);
        let message = intl.formatMessage({
            defaultMessage: 'In Application {name} deleted successfully!',
            id: 'Applications.Details.InfoBar.application.deleted.successfully',
        }, { name: application.name });
        promisedDelete.then((status) => {
            if (status === 200) {
                Alert.info(message);
                this.toggleDeleteConfirmation();
            } else if (status === 201) {
                Alert.info(intl.formatMessage({
                    defaultMessage: 'Delete request created for application {name}',
                    id: 'Applications.Listing.Listing.application.deleting.requested',
                }, { name: application.name }));
                this.toggleDeleteConfirmation();
            }
            this.props.history.push('/applications');
        }).catch((error) => {
            console.log(error);
            message = intl.formatMessage({
                defaultMessage: 'Error while deleting application {name}',
                id: 'Applications.Details.InfoBar.application.deleting.error',
            }, { name: application.name });
            Alert.error(message);
        });
    }

    /**
     * Handles delete confimation
     * @memberof InfoBar
     */
    handleDeleteConfimation() {
        const { isDeleteOpen } = this.state;
        this.setState({ isDeleteOpen: !isDeleteOpen });
    }

    /**
     * Toggles the showOverview state
     * @param {boolean} todo toggle state
     * @memberof InfoBar
     */
    toggleOverview(todo) {
        if (typeof todo === 'boolean') {
            this.setState({ showOverview: todo });
        } else {
            this.setState((prevState) => ({ showOverview: !prevState.showOverview }));
        }
    }

    /**
     * @returns {div}
     * @memberof InfoBar
     */
    render() {
        const {
            applicationId, application,
        } = this.props;
        const applicationOwner = this.props.application.owner;
        const {
            notFound, isDeleteOpen,
        } = this.state;

        if (notFound) {
            return (
                <ResourceNotFound
                    message={(
                        <FormattedMessage
                            id='Applications.Details.InfoBar.listing.resource.not.found'
                            defaultMessage='Resource Not Fount'
                        />
                    )}
                />
            );
        }

        if (!application) {
            return <Loading />;
        }
        const isUserOwner = AuthManager.getUser().name === applicationOwner;

        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={(theme) => ({
                    height: theme.custom.infoBar.height || 70,
                    background: theme.custom.infoBar.background || '#ffffff',
                    color: theme.palette.getContrastText(theme.custom.infoBar.background || '#ffffff'),
                    borderBottom: 'solid 1px ' + theme.palette.grey.A200,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: theme.spacing(2),
                })}
                >
                    <Grid item xs={10}>
                        <Box sx={(theme) => ({ marginLeft: theme.spacing(1) })}>
                            <Link
                                to={'/applications/' + applicationId + '/overview'}
                                className={(theme) => ({
                                    color: theme.palette.getContrastText(theme.custom.infoBar.background),
                                })}
                            >
                                <Typography id='itest-info-bar-application-name' variant='h4'>{application.name}</Typography>
                            </Link>
                        </Box>
                        <Box sx={(theme) => ({ marginLeft: theme.spacing(1) })}>
                            <Typography variant='caption' gutterBottom align='left' noWrap>
                                {application.subscriptionCount}
                                {' '}
                                <FormattedMessage
                                    id='Applications.Details.InfoBar.subscriptions'
                                    defaultMessage='Subscriptions'
                                />
                            </Typography>
                        </Box>
                    </Grid>
                    {isUserOwner && (
                        <Grid container justifyContent='flex-end'>
                            <VerticalDivider height={70} />
                            <Grid
                                item
                                xs={1}
                                m={3}
                                sx={(theme) => ({
                                    display: 'inline-grid',
                                    cursor: 'pointer',
                                    justifyContent: 'center',
                                    '& .material-icons, & span': {
                                        color: theme.palette.getContrastText(theme.custom.infoBar.background),
                                    },
                                })}
                            >
                                <Link
                                    to={`/applications/${applicationId}/edit/fromView`}
                                    sx={(theme) => ({
                                        display: 'inline-grid',
                                        cursor: 'pointer',
                                        '& .material-icons, & span': {
                                            color: theme.palette.getContrastText(theme.custom.infoBar.background),
                                        },
                                    })}
                                >
                                    <Button
                                        id='edit-application'
                                        style={{ padding: '4px', display: 'flex', flexDirection: 'column' }}
                                        color='grey'
                                        classes={{
                                            label: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                            },
                                        }}
                                        aria-label={(
                                            <FormattedMessage
                                                id='Applications.Details.InfoBar.edit'
                                                defaultMessage='Edit'
                                            />
                                        )}
                                    >
                                        <Icon>edit</Icon>
                                        <Typography variant='caption' style={{ marginTop: '2px' }}>
                                            <FormattedMessage
                                                id='Applications.Details.InfoBar.edit.text'
                                                defaultMessage='Edit'
                                            />
                                        </Typography>
                                    </Button>
                                </Link>
                            </Grid>
                            <VerticalDivider height={70} />
                            <Grid
                                item
                                xs={1}
                                m={1}
                                sx={(theme) => ({
                                    display: 'inline-grid',
                                    cursor: 'pointer',
                                    '& .material-icons, & span': {
                                        color: theme.palette.getContrastText(theme.custom.infoBar.background),
                                    },
                                })}
                            >
                                <Button
                                    id='delete-application'
                                    onClick={this.handleDeleteConfimation}
                                    style={{ padding: '4px', display: 'flex', flexDirection: 'column' }}
                                    disabled={AuthManager.getUser().name !== applicationOwner
                                        || this.props.application.status === 'DELETE_PENDING'}
                                    color='grey'
                                    classes={{
                                        label: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                        },
                                    }}
                                    aria-label={(
                                        <FormattedMessage
                                            id='Applications.Details.InfoBar.delete'
                                            defaultMessage='Delete'
                                        />
                                    )}
                                >
                                    <Icon>delete</Icon>
                                    <Typography variant='caption' style={{ marginTop: '2px' }}>
                                        <FormattedMessage
                                            id='Applications.Details.InfoBar.text'
                                            defaultMessage='Delete'
                                        />
                                    </Typography>
                                </Button>
                                <DeleteConfirmation
                                    handleAppDelete={this.handleAppDelete}
                                    isDeleteOpen={isDeleteOpen}
                                    toggleDeleteConfirmation={this.toggleDeleteConfirmation}
                                />
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Box>
        );
    }
}
InfoBar.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    applicationId: PropTypes.string.isRequired,
};

export default injectIntl(withRouter((InfoBar)));
