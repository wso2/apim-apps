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
import GatewayEnvironments from 'AppComponents/GatewayEnvironments';
import AdvancedThrottlePolicies from 'AppComponents/Throttling/Advanced';
import CustomThrottlingPolicies from 'AppComponents/Throttling/Custom';
import TenantTheme from 'AppComponents/TenantTheme/UploadTheme';
import KeyManagers from 'AppComponents/KeyManagers';
import AiVendors from 'AppComponents/AiVendors';
import ListRoles from 'AppComponents//RolePermissions/ListRoles.jsx';
import TenantConfSave from 'AppComponents/AdvancedSettings/TenantConfSave';
import Policies from 'AppComponents/Governance/Policies';
import RulesetCatalog from 'AppComponents/Governance/RulesetCatalog';
import BusinessIcon from '@mui/icons-material/Business';
import Organizations from 'AppComponents/Organizations/ListOrganizations';

import GamesIcon from '@mui/icons-material/Games';
import CategoryIcon from '@mui/icons-material/Category';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import PolicyIcon from '@mui/icons-material/Policy';
import RuleIcon from '@mui/icons-material/Rule';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
import AssistantIcon from '@mui/icons-material/Assistant';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ListApis from '../APISettings/ListApis';
import UsageReport from '../APISettings/UsageReport';
import ListLabels from '../Labels/ListLabels';
import ComplianceDashboard from '../Governance/ComplianceDashboard';

