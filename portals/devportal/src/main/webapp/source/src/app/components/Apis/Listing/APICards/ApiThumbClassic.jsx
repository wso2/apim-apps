/* eslint-disable react/prop-types */
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
import StarRatingBar from 'AppComponents/Apis/Listing/StarRatingBar';
import { app, apis } from 'Settings';
import classNames from 'classnames';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmailIcon from '@mui/icons-material/Email';
import Divider from '@mui/material/Divider';
import { CardActionArea, useTheme } from '@mui/material';
import ImageGenerator from './ImageGenerator';
import Api from '../../../../data/api';
import { ApiContext } from '../../Details/ApiContext';
import LetterGenerator from './LetterGenerator';

const PREFIX = 'ApiThumbClassicLegacy';

const classes = {
    card: `${PREFIX}-card`,
    apiDetails: `${PREFIX}-apiDetails`,
    suppressLinkStyles: `${PREFIX}-suppressLinkStyles`,
    row: `${PREFIX}-row`,
    thumbBy: `${PREFIX}-thumbBy`,
    media: `${PREFIX}-media`,
    thumbContent: `${PREFIX}-thumbContent`,
    thumbLeft: `${PREFIX}-thumbLeft`,
    thumbLeftAction: `${PREFIX}-thumbLeftAction`,
    thumbRight: `${PREFIX}-thumbRight`,
    thumbInfo: `${PREFIX}-thumbInfo`,
    thumbHeader: `${PREFIX}-thumbHeader`,
    contextBox: `${PREFIX}-contextBox`,
    context: `${PREFIX}-context`,
    thumbWrapper: `${PREFIX}-thumbWrapper`,
    deleteIcon: `${PREFIX}-deleteIcon`,
    textWrapper: `${PREFIX}-textWrapper`,
    imageWrapper: `${PREFIX}-imageWrapper`,
    imageOverlap: `${PREFIX}-imageOverlap`,
    chipWrapper: `${PREFIX}-chipWrapper`,
    chipWrapper2: `${PREFIX}-chipWrapper2`,
    chipWrapper3: `${PREFIX}-chipWrapper3`,
    ratingWrapper: `${PREFIX}-ratingWrapper`,
    textblock: `${PREFIX}-textblock`,
    actionArea: `${PREFIX}-actionArea`,
    ribbon: `${PREFIX}-ribbon`,
    truncate: `${PREFIX}-truncate`,
    businessDetail: `${PREFIX}-businessDetail`,
    popover: `${PREFIX}-popover`,
    paper: `${PREFIX}-paper`,
    typo: `${PREFIX}-typo`,
};

