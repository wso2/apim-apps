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
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import MaterialIcons from 'MaterialIcons';
import MCPServer from 'AppData/MCPServer';
import StarRatingBar from 'AppComponents/Apis/Listing/StarRatingBar';
import { app, apis } from 'Settings';
import classNames from 'classnames';
import Popover from '@mui/material/Popover';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmailIcon from '@mui/icons-material/Email';
import Divider from '@mui/material/Divider';
import { CardActions, Tooltip, useTheme } from '@mui/material';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import ImageGenerator from './ImageGenerator';
import Api from '../../../../data/api';
import { ApiContext } from '../../Details/ApiContext';
import LetterGenerator from './LetterGenerator';

const PREFIX = 'ApiThumbClassicLegacy';

const classes = {
    card: `${PREFIX}-card`,
    apiDetails: `${PREFIX}-apiDetails`,
    row: `${PREFIX}-row`,
    media: `${PREFIX}-media`,
    thumbHeader: `${PREFIX}-thumbHeader`,
    chip: `${PREFIX}-chip`,
    chipsWrapper: `${PREFIX}-chipsWrapper`,
    actionArea: `${PREFIX}-actionArea`,
    ribbon: `${PREFIX}-ribbon`,
    popover: `${PREFIX}-popover`,
    suppressLinkStyles: `${PREFIX}-suppressLinkStyles`,
};

