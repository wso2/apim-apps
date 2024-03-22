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

import React from 'react';
import PeopleIcon from '@mui/icons-material/People';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import PhonelinkSetupIcon from '@mui/icons-material/PhonelinkSetup';
import HomeIcon from '@mui/icons-material/Home';
import Dashboard from 'AppComponents/AdminPages/Dashboard/Dashboard';
import ApplicationThrottlingPolicies from 'AppComponents/Throttling/Application/List';
import SubscriptionThrottlingPolicies from 'AppComponents/Throttling/Subscription/index';
import APICategories from 'AppComponents/APICategories/ListApiCategories';
import BlacklistThrottlingPolicies from 'AppComponents/Throttling/Blacklist/List';
import ListApplications from 'AppComponents/ApplicationSettings/ListApplications';
import GatewayEnvironments from 'AppComponents/GatewayEnvironments/ListGWEnviornments';
import AdvancedThrottlePolicies from 'AppComponents/Throttling/Advanced';
import CustomThrottlingPolicies from 'AppComponents/Throttling/Custom';
import TenantTheme from 'AppComponents/TenantTheme/UploadTheme';
import KeyManagers from 'AppComponents/KeyManagers';
import ListRoles from 'AppComponents//RolePermissions/ListRoles.jsx';
import TenantConfSave from 'AppComponents/AdvancedSettings/TenantConfSave';

import GamesIcon from '@mui/icons-material/Games';
import CategoryIcon from '@mui/icons-material/Category';
import PolicyIcon from '@mui/icons-material/Policy';
import BlockIcon from '@mui/icons-material/Block';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ApplicationCreation from 'AppComponents/Workflow/ApplicationCreation';
import ApplicationDeletion from 'AppComponents/Workflow/ApplicationDeletion';
import SubscriptionCreation from 'AppComponents/Workflow/SubscriptionCreation';
import SubscriptionDeletion from 'AppComponents/Workflow/SubscriptionDeletion';
import SubscriptionUpdate from 'AppComponents/Workflow/SubscriptionUpdate';
import RegistrationCreation from 'AppComponents/Workflow/RegistrationCreation';
import APIStateChange from 'AppComponents/Workflow/APIStateChange';
import APIRevisionDeployment from 'AppComponents/Workflow/APIRevisionDeployment';
import UserCreation from 'AppComponents/Workflow/UserCreation';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SecurityIcon from '@mui/icons-material/Security';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ListApis from '../APISettings/ListApis';

