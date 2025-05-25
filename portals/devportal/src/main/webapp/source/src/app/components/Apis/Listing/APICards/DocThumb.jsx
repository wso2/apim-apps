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
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { FormattedMessage } from 'react-intl';
import ImageGenerator from './ImageGenerator';

const PREFIX = 'DocThumbLegacy';

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
};

const StyledCard = styled(Card)(({ theme }) => ({
    [`&.${classes.root}`]: {
        width: theme.custom.thumbnail.width,
        backgroundColor: '#f5f5f5',
        minHeight: 330,
        margin: theme.spacing(2),
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        '&:hover': {
            backgroundColor: theme.palette.grey[300],
        },
    },
    [`& .${classes.media}`]: {
        height: 200,
    },
    [`& .${classes.content}`]: {
        paddingBottom: theme.spacing(1),
    },
    [`& .${classes.actions}`]: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1),
    },
    [`& .${classes.header}`]: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
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
}));

const DocThumbLegacy = ({ doc }) => {
    const [state] = useState({
        category: null,
        selectedIcon: null,
        color: null,
        backgroundIndex: null,
        imageObj: null,
    });

    const theme = useTheme();
    const history = useHistory();
    const detailsLink = `/apis/${doc.apiUUID}/documents/${doc.id}/details`;
    const {
        category, selectedIcon, color, backgroundIndex,
    } = state;
    const {
        name, sourceType, apiName, apiVersion,
    } = doc;

    useEffect(() => {
        return () => {
            if (state.imageObj) {
                window.URL.revokeObjectURL(state.imageObj);
            }
        };
    }, [state.imageObj]);

    const handleCardClick = () => {
        history.push(detailsLink);
    };

    return (
        <StyledCard className={classes.root} onClick={handleCardClick}>
            {theme.custom.thumbnail.defaultApiImage ? (
                <CardMedia
                    className={classes.media}
                    image={theme.custom.thumbnail.defaultApiImage}
                    title='Document Image'
                />
            ) : (
                <ImageGenerator
                    width={theme.custom.thumbnail.width}
                    height={140}
                    api={doc}
                    fixedIcon={{
                        key: selectedIcon,
                        color,
                        backgroundIndex,
                        category,
                        doc,
                    }}
                />
            )}
            <CardContent className={classes.content}>
                <Typography
                    variant='h5'
                    component='div'
                    className={classes.header}
                    title={name}
                >
                    {name}
                </Typography>
                <Typography variant='caption'>
                    <FormattedMessage defaultMessage='Source Type: ' id='Apis.Listing.DocThumb.sourceType' />
                    {sourceType}
                </Typography>
                <div className={classes.info}>
                    <Typography variant='subtitle1' className={classes.apiName}>
                        {apiName}
                    </Typography>
                    <Typography variant='subtitle1' className={classes.version}>
                        {apiVersion}
                    </Typography>
                </div>
                <div className={classes.info}>
                    <Typography className={classes.subtitle}>
                        <FormattedMessage defaultMessage='API Name' id='Apis.Listing.DocThumb.apiName' />
                    </Typography>
                    <Typography className={classes.subtitle} style={{ textAlign: 'right' }}>
                        <FormattedMessage defaultMessage='API Version' id='Apis.Listing.DocThumb.apiVersion' />
                    </Typography>
                </div>
            </CardContent>
        </StyledCard>
    );
};

DocThumbLegacy.propTypes = {
    doc: PropTypes.shape({
        name: PropTypes.string,
        sourceType: PropTypes.string,
        apiName: PropTypes.string,
        apiVersion: PropTypes.string,
        id: PropTypes.string,
        apiUUID: PropTypes.string,
    }).isRequired,
};

export default DocThumbLegacy;
