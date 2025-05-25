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
import React from 'react';
import { styled } from '@mui/material/styles';
import Icon from '@mui/material/Icon';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

const PREFIX = 'DefThumbPlain';

const classes = {
    root: `${PREFIX}-root`,
    bullet: `${PREFIX}-bullet`,
    title: `${PREFIX}-title`,
    pos: `${PREFIX}-pos`,
    thumbHeader: `${PREFIX}-thumbHeader`,
    contextBox: `${PREFIX}-contextBox`,
    caption: `${PREFIX}-caption`,
    imageDisplay: `${PREFIX}-imageDisplay`
};

const StyledCard = styled(Card)((
    {
        theme
    }
) => ({
    [`&.${classes.root}`]: {
        minWidth: 200,
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
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
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        margin: 0,
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'break-word', 
    },

    [`& .${classes.contextBox}`]: {
        maxWidth: 120,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    [`& .${classes.caption}`]: {
        color: theme.palette.grey[700],
    },

    [`& .${classes.imageDisplay}`]: {
        maxWidth: '40px',
        maxHeight: '40px',
    }
}));

/**
 * Render a thumbnail
 * @param {JSON} props required pros.
 * @returns {JSX} Thumbnail rendered output.
 */
function DefThumbPlain(props) {

    const { def } = props;
    const linkTo = def.associatedType === 'API'
        ? `/apis/${def.apiUUID}/api-definition`
        : `/api-products/${def.apiUUID}/api-definition`;
    return (
        <StyledCard className={classes.root} variant='outlined'>
            <CardContent>
                <Box>
                    <Link to={linkTo} aria-hidden='true'>
                        <Box display='flex'>
                            <Box>
                                <Icon className={classes.icon} style={{ fontSize: 40 + 'px', color: '#ccc' }}>
                                    description
                                </Icon>
                            </Box>
                            <Typography
                                variant='h5'
                                gutterBottom
                                title={def.name}
                                className={classes.thumbHeader}
                            >
                                {def.name}
                            </Typography>
                        </Box>

                    </Link>
                </Box>
                <Box mt={2}>
                    <Typography variant='subtitle1' className={classes.contextBox}>
                        {def.apiName}
                    </Typography>
                    <Typography
                        variant='caption'
                        gutterBottom
                        align='right'
                        className={classes.caption}
                        Component='div'
                    >
                        <FormattedMessage
                            id='Apis.Listing.components.ImageGenerator.DefThumb.apiName'
                            defaultMessage='API Name'
                        />
                    </Typography>
                </Box>
                <Box display='flex' mt={2}>
                    <Box>
                        <Typography variant='subtitle1' align='right' className={classes.contextBox}>
                            {def.apiVersion}
                        </Typography>
                        <Typography
                            variant='caption'
                            gutterBottom
                            align='right'
                            className={classes.caption}
                            Component='div'
                        >
                            <FormattedMessage
                                id='Apis.Listing.components.ImageGenerator.DefThumb.apiVersion'
                                defaultMessage='API Version'
                            />
                        </Typography>
                    </Box>
                </Box>


            </CardContent>
        </StyledCard>
    );
}

export default DefThumbPlain;
