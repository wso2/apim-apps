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

import React, { useState } from 'react';
import { makeStyles, withStyles } from '@mui/styles';
import Accordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LeftMenuItem from 'AppComponents/Shared/LeftMenuItem';
import Typography from '@mui/material/Typography';
import EndpointIcon from '@mui/icons-material/GamesOutlined';
import ScopesIcon from '@mui/icons-material/VpnKey';
import PoliciesIcon from '@mui/icons-material/SyncAlt';
import DocumentsIcon from '@mui/icons-material/LibraryBooks';
import BusinessIcon from '@mui/icons-material/Business';
import ConfigurationIcon from '@mui/icons-material/Build';
import PropertiesIcon from '@mui/icons-material/List';
import SubscriptionsIcon from '@mui/icons-material/RssFeed';
import Tooltip from '@mui/material/Tooltip';
import CommentIcon from '@mui/icons-material/Comment';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RuntimeConfigurationIcon from '@mui/icons-material/Settings';
import MonetizationIcon from '@mui/icons-material/LocalAtm';
import { isRestricted } from 'AppData/AuthManager';
import { PROPERTIES as UserProperties } from 'AppData/User';
import { useUser } from 'AppComponents/Shared/AppContext';
import { useIntl } from 'react-intl';


const AccordianSummary = withStyles({
    root: {
        backgroundColor: '#1a1f2f',
        paddingLeft: '8px',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        minHeight: 40,
        '&.Mui-expanded': {
            minHeight: 40,
        },
    },
    content: {
        '&.Mui-expanded': {
            margin: 0,
        },
    },
    expanded: {
        backgroundColor: '#1a1f2f',
    },
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
    root: {
        backgroundColor: '#1a1f2f',
        paddingLeft: theme.spacing(0),
        paddingRight: theme.spacing(2),
        paddingTop: '0',
        paddingBottom: '0',
    },
}))(MuiAccordionDetails);


const useStyles = makeStyles((theme) => ({
    footeremaillink: {
        marginLeft: theme.custom.leftMenuWidth, /* 4px */
    },
    root: {
        backgroundColor: theme.palette.background.leftMenu,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: '0',
        paddingBottom: '0',
    },
    expanded: {
        '&.Mui-expanded': {
            margin: 0,
            backgroundColor: theme.palette.background.leftMenu,
            minHeight: 40,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
        },
    },
    leftLInkText: {
        color: theme.palette.getContrastText(theme.palette.background.leftMenu),
        textTransform: theme.custom.leftMenuTextStyle,
        width: '100%',
        textAlign: 'left',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 250,
        whiteSpace: 'nowrap',
    },
    expandIconColor: {
        color: '#ffffff',
    },
}));

/**
 *
 * @param {*} props
 * @returns
 */
