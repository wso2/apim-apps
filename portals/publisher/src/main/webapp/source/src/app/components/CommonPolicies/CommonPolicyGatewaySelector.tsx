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
import { HelpOutline } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { Radio } from '@mui/material';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const SupportedGatewayTypes = {
    REGULAR: 'Regular Gateway',
    CC: 'Choreo Connect',
};

interface CommonPolicyGatewaySelectorProps {
    handleGatewayTypeSelection: (isCCEnabled: boolean) => void;
    isAllowedToFilterCCPolicies: boolean;
}


/**
 * Renders the Gateway selection section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Radio group for the API Gateway type for policies.
 */
const CommonPolicyGatewaySelector: FC<CommonPolicyGatewaySelectorProps> = ({
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

export default CommonPolicyGatewaySelector;
