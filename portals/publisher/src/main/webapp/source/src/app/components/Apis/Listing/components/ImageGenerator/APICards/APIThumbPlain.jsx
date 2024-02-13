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
import DeleteApiButton from 'AppComponents/Apis/Details/components/DeleteApiButton';
import Configurations from 'Config';

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
    }
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
        <StyledCard className={classes.root} variant='outlined' sx={{ border: '2px solid red'}}>
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
