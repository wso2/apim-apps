/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { Box, Typography } from '@mui/material';
import { useHistory } from "react-router-dom";

import HumanizedStackTrace from './HumanizedStackTrace/HumanizedStackTrace';

/**
 *
 * @returns
 */
export default function ErrorDetails(props: any) {
    const { handleClose, error } = props;
    const [userInfo, setUserInfo] = useState('');
    const history = useHistory();
    useEffect(() => {
        const prettyUser = JSON.stringify(
            JSON.parse(localStorage.getItem('wso2_user_publisher_Default') || ''),
            null,
            2,
        );
        setUserInfo(prettyUser);
    }, []);
    
    return (
        <Dialog
            fullWidth
            maxWidth='lg'
            open
            onClose={handleClose}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                    <Box mb={2}>
                        <Typography variant='h6'>Stack trace</Typography>
                        <Divider variant='middle' />
                    </Box>
                    <HumanizedStackTrace error={error} />
                    <Box mt={2}>
                        <Typography variant='h6'>User info</Typography>
                        <Divider variant='middle' />
                    </Box>
                    <Box bgcolor='#e5e5e5' color='black'>
                        <pre>
                            {userInfo}
                        </pre>
                    </Box>
                    <Box mt={2}>
                        <Typography variant='h6'>Location info</Typography>
                        <Divider variant='middle' />
                    </Box>
                    <Box bgcolor='#e5e5e5' color='black'>
                        <pre>
                            {JSON.stringify(history.location, null, 2)}
                        </pre>
                    </Box>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color='primary' autoFocus>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
