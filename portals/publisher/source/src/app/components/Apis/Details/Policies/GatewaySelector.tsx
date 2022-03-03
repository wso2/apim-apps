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

import React, { FC, useState } from 'react';
import { HelpOutline } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    DialogActions,
    Radio,
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { FormattedMessage } from 'react-intl';

const SupportedGatewayTypes = {
    REGULAR: 'Regular Gateway',
    CC: 'Choreo Connect',
};

interface GatewaySelectorProps {
    getGatewayType: (isCCEnabled: boolean) => void;
    isChoreoConnectEnabled: boolean;
}

/**
 * Renders the Gateway selection section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Radio group for the API Gateway.
 */
const GatewaySelector: FC<GatewaySelectorProps> = ({
    getGatewayType,
    isChoreoConnectEnabled
}) => {
    const [apiFromContext] = useAPI();
    let selectedGatewayType;

    const [isRadioButtonChange, setRadioButtonChange] = useState(false);

    const saveAfterGatewayChange = () => {
        if (isChoreoConnectEnabled) {
            getGatewayType(false); 
        } else {
            getGatewayType(true);
        }
        setRadioButtonChange(false);
    }

    (() => {
        if (isChoreoConnectEnabled) {
            selectedGatewayType = SupportedGatewayTypes.CC;
        } else {
            selectedGatewayType = SupportedGatewayTypes.REGULAR;
        }
    })();

    /**
     * Handles accepted gateway type change after approving dialog box.
     */
    const handleApprovedGatewayChange = () => {
        setRadioButtonChange(true);
    };

    /**
     * Handles discarded gateway type change after cancelling dialog box.
     */
    const handleDiscardedGatewayChange = () => {
        setRadioButtonChange(false);
    };

    return (
        <Paper>
            <Grid container direction='row' spacing={3}>
                <Grid item md={12} xs={12}>
                    <Box
                        display='flex'
                        flexDirection='row'
                        justifyContent='space-between'
                        alignItems='center'
                        ml={3}
                        mr={5}
                    >
                        <Box>
                            <Typography
                                variant='subtitle1'
                                component='h3'
                                gutterBottom
                            >
                                API Gateway
                                <Tooltip
                                    title='Policy list is dependant on the selected Gateway'
                                    placement='right-start'
                                    interactive
                                >
                                    <IconButton aria-label='API Gateway selector help text'>
                                        <HelpOutline />
                                    </IconButton>
                                </Tooltip>
                            </Typography>
                        </Box>
                        <Box>
                            <FormControl component='fieldset'>
                                <RadioGroup
                                    aria-label='gateway'
                                    row
                                    aria-labelledby='gateway-selector-radio-buttons-group-label'
                                    name='gateway-selector-radio-buttons-group'
                                    value={selectedGatewayType}
                                >
                                    <FormControlLabel
                                        value={SupportedGatewayTypes.REGULAR}
                                        control={
                                            <Radio
                                                color='primary'
                                                defaultChecked
                                                id='regularGateway'
                                                disabled={isRestricted(
                                                    ['apim:api_create'],
                                                    apiFromContext,
                                                )}
                                                onChange={
                                                    handleApprovedGatewayChange
                                                }
                                            />
                                        }
                                        label='Regular Gateway'
                                        labelPlacement='end'
                                    />
                                    <FormControlLabel
                                        value={SupportedGatewayTypes.CC}
                                        control={
                                            <Radio
                                                color='primary'
                                                disabled
                                                onChange={handleApprovedGatewayChange}
                                            />
                                        }
                                        label='Choreo Connect'
                                        labelPlacement='end'
                                    />
                                </RadioGroup>
                            </FormControl>
                            <Dialog open={isRadioButtonChange}>
                                <DialogTitle>
                                    <Typography>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.GatewaySelector.change.gateway.confirm.title'
                                            defaultMessage='Change Gateway Type'
                                        />
                                    </Typography>
                                </DialogTitle>
                                <DialogContent>
                                    <Typography>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.GatewaySelector.change.gateway.confirm.content'
                                            defaultMessage={
                                                'Changing the gateway type will remove all existing policies ' +
                                                'added to the API.'
                                            }
                                        />
                                    </Typography>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={handleDiscardedGatewayChange}
                                        color='primary'
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Policies.GatewaySelector.change.gateway.confirm.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                    <Button
                                        onClick={saveAfterGatewayChange}
                                        color='primary'
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Policies.GatewaySelector.change.gateway.confirm.proceed'
                                            defaultMessage='Proceed'
                                        />
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default GatewaySelector;
