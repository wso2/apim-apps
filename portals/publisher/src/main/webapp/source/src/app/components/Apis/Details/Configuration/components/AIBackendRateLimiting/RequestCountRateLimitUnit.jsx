/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem, TextField } from '@mui/material';

// time unit enum
const timeUnitEnum = {
    SECOND: 'SECOND',
    MINUTE: 'MINUTE',
    HOUR: 'HOUR',
};

export default function RequestCountRateLimitUnit(props) {
    const { api, configDispatcher, isProduction } = props; //eslint-disable-line
    // const intl = useIntl();

    let maxTpsUnitValue;
    if (api.maxTps) {
        maxTpsUnitValue = isProduction ? api.maxTps.productionTimeUnit : api.maxTps.sandboxTimeUnit;
    }

    if (!maxTpsUnitValue) {
        maxTpsUnitValue = timeUnitEnum.SECOND;
    }

    return (
        <>
            <TextField
                label='Time Unit'
                id='time-unit-selector'
                value={maxTpsUnitValue}
                select
                SelectProps={{
                    MenuProps: {
                        anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                        },
                        getContentAnchorEl: null,
                    },
                }}
                name='selectTimeUnit'
                onChange={(event) => {
                    const value = isProduction ?
                        { ...api.maxTps, productionTimeUnit: event.target.value } :
                        { ...api.maxTps, sandboxTimeUnit: event.target.value };
                    configDispatcher({
                        action: 'maxTps',
                        value,
                    });
                }}
                margin='normal'
                variant='outlined'
                sx={{
                    '& .MuiInputBase-root': {
                        '&:before': { borderBottom: 'none' }, // Remove underline
                        '&:after': { borderBottom: 'none' }, // Remove underline
                    },
                }}
            >
                {Object.keys(timeUnitEnum).map((unit) => (
                    <MenuItem key={unit} value={unit}>
                        {unit}
                    </MenuItem>
                ))}
            </TextField>
        </>
    );
}

RequestCountRateLimitUnit.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
    isProduction: PropTypes.bool.isRequired,
};