/* eslint-disable */
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
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const WelcomeMessage = () => {    
    return (
      <Stack spacing={2} sx={{ maxWidth: '100%', alignItems: 'center', textAlign: 'center' }}>
            <Typography sx={{ color: '#212020', fontWeight: 'bold', fontSize: '2rem', marginTop: '70px', paddingTop: '70px' }}>
            Welcome to the

            <Typography component="span" sx={{ color: '#5989de', fontWeight: 'bold', fontSize: '2rem' }}>
                {' API Design Assistant!'}
            </Typography>
            </Typography>
    
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: '1.0rem'  }}>
                Simplifying the API design process with expert recommendations and enhanced security!{'\n'}
                <Typography sx={{ marginTop: '8px', fontSize: '0.9rem'  }}>
                        Share your API details or
                        <Typography component="span" sx={{ color: '#5989de', fontWeight: 'bold', marginBottom: '5px' }}>
                            {' select a template below '}
                        </Typography>
                        to get started!
                </Typography>
            </Typography>
      </Stack>
    );
};
export default WelcomeMessage
