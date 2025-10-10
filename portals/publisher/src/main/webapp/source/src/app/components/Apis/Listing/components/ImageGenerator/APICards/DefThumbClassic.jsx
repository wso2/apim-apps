/*
 * Copyright (c) 2024, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Box, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { FormattedMessage } from 'react-intl';
import LetterGenerator from 'AppComponents/Apis/Listing/components/ImageGenerator/LetterGenerator';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import Utils from 'AppData/Utils';
import { getBasePath } from 'AppComponents/Shared/Utils';

const PREFIX = 'DefThumbClassic';

const classes = {
    card: `${PREFIX}-card`,
    apiDetails: `${PREFIX}-apiDetails`,
    apiActions: `${PREFIX}-apiActions`,
    thumbHeader: `${PREFIX}-thumbHeader`,
    textTruncate: `${PREFIX}-textTruncate`,
    row: `${PREFIX}-row`,
    textWrapper: `${PREFIX}-textWrapper`,
    chip: `${PREFIX}-chip`,
    suppressLinkStyles: `${PREFIX}-suppressLinkStyles`,
};

const StyledCard = styled(Card)(({ theme }) => ({
    [`&.${classes.card}`]: {
        width: '300px',
        height: 'fit-content',
        margin: theme.spacing(1),
        borderRadius: theme.spacing(1),
        transition: 'box-shadow 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
    },

    [`& .${classes.apiDetails}`]: {
        padding: theme.spacing(1.5),
        paddingBottom: 0,
        gap: theme.spacing(2),
        display: 'flex',
        flex: 1,
    },

    [`& .${classes.apiActions}`]: {
        justifyContent: 'space-between',
        padding: `8px 12px ${theme.spacing(1)} 12px`,
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
    },

    [`& .${classes.suppressLinkStyles}`]: {
        textDecoration: 'none',
        color: 'inherit',
    },
}));

const DefThumbClassic = (props) => {
    const { def } = props;
    const [isHover, setIsHover] = useState(false);

    let apiNameLabel = 'API Name';
    if (def.associatedType === 'APIProduct') {
        apiNameLabel = 'API Product Name';
    } else if (def.associatedType === 'MCP') {
        apiNameLabel = 'MCP Name';
    }

    const toggleMouseOver = (event) => {
        setIsHover(event.type === 'mouseover');
    };

    const linkTo = getBasePath(def.associatedType) + def.apiUUID + '/api-definition';

    return (
        <StyledCard
            onMouseOver={toggleMouseOver}
            onFocus={toggleMouseOver}
            onMouseOut={toggleMouseOver}
            onBlur={toggleMouseOver}
            elevation={isHover ? 4 : 1}
            className={classes.card}
            data-testid={'def-card-' + def.name}
        >
            <Link to={linkTo} className={classes.suppressLinkStyles}>
                <CardContent className={classes.apiDetails} style={{ padding: '12px' }}>
                    <div
                        style={{
                            position: 'relative',
                            width: 100,
                            height: 100,
                        }}
                    >
                        <CardMedia
                            width={100}
                            component={LetterGenerator}
                            height={100}
                            title='Thumbnail'
                            artifact={{ name: 'Def' }}
                            charLength={3}
                            customLightColor='#366FB1'
                            customDarkColor='#032E61'
                            ThumbIcon={(iconProps) => (
                                <CustomIcon icon='api-definition' width={40} height={40} {...iconProps} />
                            )}
                        />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div className={classes.textWrapper}>
                            <Tooltip title={def.name} arrow>
                                <Typography variant='h6' className={classes.thumbHeader} id={def.name} noWrap>
                                    {def.name}
                                </Typography>
                            </Tooltip>
                        </div>
                        <div className={classes.row}>
                            <Typography variant='caption' gutterBottom align='left' noWrap>
                                <FormattedMessage id='by' defaultMessage='By' />
                                &nbsp;
                                <Tooltip title={def.apiProvider} arrow>
                                    <span>{def.apiProvider}</span>
                                </Tooltip>
                            </Typography>
                        </div>
                        <div className={classes.row}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 0.65, overflow: 'hidden' }}>
                                <Tooltip title={def.apiName} arrow>
                                    <Typography variant='body1' noWrap>
                                        {def.apiDisplayName || def.apiName}
                                    </Typography>
                                </Tooltip>
                                <Typography variant='caption' component='p' color='text.disabled' lineHeight={1}>
                                    {apiNameLabel}
                                </Typography>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 0.35, overflow: 'hidden' }}>
                                <Tooltip title={def.apiVersion} arrow>
                                    <Typography variant='body1' noWrap>
                                        {def.apiVersion}
                                    </Typography>
                                </Tooltip>
                                <Typography variant='caption' component='p' color='text.disabled' lineHeight={1}>
                                    Version
                                </Typography>
                            </div>
                        </div>
                        <div className={classes.row} style={{ marginTop: '8px' }}>
                            <Chip
                                size='small'
                                classes={{ root: classes.chip }}
                                label='DEFINITION'
                                color='primary'
                                variant='outlined'
                            />
                        </div>
                    </div>
                </CardContent>
            </Link>
            <Divider sx={{ marginLeft: 1.5, marginRight: 1.5 }} />
            <CardActions className={classes.apiActions}>
                <Box
                    display='flex'
                    alignItems='center'
                    gap={0.5}
                    sx={{ marginTop: '8px', marginBottom: '8px' }}
                >
                    <AccessTimeIcon fontSize='small' sx={{ color: 'text.disabled' }} />
                    <Typography variant='caption' color='textSecondary'>
                        {Utils.formatUpdatedTime(def.updatedTime)}
                    </Typography>
                </Box>
            </CardActions>
        </StyledCard>
    );
};

DefThumbClassic.propTypes = {
    def: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        apiName: PropTypes.string.isRequired,
        apiVersion: PropTypes.string.isRequired,
        apiUUID: PropTypes.string.isRequired,
        associatedType: PropTypes.string.isRequired,
        provider: PropTypes.string,
    }).isRequired,
};

export default DefThumbClassic;
