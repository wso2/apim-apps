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
import DeleteApiButton from 'AppComponents/Apis/Details/components/DeleteApiButton';
import Configurations from 'Config';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmailIcon from '@mui/icons-material/Email';

import { green } from '@mui/material/colors';
import BaseThumbnail from '../BaseThumbnail';

const PREFIX = 'ApiThumbClassic';

const classes = {
    card: `${PREFIX}-card`,
    providerText: `${PREFIX}-providerText`,
    apiDetails: `${PREFIX}-apiDetails`,
    apiActions: `${PREFIX}-apiActions`,
    deleteProgress: `${PREFIX}-deleteProgress`,
    thumbHeader: `${PREFIX}-thumbHeader`,
    imageWrapper: `${PREFIX}-imageWrapper`,
    thumbContent: `${PREFIX}-thumbContent`,
    thumbLeft: `${PREFIX}-thumbLeft`,
    thumbRight: `${PREFIX}-thumbRight`,
    thumbInfo: `${PREFIX}-thumbInfo`,
    contextBox: `${PREFIX}-contextBox`,
    imageOverlap: `${PREFIX}-imageOverlap`,
    row: `${PREFIX}-row`,
    textWrapper: `${PREFIX}-textWrapper`,
    thumbBy: `${PREFIX}-thumbBy`,
    thumbRightBy: `${PREFIX}-thumbRightBy`,
    thumbRightByLabel: `${PREFIX}-thumbRightByLabel`,
    ribbon: `${PREFIX}-ribbon`
};