const StyledCard = styled(Card)((
    {
        theme,
    },
) => ({
    [`&.${classes.card}`]: {
        margin: theme.spacing(3 / 2),
        maxWidth: theme.custom.thumbnail.width,
        transition: 'box-shadow 0.3s ease-in-out',
        position: 'relative',
    },

    [`& .${classes.apiDetails}`]: {
        background: theme.custom.thumbnail.contentBackgroundColor,
        padding: theme.spacing(1),
        color: theme.palette.getContrastText(theme.custom.thumbnail.contentBackgroundColor),
        '& a': {
            color: theme.palette.getContrastText(theme.custom.thumbnail.contentBackgroundColor),
        },
        position: theme.custom.thumbnail.contentPictureOverlap ? 'absolute' : 'relative',
        top: 0,
    },

    [`& .${classes.suppressLinkStyles}`]: {
        textDecoration: 'none',
        color: theme.palette.text.disabled,
    },

    [`& .${classes.row}`]: {
        display: 'inline-block',
    },

    [`& .${classes.thumbBy}`]: {
        'padding-left': '5px',
    },

    [`& .${classes.media}`]: {
        // ⚠️ object-fit is not supported by IE11.
        objectFit: 'cover',
    },

    [`& .${classes.thumbContent}`]: {
        width: theme.custom.thumbnail.width - theme.spacing(2),
    },

    [`& .${classes.thumbLeft}`]: {
        alignSelf: 'flex-start',
        flex: 1,
        width: '25%',
        'padding-left': '5px',
        'padding-right': '65px',
    },

    [`& .${classes.thumbLeftAction}`]: {
        alignSelf: 'flex-start',
        flex: 1,
        width: '25%',
        'padding-left': '5px',
        'padding-right': '10px',
    },

    [`& .${classes.thumbRight}`]: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
    },

    [`& .${classes.thumbInfo}`]: {
        display: 'flex',
    },

    [`& .${classes.thumbHeader}`]: {
        width: theme.custom.thumbnail.width - theme.spacing(1),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        margin: 0,
        'padding-left': '5px',
    },

    [`& .${classes.contextBox}`]: {
        width: `calc((${parseInt(theme.custom.thumbnail.width, 10)}px - ${theme.spacing(1)}) / 2)`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        margin: 0,
        display: 'inline-block',
        lineHeight: '1em',
        'padding-top': 5,
        'padding-right': 5,
        'padding-bottom': 1.5,
        textAlign: 'left',
    },

    [`& .${classes.context}`]: {
        marginTop: 5,
    },

    [`& .${classes.thumbWrapper}`]: {
        position: 'relative',
        paddingTop: 20,
        marginRight: theme.spacing(2),
    },

    [`& .${classes.deleteIcon}`]: {
        fill: 'red',
    },

    [`& .${classes.textWrapper}`]: {
        color: theme.palette.text.secondary,
        textDecoration: 'none',
    },

    [`& .${classes.imageWrapper}`]: {
        color: theme.custom.thumbnail.iconColor,
        width: theme.custom.thumbnail.width,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    [`& .${classes.imageOverlap}`]: {
        position: 'absolute',
        bottom: 1,
    },

    [`& .${classes.chipWrapper}`]: {
        marginTop: '15px',
    },

    [`& .${classes.chipWrapper2}`]: {
        marginBottom: '10px',
    },

    [`& .${classes.chipWrapper3}`]: {
        marginTop: '12px',
    },

    [`& .${classes.ratingWrapper}`]: {
        marginTop: '20px',
    },

    [`& .${classes.textblock}`]: {
        color: theme.palette.text.secondary,
        position: 'absolute',
        bottom: '35px',
        right: '10px',
        background: theme.custom.thumbnail.contentBackgroundColor,
        'padding-left': '10px',
        'padding-right': '10px',
    },

    [`& .${classes.actionArea}`]: {
        display: 'block !important',
        '&:focus': {
            border: '1px solid' + theme.palette.primary.main,
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

    [`& .${classes.truncate}`]: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '175px',
    },

    [`& .${classes.businessDetail}`]: {
        display: 'flex',
    },

    [`& .${classes.popover}`]: {
        pointerEvents: 'none',
    },

    [`& .${classes.paper}`]: {
        padding: theme.spacing(1),
        maxWidth: '300px',
    },

    [`& .${classes.typo}`]: {
        display: 'flex',
    },
}));

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
        const { theme: { custom: { thumbnail: { defaultApiImage } } } } = props;
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
        const restApi = new Api();

        const promisedThumbnail = restApi.getAPIThumbnail(api.id);
        promisedThumbnail.then((response) => {
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
        }).finally(() => {
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

    /**
     * Get Path Prefix depedning on the respective API Type being rendered
     *
     * @returns {String} path
     * @memberof ApiThumb
     */
    getPathPrefix() {
        const path = '/apis/';
        return path;
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

    /**
     * @inheritdoc
     * @returns {React.Component} @inheritdoc
     * @memberof APIThumb
     */
    render() {
        const {
            imageObj, selectedIcon, color, backgroundIndex, category, imageLoaded,
        } = this.state;
        const path = this.getPathPrefix();
        const { isMonetizationEnabled } = this.context;

        const detailsLink = path + this.props.api.id;
        const {
            api, theme, customWidth, customHeight, showInfo,
        } = this.props;
        const { custom: { thumbnail, social: { showRating }, thumbnailTemplates: { variant, active } } } = theme;
        const { name, version, context } = api;

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
        const imageHeight = customHeight || 140;
        const defaultImage = thumbnail.defaultApiImage;
        const { tileDisplayInfo } = apis;

        const showChips = () => {
            if (api.lifeCycleStatus === 'PROTOTYPED') {
                if ((api.type === 'GRAPHQL' || api.transportType === 'GRAPHQL')) {
                    // GraphQL APIs in prototyped status.
                    return (
                        <div className='api-thumb-chip-main'>
                            <Typography
                                variant='subtitle1'
                                gutterBottom
                                align='right'
                                className={classNames(classes.chipWrapper2, 'api-thumb-chip-wrapper')}
                            >
                                <Chip
                                    label={api.transportType === undefined ? api.type : api.transportType}
                                    color='primary'
                                />
                            </Typography>
                            <Typography
                                variant='subtitle1'
                                gutterBottom
                                align='right'
                                className={classes.chipWrapper3}
                            >
                                <Chip
                                    label='PRE-RELEASED'
                                    color='default'
                                />
                            </Typography>
                        </div>
                    );
                } else if ((api.gatewayVendor === 'solace')) {
                    // Solace APIs in prototyped status.
                    return (
                        <div className='api-thumb-chip-main'>
                            <Typography
                                variant='subtitle1'
                                gutterBottom
                                align='right'
                                className={classes.chipWrapper2}
                            >
                                <Chip
                                    label='SOLACE'
                                    color='primary'
                                />
                            </Typography>
                            <Typography
                                variant='subtitle1'
                                gutterBottom
                                align='right'
                                className={classes.chipWrapper3}
                            >
                                <Chip
                                    label='PRE-RELEASED'
                                    color='default'
                                />
                            </Typography>
                        </div>
                    );
                } else {
                    // APIs in prototyped status.
                    return (
                        <div className='api-thumb-chip-main'>
                            <Chip
                                label='PRE-RELEASED'
                                color='default'
                            />
                        </div>
                    );
                }
            } else {
                // GraphQL APIs which are not in prototyped status.
                if ((api.type === 'GRAPHQL' || api.transportType === 'GRAPHQL')) {
                    return (
                        <div className='api-thumb-chip-main'>
                            <Chip
                                label={api.transportType === undefined ? api.type : api.transportType}
                                color='primary'
                            />
                        </div>
                    );
                }

                // Solace APIs which are not in prototyped status.
                if ((api.gatewayVendor === 'solace')) {
                    return (
                        <div className='api-thumb-chip-main'>
                            <Chip
                                data-testid='solace-label'
                                label='SOLACE'
                                color='primary'
                            />
                        </div>
                    );
                }
            }
            return null;
        };

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
            ImageView = (variant === 'text' && active) ? (
                <LetterGenerator
                    width={imageWidth}
                    height={imageHeight}
                    artifact={api}
                />
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
        return (
            <StyledCard className={classNames('image-thumbnail', classes.card)}>
                <CardActionArea>
                    {api.advertiseInfo && api.advertiseInfo.advertised && (
                        <div className={classes.ribbon} data-testid='third-party-api-card-label'>third party</div>
                    )}
                    {isMonetizationEnabled && (
                        <div className={classNames(classes.textblock, 'image-thumb-text-block')}>{api.monetizationLabel}</div>
                    )}
                    <Link
                        className={classNames(classes.actionArea, 'image-thumb-action-area')}
                        to={detailsLink}
                        area-label={'Go to ' + name}
                    >
                        <div style={{ position: 'relative' }}>
                            <CardMedia area-hidden='true' classes={{ root: 'image-thumb-card-root' }}>
                                {!defaultImage && ImageView}
                                {defaultImage && <img src={app.context + defaultImage} alt='img' />}
                            </CardMedia>
                            {tileDisplayInfo.showMonetizedState && api.monetizedInfo && (
                                <div className={classes.thumbLeft} style={{ position: 'absolute', bottom: 0 }}>
                                    <MonetizationOnIcon fontSize='medium' style={{ color: '#FFD700', paddingLeft: '2px' }} />
                                </div>
                            )}
                        </div>
                        <CardContent classes={{ root: classNames(classes.apiDetails, 'image-thumb-card-content') }}>
                            <Typography
                                className={classNames(classes.thumbHeader, 'image-thumb-card-thumb-header')}
                                variant='h5'
                                component='h2'
                                gutterBottom
                                onClick={this.handleRedirectToAPIOverview}
                                title={name}
                            >
                                {name}
                            </Typography>
                            <div className={classNames(classes.row, 'image-thumb-provider-wrapper')}>
                                <Typography
                                    variant='caption'
                                    gutterBottom
                                    align='left'
                                    className={classNames(classes.thumbBy, 'image-thumb-provider')}
                                >
                                    <FormattedMessage defaultMessage='By' id='Apis.Listing.ApiThumb.by' />
                                    <FormattedMessage defaultMessage=' : ' id='Apis.Listing.ApiThumb.by.colon' />
                                    {provider}
                                </Typography>
                            </div>
                            <div className={classNames(classes.thumbInfo, 'image-thumb-info')}>
                                <div className={classNames(classes.row, 'image-thumb-row')}>
                                    <div className={classNames(classes.thumbLeft, 'image-thumb-left-version')}>
                                        <Typography variant='subtitle1' component='div'>{version}</Typography>
                                        <Typography variant='caption' component='div' gutterBottom align='left'>
                                            <FormattedMessage defaultMessage='Version' id='Apis.Listing.ApiThumb.version' />
                                        </Typography>
                                    </div>
                                </div>
                                <div className={classNames(classes.row, 'image-thumb-context')}>
                                    <div className={classes.thumbRight}>
                                        <Typography
                                            variant='subtitle1'
                                            component='div'
                                            align='right'
                                            className={classes.contextBox}
                                        >
                                            {context}
                                        </Typography>
                                        <Typography
                                            variant='caption'
                                            gutterBottom
                                            align='right'
                                            className={classes.context}
                                            Component='div'
                                        >
                                            <FormattedMessage defaultMessage='Context' id='Apis.Listing.ApiThumb.context' />
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                            {(tileDisplayInfo.showBusinessDetails || tileDisplayInfo.showTechnicalDetails) && (
                                <>
                                    <Box mt={1} mb={1}>
                                        <Divider />
                                        <div>
                                            <div className={classes.row}>
                                                <div className={classes.thumbLeft}>
                                                    <Typography variant='body2' gutterBottom align='left'>
                                                        <FormattedMessage defaultMessage='Owners' id='Apis.Listing.ApiThumb.owners' />
                                                    </Typography>
                                                </div>
                                                {tileDisplayInfo.showBusinessDetails && (
                                                    <div>
                                                        <Typography
                                                            variant='caption'
                                                            gutterBottom
                                                            align='left'
                                                            onMouseEnter={this.handleBusinessPopoverOpen}
                                                            onMouseLeave={this.handleBusinessPopoverClose}
                                                            className={classes.typo}
                                                        >
                                                            <div style={{ paddingLeft: '5px', whiteSpace: 'nowrap', paddingRight: '5px' }}>
                                                                <FormattedMessage
                                                                    defaultMessage='Business'
                                                                    id='Apis.Listing.ApiThumb.owners.business'
                                                                />
                                                                {' : '}
                                                            </div>
                                                            <div className={classes.truncate}>
                                                                {api.businessInformation.businessOwner
                                                                    ? (api.businessInformation.businessOwner)
                                                                    : (
                                                                        <span
                                                                            style={{ color: '#808080', fontWeight: 'bold' }}
                                                                        >
                                                                            Not Provided
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </Typography>
                                                        {api.businessInformation.businessOwnerEmail && (
                                                            <Popover
                                                                id='mouse-over-popover'
                                                                className={classes.popover}
                                                                classes={{
                                                                    paper: classes.paper,
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
                                                                disableRestoreFocus
                                                            >
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                }}
                                                                >
                                                                    <EmailIcon fontSize='small' />
                                                                    <Typography
                                                                        variant='body2'
                                                                        style={{ marginLeft: '8px' }}
                                                                    >
                                                                        {api.businessInformation.businessOwnerEmail}
                                                                    </Typography>
                                                                </div>
                                                            </Popover>
                                                        )}
                                                    </div>
                                                )}
                                                {tileDisplayInfo.showTechnicalDetails && (
                                                    <div>
                                                        <Typography
                                                            variant='caption'
                                                            gutterBottom
                                                            align='left'
                                                            onMouseEnter={this.handleTechnicalPopoverOpen}
                                                            onMouseLeave={this.handleTechnicalPopoverClose}
                                                            className={classes.typo}
                                                        >
                                                            <div
                                                                style={{
                                                                    paddingLeft: '5px',
                                                                    whiteSpace: 'nowrap',
                                                                    paddingRight: '5px',
                                                                }}
                                                            >
                                                                <FormattedMessage
                                                                    defaultMessage='Technical'
                                                                    id='Apis.Listing.ApiThumb.owners.technical'
                                                                />
                                                                {' : '}
                                                            </div>
                                                            <div className={classes.truncate}>
                                                                {api.businessInformation.technicalOwner
                                                                    ? (api.businessInformation.technicalOwner)
                                                                    : (
                                                                        <span
                                                                            style={{
                                                                                color: '#808080',
                                                                                fontWeight: 'bold',
                                                                            }}
                                                                        >
                                                                            Not Provided
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </Typography>
                                                        {api.businessInformation.technicalOwnerEmail && (
                                                            <Popover
                                                                id='mouse-over-popover'
                                                                className={classes.popover}
                                                                classes={{
                                                                    paper: classes.paper,
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
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                }}
                                                                >
                                                                    <EmailIcon fontSize='small' />
                                                                    <Typography
                                                                        variant='body2'
                                                                        style={{ marginLeft: '8px' }}
                                                                    >
                                                                        {api.businessInformation.technicalOwnerEmail}
                                                                    </Typography>
                                                                </div>
                                                            </Popover>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Divider />
                                    </Box>
                                </>
                            )}
                            <div className={classNames(classes.thumbInfo, 'api-thumb-rating-chip-wrapper')}>
                                {showRating && (
                                    <div className={classNames(classes.thumbLeftAction, 'api-thumb-rating-wrapper')}>
                                        <Typography
                                            variant='subtitle1'
                                            component='div'
                                            aria-label='API Rating'
                                            gutterBottom
                                            align='left'
                                            className={classNames('api-thumb-rating', classes.ratingWrapper)}
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
                                <div className={classNames(classes.thumbRight, 'api-thumb-chips-wrapper')}>
                                    <Typography
                                        variant='subtitle1'
                                        component='div'
                                        gutterBottom
                                        align='right'
                                        className={classes.chipWrapper}
                                    >
                                        {showChips()}
                                    </Typography>
                                </div>
                            </div>
                        </CardContent>
                    </Link>
                </CardActionArea>
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
    return (
        <ApiThumbClassicLegacy
            {...props}
            theme={theme}
        />
    );
}

export default (ApiThumbClassic);
