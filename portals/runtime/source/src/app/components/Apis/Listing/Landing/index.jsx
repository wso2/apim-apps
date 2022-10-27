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
import { useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { FormattedMessage } from 'react-intl';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Button from "@material-ui/core/Button";
import LaunchIcon from "@material-ui/icons/Launch";
import OnboardingMenuCard from "AppComponents/ServiceCatalog/Listing/components/OnboardingMenuCard";
import Configurations from 'Config';

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
});

const APILanding = () => {
    const theme = useTheme();
    const isXsOrBelow = useMediaQuery(theme.breakpoints.down('xs'));
    const { root } = useStyles();

    return (
        <div className={root}>
            <Grid
                container
                direction='column'
                justify='center'
            >
                <Grid item xs={12}>
                    <Box pt={isXsOrBelow ? 2 : 7} />
                </Grid>
                <Grid item md={12}>
                    <Typography id='itest-apis-welcome-msg' display='block' gutterBottom align='center' variant='h4'>
                        <FormattedMessage
                            id='Apis.Listing.SampleAPI.SampleAPI.create.new'
                            defaultMessage='Let’s get started !'
                        />
                        <Box color='text.secondary' pt={2}>
                            <Typography display='block' gutterBottom align='center' variant='body1'>
                                <FormattedMessage
                                    id='Apis.Listing.SampleAPI.SampleAPI.create.new.description'
                                    defaultMessage='You have no APIs published yet '
                                />
                            </Typography>
                        </Box>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Box pt={isXsOrBelow ? 2 : 7} pb={5} mx={isXsOrBelow ? 12 : 3}>
                        <Grid
                            container
                            direction='row'
                            justify='center'
                            alignItems='flex-start'
                            spacing={3}
                        >
                            <OnboardingMenuCard
                                iconSrc={
                                    Configurations.app.context + '/site/public/images/wso2-intg-service-icon.svg'
                                }
                                heading={(
                                    <FormattedMessage
                                        id='ServiceCatalog.Listing.Onboarding.learn.heading'
                                        defaultMessage='Learn to publish your first'
                                    />
                                )}
                                subHeading={(
                                    <FormattedMessage
                                        id='ServiceCatalog.Listing.Onboarding.learn.heading.sub'
                                        defaultMessage='Runtime API'
                                    />
                                )}
                                description={(
                                    <FormattedMessage
                                        id='ServiceCatalog.Listing.Onboarding.learn.heading.text'
                                        defaultMessage='Publish your first runtime API with WSO2 APK'
                                    />
                                )}
                            >
                                <Button
                                    size='large'
                                    variant='outlined'
                                    color='primary'
                                    href='https://apim.docs.wso2.com/en/4.1.0/design/create-api/
                                    create-an-api-using-a-service/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    endIcon={<LaunchIcon style={{ fontSize: 15 }} />}
                                >
                                    <FormattedMessage
                                        id='ServiceCatalog.Listing.Onboarding.learn.link'
                                        defaultMessage='Get Started'
                                    />
                                </Button>
                            </OnboardingMenuCard>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </div>

    );
};

export default APILanding;
