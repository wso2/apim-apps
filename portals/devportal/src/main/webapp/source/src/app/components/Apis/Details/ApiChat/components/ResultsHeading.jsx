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
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const PREFIX = 'ResultsHeading';

const classes = {
    testResultsHeading: `${PREFIX}-testResultsHeading`,
    testResultsTitle: `${PREFIX}-testResultsTitle`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.testResultsHeading}`]: {
        display: 'flex',
        gridGap: theme.spacing(2),
        alignItems: 'center',
        marginBottom: theme.spacing(2.5),
    },
    [`& .${classes.testResultsTitle}`]: {
        flexGrow: 1,
    },
}));

const ResultsHeading = () => {
    return (
        <Root>
            <Box className={classes.testResultsHeading}>
                <Box className={classes.testResultsTitle}>
                    <Typography gutterBottom variant='h7'>
                        <FormattedMessage
                            id='Apis.Details.ApiChat.ApiChat.ResultsHeading.title'
                            defaultMessage='Execution Results'
                        />
                    </Typography>
                </Box>
            </Box>
        </Root>
    );
};

export default ResultsHeading;
