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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
    CardActions, Chip, Divider, Tooltip, useTheme,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { FormattedMessage } from 'react-intl';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import { getBasePath } from 'AppUtils/utils';
import LetterGenerator from './LetterGenerator';

const PREFIX = 'DocThumb';

const classes = {
    root: `${PREFIX}-root`,
    media: `${PREFIX}-media`,
    content: `${PREFIX}-content`,
    actions: `${PREFIX}-actions`,
    header: `${PREFIX}-header`,
    info: `${PREFIX}-info`,
    apiName: `${PREFIX}-apiName`,
    version: `${PREFIX}-version`,
    subtitle: `${PREFIX}-subtitle`,
    row: `${PREFIX}-row`,
    chip: `${PREFIX}-chip`,
    suppressLinkStyles: `${PREFIX}-suppressLinkStyles`,
};

const StyledCard = styled(Card)(({ theme }) => ({
    [`&.${classes.root}`]: {
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
    [`& .${classes.content}`]: {
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
    [`& .${classes.actions}`]: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1),
    },
    [`& .${classes.header}`]: {
        cursor: 'pointer',
        fontWeight: 600,
        lineHeight: '1.3',
    },
    [`& .${classes.info}`]: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    [`& .${classes.apiName}`]: {
        flex: 1,
    },
    [`& .${classes.version}`]: {
        flex: 1,
        textAlign: 'right',
    },
    [`& .${classes.subtitle}`]: {
        color: theme.palette.grey[600],
        fontSize: '0.75rem',
    },
    [`& .${classes.row}`]: {
        display: 'flex',
        gap: theme.spacing(0.75),
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
        display: 'block',
    },
}));

const DocThumb = ({ doc }) => {
    const [state] = useState({
        category: null,
        selectedIcon: null,
        color: null,
        backgroundIndex: null,
        imageObj: null,
    });

    const theme = useTheme();
    const {
        id, name, apiUUID, apiName, apiDisplayName, apiVersion, apiProvider, associatedType,
    } = doc;
    const detailsLink = getBasePath(associatedType) + apiUUID + '/documents/' + id + '/details';

    useEffect(() => {
        return () => {
            if (state.imageObj) {
                window.URL.revokeObjectURL(state.imageObj);
            }
        };
    }, [state.imageObj]);

    return (
        <StyledCard className={classes.root}>
            <Link className={classes.suppressLinkStyles} to={detailsLink} area-label={'Go to ' + name}>
                <CardContent className={classes.content}>
                    <div style={{ position: 'relative', height: 'fit-content' }}>
                        {theme.custom.thumbnail.defaultApiImage ? (
                            <CardMedia image={theme.custom.thumbnail.defaultApiImage} title='Document Image' />
                        ) : (
                            <CardMedia
                                width={theme.custom.thumbnail.width}
                                component={LetterGenerator}
                                height={100}
                                title='Document Thumbnail'
                                artifact={{ name: 'Doc' }}
                                charLength={3}
                                customLightColor='#366FB1'
                                customDarkColor='#032E61'
                                ThumbIcon={(iconProps) => (
                                    <CustomIcon icon='documentation' width={40} height={40} {...iconProps} />
                                )}
                            />
                        )}
                    </div>

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <Tooltip title={name} arrow>
                            <Typography className={classes.header} variant='h6' component='h2' noWrap>
                                {name}
                            </Typography>
                        </Tooltip>
                        <div className={classes.row}>
                            <Typography variant='caption' align='left' gutterBottom noWrap>
                                <FormattedMessage defaultMessage='By' id='Apis.Listing.DocThumb.by' />
                                <FormattedMessage defaultMessage=':' id='Apis.Listing.DocThumb.by.colon' />
                                &nbsp;
                                <Tooltip title={apiProvider} arrow>
                                    {apiProvider}
                                </Tooltip>
                            </Typography>
                        </div>
                        <div className={classes.row}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: 0.6,
                                    overflow: 'hidden',
                                }}
                            >
                                <Tooltip title={apiName} arrow>
                                    <Typography variant='body1' noWrap>
                                        {apiDisplayName || apiName}
                                    </Typography>
                                </Tooltip>
                                <Typography variant='caption' component='p' lineHeight={1}>
                                    { associatedType === 'MCP' ? (
                                        <FormattedMessage
                                            defaultMessage='MCP Name'
                                            id='Apis.Listing.DocThumb.mcpName'
                                        />
                                    ) : (
                                        <FormattedMessage
                                            defaultMessage='API Name'
                                            id='Apis.Listing.DocThumb.apiName'
                                        />
                                    ) }
                                </Typography>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: 0.4,
                                    overflow: 'hidden',
                                }}
                            >
                                <Tooltip title={apiVersion} arrow>
                                    <Typography variant='body1' noWrap>
                                        {apiVersion}
                                    </Typography>
                                </Tooltip>
                                <Typography variant='caption' lineHeight={1} component='p'>
                                    <FormattedMessage
                                        defaultMessage='API Version'
                                        id='Apis.Listing.DocThumb.apiVersion'
                                    />
                                </Typography>
                            </div>
                        </div>
                        <div className={classes.row} style={{ marginTop: '8px' }}>
                            <Chip
                                size='small'
                                classes={{ root: classes.chip }}
                                label='DOCUMENT'
                                color='primary'
                                variant='outlined'
                            />
                        </div>
                    </div>
                </CardContent>
                <Divider sx={{ marginLeft: 1.5, marginRight: 1.5 }} />
                <CardActions style={{ padding: '18px 12px' }} />
            </Link>
        </StyledCard>
    );
};

DocThumb.propTypes = {
    doc: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        apiName: PropTypes.string,
        apiDisplayName: PropTypes.string,
        apiVersion: PropTypes.string,
        apiUUID: PropTypes.string,
        apiProvider: PropTypes.string,
    }).isRequired,
};

export default DocThumb;
