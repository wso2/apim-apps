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

import React, { FC } from 'react';
import { HelpOutline } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import { Radio } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const SupportedGatewayTypes = {
    REGULAR: 'Regular Gateway',
    CC: 'Choreo Connect',
};

interface GlobalPolicyGatewaySelectorProps {
    handleGatewayTypeSelection: (isCCEnabled: boolean) => void;
    isAllowedToFilterCCPolicies: boolean;
}


/**
 * Renders the Gateway selection section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Radio group for the API Gateway type for policies.
 */
const GlobalPolicyGatewaySelector: FC<GlobalPolicyGatewaySelectorProps> = ({
    handleGatewayTypeSelection,
    isAllowedToFilterCCPolicies
}) => {

    const handleRadioButtonSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.value === SupportedGatewayTypes.CC) {
            handleGatewayTypeSelection(true)
        } else {
            handleGatewayTypeSelection(false);
        }
    }

    let selectedGatewayType;
    if (isAllowedToFilterCCPolicies) {
        selectedGatewayType = SupportedGatewayTypes.CC;
    } else {
        selectedGatewayType = SupportedGatewayTypes.REGULAR;
    }

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
                            <Typography variant='subtitle1' component='h3' gutterBottom>
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
                                    name='gateway-selector-radio-buttons-group'
                                    value={selectedGatewayType}
                                    onChange={handleRadioButtonSelection}
                                >
                                    <FormControlLabel
                                        value={SupportedGatewayTypes.REGULAR}
                                        control={
                                            <Radio color='primary'
                                                defaultChecked
                                                inputProps={{
                                                    'aria-label': 'Regular Gateway',
                                                }}
                                                
                                            />
                                        }
                                        label='Regular Gateway'
                                    />
                                    <FormControlLabel
                                        value={SupportedGatewayTypes.CC}
                                        control={
                                            <Radio
                                                color='primary'
                                                inputProps={{
                                                    'aria-label': 'Choreo Connect',
                                                }}
                                            />
                                        }
                                        label='Choreo Connect'
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default GlobalPolicyGatewaySelector;
