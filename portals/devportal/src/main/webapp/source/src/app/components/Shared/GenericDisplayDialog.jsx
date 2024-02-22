/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { styled } from '@mui/material/styles';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { ScopeValidation, resourceMethods, resourcePaths } from 'AppComponents/Shared/ScopeValidation';

const PREFIX = 'genericDisplayDialog';

const classes = {
    appContent: `${PREFIX}-appContent`,
    button: `${PREFIX}-button`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`&.${classes.appContent}`]: {
        margin: theme.spacing(2),
    },

    [`& .${classes.button}`]: {
        color: theme.palette.getContrastText(theme.palette.primary.main),
    }
}));

const genericDisplayDialog = (props) => {
    const {
        handleClick, heading, caption, buttonText,
    } = props;

    return (
        <Root className={classes.appContent}>
            <InlineMessage type='info' className={classes.dialogContainer}>
                <Typography variant='h5' component='h2'>
                    {heading}
                </Typography>
                <Typography variant="body2" gutterBottom>
                    {caption}
                </Typography>
                <ScopeValidation resourcePath={resourcePaths.APPLICATIONS} resourceMethod={resourceMethods.POST}>
                    <Button
                        variant='contained'
                        color='primary'
                        className={classes.button}
                        onClick={handleClick}
                        id='start-key-gen-wizard-btn'
                    >
                        {buttonText}
                    </Button>
                </ScopeValidation>
            </InlineMessage>
        </Root>
    );
};

export default genericDisplayDialog;
