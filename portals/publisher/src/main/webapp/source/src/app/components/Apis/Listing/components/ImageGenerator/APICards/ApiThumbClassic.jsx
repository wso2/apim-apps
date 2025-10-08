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
import React, { Component } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { isRestricted } from 'AppData/AuthManager';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { FormattedMessage, injectIntl } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import API from 'AppData/api';
import CONSTS from 'AppData/Constants';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Configurations from 'Config';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Box, Divider } from '@mui/material';

import { green } from '@mui/material/colors';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import Utils from 'AppData/Utils';
import { getBasePath } from 'AppComponents/Shared/Utils';
import MCPServer from 'AppData/MCPServer';
import DeleteButton from './DeleteButton';
import BaseThumbnail from '../BaseThumbnail';

const PREFIX = 'ApiThumbClassic';

const classes = {
    card: `${PREFIX}-card`,
    apiDetails: `${PREFIX}-apiDetails`,
    apiActions: `${PREFIX}-apiActions`,
    deleteProgress: `${PREFIX}-deleteProgress`,
    thumbHeader: `${PREFIX}-thumbHeader`,
    textTruncate: `${PREFIX}-textTruncate`,
    row: `${PREFIX}-row`,
    textWrapper: `${PREFIX}-textWrapper`,
    chip: `${PREFIX}-chip`,
    ribbon: `${PREFIX}-ribbon`,
    suppressLinkStyles: `${PREFIX}-suppressLinkStyles`,
};

const StyledCard = styled(Card)(({ theme, useFlexibleWidth }) => ({
    [`&.${classes.card}`]: {
        ...(useFlexibleWidth ? {} : { width: '300px', margin: theme.spacing(1) }),
        borderRadius: theme.spacing(1),
        transition: 'box-shadow 0.3s ease-in-out',
        height: 'fit-content',
    },

    [`& .${classes.apiDetails}`]: {
        padding: theme.spacing(1.5),
        paddingBottom: 0,
        gap: theme.spacing(2),
    },

    [`& .${classes.apiActions}`]: {
        justifyContent: 'space-between',
        padding: `8px 12px ${theme.spacing(1)} 12px`,
    },

    [`& .${classes.deleteProgress}`]: {
        color: green[200],
        position: 'absolute',
        marginLeft: '200px',
    },

    [`& .${classes.thumbHeader}`]: {
        color: theme.palette.text.primary,
        cursor: 'pointer',
        fontWeight: 600,
        lineHeight: '1.3',
    },

    [`& .${classes.textTruncate}`]: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    [`& .${classes.row}`]: {
        display: 'flex',
        gap: '6px',
    },

    [`& .${classes.textWrapper}`]: {
        color: theme.palette.text.secondary,
        textDecoration: 'none',
    },

    [`& .${classes.chip}`]: {
        height: 20,
        borderRadius: 4,
        backgroundColor: '#eef3f9ff',
        overflow: 'hidden',
        '& svg': {
            marginLeft: '5px',
            marginRight: '-4px',
        },
    },

    [`& .${classes.ribbon}`]: {
        fontFamily: theme.typography.fontFamily,
        fontWeight: 800,
        backgroundColor: '#F2F8FF',
        textTransform: 'uppercase',
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 3,
        borderTopRightRadius: theme.spacing(0.5),
        borderBottomLeftRadius: theme.spacing(0.5),
        fontSize: '10px',
        padding: '3px 5px',
    },

    [`& .${classes.suppressLinkStyles}`]: {
        textDecoration: 'none',
        color: 'inherit',
    },
}));

// Get type chip label for APIs
const getTypeChipLabel = (type) => {
    return CONSTS.API_TYPES[type?.toUpperCase()] || type;
};

