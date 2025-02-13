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

const PREFIX = 'DefinitionThumb';

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
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.3s ease',
        '&:hover': {
            backgroundColor: theme.palette.grey[300],
        },
    },
    [`& .${classes.media}`]: {
        height: 200,
    },
    [`& .${classes.content}`]: {
        flexGrow: 1,
        paddingBottom: theme.spacing(1),
    },
    [`& .${classes.actions}`]: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(1),
    },
    [`& .${classes.header}`]: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
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

const DefinitionThumb = ({ def }) => {
    const [state] = useState({
        category: null,
        selectedIcon: null,
        color: null,
        backgroundIndex: null,
        imageObj: null,
    });

    const theme = useTheme();
    const history = useHistory();
    const detailsLink = `/apis/${def.apiUUID}/overview`;
    const {
        name, apiName, apiVersion,
    } = def;
    const {
        category, selectedIcon, color, backgroundIndex,
    } = state;

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
                    title='API Definition Image'
                />
            ) : (
                <ImageGenerator
                    width={theme.custom.thumbnail.width}
                    height={140}
                    api={def}
                    fixedIcon={{
                        key: selectedIcon,
                        color,
                        backgroundIndex,
                        category,
                        def,
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
                        <FormattedMessage defaultMessage='API Name' id='Apis.Listing.DefThumb.apiName' />
                    </Typography>
                    <Typography className={classes.subtitle} style={{ textAlign: 'right' }}>
                        <FormattedMessage defaultMessage='API Version' id='Apis.Listing.DefThumb.apiVersion' />
                    </Typography>
                </div>
            </CardContent>
        </StyledCard>
    );
};

DefinitionThumb.propTypes = {
    def: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        apiName: PropTypes.string,
        apiVersion: PropTypes.string,
        apiContext: PropTypes.string,
        apiUUID: PropTypes.string,
        apiProvider: PropTypes.string,
        apiType: PropTypes.string,
    }).isRequired,
};

export default DefinitionThumb;
