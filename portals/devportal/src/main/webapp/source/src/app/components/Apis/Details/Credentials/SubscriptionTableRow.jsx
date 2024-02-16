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
import { Link as MUILink, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import { ScopeValidation, resourceMethods, resourcePaths } from 'AppComponents/Shared/ScopeValidation';
import TokenManager from 'AppComponents/Shared/AppsAndKeys/TokenManager';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const subscriptionTableRow = (props) => {
    const {
        loadInfo, handleSubscriptionDelete, isKeyManagerAllowed,
        selectedAppId, updateSubscriptionData, selectedKeyType, app, applicationOwner, hashEnabled,
    } = props;
    const theme = useTheme();
    return (
        <>
            <tr>
                <td
                    id={app.label}
                >
                    <Typography variant='body2'>
                        {app.label}
                    </Typography>
                </td>
                <td>
                    <Typography variant='body2'>
                        {app.policy}
                    </Typography>
                </td>
                <td>
                    <Typography variant='body2'>
                        {app.status}
                    </Typography>
                </td>
                <td>
                    <Box sx={{
                        display: 'flex',
                        textAlign: 'right',
                        direction: 'rtl',
                    }}
                    >
                        <MUILink
                            sx={(themeValue) => ({
                                padding: themeValue.spacing(1),
                                color: themeValue.palette.getContrastText(themeValue.palette.background.default),
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '11px',
                                cursor: 'pointer',
                                '& span': {
                                    paddingLeft: 1,
                                    display: 'inline-block',
                                },
                            })}
                            to={'/applications/' + app.value}
                            id={app.label + '-MA'}
                            aria-labelledby={app.label + '-MA ' + app.label}
                            component={Link}
                            underline='hover'
                        >
                            <span>
                                <FormattedMessage
                                    id='Apis.Details.Credentials.SubscriptionTableRow.manage.app'
                                    defaultMessage='MANAGE APP'
                                />
                            </span>
                            <CustomIcon
                                width={16}
                                height={16}
                                strokeColor={theme.palette.primary.main}
                                icon='applications'
                            />
                        </MUILink>
                        <ScopeValidation
                            resourcePath={resourcePaths.SINGLE_SUBSCRIPTION}
                            resourceMethod={resourceMethods.DELETE}
                        >
                            <MUILink
                                sx={(themeValue) => ({
                                    padding: themeValue.spacing(1),
                                    color: themeValue.palette.getContrastText(themeValue.palette.background.default),
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    '& span': {
                                        paddingLeft: 1,
                                        display: 'inline-block',
                                    },
                                })}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSubscriptionDelete(
                                        app.subscriptionId,
                                        updateSubscriptionData,
                                    );
                                }}
                                id={app.label + '-UN'}
                                aria-labelledby={app.label + '-UN ' + app.label}
                                underline='hover'
                            >
                                <span>
                                    <FormattedMessage
                                        id='Apis.Details.Credentials.SubscriptionTableRow.unsubscribe'
                                        defaultMessage='UNSUBSCRIBE'
                                    />
                                </span>
                                <CustomIcon
                                    width={16}
                                    height={16}
                                    strokeColor={theme.palette.primary.main}
                                    icon='subscriptions'
                                />
                            </MUILink>
                        </ScopeValidation>
                        <MUILink
                            sx={(themeValue) => ({
                                padding: themeValue.spacing(1),
                                color: themeValue.palette.getContrastText(themeValue.palette.background.default),
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '11px',
                                cursor: 'pointer',
                                '& span': {
                                    paddingLeft: 1,
                                    display: 'inline-block',
                                },
                            })}
                            onClick={() => loadInfo('PRODUCTION', app.value)}
                            id={app.label + '-PK'}
                            aria-labelledby={app.label + '-PK ' + app.label}
                            underline='hover'
                        >
                            <span>
                                <FormattedMessage
                                    id='Apis.Details.Credentials.SubscriptionTableRow.prod.keys'
                                    defaultMessage='PROD KEYS'
                                />
                            </span>
                            <CustomIcon
                                width={16}
                                height={16}
                                strokeColor={theme.palette.primary.main}
                                icon='productionkeys'
                            />
                        </MUILink>
                        <MUILink
                            sx={(themeValue) => ({
                                padding: themeValue.spacing(1),
                                color: themeValue.palette.getContrastText(themeValue.palette.background.default),
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '11px',
                                cursor: 'pointer',
                                '& span': {
                                    paddingLeft: 1,
                                    display: 'inline-block',
                                },
                            })}
                            onClick={() => loadInfo('SANDBOX', app.value)}
                            id={app.label + '-SB'}
                            aria-labelledby={app.label + '-SB ' + app.label}
                            underline='hover'
                        >
                            <span>
                                <FormattedMessage
                                    id='Apis.Details.Credentials.SubscriptionTableRow.sandbox.keys'
                                    defaultMessage='SANDBOX KEYS'
                                />
                            </span>
                            <CustomIcon
                                width={16}
                                height={16}
                                strokeColor={theme.palette.primary.main}
                                icon='productionkeys'
                            />
                        </MUILink>
                    </Box>
                </td>
            </tr>
            {app.value === selectedAppId && (selectedKeyType === 'PRODUCTION' || selectedKeyType === 'SANDBOX') && (
                <tr>
                    <td colSpan='4'>
                        <Box sx={(themeValue) => ({
                            borderLeft: 'solid 2px ' + themeValue.palette.primary.main,
                        })}
                        >
                            <TokenManager
                                isKeyManagerAllowed={isKeyManagerAllowed}
                                keyType={selectedKeyType}
                                selectedApp={{
                                    appId: app.value,
                                    label: app.label,
                                    owner: applicationOwner,
                                    hashEnabled,
                                }}
                                updateSubscriptionData={updateSubscriptionData}
                            />
                        </Box>
                    </td>
                </tr>
            )}
        </>
    );
};
subscriptionTableRow.propTypes = {
    classes: PropTypes.shape({
        td: PropTypes.shape({}),
        actionColumn: PropTypes.shape({}),
        button: PropTypes.shape({}),
        activeLink: PropTypes.shape({}),
        selectedWrapper: PropTypes.shape({}),
    }).isRequired,
    theme: PropTypes.shape({

    }).isRequired,
    handleSubscriptionDelete: PropTypes.func.isRequired,
    loadInfo: PropTypes.func.isRequired,
    selectedAppId: PropTypes.string.isRequired,
    updateSubscriptionData: PropTypes.func.isRequired,
    selectedKeyType: PropTypes.string.isRequired,
    applicationOwner: PropTypes.string.isRequired,
    app: PropTypes.shape({
        label: PropTypes.string,
        policy: PropTypes.string,
        status: PropTypes.string,
        value: PropTypes.string,
        subscriptionId: PropTypes.string,
    }).isRequired,
};
export default (subscriptionTableRow);