const StyledCard = styled(Card)(({ theme }) => ({
    [`&.${classes.card}`]: {
        width: '300px',
        margin: theme.spacing(1),
        borderRadius: theme.spacing(1),
        transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        background: theme.custom.thumbnail.contentBackgroundColor,
        border: `0.5px solid ${theme.palette.divider}`,
        '&:hover': {
            boxShadow: theme.shadows[3],
        },
    },

    [`& .${classes.apiDetails}`]: {
        padding: `${theme.spacing(1.5)}`,
        color: theme.palette.getContrastText(theme.custom.thumbnail.contentBackgroundColor),
        '& a': {
            color: theme.palette.getContrastText(theme.custom.thumbnail.contentBackgroundColor),
        },
        position: theme.custom.thumbnail.contentPictureOverlap ? 'absolute' : 'relative',
        gap: theme.spacing(2),
        display: 'flex',
        flex: 1,
    },

    [`& .${classes.row}`]: {
        display: 'flex',
        gap: theme.spacing(0.75),
    },

    [`& .${classes.media}`]: {
        // ⚠️ object-fit is not supported by IE11.
        objectFit: 'cover',
    },

    [`& .${classes.thumbHeader}`]: {
        cursor: 'pointer',
        fontWeight: 600,
        lineHeight: '1.3',
    },

    [`& .${classes.chip}`]: {
        height: 20,
        borderRadius: 4,
        overflow: 'hidden',
        '& svg': {
            marginLeft: '5px',
            marginRight: '-4px',
        },
    },

    [`& .${classes.chipsWrapper}`]: {
        display: 'flex',
        gap: theme.spacing(0.75),
    },

    [`& .${classes.actionArea}`]: {
        display: 'block !important',
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
    const typeMapping = {
        HTTP: 'REST',
        WS: 'WS',
        SOAPTOREST: 'SOAPTOREST',
        SOAP: 'SOAP',
        GRAPHQL: 'GraphQL',
        WEBSUB: 'WebSub',
        SSE: 'SSE',
        WEBHOOK: 'Webhook',
        ASYNC: 'ASYNC',
    };
    return typeMapping[type?.toUpperCase()] || type;
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
            return <CustomIcon icon='mcp-server' {...iconProps} />;
        default:
            return null; // No icon for unknown types
    }
};

const windowURL = window.URL || window.webkitURL;

/**
 *
 * Render API Card component in API listing card view,containing essential API information like name , version ect
 * @class APIThumb
 * @extends {Component}
 */
class ApiThumbClassicLegacy extends React.Component {
    /**
     *Creates an instance of APIThumb.
     * @param {*} props
     * @memberof APIThumb
     */
    constructor(props) {
        super(props);
        const {
            theme: {
                custom: {
                    thumbnail: { defaultApiImage },
                },
            },
        } = props;
        this.state = {
            category: MaterialIcons.categories[0].name,
            selectedIcon: null,
            color: null,
            backgroundIndex: null,
            imageObj: null,
            imageLoaded: !!defaultApiImage, // Convert the image string to boolean value.
            businessAnchorEl: null,
            buniessOpenPopover: false,
            technicalAnchorEl: null,
            technicalOpenPopover: false,
        };
    }

    /**
     *
     *
     * @memberof ApiThumb
     */
    componentDidMount() {
        const { imageLoaded } = this.state;
        if (imageLoaded) return;
        const { api } = this.props;
        let promisedThumbnail;
        if (api.type === 'MCP') {
            promisedThumbnail = new MCPServer().getMCPServerThumbnail(api.id);
        } else {
            promisedThumbnail = new Api().getAPIThumbnail(api.id);
        }
        promisedThumbnail
            .then((response) => {
                if (response && response.data) {
                    if (response.headers['content-type'] === 'application/json') {
                        const iconJson = JSON.parse(response.data);
                        this.setState({
                            selectedIcon: iconJson.key,
                            category: iconJson.category,
                            color: iconJson.color,
                            backgroundIndex: iconJson.backgroundIndex,
                        });
                    } else if (response && response.data.size > 0) {
                        const url = windowURL.createObjectURL(response.data);
                        this.setState({ imageObj: url });
                    }
                }
            })
            .finally(() => {
                this.setState({ imageLoaded: true });
            });
    }

    /**
     * Clean up resource
     */
    componentWillUnmount() {
        if (this.state.thumbnail) {
            windowURL.revokeObjectURL(this.state.imageObj);
        }
    }

    handleBusinessPopoverOpen = (event) => {
        this.setState({ businessAnchorEl: event.currentTarget, buniessOpenPopover: true });
    };

    handleBusinessPopoverClose = () => {
        this.setState({ businessAnchorEl: null, buniessOpenPopover: false });
    };

    handleTechnicalPopoverOpen = (event) => {
        this.setState({ technicalAnchorEl: event.currentTarget, technicalOpenPopover: true });
    };

    handleTechnicalPopoverClose = () => {
        this.setState({ technicalAnchorEl: null, technicalOpenPopover: false });
    };

    isSearchRoute = window.location.pathname.includes('/search');

    /**
     * Render API type chip based on API type and vendor
     * @param {Object} api - The API object containing type and vendor information
     * @returns {JSX.Element|null} Single chip component or null if no matching type
     */
    renderApiTypeChip = (api) => {
        // No chip for AI APIs
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
        } else if (api.type === 'APIPRODUCT') {
            // In devportal, we show API Products as normal APIs
            label = getTypeChipLabel('HTTP');
            icon = getTypeIcon('HTTP');
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
        const {
            imageObj, selectedIcon, color, backgroundIndex, category, imageLoaded,
        } = this.state;
        const { isMonetizationEnabled } = this.context;

        const {
            api, theme, customWidth, customHeight, showInfo,
        } = this.props;
        const path = api.type === 'MCP' ? '/mcp-servers/' : '/apis/';
        const detailsLink = path + api.id;
        const {
            custom: {
                thumbnail,
                social: { showRating },
                thumbnailTemplates: { variant, active },
            },
        } = theme;
        const {
            name, version, context, displayName,
        } = api;

        let { provider } = api;
        if (
            api.businessInformation
            && api.businessInformation.businessOwner
            && api.businessInformation.businessOwner.trim() !== ''
        ) {
            provider = api.businessInformation.businessOwner;
        }
        if (!api.lifeCycleStatus) {
            api.lifeCycleStatus = api.status;
        }
        const imageWidth = customWidth || thumbnail.width;
        const imageHeight = customHeight || 100;
        const defaultImage = thumbnail.defaultApiImage;
        const { tileDisplayInfo } = apis;

        let ImageView;
        if (!imageLoaded) {
            ImageView = (
                <div className='image-load-frame'>
                    <div className='image-load-animation1' />
                    <div className='image-load-animation2' />
                </div>
            );
        } else if (imageObj) {
            ImageView = (
                <img
                    height={imageHeight}
                    width={imageWidth}
                    src={imageObj}
                    alt='API Thumbnail'
                    className={classes.media}
                />
            );
        } else {
            ImageView = variant === 'text' && active ? (
                <LetterGenerator width={imageWidth} height={imageHeight} artifact={api} />
            ) : (
                <ImageGenerator
                    width={imageWidth}
                    height={imageHeight}
                    api={api}
                    fixedIcon={{
                        key: selectedIcon,
                        color: color || thumbnail.iconColor,
                        backgroundIndex,
                        category,
                        api,
                    }}
                />
            );
        }
        if (!showInfo) {
            return (
                <div className='api-thumb-image-view'>
                    {!defaultImage && ImageView}
                    {defaultImage && <img src={app.context + defaultImage} alt='img' />}
                </div>
            );
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

            if (api.advertiseInfo && api.advertiseInfo.advertised) {
                return (
                    <div className={classes.ribbon} data-testid='third-party-api-card-label'>
                        <FormattedMessage id='Apis.Listing.ApiThumb.ribbon.thirdParty' defaultMessage='THIRD PARTY' />
                    </div>
                );
            }

            return null;
        };

        return (
            <StyledCard className={classNames('image-thumbnail', classes.card)}>
                <Link
                    className={classNames(classes.actionArea, classes.suppressLinkStyles, 'image-thumb-action-area')}
                    to={detailsLink}
                    area-label={'Go to ' + name}
                >
                    <CardContent
                        classes={{ root: classNames(classes.apiDetails, 'image-thumb-card-content') }}
                        style={{ minHeight: '105px' }}
                    >
                        <div style={{ position: 'relative', height: 'fit-content' }}>
                            {/* Display the AI API or Third Party API Tag if applicable */}
                            {renderRibbon()}
                            <CardMedia classes={{ root: 'image-thumb-card-root' }}>
                                {!defaultImage && ImageView}
                                {defaultImage && <img src={app.context + defaultImage} alt='img' />}
                            </CardMedia>
                            {tileDisplayInfo.showMonetizedState && api.monetizedInfo && (
                                <div style={{ position: 'absolute', bottom: 0, display: 'flex' }}>
                                    <MonetizationOnIcon
                                        fontSize='medium'
                                        style={{ color: '#FFD700', padding: '4px' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <Tooltip title={displayName || name} arrow>
                                <Typography
                                    className={classNames(classes.thumbHeader, 'image-thumb-card-thumb-header')}
                                    variant='h6'
                                    component='h2'
                                    onClick={this.handleRedirectToAPIOverview}
                                    noWrap
                                >
                                    {displayName || name}
                                </Typography>
                            </Tooltip>
                            <div className={classNames(classes.row, 'image-thumb-provider-wrapper')}>
                                <Typography
                                    variant='caption'
                                    align='left'
                                    gutterBottom
                                    noWrap
                                    className={classNames('image-thumb-provider')}
                                >
                                    <FormattedMessage defaultMessage='By' id='Apis.Listing.ApiThumb.by' />
                                    <FormattedMessage defaultMessage=':' id='Apis.Listing.ApiThumb.by.colon' />
                                    &nbsp;
                                    <Tooltip title={provider} arrow>
                                        {provider}
                                    </Tooltip>
                                </Typography>
                            </div>
                            <div className={classNames('image-thumb-info')}>
                                <div className={classNames(classes.row, 'image-thumb-row')}>
                                    <div
                                        className={classNames('image-thumb-left-version')}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            flex: 0.35,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Tooltip title={version} arrow>
                                            <Typography variant='body1'>{version}</Typography>
                                        </Tooltip>
                                        <Typography variant='caption' component='p' lineHeight={1}>
                                            <FormattedMessage
                                                defaultMessage='Version'
                                                id='Apis.Listing.ApiThumb.version'
                                            />
                                        </Typography>
                                    </div>
                                    <div
                                        className={classNames('image-thumb-context')}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            flex: 0.65,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Tooltip title={context} arrow>
                                            <Typography variant='body1' noWrap>
                                                {context}
                                            </Typography>
                                        </Tooltip>
                                        <Typography variant='caption' lineHeight={1} component='p'>
                                            <FormattedMessage
                                                defaultMessage='Context'
                                                id='Apis.Listing.ApiThumb.context'
                                            />
                                        </Typography>
                                    </div>
                                </div>
                                <div
                                    className={classNames(classes.row, 'image-thumb-row')}
                                    style={{ marginTop: '8px' }}
                                >
                                    <div className={classNames(classes.chipsWrapper, 'api-thumb-chips-wrapper')}>
                                        {api.gatewayVendor === 'solace' && (
                                            <div className='api-thumb-chip-main'>
                                                <Chip
                                                    data-testid='solace-label'
                                                    label='SOLACE'
                                                    color='primary'
                                                    classes={{ root: classes.chip }}
                                                />
                                            </div>
                                        )}
                                        {api.lifeCycleStatus === 'PROTOTYPED' && (
                                            <Chip
                                                size='small'
                                                classes={{ root: classes.chip }}
                                                label='PRE-RELEASED'
                                                color='default'
                                                data-testid='itest-api-lifecycleState'
                                            />
                                        )}
                                        {this.renderApiTypeChip(api)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    {(tileDisplayInfo.showBusinessDetails || tileDisplayInfo.showTechnicalDetails) && (
                        <>
                            <Divider sx={{ marginLeft: 1.5, marginRight: 1.5 }} />
                            <CardContent
                                classes={{ root: classNames(classes.apiDetails, 'image-thumb-card-content') }}
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
                                                noWrap
                                            >
                                                <FormattedMessage
                                                    defaultMessage='Business'
                                                    id='Apis.Listing.ApiThumb.owners.business'
                                                />
                                                {' : '}
                                                {api.businessInformation.businessOwner ? (
                                                    api.businessInformation.businessOwner
                                                ) : (
                                                    <span style={{ color: '#808080', fontWeight: 'bold' }}>
                                                        Not Provided
                                                    </span>
                                                )}
                                            </Typography>
                                            {api.businessInformation.businessOwnerEmail && (
                                                <Popover
                                                    id='mouse-over-popover'
                                                    sx={{
                                                        pointerEvents: 'none',
                                                    }}
                                                    open={this.state.buniessOpenPopover}
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
                                                    disableAutoFocus
                                                    disableEnforceFocus
                                                    disableRestoreFocus
                                                    keepMounted
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', padding: '4px' }}>
                                                            <EmailIcon fontSize='small' />
                                                            <Typography variant='body2' style={{ marginLeft: '8px' }}>
                                                                {api.businessInformation.businessOwnerEmail}
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
                                                noWrap
                                            >
                                                <FormattedMessage
                                                    defaultMessage='Technical'
                                                    id='Apis.Listing.ApiThumb.owners.technical'
                                                />
                                                {' : '}
                                                {api.businessInformation.technicalOwner ? (
                                                    api.businessInformation.technicalOwner
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: '#808080',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        Not Provided
                                                    </span>
                                                )}
                                            </Typography>
                                            {api.businessInformation.technicalOwnerEmail && (
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
                                                    disableAutoFocus
                                                    disableEnforceFocus
                                                    disableRestoreFocus
                                                    keepMounted
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', padding: '4px' }}>
                                                            <EmailIcon fontSize='small' />
                                                            <Typography variant='body2' style={{ marginLeft: '8px' }}>
                                                                {api.businessInformation.technicalOwnerEmail}
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

                    {(showRating || (isMonetizationEnabled && api.monetizationLabel)) && (
                        <>
                            <Divider sx={{ marginLeft: 1.5, marginRight: 1.5 }} />
                            <CardActions
                                data-testid={'card-action-' + api.name + api.version}
                                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                {showRating && (
                                    <div className={classNames('api-thumb-rating-wrapper')}>
                                        <Typography
                                            variant='subtitle1'
                                            component='div'
                                            aria-label='API Rating'
                                            align='left'
                                            className={classNames('api-thumb-rating')}
                                        >
                                            <StarRatingBar
                                                apiRating={api.avgRating}
                                                apiId={api.id}
                                                isEditable={false}
                                                showSummary={false}
                                            />
                                        </Typography>
                                    </div>
                                )}
                                {isMonetizationEnabled && api.monetizationLabel && (
                                    <Typography
                                        variant='caption'
                                        sx={{
                                            marginLeft: 'auto',
                                            fontWeight: 'medium',
                                            padding: '0px 2px',
                                        }}
                                    >
                                        {api.monetizationLabel}
                                    </Typography>
                                )}
                            </CardActions>
                        </>
                    )}
                </Link>
            </StyledCard>
        );
    }
}
ApiThumbClassicLegacy.defaultProps = {
    customWidth: null,
    customHeight: null,
    showInfo: true,
};
ApiThumbClassicLegacy.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    customWidth: PropTypes.number,
    customHeight: PropTypes.number,
    showInfo: PropTypes.bool,
};

ApiThumbClassicLegacy.contextType = ApiContext;

function ApiThumbClassic(props) {
    const theme = useTheme();
    return <ApiThumbClassicLegacy {...props} theme={theme} />;
}

export default ApiThumbClassic;
