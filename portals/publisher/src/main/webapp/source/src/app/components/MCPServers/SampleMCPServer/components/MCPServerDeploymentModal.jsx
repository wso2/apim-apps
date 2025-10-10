/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Link as RouterLink } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { FormattedMessage } from 'react-intl';
import AuthManager from 'AppData/AuthManager';
import TaskState from 'AppComponents/Apis/Listing/SampleAPI/components/TaskState';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

const PREFIX = 'MCPServerDeploymentModal';

const classes = {
    wrapper: `${PREFIX}-wrapper`,
};

const StyledModal = styled(Modal)(({ theme }) => ({
    '&': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    [`& .${classes.wrapper}`]: {
        width: theme.spacing(35),
        borderRadius: theme.spacing(1),
        outline: 'none',
        padding: theme.spacing(1),
    },
}));

/**
 * Shared modal component for MCP Server deployment progress
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const MCPServerDeploymentModal = ({
    open,
    tasksStatus,
    onClose,
    newMCPServer,
    showPublisherTasks,
}) => {
    const anyErrors = Object.values(tasksStatus).map((tasks) => tasks.errors).find((error) => error !== false);

    return (
        <StyledModal
            aria-labelledby='transition-modal-title'
            aria-describedby='transition-modal-description'
            open={open}
            closeAfterTransition
        >
            <Fade in={open}>
                <Box
                    bgcolor='background.paper'
                    className={classes.wrapper}
                >
                    <Grid
                        container
                        direction='row'
                        justifyContent='center'
                        alignItems='center'
                    >
                        <TaskState
                            completed={tasksStatus.create.completed}
                            errors={tasksStatus.create.errors}
                            inProgress={tasksStatus.create.inProgress}
                            completedMessage={
                                <FormattedMessage
                                    id='MCPServers.Listing.SampleMCPServer.popup.create.complete'
                                    defaultMessage='MCP Server created successfully!'
                                />
                            }
                            inProgressMessage={
                                <FormattedMessage
                                    id='MCPServers.Listing.SampleMCPServer.popup.create.inprogress'
                                    defaultMessage='Creating sample MCP Server with OpenAPI definition...'
                                />
                            }
                        >
                            Create MCP Server
                        </TaskState>
                        
                        {showPublisherTasks && !AuthManager.isNotPublisher() && (
                            <>
                                <TaskState
                                    completed={tasksStatus.revision.completed}
                                    errors={tasksStatus.revision.errors}
                                    inProgress={tasksStatus.revision.inProgress}
                                    completedMessage={
                                        <FormattedMessage
                                            id='MCPServers.Listing.SampleMCPServer.popup.revision.complete'
                                            defaultMessage='MCP Server revision created successfully!'
                                        />
                                    }
                                    inProgressMessage={
                                        <FormattedMessage
                                            id='MCPServers.Listing.SampleMCPServer.popup.revision.inprogress'
                                            defaultMessage='Creating a revision of sample MCP Server ...'
                                        />
                                    }
                                >
                                    Revision MCP Server
                                </TaskState>
                                <TaskState
                                    pending={tasksStatus.deploy.pending}
                                    completed={tasksStatus.deploy.completed}
                                    errors={tasksStatus.deploy.errors}
                                    inProgress={tasksStatus.deploy.inProgress}
                                    pendingMessage={
                                        <FormattedMessage
                                            id='MCPServers.Listing.SampleMCPServer.popup.deploy.pending'
                                            defaultMessage='MCP Server revision deployment request sent'
                                        />
                                    }
                                    completedMessage={
                                        <FormattedMessage
                                            id='MCPServers.Listing.SampleMCPServer.popup.deploy.complete'
                                            defaultMessage='MCP Server deployed successfully!'
                                        />
                                    }
                                    inProgressMessage={
                                        <FormattedMessage
                                            id='MCPServers.Listing.SampleMCPServer.popup.deploy.inprogress'
                                            defaultMessage='Deploying sample MCP Server ...'
                                        />
                                    }
                                >
                                    Deploying MCP Server
                                </TaskState>
                                <TaskState
                                    completed={tasksStatus.publish.completed}
                                    errors={tasksStatus.publish.errors}
                                    inProgress={tasksStatus.publish.inProgress}
                                    completedMessage={
                                        <FormattedMessage
                                            id='MCPServers.Listing.SampleMCPServer.popup.publish.complete'
                                            defaultMessage='MCP Server published successfully!'
                                        />
                                    }
                                    inProgressMessage={
                                        <FormattedMessage
                                            id='MCPServers.Listing.SampleMCPServer.popup.publish.inprogress'
                                            defaultMessage='Publishing MCP Server to developer portal ...'
                                        />
                                    }
                                >
                                    Publish MCP Server
                                </TaskState>
                            </>
                        )}
                        
                        {anyErrors && (
                            <Grid container justifyContent='flex-end' gap={2}
                                paddingRight={1} paddingBottom={1} alignItems='center'>
                                <Grid item>
                                    <Button
                                        onClick={onClose}
                                        variant='outlined'
                                    >
                                        <FormattedMessage
                                            id='MCPServers.Listing.SampleMCPServer.continue.on.close'
                                            defaultMessage='Close'
                                        />
                                    </Button>
                                </Grid>
                                {newMCPServer && (
                                    <Grid item>
                                        <Link
                                            variant='body2'
                                            underline='none'
                                            component={RouterLink}
                                            to={`/mcp-servers/${newMCPServer.id}/overview`}
                                        >
                                            <FormattedMessage
                                                id='MCPServers.Listing.SampleMCPServer.continue.on.error'
                                                defaultMessage='Continue'
                                            />
                                        </Link>
                                    </Grid>
                                )}
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Fade>
        </StyledModal>
    );
};

MCPServerDeploymentModal.defaultProps = {
    showPublisherTasks: true,
};

MCPServerDeploymentModal.propTypes = {
    open: PropTypes.bool.isRequired,
    tasksStatus: PropTypes.shape({}).isRequired,
    onClose: PropTypes.func.isRequired,
    newMCPServer: PropTypes.shape({}).isRequired,
    showPublisherTasks: PropTypes.bool,
};

export default MCPServerDeploymentModal;