const RouteMenuMapping = (intl) => [
    {
        id: intl.formatMessage({
            id: 'Base.RouteMenuMapping.dashboard',
            defaultMessage: 'Dashboard',
        }),
        icon: <HomeIcon />,
        path: '/dashboard',
        component: () => <Dashboard />,
        exact: true,
    },
    {
        id: intl.formatMessage({
            id: 'Base.RouteMenuMapping.throttling.policies',
            defaultMessage: 'Rate Limiting Policies',
        }),
        children: [
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.advanced.throttling.policies',
                    defaultMessage: 'Advanced Policies',
                }),
                path: '/throttling/advanced',
                component: AdvancedThrottlePolicies,
                icon: <PolicyIcon />,
                addEditPageDetails: [
                    {
                        id: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.advanced.throttling.policies.Adding',
                            defaultMessage: 'Add Advanced Policy',
                        }),
                        path: '/throttling/advanced/create',
                    },
                    {
                        id: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.advanced.throttling.policies.Editing',
                            defaultMessage: 'Edit Advanced Policy',
                        }),
                        path: '/throttling/advanced/(.*?)$',
                    },
                ],
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.application.throttling.policies',
                    defaultMessage: 'Application Policies',
                }),
                path: '/throttling/application',
                component: ApplicationThrottlingPolicies,
                icon: <PhonelinkSetupIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.subscription.throttling.policies',
                    defaultMessage: 'Subscription Policies',
                }),
                path: '/throttling/subscription',
                component: SubscriptionThrottlingPolicies,
                icon: <AssignmentTurnedInIcon />,
                addEditPageDetails: [
                    {
                        id: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.subscription.throttling.policies.Adding',
                            defaultMessage: 'Add Subscription Policy',
                        }),
                        path: '/throttling/subscription/add',
                    },
                    {
                        id: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.subscription.throttling.policies.Editing',
                            defaultMessage: 'Edit Subscription Policy',
                        }),
                        path: '/throttling/subscription/(.*?)$',
                    },
                ],
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.custom.throttling.policies',
                    defaultMessage: 'Custom Policies',
                }),
                path: '/throttling/custom',
                component: CustomThrottlingPolicies,
                icon: <AssignmentIcon />,
                addEditPageDetails: [
                    {
                        id: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.custom.throttling.policies.items.Adding',
                            defaultMessage: 'Add Custom Policy',
                        }),
                        path: '/throttling/custom/create',
                    },
                    {
                        id: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.custom.throttling.policies.items.Editing',
                            defaultMessage: 'Edit Custom Policy',
                        }),
                        path: '/throttling/custom/(.*?)$',
                    },
                ],
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.blacklisted.items',
                    defaultMessage: 'Deny Policies',
                }),
                path: '/throttling/deny-policies',
                component: BlacklistThrottlingPolicies,
                icon: <BlockIcon />,
            },
        ],
    },
    {
        id: intl.formatMessage({
            id: 'Base.RouteMenuMapping.gateways',
            defaultMessage: 'Gateways',
        }),
        path: '/settings/environments',
        component: GatewayEnvironments,
        icon: <GamesIcon />,
    },
    {
        id: intl.formatMessage({
            id: 'Base.RouteMenuMapping.api.categories',
            defaultMessage: 'API Categories',
        }),
        path: '/settings/api-categories',
        component: APICategories,
        icon: <CategoryIcon />,
    },
    {
        id: intl.formatMessage({
            id: 'Base.RouteMenuMapping.keymanagers',
            defaultMessage: 'Key Managers',
        }),
        path: '/settings/key-managers',
        component: KeyManagers,
        icon: <SecurityIcon />,
        addEditPageDetails: [
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.keymanagers.items.Adding',
                    defaultMessage: 'Add Key Manager',
                }),
                path: '/settings/key-managers/create',
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.keymanagers.items.Editing',
                    defaultMessage: 'Edit Key Manager',
                }),
                path: '/settings/key-managers/(.*?)$',
            },
        ],
    },
    {
        id: intl.formatMessage({
            id: 'Base.RouteMenuMapping.tasks',
            defaultMessage: 'Tasks',
        }),
        children: [
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.user.creation',
                    defaultMessage: 'User Creation',
                }),
                path: '/tasks/user-creation',
                component: UserCreation,
                icon: <PeopleIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.application.creation',
                    defaultMessage: 'Application Creation',
                }),
                path: '/tasks/application-creation',
                component: ApplicationCreation,
                icon: <DnsRoundedIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.application.deletion',
                    defaultMessage: 'Application Deletion',
                }),
                path: '/tasks/application-deletion',
                component: ApplicationDeletion,
                icon: <DnsRoundedIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.subscription.creation',
                    defaultMessage: 'Subscription Creation',
                }),
                path: '/tasks/subscription-creation',
                component: SubscriptionCreation,
                icon: <TouchAppIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.subscription.deletion',
                    defaultMessage: 'Subscription Deletion',
                }),
                path: '/tasks/subscription-deletion',
                component: SubscriptionDeletion,
                icon: <TouchAppIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.subscription.update',
                    defaultMessage: 'Subscription Update',
                }),
                path: '/tasks/subscription-update',
                component: SubscriptionUpdate,
                icon: <TouchAppIcon />,
            },
            {
                id: 'Application Registration',
                path: '/tasks/application-registration',
                component: RegistrationCreation,
                icon: <VpnKeyIcon />,
            },
            {
                id: 'API State Change',
                path: '/tasks/api-state-change',
                component: APIStateChange,
                icon: <SettingsEthernetIcon />,
            },
            {
                id: 'API Product State Change',
                path: '/tasks/api-product-state-change',
                component: () => <APIStateChange isAPIProduct />,
                icon: <SettingsEthernetIcon />,
            },
            {
                id: 'API Revision Deployment',
                path: '/tasks/api-revision-deploy',
                component: APIRevisionDeployment,
                icon: <SettingsEthernetIcon />,
            },
        ],
    },
    {
        id: intl.formatMessage({
            id: 'Base.RouteMenuMapping.settings',
            defaultMessage: 'Settings',
        }),
        children: [
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.applications',
                    defaultMessage: 'Change Application Owner',
                }),
                path: '/settings/applications',
                component: ListApplications,
                icon: <SettingsIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.apis',
                    defaultMessage: 'Change API Provider',
                }),
                path: '/settings/apis',
                component: ListApis,
                icon: <SettingsIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.role.permissions',
                    defaultMessage: 'Scope Assignments',
                }),
                path: '/settings/scope-mapping',
                component: ListRoles,
                icon: <AccountTreeIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.tenant.theme',
                    defaultMessage: 'Tenant Theme',
                }),
                path: '/settings/devportal-theme',
                component: TenantTheme,
                icon: <PhonelinkSetupIcon />,
            },
            {
                id: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.advanced',
                    defaultMessage: 'Advanced',
                }),
                path: '/settings/advanced',
                component: TenantConfSave,
                icon: <SettingsApplicationsIcon />,
            },
        ],
    },

];

export default RouteMenuMapping;
