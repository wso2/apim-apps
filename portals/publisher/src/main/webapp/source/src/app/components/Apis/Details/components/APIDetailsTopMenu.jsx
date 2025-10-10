/*
 * Copyright (c), WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState, useContext, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Utils from 'AppData/Utils';
import Alert from 'AppComponents/Shared/Alert';
import { FormattedMessage, injectIntl } from 'react-intl';
import LaunchIcon from '@mui/icons-material/Launch';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import { isRestricted } from 'AppData/AuthManager';
import { Link, useHistory } from 'react-router-dom';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import { useAppContext, usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { useRevisionContext } from 'AppComponents/Shared/RevisionContext';
import ThumbnailView from 'AppComponents/Apis/Listing/components/ImageGenerator/ThumbnailView';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import GoTo from 'AppComponents/Apis/Details/GoTo/GoTo';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import clsx from 'clsx';
import DeleteApiButton from './DeleteApiButton';
import CreateNewVersionButton from './CreateNewVersionButton';
import ShareButton from './ShareButton';

const PREFIX = 'APIDetailsTopMenu';
const classes = {
    root: `${PREFIX}-root`,
    backLink: `${PREFIX}-backLink`,
    backIcon: `${PREFIX}-backIcon`,
    backText: `${PREFIX}-backText`,
    viewInStoreLauncher: `${PREFIX}-viewInStoreLauncher`,
    linkText: `${PREFIX}-linkText`,
    dateWrapper: `${PREFIX}-dateWrapper`,
    lastUpdatedTypography: `${PREFIX}-lastUpdatedTypography`,
    apiName: `${PREFIX}-apiName`,
    downloadApi: `${PREFIX}-downloadApi`,
    downloadApiFlex: `${PREFIX}-downloadApiFlex`,
    revisionWrapper: `${PREFIX}-revisionWrapper`,
    topRevisionStyle: `${PREFIX}-topRevisionStyle`,
    active: `${PREFIX}-active`,
    chip: `${PREFIX}-chip`,
    chipSecondary: `${PREFIX}-chipSecondary`,
};

const Root = styled('div')(({ theme }) => ({
    [`.${classes.root}`]: {
        height: theme.custom.apis.topMenu.height,
        background: theme.palette.background.paper,
        borderBottom: 'solid 1px ' + theme.palette.grey.A200,
        display: 'flex',
        alignItems: 'center',
    },
    [`.${classes.backLink}`]: {
        alignItems: 'center',
        textDecoration: 'none',
        display: 'contents',
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },
    [`.${classes.backIcon}`]: {
        color: theme.palette.primary.main,
        fontSize: 56,
        cursor: 'pointer',
    },
    [`.${classes.backText}`]: {
        color: theme.palette.primary.main,
        cursor: 'pointer',
        fontFamily: theme.typography.fontFamily,
    },
    [`.${classes.viewInStoreLauncher}`]: {
        display: 'flex',
        flexDirection: 'column',
        color: theme.palette.getContrastText(theme.palette.background.paper),
        textAlign: 'center',
        justifyContent: 'center',
        height: 70,
    },
    [`.${classes.linkText}`]: {
        fontSize: theme.typography.fontSize,
    },
    [`.${classes.dateWrapper}`]: {
        flex: 1,
        alignSelf: 'center',
    },
    [`.${classes.lastUpdatedTypography}`]: {
        display: 'inline-block',
        minWidth: 30,
    },
    [`.${classes.apiName}`]: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    [`.${classes.downloadApi}`]: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        height: 70,
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },
    [`.${classes.downloadApiFlex}`]: {
        display: 'flex',
        flexDirection: 'column',
    },
    [`.${classes.revisionWrapper}`]: {
        paddingRight: theme.spacing(2),
    },
    [`.${classes.topRevisionStyle}`]: {
        marginLeft: theme.spacing(1),
        maxWidth: 500,
    },
    [`.${classes.active}`]: {
        background: theme.custom.revision.activeRevision.background,
        width: 8,
        height: 8,
        borderRadius: '50%',
        alignItems: 'center',
    },
    [`.${classes.chip}`]: {
        height: 28,
        borderRadius: 4,
        backgroundColor: '#eef3f9ff',
        color: theme.palette.text.primary,
        overflow: 'hidden',
        marginLeft: theme.spacing(1),
        '& svg': {
            marginLeft: '8px',
            marginRight: '-6px',
        },
    },
    [`.${classes.chipSecondary}`]: {
        backgroundColor: theme.palette.background.default,
    },
}));

const APIDetailsTopMenu = (props) => {
    const {
        api, isAPIProduct, imageUpdate, intl, openPageSearch, setOpenPageSearch, updateAPI
    } = props;
    const theme = useTheme();
    const history = useHistory();
    const prevLocation = history.location.pathname;
    const lastIndex = prevLocation.split('/')[3];
    const [revisionId, setRevisionId] = useState(api.id);
    let lifecycleState;
    let isVisibleInStore;
    if (isAPIProduct) {
        lifecycleState = api.state === 'PROTOTYPED' ? 'PRE-RELEASED' : api.state;
        isVisibleInStore = ['PROTOTYPED', 'PUBLISHED'].includes(api.state);
    } else {
        lifecycleState = api.lifeCycleStatus === 'PROTOTYPED' ? 'PRE-RELEASED' : api.lifeCycleStatus;
        isVisibleInStore = ['PROTOTYPED', 'PUBLISHED'].includes(api.lifeCycleStatus);
    }
    const ApiLifeCycleStates = {
        CREATED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.CREATED', defaultMessage: 'CREATED',
        }),
        PUBLISHED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.PUBLISHED', defaultMessage: 'PUBLISHED',
        }),
        DEPRECATED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.DEPRECATED', defaultMessage: 'DEPRECATED',
        }),
        RETIRED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.RETIRED', defaultMessage: 'RETIRED',
        }),
        BLOCKED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.BLOCKED', defaultMessage: 'BLOCKED',
        }),
        'PRE-RELEASED': intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.PRE-RELEASED', defaultMessage: 'PRE-RELEASED',
        }),
    };
    const isMCPServer = api.isMCPServer();

    const [userOrg, setUserOrg] = useState(null);

    useEffect(() => {
        if (!isMCPServer) {
            new API()
                .getUserOrganizationInfo()
                .then((result) => {
                    setUserOrg(result.body.organizationId);
                })
                .catch((error) => {
                    throw error;
                });
        }
    }, []);

    /**
         * The component for advanced endpoint configurations.
         * @param {string} name The name of the
         * @param {string} version Version of the API
         * @param {string} provider Provider of the API
         * @param {string} format Weather to recive files in YALM of JSON format
         * @returns {zip} Zpi file containing the API directory.
     */
    function exportAPI() {
        let exportPromise;
        if (api.isMCPServer()) {
            exportPromise = MCPServer.exportMCPServer(api.id);
        } else {
            exportPromise = api.export();
        }
        return exportPromise.then((zipFile) => {
            return Utils.forceDownload(zipFile);
        }).catch((error) => {
            console.error(error);
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.components.APIDetailsTopMenu.error',
                    defaultMessage: 'Something went wrong while downloading the API.',
                }));
            }
        });
    }

    const handleChange = (event) => {
        setRevisionId(event.target.value);
    };

    /**
     * Update the state when new props are available
     */
    useEffect(() => {
        setRevisionId(api.id);
    }, [api.id]);

    const isDownloadable = [API.CONSTS.API, API.CONSTS.APIProduct, MCPServer.CONSTS.MCP].includes(api.apiType);
    const { user } = useAppContext();
    const { data: settings } = usePublisherSettings();
    const { allRevisions, allEnvRevision } = useRevisionContext();
    const { tenantList } = useContext(ApiContext);
    const userNameSplit = user.name.split('@');
    const tenantDomain = userNameSplit[userNameSplit.length - 1];
    // let devportalUrl = settings ? `${settings.devportalUrl}/apis/${api.id}/overview` : '';
    // if (tenantList && tenantList.length > 0) {
    //     devportalUrl = settings ? `${settings.devportalUrl}/apis/${api.id}/overview?tenant=${tenantDomain}` : '';
    // }

    function getDeployments(revisionKey) {
        const array = [];
        allEnvRevision.filter(
            (env) => env.id === revisionKey,
        )[0].deploymentInfo.map((environment) => array.push(environment.name));
        return array.join(', ');
    }

    const getDevportalUrl = () => {
        let devportalUrl = '';
        if (settings && settings.devportalUrl) {
            devportalUrl = `${settings.devportalUrl}/${api.isMCPServer() ? 'mcp-servers' : 'apis'}/${api.id}/overview`;
        }
        if (tenantList && tenantList.length > 0) {
            devportalUrl += `?tenant=${tenantDomain}`;
        }
        return devportalUrl;
    }

    /**
     * Checks if the user has access to delete APIs/MCP Servers.
     * @returns {boolean} Returns true if the user's access is restricted, false otherwise.
     */
    const isDeleteAccessRestricted = () => {
        if (api.isMCPServer()) {
            return isRestricted(
                ['apim:mcp_server_delete', 'apim:mcp_server_manage', 'apim:mcp_server_import_export'],
                api
            );
        } else {
            return isRestricted(['apim:api_create'], api);
        }
    }

    /**
     * Checks if the user has access to create MCP Servers.
     * @returns {boolean} Returns true if the user's access is restricted, false otherwise.
     */
    const isGenerateMCPServerAccessRestricted = () => {
        return isRestricted(['apim:mcp_server_create', 'apim:mcp_server_manage'], api);
    }

    // todo: need to support rev proxy ~tmkb
    return (
        <Root>
            <div className={classes.root}>
                <Link
                    to={(() => {
                        if (api.isMCPServer()) {
                            return `/mcp-servers/${api.id}/overview`;
                        } else if (isAPIProduct) {
                            return `/api-products/${api.id}/overview`;
                        } else {
                            return `/apis/${api.id}/overview`;
                        }
                    })()}
                    className={classes.backLink}
                >
                    <Box width={70} height={50} marginLeft={1}>
                        <ThumbnailView api={api} width={70} height={50} imageUpdate={imageUpdate}
                            updateAPI={updateAPI} />
                    </Box>
                    <div style={{ marginLeft: theme.spacing(1), maxWidth: 500 }}>
                        <Link
                            to={(() => {
                                if (api.isMCPServer()) {
                                    return `/mcp-servers/${api.id}/overview`;
                                } else if (isAPIProduct) {
                                    return `/api-products/${api.id}/overview`;
                                } else {
                                    return `/apis/${api.id}/overview`;
                                }
                            })()}
                            className={classes.backLink}
                        >
                            <Typography id='itest-api-name-version' variant='h4' component='h1' 
                                className={classes.apiName}>
                                {api.displayName || api.name}
                                {' :'}
                                {api.version}
                            </Typography>
                            <Typography variant='caption' gutterBottom align='left'>
                                <FormattedMessage
                                    id='Apis.Details.components.APIDetailsTopMenu.created.by'
                                    defaultMessage='Created by '
                                />
                                {' '}
                                {api.provider}
                                {!isAPIProduct && !api.isMCPServer() && (
                                    <>
                                        &nbsp;
                                        <FormattedMessage 
                                            id='Apis.Details.components.APIDetailsTopMenu.created.on' 
                                            defaultMessage='on' />
                                        &nbsp;
                                        {api.gatewayVendor === 'wso2'
                                            ? api.gatewayVendor.toUpperCase()
                                            : Utils.capitalizeFirstLetter(api.gatewayType)}
                                    </>
                                )}
                            </Typography>
                        </Link>
                    </div>
                </Link>
                <VerticalDivider height={70} />
                <div>
                    <Typography data-testid='itest-api-state' component='div' variant='subtitle1'>
                        {lifecycleState in ApiLifeCycleStates
                            ? ApiLifeCycleStates[lifecycleState] : lifecycleState}
                    </Typography>
                    <Typography variant='caption' align='left'>
                        <FormattedMessage
                            id='Apis.Details.components.APIDetailsTopMenu.state'
                            defaultMessage='State'
                        />
                    </Typography>
                </div>
                <VerticalDivider height={70} />
                {api.initiatedFromGateway && (
                    <Chip
                        variant='outlined'
                        color='primary'
                        icon={<CustomIcon icon='discovered-api' height={16} width={16} />}
                        classes={{ root: classes.chip }}
                        label={
                            <>
                                <FormattedMessage
                                    id='Apis.Details.components.APIDetailsTopMenu.discovered.api.label'
                                    defaultMessage='Discovered API -'
                                />
                                &nbsp;
                                {api.gatewayVendor === 'wso2'
                                    ? api.gatewayVendor.toUpperCase()
                                    : Utils.capitalizeFirstLetter(api.gatewayType)}
                            </>
                        }
                    />
                )}
                {api.isRevision && (
                    <Chip
                        variant='outlined'
                        color='default'
                        icon={<CustomIcon icon='read-only-api' height={16} width={16} />}
                        classes={{ root: clsx(classes.chip, classes.chipSecondary) }}
                        label={
                            <FormattedMessage
                                id='Apis.Details.components.APIDetailsTopMenu.read.only.label'
                                defaultMessage='Read Only'
                            />
                        }
                    />
                )}
                {(api.subtypeConfiguration?.subtype === 'AIAPI') && (
                    <Chip
                        data-testid='itest-ai-api-label'
                        variant='outlined'
                        color='primary'
                        icon={<CustomIcon icon='ai-api' height={16} width={16} />}
                        classes={{ root: classes.chip }}
                        label={
                            <FormattedMessage
                                id='Apis.Details.components.APIDetailsTopMenu.ai.api.label'
                                defaultMessage='AI API'
                            />
                        }
                    />
                )}
                {(api.advertiseInfo && api.advertiseInfo.advertised) && (
                    <Chip
                        data-testid='itest-third-party-api-label'
                        variant='outlined'
                        color='primary'
                        icon={<CustomIcon icon='third-party-api' height={16} width={16} />}
                        classes={{ root: classes.chip }}
                        label={
                            <FormattedMessage
                                id='Apis.Details.components.APIDetailsTopMenu.advertise.only.label'
                                defaultMessage='Third-party API'
                            />
                        }
                    />
                )}
                <div className={classes.dateWrapper} />
                {(!api.advertiseInfo || !api.advertiseInfo.advertised) && (api.gatewayType !== 'solace') && (
                    <div className={classes.topRevisionStyle}>
                        <FormControl margin='dense' variant='outlined'>
                            <Select
                                id='revision-selector'
                                value={revisionId}
                                name='selectRevision'
                                onChange={handleChange}
                                size='small'
                            >
                                {(() => {
                                    let menuItemProps = {};
                                
                                    if (isMCPServer) {
                                        const mcpServerId = api.isRevision ? api.revisionedMCPServerId : api.id;
                                        menuItemProps = {
                                            value: mcpServerId,
                                            component: Link,
                                            to: `/mcp-servers/${mcpServerId}/${lastIndex}`,
                                            children: (
                                                <FormattedMessage
                                                    id='Apis.Details.components.APIDetailsTopMenu.current.mcp.server'
                                                    defaultMessage='Current MCP Server'
                                                />
                                            )
                                        };
                                    } else if (isAPIProduct) {
                                        const apiProductId = api.isRevision ? api.revisionedApiProductId : api.id;
                                        menuItemProps = {
                                            value: apiProductId,
                                            component: Link,
                                            to: `/api-products/${apiProductId}/${lastIndex}`,
                                            children: (
                                                <FormattedMessage
                                                    id='Apis.Details.components.APIDetailsTopMenu.current.api'
                                                    defaultMessage='Current API'
                                                />
                                            )
                                        };
                                    } else {
                                        menuItemProps = {
                                            value: api.isRevision ? api.revisionedApiId : api.id,
                                            component: Link,
                                            to: `/apis/${api.isRevision ? api.revisionedApiId : api.id}/${lastIndex}`,
                                            children: (
                                                <FormattedMessage
                                                    id='Apis.Details.components.APIDetailsTopMenu.current.api'
                                                    defaultMessage='Current API'
                                                />
                                            )
                                        };
                                    }
                                
                                    return <MenuItem {...menuItemProps} />;
                                })()}
                                {allRevisions && !isAPIProduct && allRevisions.map((item) => {
                                    const revisionUrl = isMCPServer 
                                        ? `/mcp-servers/${item.id}/${lastIndex}`
                                        : `/apis/${item.id}/${lastIndex}`;
                                
                                    return (
                                        <MenuItem key={item.id} 
                                            value={item.id} component={Link} to={revisionUrl}>
                                            <Grid
                                                container
                                                direction='row'
                                                alignItems='center'
                                            >
                                                <Grid item>
                                                    {item.displayName}
                                                </Grid>
                                                {allEnvRevision && allEnvRevision.find((env) => env.id === item.id) && (
                                                    <Grid item>
                                                        <Box ml={2}>
                                                            <Tooltip
                                                                title={getDeployments(item.id)}
                                                                placement='bottom'
                                                            >
                                                                <Grid className={classes.active} />
                                                            </Tooltip>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </MenuItem>
                                    );
                                })}
                                {allRevisions && isAPIProduct && allRevisions.map((item) => (
                                    <MenuItem
                                        value={item.id}
                                        component={Link}
                                        to={'/api-products/' + item.id + '/' + lastIndex}
                                    >
                                        <Grid
                                            container
                                            direction='row'
                                            alignItems='center'
                                        >
                                            <Grid item>
                                                {item.displayName}
                                            </Grid>
                                            {allEnvRevision && allEnvRevision.find((env) => env.id === item.id) && (
                                                <Grid item>
                                                    <Box ml={2}>
                                                        <Tooltip
                                                            title={getDeployments(item.id)}
                                                            placement='bottom'
                                                        >
                                                            <Grid className={classes.active} />
                                                        </Tooltip>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                )}

                <VerticalDivider height={70} />
                <GoTo
                    setOpenPageSearch={setOpenPageSearch}
                    openPageSearch={openPageSearch}
                    api={api}
                    isAPIProduct={isAPIProduct}
                />
                {(isVisibleInStore) && <VerticalDivider height={70} />}
                {(isVisibleInStore) && (
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href={getDevportalUrl()}
                        className={classes.viewInStoreLauncher}
                        style={{ minWidth: 90 }}
                    >
                        <div>
                            <LaunchIcon />
                        </div>
                        <Typography variant='caption'>
                            <FormattedMessage
                                id='Apis.Details.components.APIDetailsTopMenu.view.in.portal'
                                defaultMessage='View in Dev Portal'
                            />
                        </Typography>
                    </a>
                )}
                {(settings && settings.isMCPSupportEnabled) &&
                api.type === 'HTTP' && api.gatewayType === 'wso2/synapse' &&
                api.subtypeConfiguration?.subtype !== 'AIAPI' &&
                !isGenerateMCPServerAccessRestricted() && (() => {
                    const mcpServerUrl = `/mcp-servers/create/mcp-from-existing-api?apiId=${api.id}`;
                    return (
                        <>
                            <VerticalDivider height={70} />
                            <Link
                                className={classes.viewInStoreLauncher}
                                to={mcpServerUrl}
                                style={{ minWidth: 90 }}
                            >
                                <div>
                                    <CustomIcon
                                        width={20}
                                        height={20}
                                        icon='mcp-servers'
                                        strokeColor={theme.palette.getContrastText(theme.palette.background.paper)}
                                    />
                                </div>
                                <Typography variant='caption'>
                                    <FormattedMessage
                                        id='Apis.Details.components.APIDetailsTopMenu.generate.mcp.server.label'
                                        defaultMessage='Generate MCP Server'
                                    />
                                </Typography>
                            </Link>
                        </>
                    );
                })()}
                {/* Page error banner */}
                {/* end of Page error banner */}
                {api.apiType !== API.CONSTS.APIProduct && isVisibleInStore && userOrg 
                    ? <>
                        <ShareButton buttonClass={classes.viewInStoreLauncher}
                            api={api} isAPIProduct={isAPIProduct} />
                    </> : null
                }
                {api.isRevision || (settings && settings.portalConfigurationOnlyModeEnabled)
                    ? null :
                    <>
                        <CreateNewVersionButton buttonClass={classes.viewInStoreLauncher}
                            api={api} isAPIProduct={isAPIProduct} />
                    </>}
                {(isDownloadable) && <VerticalDivider height={70} />}
                <div className={classes.downloadApi}>
                    {(isDownloadable) && (
                        <a
                            onClick={exportAPI}
                            onKeyDown={null}
                            className={classes.downloadApiFlex}
                            id='download-api-btn'
                        >
                            <div>
                                <CloudDownloadRounded />
                            </div>
                            <Typography variant='caption' align='left'>
                                {api.isMCPServer() ? (
                                    <FormattedMessage
                                        id='Apis.Details.APIDetailsTopMenu.download.mcp.server'
                                        defaultMessage='Download MCP Server'
                                    />
                                ) : (
                                    <FormattedMessage
                                        id='Apis.Details.APIDetailsTopMenu.download.api'
                                        defaultMessage='Download API'
                                    />
                                )}
                            </Typography>
                        </a>
                    )}
                </div>
                {api.isRevision || (settings && settings.portalConfigurationOnlyModeEnabled)
                    || isDeleteAccessRestricted()
                    ? (<div className={classes.revisionWrapper} />)
                    : (
                        <DeleteApiButton
                            buttonClass={classes.viewInStoreLauncher}
                            api={api}
                            isAPIProduct={isAPIProduct}
                        />
                    )
                }
            </div>
        </Root>
    );
};

APIDetailsTopMenu.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        subtypeConfiguration: PropTypes.shape({}),
    }).isRequired,
    isAPIProduct: PropTypes.bool.isRequired,
    imageUpdate: PropTypes.number.isRequired,
};

export default injectIntl(APIDetailsTopMenu);