// Get icon component for API type
const getTypeIcon = (type) => {
    const iconProps = {
        width: '12px',
        height: '12px',
    };

    switch (type?.toUpperCase()) {
        case 'HTTP':
            return <CustomIcon icon='rest' {...iconProps} />;
        case 'SOAP':
            return <CustomIcon icon='soap' {...iconProps} />;
        case 'WS':
            return <CustomIcon icon='ws' {...iconProps} />;
        case 'SSE':
            return <CustomIcon icon='sse' {...iconProps} />;
        case 'WEBHOOK':
            return <CustomIcon icon='webhook' {...iconProps} />;
        case 'WEBSUB':
            return <CustomIcon icon='websub' {...iconProps} />;
        case 'GRAPHQL':
            return <CustomIcon icon='graphql' {...iconProps} />;
        case 'ASYNC':
            return <CustomIcon icon='async' {...iconProps} />;
        case 'MCP':
            return <CustomIcon icon='mcp-servers' strokeColor='#000000' {...iconProps} />;
        default:
            return null; // No icon for unknown types
    }
};

/**
 *
 * Render API Card component in API listing card view,containing essential API information like name , version ect
 * @class APIThumb
 * @extends {Component}
 */
class APIThumb extends Component {
    /**
     *Creates an instance of APIThumb.
     * @param {*} props
     * @memberof APIThumb
     */
    constructor(props) {
        super(props);
        this.state = {
            isHover: false,
            loading: false,
            businessAnchorEl: null,
            businessOpenPopover: false,
            technicalAnchorEl: null,
            technicalOpenPopover: false,
        };
        this.toggleMouseOver = this.toggleMouseOver.bind(this);
        this.setLoading = this.setLoading.bind(this);
    }

    /**
     *
     * Set loading state
     * @param {String} loadingState New state value
     * @memberof APIThumb
     */
    setLoading(loadingState) {
        this.setState({ loading: loadingState });
    }

    /**
     * Toggle mouse Hover state to set the card `raised` property
     *
     * @param {React.SyntheticEvent} event mouseover and mouseout
     * @memberof APIThumb
     */
    toggleMouseOver(event) {
        this.setState({ isHover: event.type === 'mouseover' });
    }

    handleBusinessPopoverOpen = (event) => {
        this.setState({ businessAnchorEl: event.currentTarget, businessOpenPopover: true });
    };

    handleBusinessPopoverClose = () => {
        this.setState({ businessAnchorEl: null, businessOpenPopover: false });
    };

    handleTechnicalPopoverOpen = (event) => {
        this.setState({ technicalAnchorEl: event.currentTarget, technicalOpenPopover: true });
    };

    handleTechnicalPopoverClose = () => {
        this.setState({ technicalAnchorEl: null, technicalOpenPopover: false });
    };

    isSearchRoute = window.location.pathname.includes('/search');

    // Check if access is restricted for delete button
    isAccessRestricted = () => {
        if (this.props.api.apiType === MCPServer.CONSTS.MCP) {
            return isRestricted(
                ['apim:mcp_server_delete', 'apim:mcp_server_manage', 'apim:mcp_server_import_export'],
                this.props.api
            );
        } else {
            return isRestricted(['apim:api_create'], this.props.api);
        }
    };

    /**
     * Render API type chip based on API type and vendor
     * @param {Object} api - The API object containing type and vendor information
     * @returns {JSX.Element|null} Single chip component or null if no matching type
     */
    renderApiTypeChip = (api) => {
        // No REST chip for AI APIs
        if (api.subtype && api.subtype === 'AIAPI') {
            return null;
        }

        // If API type is MCP, always show label as 'MCP'
        let label;
        let icon;
        if (api.type === 'MCP') {
            if (!this.isSearchRoute) {
                // No MCP chip for listing mode (non-search routes)
                return null;
            } else {
                label = 'MCP';
                icon = getTypeIcon('MCP');
            }
        } else if (api.apiType === 'APIPRODUCT') {
            if (!this.isSearchRoute) {
                // No API Product chip for listing mode (non-search routes)
                return null;
            } else {
                label = 'API Product';
                icon = getTypeIcon('APIProduct');
            }
        } else {
            // In search route, the apiType comes as `transportType`
            // In non-search (listing) route, the apiType comes as `type`
            // Giving precedence to transportType since there is a different attribute called `type` in search mode
            label = getTypeChipLabel(api.transportType ? api.transportType : api.type);
            icon = getTypeIcon(api.transportType ? api.transportType : api.type);
        }

        return (
            <Chip
                size='small'
                classes={{ root: classes.chip }}
                icon={icon}
                label={label}
                color='primary'
                variant='outlined'
            />
        );
    };

