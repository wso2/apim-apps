/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { Card } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import PeopleIcon from '@mui/icons-material/People';
import PermMediaOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActual';
import PublicIcon from '@mui/icons-material/Public';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import Api from 'AppData/api';

/**
 * Render progress inside a container centering in the container.
 * @returns {JSX} Loading animation.
 */
export default function TasksWorkflowCard() {
    const intl = useIntl();
    const restApi = new Api();
    const [allTasksSet, setAllTasksSet] = useState({});

    /**
    * Calculate total task count
    * @returns {int} total task count
    */
    function getAllTaskCount() {
        let counter = 0;
        for (const task in allTasksSet) {
            if (allTasksSet[task]) {
                counter += allTasksSet[task].length;
            }
        }
        return counter;
    }

    // Fetch all workflow tasks
    const fetchAllWorkFlows = () => {
        const promiseUserSign = restApi.workflowsGet('AM_USER_SIGNUP');
        const promiseStateChange = restApi.workflowsGet('AM_API_STATE');
        const promiseApiProductStateChange = restApi.workflowsGet('AM_API_PRODUCT_STATE');
        const promiseAppCreation = restApi.workflowsGet('AM_APPLICATION_CREATION');
        const promiseAppDeletion = restApi.workflowsGet('AM_APPLICATION_DELETION');
        const promiseSubCreation = restApi.workflowsGet('AM_SUBSCRIPTION_CREATION');
        const promiseSubDeletion = restApi.workflowsGet('AM_SUBSCRIPTION_DELETION');
        const promiseSubUpdate = restApi.workflowsGet('AM_SUBSCRIPTION_UPDATE');
        const promiseRegProd = restApi.workflowsGet('AM_APPLICATION_REGISTRATION_PRODUCTION');
        const promiseRegSb = restApi.workflowsGet('AM_APPLICATION_REGISTRATION_SANDBOX');
        const promiseRevDeployment = restApi.workflowsGet('AM_REVISION_DEPLOYMENT');
        Promise.all([promiseUserSign, promiseStateChange, promiseAppCreation, promiseAppDeletion,
            promiseSubCreation, promiseSubDeletion, promiseSubUpdate, promiseRegProd, promiseRegSb,
            promiseApiProductStateChange, promiseRevDeployment])
            .then(([resultUserSign, resultStateChange, resultAppCreation, resultAppDeletion, resultSubCreation,
                resultSubDeletion, resultSubUpdate, resultRegProd, resultRegSb,
                resultApiProductStateChange, resultRevDeployment]) => {
                const userCreation = resultUserSign.body.list;
                const stateChange = resultStateChange.body.list;
                const productStateChange = resultApiProductStateChange.body.list;
                const applicationCreation = resultAppCreation.body.list;
                const applicationDeletion = resultAppDeletion.body.list;
                const subscriptionCreation = resultSubCreation.body.list;
                const subscriptionDeletion = resultSubDeletion.body.list;
                const subscriptionUpdate = resultSubUpdate.body.list;
                const revisionDeployment = resultRevDeployment.body.list;
                const registration = resultRegProd.body.list.concat(resultRegSb.body.list);
                setAllTasksSet({
                    userCreation,
                    stateChange,
                    applicationCreation,
                    applicationDeletion,
                    subscriptionCreation,
                    subscriptionDeletion,
                    subscriptionUpdate,
                    registration,
                    productStateChange,
                    revisionDeployment,
                });
            });
    };

    useEffect(() => {
        fetchAllWorkFlows();
    }, []);

    // Component to be displayed when there's no task available
    // Note: When workflow is not enabled, this will be displayed
    const noTasksCard = (
        <Card sx={{ minWidth: 275, minHeight: 270, textAlign: 'center' }}>
            <CardContent>
                <Box mt={2}>
                    <DeviceHubIcon color='secondary' style={{ fontSize: 60 }} />
                </Box>

                <Typography sx={{ fontSize: 20, fontWeight: 'fontWeightBold' }} gutterBottom>
                    <FormattedMessage
                        id='Dashboard.tasksWorkflow.noTasks.card.title'
                        defaultMessage='All the pending tasks completed'
                    />
                </Typography>

                <Typography variant='body2' component='p'>
                    <FormattedMessage
                        id='Dashboard.tasksWorkflow.noTasks.card.description'
                        defaultMessage='Manage workflow tasks, increase productivity and enhance
                        competitiveness by enabling developers to easily deploy
                        business processes and models.'
                    />
                </Typography>
            </CardContent>
        </Card>
    );

    // Compact task card component's individual category component
    const getCompactTaskComponent = (IconComponent, path, name, numberOfTasks) => {
        return (
            <Box alignItems='center' display='flex' width='50%' my='1%'>
                <Box mx={1}>
                    <Avatar>
                        <IconComponent fontSize='inherit' />
                    </Avatar>
                </Box>
                <Box flexGrow={1}>
                    <Link component={RouterLink} to={path} color='inherit' underline='hover'>
                        <Typography>
                            {name}
                        </Typography>
                    </Link>
                    <Typography variant='body2' gutterBottom>
                        {numberOfTasks + ' '}
                        {numberOfTasks === 1
                            ? (
                                <FormattedMessage
                                    id='Dashboard.tasksWorkflow.compactTasks.card.numberOfPendingTasks.postFix.singular'
                                    defaultMessage=' Pending task'
                                />
                            ) : (
                                <FormattedMessage
                                    id='Dashboard.tasksWorkflow.compactTasks.card.numberOfPendingTasks.postFix.plural'
                                    defaultMessage=' Pending tasks'
                                />
                            )}
                    </Typography>
                </Box>
            </Box>
        );
    };

    // Component to be displayed when there are more than 4 tasks available
    // Renders the total task count, each task category remaining task count and links
    const compactTasksCard = () => {
        const compactTaskComponentDetails = [
            {
                icon: PeopleIcon,
                path: '/tasks/user-creation',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.userCreation.name',
                    defaultMessage: 'User Creation',
                }),
                count: allTasksSet.userCreation.length,
            },
            {
                icon: DnsRoundedIcon,
                path: '/tasks/application-creation',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.applicationCreation.name',
                    defaultMessage: 'Application Creation',
                }),
                count: allTasksSet.applicationCreation.length,
            },
            {
                icon: DnsRoundedIcon,
                path: '/tasks/application-deletion',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.applicationDeletion.name',
                    defaultMessage: 'Application Deletion',
                }),
                count: allTasksSet.applicationDeletion.length,
            },
            {
                icon: PermMediaOutlinedIcon,
                path: '/tasks/subscription-creation',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.subscriptionCreation.name',
                    defaultMessage: 'Subscription Creation',
                }),
                count: allTasksSet.subscriptionCreation.length,
            },
            {
                icon: PermMediaOutlinedIcon,
                path: '/tasks/subscription-deletion',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.subscriptionDeletion.name',
                    defaultMessage: 'Subscription Deletion',
                }),
                count: allTasksSet.subscriptionDeletion.length,
            },
            {
                icon: PermMediaOutlinedIcon,
                path: '/tasks/subscription-update',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.subscriptionUpdate.name',
                    defaultMessage: 'Subscription Update',
                }),
                count: allTasksSet.subscriptionUpdate.length,
            },
            {
                icon: PublicIcon,
                path: '/tasks/application-registration',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.applicationRegistration.name',
                    defaultMessage: 'Application Registration',
                }),
                count: allTasksSet.registration.length,
            },
            {
                icon: SettingsEthernetIcon,
                path: '/tasks/api-state-change',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.apiStateChange.name',
                    defaultMessage: 'API State Change',
                }),
                count: allTasksSet.stateChange.length,
            },
            {
                icon: SettingsEthernetIcon,
                path: '/tasks/api-product-state-change',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.apiProductStateChange.name',
                    defaultMessage: 'API Product State Change',
                }),
                count: allTasksSet.productStateChange.length,
            },
            {
                icon: SettingsEthernetIcon,
                path: '/tasks/api-revision-deploy',
                name: intl.formatMessage({
                    id: 'Dashboard.tasksWorkflow.compactTasks.apiRevisionDeployment.name',
                    defaultMessage: 'API Revision Deployment',
                }),
                count: allTasksSet.revisionDeployment.length,
            },
        ];
        return (
            <Card sx={{ minWidth: 275, minHeight: 270, textAlign: 'left' }}>
                <CardContent>
                    <Box display='flex'>
                        <Box flexGrow={1}>
                            <Typography sx={{ fontSize: 20, fontWeight: 'fontWeightBold' }} gutterBottom>
                                <FormattedMessage
                                    id='Dashboard.tasksWorkflow.compactTasks.card.title'
                                    defaultMessage='Pending tasks'
                                />
                            </Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 20, fontWeight: 'fontWeightBold' }} gutterBottom>
                                {getAllTaskCount()}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ opacity: 0.2 }} />

                    <Box
                        display='flex'
                        flexWrap='wrap'
                        mt={2}
                        bgcolor='background.paper'

                    >
                        {compactTaskComponentDetails.map((c) => {
                            return getCompactTaskComponent(c.icon, c.path, c.name, c.count);
                        })}
                    </Box>
                </CardContent>
            </Card>
        );
    };

    // Render the card depending on the number of all remaining tasks
    const cnt = getAllTaskCount();
    if (cnt > 0) {
        return compactTasksCard();
    } else {
        return noTasksCard;
    }
}
