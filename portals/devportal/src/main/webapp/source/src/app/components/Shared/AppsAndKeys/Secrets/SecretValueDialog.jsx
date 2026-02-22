/*
* Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import { FormattedMessage } from 'react-intl';

import ViewSecret from "../ViewSecret";

export default function SecretValueDialog({ open, onClose, secret }) {

    if (!secret) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                <FormattedMessage
                    id='Shared.AppsAndKeys.Secrets.SecretValueDialog.secret.generate.success.dialog.title'
                    defaultMessage='Secret Generated Successfully'
                />
            </DialogTitle>

            <DialogContent>
                <DialogContentText component="div">
                    <ViewSecret secret={{ consumerSecret: secret }} isGenerated={true} />
                </DialogContentText>
            </DialogContent>

            <DialogActions
                sx={{
                    justifyContent: "space-between",
                    px: 3,
                    pb: 2,
                }}
            >
                <Button onClick={onClose} variant="contained" color="primary">
                    <FormattedMessage
                        id='Shared.AppsAndKeys.Secrets.SecretValueDialog.close.button'
                        defaultMessage='Close'
                    />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
