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
 * under the License.handleTooltipClose
 */
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const WelcomeMessage = () => {    
    return (
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Typography sx={{ color: '#212020', fontWeight: 'bold', fontSize: '2rem', marginTop: '70px', paddingTop: '70px' }}>
            Welcome to the

            <Typography component="span" sx={{ color: '#004d99', fontWeight: 'bold', fontSize: '2rem' }}>
                {' API Design Assistant!'}
            </Typography>
            </Typography>
    
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: '1.0rem'  }}>
                        Provide API details or choose a template below to get started!
            </Typography>
      </Stack>
    );
};
export default WelcomeMessage