    /**
     * @inheritdoc
     * @returns {React.Component} @inheritdoc
     * @memberof APIThumb
     */
    render() {
        const { api, isAPIProduct, isMCPServer, theme, updateData } = this.props;
        const { isHover, loading } = this.state;
        let overviewPath = '';
        const { tileDisplayInfo } = Configurations.apis;

        // If the the data is coming throught the API/APIProduct/MCP Listing path,
        // the apiType attribute will be automatically added before coming here.
        // If apiType is missing, that means the data is coming from the search path
        // There we can take the api.type as the apiType
        if (!api.apiType) {
            api.apiType = api.type;
        }

        overviewPath = getBasePath(api.apiType) + api.id + '/overview';

        if (!api.lifeCycleStatus) {
            api.lifeCycleStatus = api.status;
        }
        
        let lifecycleState;
        if (api.apiType === API.CONSTS.APIProduct) {
            lifecycleState = api.state === 'PROTOTYPED' ? 'PRE-RELEASED' : api.state;
        } else if (api.apiType === MCPServer.CONSTS.MCP) {
            lifecycleState = api.lifeCycleStatus === 'PROTOTYPED' ? 'PRE-RELEASED' : api.lifeCycleStatus;
        } else {
            lifecycleState = api.lifeCycleStatus === 'PROTOTYPED' ? 'PRE-RELEASED' : api.lifeCycleStatus;
        }


        // Helper function to render ribbon content
        const renderRibbon = () => {
            if (api.subtype === 'AIAPI') {
                return (
                    <div
                        className={classes.ribbon}
                        data-testid='ai-api-card-label'
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <FormattedMessage id='Apis.Listing.ApiThumb.ribbon.ai' defaultMessage='AI' />
                        <CustomIcon icon='ai' width={12} height={12} />
                    </div>
                );
            }

            if (api.advertiseOnly) {
                return (
                    <div className={classes.ribbon} data-testid='third-party-api-card-label'>
                        <FormattedMessage id='Apis.Listing.ApiThumb.ribbon.thirdParty' defaultMessage='THIRD PARTY' />
                    </div>
                );
            }

            return null;
        };

        return (
            <StyledCard
                onMouseOver={this.toggleMouseOver}
                onFocus={this.toggleMouseOver}
                onMouseOut={this.toggleMouseOver}
                onBlur={this.toggleMouseOver}
                elevation={isHover ? 4 : 1}
                className={classes.card}
                data-testid={'card-' + api.name + api.version}
                useFlexibleWidth={this.props.useFlexibleWidth}
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                <Link to={overviewPath} className={classes.suppressLinkStyles} aria-label={api.name + ' Thumbnail'}>
                    <CardContent className={classes.apiDetails} style={{ display: 'flex', flex: 1, padding: '12px' }}>
                        <div
                            style={{
                                position: 'relative',
                                width: theme.custom.thumbnail.width,
                                height: theme.custom.thumbnail.height,
                            }}
                        >
                            {/* Display the AI API or Third Party API Tag if applicable */}
                            {renderRibbon()}

                            <CardMedia
                                src='None'
                                component={BaseThumbnail}
                                height={theme.custom.thumbnail.height}
                                width={theme.custom.thumbnail.width}
                                title='Thumbnail'
                                api={api}
                            />
                            {api.monetizedInfo && tileDisplayInfo.showMonetizedState && (
                                <div style={{ position: 'absolute', bottom: 0 }}>
                                    <MonetizationOnIcon
                                        fontSize='medium'
                                        style={{ color: '#FFD700', paddingLeft: '2px' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div className={classes.textWrapper}>
                                <Tooltip title={api.displayName || api.name} arrow>
                                    <Typography variant='h6' className={classes.thumbHeader} id={api.name} noWrap>
                                        {api.displayName || api.name}
                                    </Typography>
                                </Tooltip>
                            </div>
                            <div className={classes.row}>
                                <Typography variant='caption' gutterBottom align='left' noWrap>
                                    <FormattedMessage id='by' defaultMessage='By' />
                                    &nbsp;
                                    <Tooltip title={api.provider} arrow>
                                        <span>{api.provider}</span>
                                    </Tooltip>
                                    {!isAPIProduct && !isMCPServer && (api.gatewayVendor || api.gatewayType) && (
                                        <>
                                            &nbsp;
                                            <FormattedMessage id='on' defaultMessage='on' />
                                            &nbsp;
                                            {api.gatewayVendor === 'wso2'
                                                ? api.gatewayVendor.toUpperCase()
                                                : Utils.capitalizeFirstLetter(api.gatewayType)}
                                        </>
                                    )}
                                </Typography>
                            </div>
                            <div className={classes.row}>
                                <div
                                    style={{ display: 'flex', flexDirection: 'column', flex: 0.35, overflow: 'hidden' }}
                                >
                                    <Tooltip title={api.version} arrow>
                                        <Typography variant='body1' noWrap>
                                            {api.version}
                                        </Typography>
                                    </Tooltip>
                                    <Typography variant='caption' component='p' color='text.disabled' lineHeight={1}>
                                        <FormattedMessage defaultMessage='Version' id='Apis.Listing.ApiThumb.version' />
                                    </Typography>
                                </div>

                                <div
                                    style={{ display: 'flex', flexDirection: 'column', flex: 0.65, overflow: 'hidden' }}
                                >
                                    <Tooltip title={api.context} arrow>
                                        <Typography variant='body1' noWrap>
                                            {api.context}
                                        </Typography>
                                    </Tooltip>
                                    <Typography variant='caption' component='p' color='text.disabled' lineHeight={1}>
                                        {api.type === 'WS' ? (
                                            <FormattedMessage
                                                defaultMessage='Channel'
                                                id='Apis.Listing.ApiThumb.channel'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                defaultMessage='Context'
                                                id='Apis.Listing.ApiThumb.context'
                                            />
                                        )}
                                    </Typography>
                                </div>
                            </div>
                            <div className={classes.row} style={{ marginTop: '8px' }}>
                                <Chip
                                    size='small'
                                    classes={{ root: classes.chip }}
                                    label={lifecycleState}
                                    color='default'
                                    data-testid='itest-api-lifecycleState'
                                />

                                {/* Display the API type */}
                                {this.renderApiTypeChip(api)}
                            </div>
                        </div>
                    </CardContent>

                    {(tileDisplayInfo.showBusinessDetails || tileDisplayInfo.showTechnicalDetails) && (
                        <>
                            <Divider sx={{ marginLeft: 1.5, marginRight: 1.5 }} />
                            <CardContent
                                className={classes.apiDetails}
                                style={{ display: 'flex', flex: 1, padding: '12px' }}
                            >
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div className={classes.row}>
                                        <Typography variant='body2' gutterBottom align='left'>
                                            <FormattedMessage
                                                defaultMessage='Owners'
                                                id='Apis.Listing.ApiThumb.owners'
                                            />
                                        </Typography>
                                    </div>
                                    {tileDisplayInfo.showBusinessDetails && (
                                        <div className={classes.row}>
                                            <Typography
                                                variant='caption'
                                                gutterBottom
                                                align='left'
                                                onMouseEnter={this.handleBusinessPopoverOpen}
                                                onMouseLeave={this.handleBusinessPopoverClose}
                                                className={classes.textTruncate}
                                            >
                                                <FormattedMessage
                                                    defaultMessage='Business'
                                                    id='Apis.Listing.ApiThumb.owners.business'
                                                />
                                                {': '}
                                                {api.businessOwner ? (
                                                    api.businessOwner
                                                ) : (
                                                    <span style={{ color: '#808080' }}>Not Provided</span>
                                                )}
                                            </Typography>
                                            {api.businessOwnerEmail && (
                                                <Popover
                                                    id='mouse-over-popover'
                                                    sx={{
                                                        pointerEvents: 'none',
                                                    }}
                                                    open={this.state.businessOpenPopover}
                                                    anchorEl={this.state.businessAnchorEl}
                                                    anchorOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'right',
                                                    }}
                                                    transformOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'left',
                                                    }}
                                                    onClose={this.handleBusinessPopoverClose}
                                                    disableRestoreFocus
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', padding: '4px' }}>
                                                            <EmailIcon fontSize='small' />
                                                            <Typography variant='body2' style={{ marginLeft: '8px' }}>
                                                                {api.businessOwnerEmail}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Popover>
                                            )}
                                        </div>
                                    )}
                                    {tileDisplayInfo.showTechnicalDetails && (
                                        <div className={classes.row}>
                                            <Typography
                                                variant='caption'
                                                gutterBottom
                                                align='left'
                                                onMouseEnter={this.handleTechnicalPopoverOpen}
                                                onMouseLeave={this.handleTechnicalPopoverClose}
                                                className={classes.textTruncate}
                                            >
                                                <FormattedMessage
                                                    defaultMessage='Technical'
                                                    id='Apis.Listing.ApiThumb.owners.technical'
                                                />
                                                {': '}
                                                {api.technicalOwner ? (
                                                    api.technicalOwner
                                                ) : (
                                                    <span style={{ color: '#808080' }}>Not Provided</span>
                                                )}
                                            </Typography>
                                            {api.technicalOwnerEmail && (
                                                <Popover
                                                    id='mouse-over-popover'
                                                    sx={{
                                                        pointerEvents: 'none',
                                                    }}
                                                    open={this.state.technicalOpenPopover}
                                                    anchorEl={this.state.technicalAnchorEl}
                                                    anchorOrigin={{
                                                        vertical: 'top',
                                                        horizontal: 'right',
                                                    }}
                                                    transformOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'left',
                                                    }}
                                                    onClose={this.handleTechnicalPopoverClose}
                                                    disableRestoreFocus
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', padding: '4px' }}>
                                                            <EmailIcon fontSize='small' />
                                                            <Typography variant='body2' style={{ marginLeft: '8px' }}>
                                                                {api.technicalOwnerEmail}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Popover>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </>
                    )}
                </Link>

                <Divider sx={{ marginLeft: 1.5, marginRight: 1.5 }} />
                <CardActions className={classes.apiActions} data-testid={'card-action-' + api.name + api.version}>
                    <Box
                        display='flex'
                        alignItems='center'
                        gap={0.5}
                        sx={{ marginTop: '8px', marginBottom: '8px', marginRight: 'auto' }}
                    >
                        <AccessTimeIcon fontSize='small' sx={{ color: 'text.disabled' }} />
                        <Typography variant='caption' color='textSecondary'>
                            {Utils.formatUpdatedTime(api.updatedTime)}
                        </Typography>
                    </Box>
                    {!this.isAccessRestricted() && (
                        <div style={{ marginLeft: 'auto' }}>
                            <DeleteButton
                                setLoading={this.setLoading}
                                api={api}
                                updateData={updateData}
                                isAPIProduct={isAPIProduct}
                            />
                            {loading && <CircularProgress className={classes.deleteProgress} />}
                        </div>
                    )}
                </CardActions>
            </StyledCard>
        );
    }
}

APIThumb.defaultProps = {
    isMCPServer: false,
    useFlexibleWidth: false,
};

APIThumb.propTypes = {
    api: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        apiType: PropTypes.string.isRequired,
    }).isRequired,
    isAPIProduct: PropTypes.bool.isRequired,
    isMCPServer: PropTypes.bool,
    updateData: PropTypes.func.isRequired,
    useFlexibleWidth: PropTypes.bool,
};

export default injectIntl((props) => {
    const theme = useTheme();
    return <APIThumb {...props} theme={theme} />;
});
