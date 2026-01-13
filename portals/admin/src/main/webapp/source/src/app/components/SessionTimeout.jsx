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
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useEffect, useRef } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import Configurations from 'Config';
import ConfirmDialog from 'AppComponents/Shared/ConfirmDialog';

const SessionTimeout = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0); // To track remaining time
    const openDialogRef = useRef(openDialog); // Create a ref to track openDialog state

    // Use refs to hold values that are mutated from closures and should persist
    const idleTimeoutRef = useRef(0);
    const idleWarningTimeoutRef = useRef(0);
    const idleSecondsCounterRef = useRef(0);

    const handleTimeOut = (idleSecondsCount) => {
        // Only update the remaining time if the warning timeout is reached
        if (idleSecondsCount >= idleWarningTimeoutRef.current) {
            setRemainingTime(idleTimeoutRef.current - idleSecondsCount); // Update remaining time
        }
        if (idleSecondsCount === idleWarningTimeoutRef.current) {
            setOpenDialog(true); // Open dialog when warning timeout is reached
        }
        if (idleSecondsCount === idleTimeoutRef.current) {
            // Logout if the idle timeout is reached
            setOpenDialog(false); // Close dialog if it was open
            window.location = Configurations.app.context + '/services/logout';
        }
    };

    useEffect(() => {
        openDialogRef.current = openDialog; // Update the ref whenever openDialog changes
    }, [openDialog]);

    useEffect(() => {
        if (!(Configurations.sessionTimeout && Configurations.sessionTimeout.enable)) {
            return () => { };
        }

        idleTimeoutRef.current = Configurations.sessionTimeout.idleTimeout;
        idleWarningTimeoutRef.current = Configurations.sessionTimeout.idleWarningTimeout;

        const resetIdleTimer = () => {
            if (!openDialogRef.current) {
                idleSecondsCounterRef.current = 0;
            }
        };

        document.onclick = resetIdleTimer;
        document.onmousemove = resetIdleTimer;
        document.onkeydown = resetIdleTimer;

        const worker = new Worker(new URL('../webWorkers/timer.worker.js', import.meta.url));
        worker.onmessage = () => {
            // increment the ref and pass the new value
            idleSecondsCounterRef.current += 1;
            handleTimeOut(idleSecondsCounterRef.current);
        };

        // Cleanup function to remove event listeners and terminate the worker
        return () => {
            document.onclick = null;
            document.onmousemove = null;
            document.onkeydown = null;
            worker.terminate();
        };
    }, []);

    const handleConfirmDialog = (res) => {
        if (res) {
            setOpenDialog(false);
            idleSecondsCounterRef.current = 0; // Reset the idle timer stored in ref
        } else {
            window.location = Configurations.app.context + '/services/logout';
        }
    };

    return (
        <div>
            <ConfirmDialog
                key='key-dialog'
                labelCancel={(
                    <FormattedMessage
                        id='SessionTimeout.dialog.label.cancel'
                        defaultMessage='Logout'
                    />
                )}
                title={(
                    <FormattedMessage
                        id='SessionTimeout.dialog.title'
                        defaultMessage='Are you still there?'
                    />
                )}
                message={(
                    <FormattedMessage
                        id='SessionTimeout.dialog.message'
                        defaultMessage={
                            'Your session is about to expire due to inactivity. To keep your session active, '
                            + 'click "Stay Logged In". If no action is taken, '
                            + 'you will be logged out automatically in {time} seconds, for security reasons.'
                        }
                        values={{ time: remainingTime }} // Use remainingTime here
                    />
                )}
                labelOk={(
                    <FormattedMessage
                        id='SessionTimeout.dialog.label.ok'
                        defaultMessage='Stay Logged In'
                    />
                )}
                callback={handleConfirmDialog}
                open={openDialog}
            />
        </div>
    );
};

export default injectIntl(SessionTimeout);