const RouteMenuMapping = (intl) => [
    {
        id: 'Dashboard',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.dashboard',
            defaultMessage: 'Dashboard',
        }),
        icon: <HomeIcon />,
        path: '/dashboard',
        component: () => <Dashboard />,
        exact: true,
    },
    {
        id: 'Rate Limiting Policies',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.throttling.policies',
            defaultMessage: 'Rate Limiting Policies',
        }),
        children: [
            {
                id: 'Advanced Policies',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.advanced.throttling.policies',
                    defaultMessage: 'Advanced Policies',
                }),
                path: '/throttling/advanced',
                component: AdvancedThrottlePolicies,
                icon: <PolicyIcon />,
                addEditPageDetails: [
                    {
                        id: 'Add Advanced Policy',
                        displayText: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.advanced.throttling.policies.Adding',
                            defaultMessage: 'Add Advanced Policy',
                        }),
                        path: '/throttling/advanced/create',
                    },
                    {
                        id: 'Edit Advanced Policy',
                        displayText: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.advanced.throttling.policies.Editing',
                            defaultMessage: 'Edit Advanced Policy',
                        }),
                        path: '/throttling/advanced/(.*?)$',
                    },
                ],
            },
            {
                id: 'Application Policies',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.application.throttling.policies',
                    defaultMessage: 'Application Policies',
                }),
                path: '/throttling/application',
                component: ApplicationThrottlingPolicies,
                icon: <PhonelinkSetupIcon />,
            },
            {
                id: 'Subscription Policies',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.subscription.throttling.policies',
                    defaultMessage: 'Subscription Policies',
                }),
                path: '/throttling/subscription',
                component: SubscriptionThrottlingPolicies,
                icon: <AssignmentTurnedInIcon />,
                addEditPageDetails: [
                    {
                        id: 'Add Subscription Policy',
                        displayText: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.subscription.throttling.policies.Adding',
                            defaultMessage: 'Add Subscription Policy',
                        }),
                        path: '/throttling/subscription/add',
                    },
                    {
                        id: 'Edit Subscription Policy',
                        displayText: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.subscription.throttling.policies.Editing',
                            defaultMessage: 'Edit Subscription Policy',
                        }),
                        path: '/throttling/subscription/(.*?)$',
                    },
                ],
            },
            {
                id: 'Custom Policies',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.custom.throttling.policies',
                    defaultMessage: 'Custom Policies',
                }),
                path: '/throttling/custom',
                component: CustomThrottlingPolicies,
                icon: <AssignmentIcon />,
                addEditPageDetails: [
                    {
                        id: 'Add Custom Policy',
                        displayText: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.custom.throttling.policies.items.Adding',
                            defaultMessage: 'Add Custom Policy',
                        }),
                        path: '/throttling/custom/create',
                    },
                    {
                        id: 'Edit Custom Policy',
                        displayText: intl.formatMessage({
                            id: 'Base.RouteMenuMapping.custom.throttling.policies.items.Editing',
                            defaultMessage: 'Edit Custom Policy',
                        }),
                        path: '/throttling/custom/(.*?)$',
                    },
                ],
            },
            {
                id: 'Deny Policies',
                displayText: intl.formatMessage({
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
        id: 'Gateways',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.gateways',
            defaultMessage: 'Gateways',
        }),
        path: '/settings/environments',
        component: GatewayEnvironments,
        icon: <GamesIcon />,
        addEditPageDetails: [
            {
                id: 'Add Gateway Environment',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.gateways.items.Adding',
                    defaultMessage: 'Gateway Environment',
                }),
                path: '/settings/gateways/create',
            },
            {
                id: 'Edit Gateway Environment',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.gateways.items.Editing',
                    defaultMessage: 'Edit Gateway Environment',
                }),
                path: '/settings/gateways/(.*?)$',
            },
        ],
    },
    {
        id: 'API Categories',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.api.categories',
            defaultMessage: 'API Categories',
        }),
        path: '/settings/api-categories',
        component: APICategories,
        icon: <CategoryIcon />,
    },
    {
        id: 'Organizations',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.organizations',
            defaultMessage: 'Organizations',
        }),
        path: '/settings/organizations',
        component: Organizations,
        icon: <BusinessIcon />,
    },
    {
        id: 'Key Managers',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.keymanagers',
            defaultMessage: 'Key Managers',
        }),
        path: '/settings/key-managers',
        component: KeyManagers,
        icon: <SecurityIcon />,
        addEditPageDetails: [
            {
                id: 'Add Key Manager',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.keymanagers.items.Adding',
                    defaultMessage: 'Add Key Manager',
                }),
                path: '/settings/key-managers/create',
            },
            {
                id: 'Edit Key Manager',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.keymanagers.items.Editing',
                    defaultMessage: 'Edit Key Manager',
                }),
                path: '/settings/key-managers/(.*?)$',
            },
        ],
    },
    {
        id: 'Ai Vendors',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.aivendors',
            defaultMessage: 'AI/LLM Vendors',
        }),
        path: '/settings/ai-vendors',
        component: AiVendors,
        icon: <AssistantIcon />,
        addEditPageDetails: [
            {
                id: 'Add AI Vendor',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.aivendors.items.Adding',
                    defaultMessage: 'Add AI/LLM Vendor',
                }),
                path: '/settings/ai-vendors/create',
            },
            {
                id: 'Edit AI Vendor',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.aivendors.items.Editing',
                    defaultMessage: 'Edit AI/LLM Vendor',
                }),
                path: '/settings/ai-vendors/(.*?)$',
            },
        ],
    },
    {
        id: 'Labels',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.labels',
            defaultMessage: 'Labels',
        }),
        path: '/settings/labels',
        component: ListLabels,
        icon: <BookmarksIcon />,
    },
    {
        id: 'Governance',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.governance',
            defaultMessage: 'Governance',
        }),
        children: [
            {
                id: 'Compliance',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.compliance',
                    defaultMessage: 'Compliance',
                }),
                path: '/governance/compliance',
                component: ComplianceDashboard,
                icon: <CheckCircleIcon />,
            },
            {
                id: 'Policies',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.governance.policies',
                    defaultMessage: 'Policies',
                }),
                path: '/governance/policies',
                component: Policies,
                icon: <PolicyIcon />,
            },
            {
                id: 'Ruleset Catalog',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.ruleset.catalog',
                    defaultMessage: 'Ruleset Catalog',
                }),
                path: '/governance/ruleset-catalog',
                component: RulesetCatalog,
                icon: <RuleIcon />,
            },
        ],
    },
    {
        id: 'Tasks',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.tasks',
            defaultMessage: 'Tasks',
        }),
        children: [
            {
                id: 'User Creation',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.user.creation',
                    defaultMessage: 'User Creation',
                }),
                path: '/tasks/user-creation',
                component: UserCreation,
                icon: <PeopleIcon />,
            },
            {
                id: 'Application Creation',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.application.creation',
                    defaultMessage: 'Application Creation',
                }),
                path: '/tasks/application-creation',
                component: ApplicationCreation,
                icon: <DnsRoundedIcon />,
            },
            {
                id: 'Application Deletion',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.application.deletion',
                    defaultMessage: 'Application Deletion',
                }),
                path: '/tasks/application-deletion',
                component: ApplicationDeletion,
                icon: <DnsRoundedIcon />,
            },
            {
                id: 'Subscription Creation',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.subscription.creation',
                    defaultMessage: 'Subscription Creation',
                }),
                path: '/tasks/subscription-creation',
                component: SubscriptionCreation,
                icon: <TouchAppIcon />,
            },
            {
                id: 'Subscription Deletion',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.subscription.deletion',
                    defaultMessage: 'Subscription Deletion',
                }),
                path: '/tasks/subscription-deletion',
                component: SubscriptionDeletion,
                icon: <TouchAppIcon />,
            },
            {
                id: 'Subscription Update',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.subscription.update',
                    defaultMessage: 'Subscription Update',
                }),
                path: '/tasks/subscription-update',
                component: SubscriptionUpdate,
                icon: <TouchAppIcon />,
            },
            {
                id: 'Application Registration',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.application.reg',
                    defaultMessage: 'Application Registration',
                }),
                path: '/tasks/application-registration',
                component: RegistrationCreation,
                icon: <VpnKeyIcon />,
            },
            {
                id: 'API State Change',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.api.state.change',
                    defaultMessage: 'API State Change',
                }),
                path: '/tasks/api-state-change',
                component: APIStateChange,
                icon: <SettingsEthernetIcon />,
            },
            {
                id: 'API Product State Change',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.api.product.state.change',
                    defaultMessage: 'API Product State Change',
                }),
                path: '/tasks/api-product-state-change',
                component: () => <APIStateChange isAPIProduct />,
                icon: <SettingsEthernetIcon />,
            },
            {
                id: 'API Revision Deployment',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.api.revision.deployment',
                    defaultMessage: 'API Revision Deployment',
                }),
                path: '/tasks/api-revision-deploy',
                component: APIRevisionDeployment,
                icon: <SettingsEthernetIcon />,
            },
        ],
    },
    {
        id: 'Settings',
        displayText: intl.formatMessage({
            id: 'Base.RouteMenuMapping.settings',
            defaultMessage: 'Settings',
        }),
        children: [
            {
                id: 'Change Application Owner',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.applications',
                    defaultMessage: 'Change Application Owner',
                }),
                path: '/settings/applications',
                component: ListApplications,
                icon: <SettingsIcon />,
            },
            {
                id: 'Change API Provider',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.apis',
                    defaultMessage: 'Change API Provider',
                }),
                path: '/settings/apis',
                component: ListApis,
                icon: <SettingsIcon />,
            },
            {
                id: 'Scope Assignments',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.role.permissions',
                    defaultMessage: 'Scope Assignments',
                }),
                path: '/settings/scope-mapping',
                component: ListRoles,
                icon: <AccountTreeIcon />,
            },
            {
                id: 'Tenant Theme',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.tenant.theme',
                    defaultMessage: 'Tenant Theme',
                }),
                path: '/settings/devportal-theme',
                component: TenantTheme,
                icon: <PhonelinkSetupIcon />,
            },
            {
                id: 'Advanced',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.advanced',
                    defaultMessage: 'Advanced',
                }),
                path: '/settings/advanced',
                component: TenantConfSave,
                icon: <SettingsApplicationsIcon />,
            },
            {
                id: 'Usage Report',
                displayText: intl.formatMessage({
                    id: 'Base.RouteMenuMapping.usage.report',
                    defaultMessage: 'Usage Report',
                }),
                path: '/settings/usage-report',
                component: UsageReport,
                icon: <AssignmentIcon />,
            },
        ],
    },

];

export default RouteMenuMapping;