export default function DevelopSectionMenu(props) {
    const {
        pathPrefix, isAPIProduct, api, getLeftMenuItemForResourcesByType, getLeftMenuItemForDefinitionByType,
    } = props;
    const user = useUser();
    const [portalConfigsExpanded, setPortalConfigsExpanded] = useState(user
        .getProperty(UserProperties.PORTAL_CONFIG_OPEN));
    const [apiConfigsExpanded, setApiConfigsExpanded] = useState(user.getProperty(UserProperties.API_CONFIG_OPEN));
    const handleAccordionState = (section, isExpanded) => {
        if (section === 'portalConfigsExpanded') {
            setPortalConfigsExpanded(isExpanded);
            user.setProperty(UserProperties.PORTAL_CONFIG_OPEN, isExpanded);
        } else {
            setApiConfigsExpanded(isExpanded);
            user.setProperty(UserProperties.API_CONFIG_OPEN, isExpanded);
        }
    };
    const classes = useStyles();
    const intl = useIntl();

    return (
        <div className={classes.root}>
            <Accordion
                id='itest-api-details-portal-config-acc'
                defaultExpanded={portalConfigsExpanded}
                elevation={0}
                onChange={(e, isExpanded) => handleAccordionState('portalConfigsExpanded',
                    isExpanded)}
                classes={{ expanded: classes.expanded }}
            >
                <AccordianSummary
                    expandIcon={<ExpandMoreIcon className={classes.expandIconColor} />}
                >
                    <Typography className={classes.leftLInkText}>
                        Portal Configurations
                    </Typography>
                </AccordianSummary>
                <AccordionDetails>
                    <div>
                        <LeftMenuItem
                            className={classes.footeremaillink}
                            text={intl.formatMessage({
                                id: 'Apis.Details.index.design.configs',
                                defaultMessage: 'Basic info',
                            })}
                            route='configuration'
                            to={pathPrefix + 'configuration'}
                            Icon={<ConfigurationIcon />}
                            id='left-menu-itemDesignConfigurations'
                        />
                        <LeftMenuItem
                            text={intl.formatMessage({
                                id: 'Apis.Details.index.business.info',
                                defaultMessage: 'business info',
                            })}
                            to={pathPrefix + 'business info'}
                            Icon={<BusinessIcon />}
                            id='left-menu-itembusinessinfo'
                        />
                        {!isAPIProduct && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.subscriptions',
                                    defaultMessage: 'subscriptions',
                                })}
                                to={pathPrefix + 'subscriptions'}
                                Icon={<SubscriptionsIcon />}
                                id='left-menu-itemsubscriptions'
                            />
                        )}
                        {isAPIProduct && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.subscriptions',
                                    defaultMessage: 'subscriptions',
                                })}
                                to={pathPrefix + 'subscriptions'}
                                Icon={<SubscriptionsIcon />}
                                id='left-menu-itemsubscriptions'
                            />
                        )}
                        <LeftMenuItem
                            text={intl.formatMessage({
                                id: 'Apis.Details.index.documents',
                                defaultMessage: 'documents',
                            })}
                            to={pathPrefix + 'documents'}
                            Icon={<DocumentsIcon />}
                            id='left-menu-itemdocuments'
                        />
                        {!isAPIProduct && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.comments',
                                    defaultMessage: 'Comments',
                                })}
                                route='comments'
                                to={pathPrefix + 'comments'}
                                Icon={<CommentIcon />}
                                id='left-menu-itemcomments'
                            />
                        )}
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion
                id='itest-api-details-api-config-acc'
                defaultExpanded={apiConfigsExpanded}
                elevation={0}
                onChange={(e, isExpanded) => handleAccordionState('apiConfigsExpanded',
                    isExpanded)}
                classes={{ expanded: classes.expanded }}
            >
                <AccordianSummary
                    expandIcon={<ExpandMoreIcon className={classes.expandIconColor} />}
                >
                    <Typography 
                        className={classes.leftLInkText} 
                        data-testid='itest-api-config'>
                        API Configurations
                    </Typography>
                    <Tooltip
                        title={'If you make any changes to the API configuration, you need to redeploy'
                            + ' the API to see updates in the API Gateway.'}
                        placement='bottom'
                    >
                        <IconButton color='primary' size='small' aria-label='delete'>
                            <InfoOutlinedIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                </AccordianSummary>
                <AccordionDetails>
                    <div>
                        {!isAPIProduct && !api.isWebSocket() && (api.gatewayVendor === 'wso2') && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.runtime.configs',
                                    defaultMessage: 'Runtime',
                                })}
                                route='runtime-configuration'
                                to={pathPrefix + 'runtime-configuration'}
                                Icon={<RuntimeConfigurationIcon />}
                                id='left-menu-itemRuntimeConfigurations'
                            />
                        )}
                        {isAPIProduct && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.runtime.configs',
                                    defaultMessage: 'Runtime',
                                })}
                                route='runtime-configuration'
                                to={pathPrefix + 'runtime-configuration'}
                                Icon={<RuntimeConfigurationIcon />}
                                id='left-menu-itemRuntimeConfigurations'
                            />
                        )}
                        {api.isWebSocket() && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.runtime.configs',
                                    defaultMessage: 'Runtime',
                                })}
                                route='runtime-configuration'
                                to={pathPrefix + 'runtime-configuration-websocket'}
                                Icon={<RuntimeConfigurationIcon />}
                                id='left-menu-itemRuntimeConfigurations'
                            />
                        )}
                        {getLeftMenuItemForResourcesByType(api.type)}
                        {getLeftMenuItemForDefinitionByType(api.type)}
                        {(!api.advertiseInfo || !api.advertiseInfo.advertised) && !isAPIProduct
                            && api.type !== 'WEBSUB' && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.endpoints',
                                    defaultMessage: 'endpoints',
                                })}
                                to={pathPrefix + 'endpoints'}
                                Icon={<EndpointIcon />}
                                id='left-menu-itemendpoints'
                            />
                        )}
                        {!isAPIProduct && (api.gatewayVendor === 'wso2') && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.left.menu.scope',
                                    defaultMessage: 'Local Scopes',
                                })}
                                route='scopes'
                                to={pathPrefix + 'scopes'}
                                Icon={<ScopesIcon />}
                                id='left-menu-itemLocalScopes'
                            />
                        )}
                        {api.advertiseInfo && !api.advertiseInfo.advertised && !isAPIProduct
                            && (api.type === 'HTTP' || api.type === 'SOAP' || api.type === 'SOAPTOREST') && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.policies',
                                    defaultMessage: 'Policies',
                                })}
                                route='policies'
                                to={pathPrefix + 'policies'}
                                Icon={<PoliciesIcon />}
                                data-testid='left-menu-policies'
                                id='left-menu-policies'
                            />
                        )}

                        <LeftMenuItem
                            text={intl.formatMessage({
                                id: 'Apis.Details.index.properties',
                                defaultMessage: 'properties',
                            })}
                            to={pathPrefix + 'properties'}
                            Icon={<PropertiesIcon />}
                            id='left-menu-itemproperties'
                        />

                        {!api.isWebSocket() && !isRestricted(['apim:api_publish'], api) && (
                            <>
                                {!isAPIProduct && (api.gatewayVendor === 'wso2') && (
                                    <LeftMenuItem
                                        text={intl.formatMessage({
                                            id: 'Apis.Details.index.monetization',
                                            defaultMessage: 'monetization',
                                        })}
                                        to={pathPrefix + 'monetization'}
                                        Icon={<MonetizationIcon />}
                                        id='left-menu-itemMonetization'
                                    />
                                )}
                            </>
                        )}
                        {isAPIProduct && !api.isWebSocket()
                            && !isRestricted(['apim:api_publish'], api) && (
                            <LeftMenuItem
                                text={intl.formatMessage({
                                    id: 'Apis.Details.index.monetization',
                                    defaultMessage: 'monetization',
                                })}
                                to={pathPrefix + 'monetization'}
                                Icon={<MonetizationIcon />}
                                id='left-menu-monetization-prod'
                            />
                        )}
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}
