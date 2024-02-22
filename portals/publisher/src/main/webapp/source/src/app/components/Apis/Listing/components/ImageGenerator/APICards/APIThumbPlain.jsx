import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Icon from '@mui/material/Icon';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { isRestricted } from 'AppData/AuthManager';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Api from 'AppData/api';
import Popover from '@mui/material/Popover';
import DeleteApiButton from 'AppComponents/Apis/Details/components/DeleteApiButton';
import Configurations from 'Config';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmailIcon from '@mui/icons-material/Email';

import getIcon from './ImageUtils';

const PREFIX = 'APIThumbPlain';

const classes = {
    root: `${PREFIX}-root`,
    bullet: `${PREFIX}-bullet`,
    title: `${PREFIX}-title`,
    pos: `${PREFIX}-pos`,
    thumbHeader: `${PREFIX}-thumbHeader`,
    contextBox: `${PREFIX}-contextBox`,
    caption: `${PREFIX}-caption`,
    imageDisplay: `${PREFIX}-imageDisplay`,
    thumbRightBy: `${PREFIX}-thumbRightBy`,
    thumbRightByLabel: `${PREFIX}-thumbRightByLabel`
};

const StyledCard = styled(Card)((
    {
        theme
    }
) => ({
    [`&.${classes.root}`]: {
        minWidth: 200,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
    },

    [`& .${classes.bullet}`]: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },

    [`& .${classes.title}`]: {
        fontSize: 14,
    },

    [`& .${classes.pos}`]: {
        marginBottom: 12,
    },

    [`& .${classes.thumbHeader}`]: {
        width: '150px',
        color: '#444',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        margin: 0,
        'padding-left': '5px',
    },

    [`& .${classes.contextBox}`]: {
        maxWidth: 120,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        paddingLeft: '5px',
    },

    [`& .${classes.caption}`]: {
        color: theme.palette.grey[700],
    },

    [`& .${classes.imageDisplay}`]: {
        maxWidth: '40px',
        maxHeight: '40px',
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

    [`& .${classes.typo}`]: {
        display: 'flex'
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

    [`& .${classes.ribbon}`]: {
        fontFamily: theme.typography.fontFamily,
        fontSize: '12px',
        fontWeight: 800,
        color: '#616161',
        position: 'absolute',
        padding: '5px',
        width: '80px',
        zIndex: 3,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
}));

const windowURL = window.URL || window.webkitURL;

/**
 * Render a thumbnail
 * @param {JSON} props required pros.
 * @returns {JSX} Thumbnail rendered output.
 */
function APIThumbPlain(props) {
    const theme = useTheme();

    const {
        api, showInfo, isAPIProduct, updateData,
    } = props;
    const { custom: { thumbnail } } = theme;
    const {
        name, version, context, provider,
    } = api;

    const [imageConf, setImageConf] = useState({
        selectedIcon: '',
        category: '',
        color: '#ccc',
    });
    const [imageObj, setIMageObj] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const { tileDisplayInfo } = Configurations.apis;
    const [businessAnchorEl, setBusinessAnchorEl] = useState(null);
    const [technicalAnchorEl, setTechnicalAnchorEl] = useState(null);
    const [businessOpenPopover, setBusinessOpenPopover] = useState(false);
    const [technicalOpenPopover, setTechnicalOpenPopover] = useState(false);

    useEffect(() => {
        const restApi = new Api();

        const promisedThumbnail = restApi.getAPIThumbnail(api.id);

        promisedThumbnail.then((response) => {
            if (response && response.data) {
                if (response.headers['content-type'] === 'application/json') {
                    const iconJson = JSON.parse(response.data);
                    setImageConf({
                        selectedIcon: iconJson.key,
                        category: iconJson.category,
                        color: iconJson.color,
                    });
                } else if (response && response.data.size > 0) {
                    setIMageObj(windowURL.createObjectURL(response.data));
                }
            }
        }).finally(() => {
            setImageLoaded(true);
        });
    }, []);
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
                src={imageObj}
                alt='API Thumbnail'
                className={classes.imageDisplay}
            />
        );
    } else {
        ImageView = (
            <Icon className={classes.icon} style={{ fontSize: 40 + 'px', color: imageConf.color }}>
                {getIcon(imageConf.selectedIcon, imageConf.category, theme, api)}
            </Icon>
        );
    }

    const handleBusinessPopoverOpen = (event) => {
        setBusinessOpenPopover(true);
        setBusinessAnchorEl(event.currentTarget);
    };

    const handleBusinessPopoverClose = () => {
        setBusinessAnchorEl(null);
        setBusinessOpenPopover(false);
    };

    const handleTechnicalPopoverOpen = (event) => {
        setTechnicalAnchorEl(event.currentTarget);
        setTechnicalOpenPopover(true);
    };

    const handleTechnicalPopoverClose = () => {
        setTechnicalAnchorEl(null);
        setTechnicalOpenPopover(false);
    };

    if (!showInfo) {
        return (
            <Link to={'/apis/' + api.id} aria-hidden='true'>
                <Box display='flex'>
                    <Box>
                        {!thumbnail.defaultApiImage && ImageView}
                        {thumbnail.defaultApiImage
                        && (
                            <img
                                src={Configurations.app.context + thumbnail.defaultApiImage}
                                alt='img'
                            />
                        )}
                    </Box>
                </Box>

            </Link>
        );
    }
    return (
        <StyledCard className={classes.root} variant='outlined'>
            <Box mb={2} pl={1}>
                {api.advertiseOnly && (
                    <div className={classes.ribbon}>third party</div>
                )}
            </Box>
            <CardContent>
                <Box id={api.name}>
                    <Link to={'/apis/' + api.id + '/overview'} aria-hidden='true'>
                        <Box display='flex'>
                            <Box>
                                {!thumbnail.defaultApiImage && ImageView}
                                {thumbnail.defaultApiImage
                                && <img src={Configurations.app.context + thumbnail.defaultApiImage} alt='img' />}
                            </Box>
                            <Typography
                                variant='h5'
                                gutterBottom
                                title={name}
                                className={classes.thumbHeader}
                            >
                                {name}
                            </Typography>
                        </Box>

                    </Link>
                </Box>
                <Box display='flex'>
                    <Box flex={1}>
                        {provider && (
                            <>
                                <Typography
                                    variant='caption'
                                    gutterBottom
                                    align='left'
                                    className={classes.caption}
                                    component='span'
                                >
                                    <FormattedMessage defaultMessage='By' id='Apis.Listing.ApiThumb.by' />
                                    <FormattedMessage defaultMessage=' : ' id='Apis.Listing.ApiThumb.by.colon' />
                                </Typography>
                                <Typography variant='body2' component='span'>{provider}</Typography>
                            </>
                        )}
                    </Box>
                    <Box>
                        {api.monetizedInfo && tileDisplayInfo.showMonetizedState &&
                            <MonetizationOnIcon fontSize='medium'/>
                        }
                    </Box>
                </Box>
                <Box display='flex' mt={2}>
                    <Box flex={1}>
                        <Typography variant='subtitle1'>{version}</Typography>
                        <Typography variant='caption' gutterBottom align='left' className={classes.caption}>
                            <FormattedMessage defaultMessage='Version' id='Apis.Listing.ApiThumb.version' />
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant='subtitle1' align='right' className={classes.contextBox}>
                            {context}
                        </Typography>
                        <Typography
                            variant='caption'
                            gutterBottom
                            align='right'
                            className={classes.caption}
                            Component='div'
                        >
                            <FormattedMessage defaultMessage='Context' id='Apis.Listing.ApiThumb.context' />
                        </Typography>
                    </Box>
                </Box>

                {(tileDisplayInfo.showBusinessDetails || tileDisplayInfo.showTechnicalDetails) && (
                    <>
                        <hr />
                        <div>
                            <div>
                                <div>
                                    <Typography variant='body2' gutterBottom align='left'>
                                        <FormattedMessage
                                            defaultMessage='Owners'
                                            id='Apis.Listing.ApiThumb.owners'
                                        />
                                    </Typography>
                                </div>
                                {tileDisplayInfo.showBusinessDetails &&
                                    <div>
                                        <Typography
                                            variant='caption'
                                            gutterBottom
                                            align='left'
                                            onMouseEnter={handleBusinessPopoverOpen}
                                            onMouseLeave={handleBusinessPopoverClose}
                                            className={classes.typo}
                                        >
                                            <div style={{
                                                whiteSpace: 'nowrap',
                                                paddingRight: '5px'
                                            }}
                                            >
                                                <FormattedMessage
                                                    defaultMessage='Business'
                                                    id='Apis.Listing.ApiThumb.owners.business'
                                                />
                                                {' : '}
                                            </div>
                                            <div className={classes.truncate}>
                                                {api.businessOwner
                                                    ? (api.businessOwner)
                                                    : (
                                                        <span
                                                            style={{ color: '#808080', fontWeight: 'bold' }}
                                                        >
                                                            Not Provided
                                                        </span>
                                                    )}
                                            </div>
                                        </Typography>
                                        {api.businessOwnerEmail && (
                                            <Popover
                                                id='mouse-over-popover'
                                                className={classes.popover}
                                                classes={{
                                                    paper: classes.paper,
                                                }}
                                                open={businessOpenPopover}
                                                anchorEl={businessAnchorEl}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'left',
                                                }}
                                                onClose={handleBusinessPopoverClose}
                                                disableRestoreFocus
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                                >
                                                    <div style={{ display: 'flex' }}>
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
                                    <div>
                                        <Typography
                                            variant='caption'
                                            gutterBottom align='left'
                                            onMouseEnter={handleTechnicalPopoverOpen}
                                            onMouseLeave={handleTechnicalPopoverClose}
                                            className={classes.typo}
                                        >
                                            <div style={{
                                                whiteSpace: 'nowrap',
                                                paddingRight: '5px'
                                            }}
                                            >
                                                <FormattedMessage
                                                    defaultMessage='Technical'
                                                    id='Apis.Listing.ApiThumb.owners.technical'
                                                />
                                                {' : '}
                                            </div>
                                            <div className={classes.truncate}>
                                                {api.technicalOwner
                                                    ? (api.technicalOwner)
                                                    : (
                                                        <span
                                                            style={{ color: '#808080', fontWeight: 'bold' }}
                                                        >
                                                            Not Provided
                                                        </span>
                                                    )}
                                            </div>
                                        </Typography>
                                        {api.technicalOwnerEmail && (
                                            <Popover
                                                id='mouse-over-popover'
                                                className={classes.popover}
                                                classes={{
                                                    paper: classes.paper,
                                                }}
                                                open={technicalOpenPopover}
                                                anchorEl={technicalAnchorEl}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'left',
                                                }}
                                                onClose={handleTechnicalPopoverClose}
                                                disableRestoreFocus
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                                >
                                                    <div style={{ display: 'flex' }}>
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
                <Box display='flex' mt={2}>
                    <Box flex={1}>
                        {!isAPIProduct && (
                            <Chip
                                label={api.apiType === Api.CONSTS.APIProduct ? api.state : api.lifeCycleStatus}
                                color='default'
                                size='small'
                                classes={{ root: classes.thumbRightBy, label: classes.thumbRightByLabel }}
                            />
                        )}
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
                    </Box>
                    {!isRestricted(['apim:api_create'], api) && (
                        <>
                            <DeleteApiButton
                                setLoading={setLoading}
                                api={api}
                                updateData={updateData}
                                isAPIProduct={isAPIProduct}
                            />
                            {loading && <CircularProgress className={classes.deleteProgress} />}
                        </>
                    )}
                </Box>
            </CardContent>
        </StyledCard>
    );
}


APIThumbPlain.defaultProps = {
    showInfo: true,
};
APIThumbPlain.propTypes = {
    showInfo: PropTypes.bool,
    updateData: PropTypes.func.isRequired,
    isAPIProduct: PropTypes.bool.isRequired,
};

export default APIThumbPlain;
