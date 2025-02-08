/* eslint-disable */
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
import { Box, Button, Typography, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { app } from 'Settings';

const DesignAssistantMenu = () => {
  return (
    <Box p={2} border={0} borderRadius={2}>
      <Stack direction='row' alignItems='center' justifyContent='center' spacing={2}>
        <Box>
          <img
            alt='API Design Assistant'
            src={`${app.context}/site/public/images/ai/APIchatassistantImageWithColour.svg`}
            style={{ width: '200px', height: 'auto' }}
          />
        </Box>
        <Stack direction='column' alignItems='center' spacing={2}>
          <Typography variant='h6' sx={{ color: '#1a3c73' }}>Not sure which API to create? We got you!</Typography>
          <Button
            variant='contained'
            color='primary'
            component={Link}
            to='/apis/design-assistant'
          >
            <FormattedMessage
              id='Apis.Listing.components.TopMenu.create.api.with.ai'
              defaultMessage='Create API with AI'
            />
            <AutoAwesomeIcon
              sx={{ 
                marginLeft: '6px',
                fontSize: 15
              }}
            />
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default DesignAssistantMenu;
