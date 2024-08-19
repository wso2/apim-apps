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
import { styled } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Collapse from '@mui/material/Collapse';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';

/**
 *
 *
 * @param {*} props
 * @returns
 */
function MinusSquare(props) {
    return (
        <SvgIcon fontSize='inherit' style={{ width: 14, height: 14 }} {...props}>
            {/* disabled max-len because of the SVG declaration */}
            {/* eslint-disable-next-line max-len */}
            <path d='M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z' />
        </SvgIcon>
    );
}

/**
 *
 *
 * @param {*} props
 * @returns
 */
function PlusSquare(props) {
    return (
        <SvgIcon fontSize='inherit' style={{ width: 14, height: 14 }} {...props}>
            {/* disabled max-len because of the SVG declaration */}
            {/* eslint-disable-next-line max-len */}
            <path d='M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z' />
        </SvgIcon>
    );
}

/**
 *
 *
 * @param {*} props
 * @returns
 */
function TransitionComponent(props) {
    const style = useSpring({
        from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
        to: {
            opacity: props.in ? 1 : 0,
            transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
        },
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
}

const StyledTreeItem = styled(TreeItem)(() => ({
    iconContainer: {
        '& .close': {
            opacity: 0.3,
        },
    },
    group: {
        marginLeft: 7,
        paddingLeft: 18,
        // borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
    },

    label: {
        backgroundColor: 'inherit !important', // tmkasun: remove !important
        width: '100%',
        paddingLeft: 4,
        position: 'relative',
        '&:hover': {
            backgroundColor: '#ececec8c !important', // tmkasun: remove !important
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: 'transparent',
            },
        },
    },
}));

/**
 *
 *
 * @export
 * @returns
 */
export default function PermissionTreeView(props) {
    const { appMappings, role, onCheck } = props;
    const intl = useIntl();
    const totalPermissions = appMappings.admin.length + appMappings.devportal.length + appMappings.publisher.length;

    const APIM_SCOPES_DESCRIPTION_MAP = {
        'apim:api_workflow_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_workflow_view',
            defaultMessage: 'Retrive workflow requests',
        }),
        'apim:tenant_theme_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.tenant_theme_manage',
            defaultMessage: 'Manage tenant themes',
        }),
        'apim:api_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_manage',
            defaultMessage: 'Manage all API related operations',
        }),
        'apim:gateway_policy_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.gateway_policy_manage',
            defaultMessage: 'Add, Update and Delete gateway policies',
        }),
        'apim:admin': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.admin',
            defaultMessage: 'Manage all admin operations',
        }),
        'apim:api_workflow_approve': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_workflow_approve',
            defaultMessage: 'Manage workflows',
        }),
        'apim:common_operation_policy_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.common_operation_policy_view',
            defaultMessage: 'View common operation policies',
        }),
        'apim:gateway_policy_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.gateway_policy_view',
            defaultMessage: 'View gateway policies',
        }),
        'apim:subscription_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.subscription_manage',
            defaultMessage: 'Manage all Subscription related operations',
        }),
        'apim:scope_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.scope_manage',
            defaultMessage: 'Manage system scopes',
        }),
        'apim:api_list_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_list_view',
            defaultMessage: 'View, Retrieve API list',
        }),
        'apim:app_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.app_manage',
            defaultMessage: 'Retrieve, Manage and Import, Export applications',
        }),
        'service_catalog:service_view': intl.formatMessage({
            id: 'PERMISSION_TREE.service_catalog.service_view',
            defaultMessage: 'view access to services in service catalog',
        }),
        'apim:admin_application_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.admin_application_view',
            defaultMessage: 'View Applications',
        }),
        'apim:bl_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.bl_view',
            defaultMessage: 'View deny policies',
        }),
        'apim:store_settings': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.store_settings',
            defaultMessage: 'Retrieve Developer Portal settings',
        }),
        'apim:common_operation_policy_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.common_operation_policy_manage',
            defaultMessage: 'Add, Update and Delete common operation policies',
        }),
        'apim:sub_alert_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.sub_alert_manage',
            defaultMessage: 'Retrieve, subscribe and configure Developer Portal alert types',
        }),
        'apim:threat_protection_policy_create': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.threat_protection_policy_create',
            defaultMessage: 'Create threat protection policies',
        }),
        'apim:mediation_policy_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.mediation_policy_manage',
            defaultMessage: 'Update and delete mediation policies',
        }),
        'apim:ep_certificates_update': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.ep_certificates_update',
            defaultMessage: 'Update and delete backend endpoint certificates',
        }),
        'apim:ep_certificates_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.ep_certificates_view',
            defaultMessage: 'View backend endpoint certificates',
        }),
        'apim:admin_settings': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.admin_settings',
            defaultMessage: 'Retrieve admin settings',
        }),
        'apim:app_import_export': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.app_import_export',
            defaultMessage: 'Import and export applications related operations',
        }),
        'apim:api_publish': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_publish',
            defaultMessage: 'Publish API',
        }),
        'apim:client_certificates_update': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.client_certificates_update',
            defaultMessage: 'Update and delete client certificates',
        }),
        'apim:environment_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.environment_manage',
            defaultMessage: 'Manage gateway environments',
        }),
        'apim:api_definition_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_definition_view',
            defaultMessage: 'View, Retrieve API definition',
        }),
        'apim:api_key': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_key',
            defaultMessage: 'Generate API Keys',
        }),
        'apim:admin_alert_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.admin_alert_manage',
            defaultMessage: 'Manage admin alerts',
        }),
        'apim:api_generate_key': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_generate_key',
            defaultMessage: 'Generate Internal Key',
        }),
        'apim:api_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_view',
            defaultMessage: 'View API',
        }),
        'apim:api_provider_change': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_provider_change',
            defaultMessage: 'Retrieve and manage applications',
        }),
        'apim:mediation_policy_create': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.mediation_policy_create',
            defaultMessage: 'Create mediation policies',
        }),
        'apim:pub_alert_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.pub_alert_manage',
            defaultMessage: 'Get/ subscribe/ configure publisher alerts',
        }),
        'apim:document_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.document_manage',
            defaultMessage: 'Create, update and delete API documents',
        }),
        'apim:ep_certificates_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.ep_certificates_manage',
            defaultMessage: 'View, create, update and remove endpoint certificates',
        }),
        'apim:comment_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.comment_view',
            defaultMessage: 'Read permission to comments',
        }),
        'service_catalog:service_write': intl.formatMessage({
            id: 'PERMISSION_TREE.service_catalog.service_write',
            defaultMessage: 'write access to services in service catalog',
        }),
        'apim:admin_tier_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.admin_tier_view',
            defaultMessage: 'View throttling policies',
        }),
        'apim:comment_write': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.comment_write',
            defaultMessage: 'Write permission to comments',
        }),
        'apim:api_category': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_category',
            defaultMessage: 'Manage API categories',
        }),
        'apim:admin_operations': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.admin_operations',
            defaultMessage: 'Manage API categories and Key Managers related operations',
        }),
        'apim:app_owner_change': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.app_owner_change',
            defaultMessage: 'Retrieve and manage applications',
        }),
        'apim:bl_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.bl_manage',
            defaultMessage: 'Update and delete deny policies',
        }),
        'apim:tier_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.tier_manage',
            defaultMessage: 'View, update and delete throttling policies',
        }),
        'apim:keymanagers_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.keymanagers_manage',
            defaultMessage: 'Manage Key Managers',
        }),
        'apim:role_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.role_manage',
            defaultMessage: 'Manage system roles',
        }),
        'apim:policies_import_export': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.policies_import_export',
            defaultMessage: 'Export and import policies related operations',
        }),
        'apim:sub_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.sub_manage',
            defaultMessage: 'Retrieve, Manage subscriptions',
        }),
        'apim:admin_tier_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.admin_tier_manage',
            defaultMessage: 'Update and delete throttling policies',
        }),
        'apim:subscribe': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.subscribe',
            defaultMessage: 'Subscribe API',
        }),
        'apim:comment_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.comment_manage',
            defaultMessage: 'Read and Write comments',
        }),
        'apim:tier_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.tier_view',
            defaultMessage: 'View throttling policies',
        }),
        'apim:document_create': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.document_create',
            defaultMessage: 'Create API documents',
        }),
        'apim:threat_protection_policy_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.threat_protection_policy_manage',
            defaultMessage: 'Update and delete threat protection policies',
        }),
        'apim:subscription_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.subscription_view',
            defaultMessage: 'View Subscription',
        }),
        'apim:api_create': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_create',
            defaultMessage: 'Create API',
        }),
        'apim:shared_scope_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.shared_scope_manage',
            defaultMessage: 'Manage shared scopes',
        }),
        'apim:client_certificates_add': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.client_certificates_add',
            defaultMessage: 'Add client certificates',
        }),
        'apim:api_product_import_export': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_product_import_export',
            defaultMessage: 'Import and export API Products related operations',
        }),
        'apim:environment_read': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.environment_read',
            defaultMessage: 'Retrieve gateway environments',
        }),
        'apim:monetization_usage_publish': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.monetization_usage_publish',
            defaultMessage: 'Retrieve and publish Monetization related usage records',
        }),
        'apim:tenantInfo': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.tenantInfo',
            defaultMessage: 'Retrieve tenant related information',
        }),
        'apim:api_delete': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_delete',
            defaultMessage: 'Delete API',
        }),
        'apim:client_certificates_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.client_certificates_view',
            defaultMessage: 'View client certificates',
        }),
        'apim:api_import_export': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_import_export',
            defaultMessage: 'Import and export APIs related operations',
        }),
        'apim:publisher_settings': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.publisher_settings',
            defaultMessage: 'Retrieve store settings',
        }),
        'apim:subscription_block': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.subscription_block',
            defaultMessage: 'Block Subscription',
        }),
        'apim:mediation_policy_view': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.mediation_policy_view',
            defaultMessage: 'View mediation policies',
        }),
        'apim:client_certificates_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.client_certificates_manage',
            defaultMessage: 'View, create, update and remove client certificates',
        }),
        'apim:ep_certificates_add': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.ep_certificates_add',
            defaultMessage: 'Add backend endpoint certificates',
        }),
        'apim:bot_data': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.bot_data',
            defaultMessage: 'Retrieve bot detection data',
        }),
        'apim:api_mediation_policy_manage': intl.formatMessage({
            id: 'PERMISSION_TREE.apim.api_mediation_policy_manage',
            defaultMessage: 'View, create, update and remove API specific mediation policies',
        }),
    };

    return (
        <TreeView
            sx={{ minHeight: 512, flexGrow: 1, maxWidth: 800 }}
            defaultExpanded={['0', '3']}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
        >

            <StyledTreeItem
                {...props}
                TransitionComponent={TransitionComponent}
                nodeId='0'
                label={intl.formatMessage(
                    {
                        id: 'Permissions.tree.scope.assignments.title',
                        defaultMessage: 'Scope Assignments ({totalPermissions})',
                    },
                    {
                        totalPermissions,
                    },
                )}
            >
                {
                    Object.entries(appMappings).map(([app, scopes], APIIndex) => {
                        const nodeId = APIIndex + 1; // this is to give unique id for each nodes in the tree
                        return (
                            <StyledTreeItem
                                {...props}
                                TransitionComponent={TransitionComponent}
                                nodeId={`${nodeId}`}
                                label={(
                                    <Typography display='block' variant='subtitle1'>
                                        {app}
                                        {' '}
                                        <Typography variant='caption'>
                                            (
                                            {scopes.length}
                                            )
                                        </Typography>
                                    </Typography>
                                )}
                            >
                                {scopes.map(({ name, description, roles }, index) => (
                                    <StyledTreeItem
                                        {...props}
                                        TransitionComponent={TransitionComponent}
                                        endIcon={(
                                            <Checkbox
                                                checked={roles.includes(role)}
                                                name={name}
                                                onChange={(e) => onCheck({
                                                    target: {
                                                        name, checked: e.target.checked, role, app,
                                                    },
                                                })}
                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                            />
                                        )}
                                        onClick={() => onCheck({
                                            target: {
                                                name, checked: !roles.includes(role), role, app,
                                            },
                                        })}
                                        nodeId={`${index + 10 * nodeId}`}
                                        label={(
                                            <ListItemText
                                                primary={
                                                    name in APIM_SCOPES_DESCRIPTION_MAP
                                                        ? APIM_SCOPES_DESCRIPTION_MAP[name] : description
                                                }
                                                secondary={name}
                                            />
                                        )}
                                    />
                                ))}
                            </StyledTreeItem>
                        );
                    })
                }
            </StyledTreeItem>
        </TreeView>
    );
}
