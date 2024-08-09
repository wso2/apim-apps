/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { FormattedMessage, useIntl } from 'react-intl';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import Alert from 'AppComponents/Shared/Alert';

/**
 *
 *
 * @export
 * @returns
 */
export default function DeletePermission(props) {
    const {
        onDelete, role, isAlias,
    } = props;
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const intl = useIntl();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const handleConfirmation = (event) => {
        const { id } = event.currentTarget;
        setIsDeleting(true);
        Promise.resolve(onDelete(id, isAlias))
            .then(() => {
                Alert.info(
                    <span>
                        {intl.formatMessage(
                            {
                                id: 'RolePermissions.ListRoles.scope.assignment.delete.scope.success',
                                defaultMessage: 'Scope Assignments {role} deleted successfully',
                            },
                            {
                                role: <b>{role}</b>,
                            },
                        )}
                    </span>,
                );
                handleClose();
            })
            .catch((error) => {
                Alert.error(
                    intl.formatMessage({
                        id: 'RolePermissions.Common.DeletePermission.delete.scope.error',
                        defaultMessage: 'Something went wrong while deleting the scope assignments',
                    }),
                );
                console.error(error);
            })
            .finally(() => setIsDeleting(false));
    };
    return (
        <>
            <Button
                onClick={handleClickOpen}
                size='small'
                variant='outlined'
                data-testid={role + '-delete-btn'}
            >
                <FormattedMessage
                    id='RolePermissions.ListRoles.scope.assignment.delete.button'
                    defaultMessage='Delete'
                />
            </Button>
            <Dialog
                fullWidth
                maxWidth='xs'
                open={open}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick' || !isDeleting) {
                        handleClose(event, reason);
                    }
                }}
                aria-labelledby='delete-confirmation'
            >
                <DialogTitle id='delete-confirmation'>
                    {intl.formatMessage(
                        {
                            id: 'RolePermissions.ListRoles.scope.assignment.delete.dialog.title',
                            defaultMessage: 'Delete scope assignments of {role} ?',
                        },
                        {
                            role: <Typography display='inline' variant='subtitle2'>{role}</Typography>,
                        },
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    <Box mt={2} mb={2} ml={1}>
                        {intl.formatMessage(
                            {
                                id: 'RolePermissions.ListRoles.scope.assignment.delete.dialog.content',
                                defaultMessage: 'Are you sure you want to delete scope assignments for '
                                    + '{role} ?',
                            },
                            {
                                role: <b>{role}</b>,
                            },
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined'>
                        <FormattedMessage
                            id='RolePermissions.ListRoles.scope.assignment.cancel.button'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        size='small'
                        variant='contained'
                        color='primary'
                        onClick={handleConfirmation}
                        id={role}
                        disabled={isDeleting}
                    >
                        {isDeleting && <CircularProgress size={16} />}
                        <FormattedMessage
                            id='RolePermissions.ListRoles.scope.assignment.delete.button'
                            defaultMessage='Delete'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
