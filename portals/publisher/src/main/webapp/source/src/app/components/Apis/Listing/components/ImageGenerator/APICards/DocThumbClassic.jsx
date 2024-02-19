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
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import LetterGenerator from 'AppComponents/Apis/Listing/components/ImageGenerator/LetterGenerator';
import Configurations from 'Config';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const PREFIX = 'DocThumb';

const classes = {
    card: `${PREFIX}-card`,
    thumbHeader: `${PREFIX}-thumbHeader`
};

const StyledLink = styled(Link)((
    {
        theme
    }
) => ({
    [`& .${classes.card}`]: {
        margin: theme.spacing(3 / 2),
        maxWidth: theme.spacing(32),
        transition: 'box-shadow 0.3s ease-in-out',
    },

    [`& .${classes.thumbHeader}`]: {
        maxWidth: theme.spacing(16),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    
    [`& .${classes.defaultCardContent}`]: {
        height: '111px',
    },

    [`& .${classes.maxCardContent}`]: {
        height: '208px',
    },
    
    [`& .${classes.minCardContent}`]: {
        height: '187px',
    },
}));


const DocThumb = (props) => {
    const { doc } = props;
    const [isHover, setIsHover] = useState(false);
    const toggleMouseOver = () => setIsHover(!isHover);

    let thumbIcon;
    let PrefixIcon = TextFieldsIcon;
    if (doc.sourceType === 'FILE') {
        PrefixIcon = PictureAsPdfIcon;
        thumbIcon = DescriptionTwoToneIcon;
    } else if (doc.sourceType === 'URL') {
        PrefixIcon = LinkIcon;
    }
    let configValue;
    const { tileDisplayInfo } = Configurations.apis;
    if (tileDisplayInfo.showBusinessDetails === true && tileDisplayInfo.showTechnicalDetails === true) {
        configValue = 2;
    } else if (tileDisplayInfo.showBusinessDetails === true || tileDisplayInfo.showTechnicalDetails === true) {
        configValue = 1;
    }
    let cardContentClassName;
    if (configValue === 1) {
        cardContentClassName = classes.minCardContent;
    } else if (configValue === 2) {
        cardContentClassName = classes.maxCardContent;
    } else {
        cardContentClassName = classes.defaultCardContent;
    }
    return (
        <StyledLink
            underline='none'
            component={RouterLink}
            to={'/apis/' + doc.apiUUID + '/documents/' + doc.id + '/details'}
            aria-hidden='true'
            sx={{ border: '2px solid blue'}}
        >
            <Card
                onMouseOver={toggleMouseOver}
                onFocus={toggleMouseOver}
                onMouseOut={toggleMouseOver}
                onBlur={toggleMouseOver}
                elevation={isHover ? 4 : 1}
                className={classes.card}
            >
                <CardMedia
                    width={240}
                    component={LetterGenerator}
                    height={140}
                    title='Thumbnail'
                    artifact={{ name: 'Doc' }}
                    charLength={3}
                    ThumbIcon={thumbIcon}
                    bgColor={false}
                />
                <CardContent className={cardContentClassName}>
                    <Grid
                        container
                        direction='column'
                        justifyContent='space-evenly'
                        alignItems='flex-start'
                    >
                        <Grid item>
                            <Box display='flex' alignItems='center' flexDirection='row' fontFamily='fontFamily'>
                                <Box display='flex'>
                                    <PrefixIcon color='primary' />
                                </Box>
                                <Box
                                    className={classes.thumbHeader}
                                    color='text.primary'
                                    fontSize='h4.fontSize'
                                    ml={1}
                                >
                                    {doc.name}
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box mt={3} fontFamily='fontFamily'>
                                <Box color='primary.main'>
                                    {doc.associatedType}
                                </Box>
                                <Box color='text.primary' fontSize='h6.fontSize'>
                                    {doc.apiName}
                                </Box>
                                <Box color='text.secondary' fontSize='body1.fontSize'>
                                    Version:
                                    {' '}
                                    {doc.apiVersion}
                                </Box>
                            </Box>
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>
        </StyledLink>
    );
};

DocThumb.propTypes = {
    doc: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        sourceType: PropTypes.string.isRequired,
        apiName: PropTypes.string.isRequired,
        apiVersion: PropTypes.string.isRequired,
    }).isRequired,
};
export default DocThumb;
