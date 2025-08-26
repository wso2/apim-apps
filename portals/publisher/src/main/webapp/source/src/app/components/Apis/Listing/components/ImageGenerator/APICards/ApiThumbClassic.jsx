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
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Configurations from 'Config';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Box, Divider } from '@mui/material';

import { green } from '@mui/material/colors';
import DeleteButton from './DeleteButton';
import BaseThumbnail from '../BaseThumbnail';
import { formatUpdatedTime } from './utils';

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
        gap: '8px',
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
        '& .MuiChip-icon': {
            fontSize: '12px',
            width: '12px',
            height: '12px',
            marginLeft: '4px',
        },
    },

    [`& .${classes.ribbon}`]: {
        fontFamily: theme.typography.fontFamily,
        fontSize: '12px',
        fontWeight: 800,
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        position: 'absolute',
        padding: '5px',
        width: '80px',
        zIndex: 3,
        textAlign: 'center',
        textTransform: 'uppercase',
    },

    [`& .${classes.suppressLinkStyles}`]: {
        textDecoration: 'none',
        color: 'inherit',
    },
}));

// Get type chip label for APIs
const getTypeChipLabel = (apiType) => {
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
    return typeMapping[apiType?.toUpperCase()] || apiType;
};

// Get icon component for API type
const getTypeIcon = (apiType) => {
    const iconProps = {
        style: {
            width: '12px',
            height: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    };

    switch (apiType?.toUpperCase()) {
        case 'HTTP':
            return (
                <img
                    src={Configurations.app.context + '/site/public/images/custom-icons/rest.svg'}
                    alt='REST'
                    {...iconProps}
                />
            );
        case 'SOAP':
            return (
                <img
                    src={Configurations.app.context + '/site/public/images/custom-icons/soap.svg'}
                    alt='SOAP'
                    {...iconProps}
                />
            );
        case 'WS':
            return (
                <img
                    src={Configurations.app.context + '/site/public/images/custom-icons/ws.svg'}
                    alt='WebSocket'
                    {...iconProps}
                />
            );
        case 'SSE':
            return (
                <img
                    src={Configurations.app.context + '/site/public/images/custom-icons/sse.svg'}
                    alt='SSE'
                    {...iconProps}
                />
            );
        case 'WEBHOOK':
            return (
                <img
                    src={Configurations.app.context + '/site/public/images/custom-icons/webhook.svg'}
                    alt='Webhook'
                    {...iconProps}
                />
            );
        case 'WEBSUB':
            return (
                <img
                    src={Configurations.app.context + '/site/public/images/custom-icons/websub.svg'}
                    alt='WebSub'
                    {...iconProps}
                />
            );
        case 'GRAPHQL':
            return (
                <img
                    src={Configurations.app.context + '/site/public/images/custom-icons/graphql.svg'}
                    alt='GraphQL'
                    {...iconProps}
                />
            );
        case 'ASYNC':
            return (
                <img
                    src={Configurations.app.context + '/site/public/images/custom-icons/async.svg'}
                    alt='Async'
                    {...iconProps}
                />
            );
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
        if (api.apiType) {
            if (isAPIProduct) {
                overviewPath = `/api-products/${api.id}/overview`;
            } else if (isMCPServer) {
                overviewPath = `/mcp-servers/${api.id}/overview`;
            } else {
                overviewPath = `/apis/${api.id}/overview`;
            }
        } else {
            overviewPath = `/apis/${api.apiUUID}/documents/${api.id}/details`;
        }
        let lifecycleState;
        if (isAPIProduct) {
            api.apiType = API.CONSTS.APIProduct;
            lifecycleState = api.state === 'PROTOTYPED' ? 'PRE-RELEASED' : api.state;
        } else {
            api.apiType = API.CONSTS.API;
            lifecycleState = api.lifeCycleStatus === 'PROTOTYPED' ? 'PRE-RELEASED' : api.lifeCycleStatus;
        }

        if (!api.lifeCycleStatus) {
            api.lifeCycleStatus = api.status;
        }

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
                {api.advertiseOnly && (
                    <div className={classes.ribbon} data-testid='third-party-api-card-label'>
                        third party
                    </div>
                )}
                <Link to={overviewPath} className={classes.suppressLinkStyles}>
                    <CardContent className={classes.apiDetails} style={{ display: 'flex', flex: 1, padding: '12px' }}>
                        <div
                            style={{
                                position: 'relative',
                                width: theme.custom.thumbnail.width,
                                height: theme.custom.thumbnail.height,
                            }}
                        >
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
                                <Typography
                                    variant='h6'
                                    className={classes.thumbHeader}
                                    title={api.name}
                                    id={api.name}
                                    noWrap
                                >
                                    {api.displayName || api.name}
                                </Typography>
                            </div>
                            <div className={classes.row}>
                                <Typography variant='caption' gutterBottom align='left' noWrap>
                                    <FormattedMessage id='by' defaultMessage='By' />
                                    &nbsp;
                                    <Tooltip title={api.provider} arrow>
                                        <span>{api.provider}</span>
                                    </Tooltip>
                                    {!isAPIProduct && !isMCPServer && (
                                        <>
                                            &nbsp;
                                            <FormattedMessage id='on' defaultMessage='on' />
                                            &nbsp;
                                            {api.gatewayVendor === 'wso2' || api.gatewayVendor === 'solace'
                                                ? api.gatewayVendor.toUpperCase()
                                                : api.gatewayType}
                                        </>
                                    )}
                                </Typography>
                            </div>
                            <div className={classes.row}>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                    <Typography variant='body1' noWrap>
                                        {api.version}
                                    </Typography>
                                    <Typography variant='caption' component='p' color='text.disabled' lineHeight={1}>
                                        <FormattedMessage defaultMessage='Version' id='Apis.Listing.ApiThumb.version' />
                                    </Typography>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                    <Typography variant='body1' noWrap>
                                        {api.context}
                                    </Typography>
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
                            {(tileDisplayInfo.showBusinessDetails || tileDisplayInfo.showTechnicalDetails) && (
                                <>
                                    <hr />
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
                                    <hr />
                                </>
                            )}
                            <div className={classes.row} style={{ marginTop: '8px' }}>
                                <Chip
                                    size='small'
                                    classes={{ root: classes.chip }}
                                    label={lifecycleState}
                                    color='default'
                                    data-testid='itest-api-lifecycleState'
                                />
                                {(api.type === 'GRAPHQL' || api.transportType === 'GRAPHQL') && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('GRAPHQL')}
                                        label={getTypeChipLabel(
                                            api.transportType === undefined ? api.type : api.transportType
                                        )}
                                        color='primary'
                                        variant='outlined'
                                    />
                                )}
                                {api.type === 'WS' && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('WS')}
                                        label={getTypeChipLabel('WS')}
                                        color='primary'
                                        variant='outlined'
                                    />
                                )}
                                {api.type === 'WEBSUB' && api.gatewayVendor === 'wso2' && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('WEBSUB')}
                                        label={getTypeChipLabel('WEBSUB')}
                                        color='primary'
                                        variant='outlined'
                                    />
                                )}
                                {api.type === 'WEBSUB' && api.gatewayVendor === 'solace' && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('WEBSUB')}
                                        label='SOLACE API'
                                        style={{ backgroundColor: '#00c995' }}
                                        variant='outlined'
                                    />
                                )}
                                {api.type === 'HTTP' && (!api.subtype || api.subtype === 'DEFAULT') && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('HTTP')}
                                        label={getTypeChipLabel('HTTP')}
                                        color='primary'
                                        variant='outlined'
                                    />
                                )}
                                {api.type === 'SOAP' && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('SOAP')}
                                        label={getTypeChipLabel('SOAP')}
                                        color='primary'
                                        variant='outlined'
                                    />
                                )}
                                {api.type === 'SOAPTOREST' && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('SOAP')}
                                        label={getTypeChipLabel('SOAPTOREST')}
                                        color='primary'
                                        variant='outlined'
                                    />
                                )}
                                {api.type === 'SSE' && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('SSE')}
                                        label={getTypeChipLabel('SSE')}
                                        color='primary'
                                        variant='outlined'
                                    />
                                )}
                                {api.type === 'WEBHOOK' && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('WEBHOOK')}
                                        label={getTypeChipLabel('WEBHOOK')}
                                        color='primary'
                                        variant='outlined'
                                    />
                                )}
                                {api.type === 'ASYNC' && (
                                    <Chip
                                        size='small'
                                        classes={{ root: classes.chip }}
                                        icon={getTypeIcon('ASYNC')}
                                        label={getTypeChipLabel('ASYNC')}
                                        color='primary'
                                        variant='outlined'
                                    />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Link>
                <Divider sx={{ marginLeft: 1.5, marginRight: 1.5 }} />
                <CardActions className={classes.apiActions} data-testid={'card-action-' + api.name + api.version}>
                    <Box display='flex' alignItems='center' gap={0.5}>
                        <AccessTimeIcon fontSize='small' sx={{ color: 'text.disabled' }} />
                        <Typography variant='caption' color='textSecondary'>
                            {formatUpdatedTime(api.updatedTime)}
                        </Typography>
                    </Box>
                    {!isRestricted(['apim:api_create'], api) && (
                        <>
                            <DeleteButton
                                setLoading={this.setLoading}
                                api={api}
                                updateData={updateData}
                                isAPIProduct={isAPIProduct}
                            />
                            {loading && <CircularProgress className={classes.deleteProgress} />}
                        </>
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