const StyledCard = styled(Card)((
    {
        theme
    }
) => ({
    [`&.${classes.card}`]: {
        margin: theme.spacing(3 / 2),
        maxWidth: theme.custom.thumbnail.width,
        transition: 'box-shadow 0.3s ease-in-out',
    },

    [`& .${classes.providerText}`]: {
        textTransform: 'capitalize',
    },

    [`& .${classes.apiDetails}`]: { padding: theme.spacing(1), paddingBottom: 0 },

    [`& .${classes.apiActions}`]: { 
        justifyContent: 'space-between',
        padding: `0px 0px ${theme.spacing(1)} 8px`,
        height: 48
    },

    [`& .${classes.deleteProgress}`]: {
        color: green[200],
        position: 'absolute',
        marginLeft: '200px',
    },

    [`& .${classes.thumbHeader}`]: {
        width: '90%',
        whiteSpace: 'nowrap',
        color: theme.palette.text.secondary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        margin: 0,
        'padding-left': '5px',
    },

    [`& .${classes.imageWrapper}`]: {
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
        width: theme.custom.thumbnail.width + theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    [`& .${classes.thumbContent}`]: {
        width: theme.custom.thumbnail.width - theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(1),
    },

    [`& .${classes.thumbLeft}`]: {
        alignSelf: 'flex-start',
        flex: 1,
        width: '25%',
        'padding-left': '5px',
        'padding-right': '65px',
    },

    [`& .${classes.thumbRight}`]: {
        alignSelf: 'flex-end',
    },

    [`& .${classes.thumbInfo}`]: {
        display: 'flex',
    },

    [`& .${classes.contextBox}`]: {
        width: '110px',
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

    [`& .${classes.imageOverlap}`]: {
        position: 'absolute',
        bottom: 1,
        backgroundColor: theme.custom.thumbnail.contentBackgroundColor,
    },

    [`& .${classes.row}`]: {
        display: 'inline-block',
    },

    [`& .${classes.textWrapper}`]: {
        color: theme.palette.text.secondary,
        textDecoration: 'none',
    },

    [`& .${classes.thumbBy}`]: {
        'padding-left': '5px',
    },

    [`& .${classes.thumbRightBy}`]: {
        'margin-right': '5px',
        height: 18,
        borderRadius: 8,
    },

    [`& .${classes.thumbRightByLabel}`]: {
        paddingLeft: 5,
        paddingRight: 5,
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

    [`& .${classes.popover}`]: {
        pointerEvents: 'none',
    },

    [`& .${classes.paper}`]: {
        padding: theme.spacing(1),
        maxWidth: '300px',
    },

    [`& .${classes.typo}`]: {
        display: 'flex'
    },
}));

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
        const { api, isAPIProduct, theme, updateData } = this.props;
        const { isHover, loading } = this.state;
        let overviewPath = '';
        const { tileDisplayInfo } = Configurations.apis;
        if (api.apiType) {
            overviewPath = isAPIProduct ? `/api-products/${api.id}/overview` : `/apis/${api.id}/overview`;
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
            >
                {api.advertiseOnly && (
                    <div className={classes.ribbon} data-testid='third-party-api-card-label'>third party</div>
                )}
                <div style={{ position: "relative" }}>
                    <CardMedia
                        src='None'
                        component={BaseThumbnail}
                        height={theme.custom.thumbnail.height}
                        width={theme.custom.thumbnail.width}
                        title='Thumbnail'
                        api={api}
                    />
                    {api.monetizedInfo && tileDisplayInfo.showMonetizedState && 
                        <div className={classes.thumbLeft} style={{ position: "absolute", bottom: 0 }}>
                            <MonetizationOnIcon fontSize='medium' style={{ color: '#FFD700', paddingLeft: '2px' }} />
                        </div>
                    }
                </div>
                <CardContent className={classes.apiDetails}>
                    <div className={classes.textWrapper}>
                        <Link to={overviewPath}>
                            <Typography
                                gutterBottom variant='h4'
                                className={classes.thumbHeader}
                                title={api.name}
                                id={api.name}>
                                {api.name}
                            </Typography>
                        </Link>
                    </div>
                    <div className={classes.row}>
                        <Typography variant='caption' gutterBottom align='left' className={classes.thumbBy}>
                            <FormattedMessage id='by' defaultMessage='By' />
                            <FormattedMessage id='colon' defaultMessage=' : ' />
                            {api.provider}
                        </Typography>
                    </div>
                    <div className={classes.thumbInfo}>
                        <div className={classes.row}>
                            <div className={classes.thumbLeft}>
                                <Typography variant='subtitle1'>{api.version}</Typography>
                            </div>

                            <div className={classes.thumbLeft}>
                                <Typography variant='caption' gutterBottom align='left'>
                                    <FormattedMessage defaultMessage='Version' id='Apis.Listing.ApiThumb.version' />
                                </Typography>
                            </div>
                        </div>
                        <div className={classes.row}>
                            <div className={classes.thumbRight}>
                                <Typography variant='subtitle1' align='right' className={classes.contextBox}>
                                    {api.context}
                                </Typography>
                            </div>

                            <div className={classes.thumbRight}>
                                <Typography variant='caption' gutterBottom align='right' className={classes.context}>
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
                    </div>
                    {(tileDisplayInfo.showBusinessDetails || tileDisplayInfo.showTechnicalDetails) && (
                        <>
                            <hr />
                            <div>
                                <div className={classes.row}>
                                    <div className={classes.thumbLeft}>
                                        <Typography variant='body2' gutterBottom align='left'>
                                            <FormattedMessage
                                                defaultMessage='Owners'
                                                id='Apis.Listing.ApiThumb.owners'
                                            />
                                        </Typography>
                                    </div>
                                    {tileDisplayInfo.showBusinessDetails &&
                                        <div style={{ paddingLeft: '5px' }}>
                                            <Typography
                                                variant='caption'
                                                gutterBottom
                                                align='left'
                                                onMouseEnter={this.handleBusinessPopoverOpen}
                                                onMouseLeave={this.handleBusinessPopoverClose}
                                                className={classes.typo}
                                            >
                                                <FormattedMessage
                                                    defaultMessage='Business'
                                                    id='Apis.Listing.ApiThumb.owners.business'
                                                />
                                                {' : '}
                                                {api.businessOwner ? (api.businessOwner): (
                                                    <span style={{ color: '#808080' }}>
                                                        Not Provided
                                                    </span>
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
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}
                                                    >
                                                        <div style={{ display: 'flex', padding: '4px' }}>
                                                            <EmailIcon fontSize='small' />
                                                            <Typography
                                                                variant='body2'
                                                                style={{ marginLeft: '8px' }}
                                                            >
                                                                {api.businessOwnerEmail}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Popover>
                                            )}
                                        </div>}
                                    {tileDisplayInfo.showTechnicalDetails &&
                                        <div style={{ paddingLeft: '5px' }}>
                                            <Typography
                                                variant='caption'
                                                gutterBottom align='left'
                                                onMouseEnter={this.handleTechnicalPopoverOpen}
                                                onMouseLeave={this.handleTechnicalPopoverClose}
                                                className={classes.typo}
                                            >
                                                <FormattedMessage
                                                    defaultMessage='Technical'
                                                    id='Apis.Listing.ApiThumb.owners.technical'
                                                />
                                                {' : '}
                                                {api.technicalOwner ? (api.technicalOwner): (
                                                    <span style={{ color: '#808080' }}>
                                                        Not Provided
                                                    </span>
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
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}
                                                    >
                                                        <div style={{ display: 'flex', padding: '4px' }}>
                                                            <EmailIcon fontSize='small' />
                                                            <Typography
                                                                variant='body2'
                                                                style={{ marginLeft: '8px' }}
                                                            >
                                                                {api.technicalOwnerEmail}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Popover>
                                            )}
                                        </div>}
                                </div>
                            </div>
                            <hr />
                        </>
                    )}
                </CardContent>
                <CardActions className={classes.apiActions} data-testid={'card-action-' + api.name + api.version}>
                    <Chip
                        size='small'
                        classes={{ root: classes.thumbRightBy, label: classes.thumbRightByLabel }}
                        label={lifecycleState}
                        color='default'
                        data-testid='itest-api-lifecycleState'
                    />
                    {(api.type === 'GRAPHQL' || api.transportType === 'GRAPHQL') && (
                        <Chip
                            size='small'
                            classes={{ root: classes.thumbRightBy, label: classes.thumbRightByLabel }}
                            label={api.transportType === undefined
                                ? api.type : api.transportType}
                            color='primary'
                        />
                    )}
                    {(api.type === 'WS') && (
                        <Chip
                            size='small'
                            classes={{ root: classes.thumbRightBy, label: classes.thumbRightByLabel }}
                            label='WEBSOCKET'
                            color='primary'
                        />
                    )}
                    {(api.type === 'WEBSUB') && (api.gatewayVendor === 'wso2') && (
                        <Chip
                            size='small'
                            classes={{ root: classes.thumbRightBy, label: classes.thumbRightByLabel }}
                            label='WEBSUB'
                            color='primary'
                        />
                    )}
                    {(api.type === 'WEBSUB') && (api.gatewayVendor === 'solace') && (
                        <Chip
                            size='small'
                            classes={{ root: classes.thumbRightBy, label: classes.thumbRightByLabel }}
                            label='SOLACE API'
                            style={{ backgroundColor: '#00c995' }}
                        />
                    )}
                    {!isRestricted(['apim:api_create'], api) && (
                        <>
                            <DeleteApiButton
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

APIThumb.propTypes = {
    api: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        apiType: PropTypes.string.isRequired,
    }).isRequired,
    isAPIProduct: PropTypes.bool.isRequired,
    updateData: PropTypes.func.isRequired,
};

export default injectIntl((props) => {
    const theme = useTheme();
    return <APIThumb {...props} theme={theme} />;
});
