/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const ProviderCreateMenuSection = (props) => {
    const {
        title, children,
    } = props;


    return (
        <Grid>
            <Box pl={3}>
                <Box mb={1}>
                    <Typography
                        variant='h6'
                        align='left'
                    >
                        {title}
                    </Typography>
                </Box>
                <Grid
                    container
                    direction='column'
                    justify='flex-start'
                    alignItems='flex-start'
                    spacing={1}
                >
                    {/* Menu links or buttons */}
                    {children}
                </Grid>
            </Box>
        </Grid>
    );
};

export default ProviderCreateMenuSection;
