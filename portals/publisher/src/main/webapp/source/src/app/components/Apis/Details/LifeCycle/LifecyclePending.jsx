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

import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import Alert from 'AppComponents/Shared/Alert';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import MCPServer from 'AppData/MCPServer';

const lifecyclePending = (props) => {
    const { currentState } = props;
    const intl = useIntl();
    const [isOpen, setOpen] = useState(false);
    const [api, updateAPI] = useAPI();
    const isMCPServer = api.apiType.toUpperCase() === MCPServer.CONSTS.MCP;
    const deleteTask = () => {
        const { id } = api;
        let deleteTaskPromise;
        if (isMCPServer) {
            deleteTaskPromise = MCPServer.cancelLifecyclePendingTask(id);
        } else {
            deleteTaskPromise = api.cleanupPendingTask(id);
        }
        deleteTaskPromise
            .then(() => {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Details.LifeCycle.LifeCycleUpdate.LifecyclePending.success',
                    defaultMessage: 'Lifecycle task deleted successfully',
                }));
                updateAPI();
            })
            .catch((errorResponse) => {
                console.error(errorResponse);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.LifeCycle.LifeCycleUpdate.LifecyclePending.error',
                    defaultMessage: 'Error while deleting task',
                }));
            })
            .finally(() => { setOpen(false); });
    };
    return (
        <Paper>
            <Box display='block' p={2} mt={2}>
                <Box display='block'>
                    <Typography variant='h6'>
                        <FormattedMessage
                            id='Apis.Details.LifeCycle.LifeCycleUpdate.LifecyclePending.pending'
                            defaultMessage='Pending lifecycle state change.'
                        />
                    </Typography>
                </Box>
                <Box display='block' mt={0.5}>
                    <Typography variant='subtitle2'>
                        <FormattedMessage
                            id='Apis.Details.LifeCycle.LifeCycleUpdate.LifecyclePending.current.state'
                            defaultMessage='Current state is'
                        />
                        {' '}
                        {currentState}
                    </Typography>
                </Box>
                <Box display='flex' mt={2}>
                    <Button
                        size='small'
                        variant='contained'
                        color='primary'
                        onClick={() => setOpen(true)}
                    >
                        <FormattedMessage
                            id='Apis.Details.LifeCycle.LifeCycleUpdate.LifecyclePending.delete.task'
                            defaultMessage='Delete Task'
                        />
                    </Button>

                </Box>
            </Box>
            <Dialog open={isOpen} transition={Slide}>
                <DialogTitle>
                    <FormattedMessage
                        id='Apis.Details.LifeCycle.LifeCycleUpdate.LifecyclePending.dialog.title'
                        defaultMessage='Delete Task'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage
                            id='Apis.Details.LifeCycle.LifeCycleUpdate.LifecyclePending.dialog.text.description'
                            defaultMessage='The life cycle task will be removed'
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button dense onClick={() => setOpen(false)}>
                        <FormattedMessage
                            id='Apis.Details.LifeCycle.LifeCycleUpdate.LifecyclePending.dialog.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        size='small'
                        variant='text'
                        color='primary'
                        onClick={deleteTask}
                    >
                        <FormattedMessage
                            id='Apis.Details.LifeCycle.LifeCycleUpdate.LifecyclePending.dialog,delete'
                            defaultMessage='Delete'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};
lifecyclePending.propTypes = {
    currentState: PropTypes.string.isRequired,
};
export default lifecyclePending;
