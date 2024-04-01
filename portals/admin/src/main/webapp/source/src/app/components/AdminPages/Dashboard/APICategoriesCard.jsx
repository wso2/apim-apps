/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { FormattedMessage } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import { Card } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CategoryIcon from '@mui/icons-material/Category';
import LaunchIcon from '@mui/icons-material/Launch';
import Progress from 'AppComponents/Shared/Progress';
import API from 'AppData/api';
import Configurations from 'Config';

/**
 * Render progress inside a container centering in the container.
 * @returns {JSX} Loading animation.
 */
export default function APICategoriesCard() {
    const [apiCategoriesList, setApiCategoriesList] = useState();
    const [numberOfCategories, setNumberOfCategories] = useState(0);
    const restApi = new API();

    useEffect(() => {
        restApi.apiCategoriesListGet()
            .then((result) => {
                const allCategoriesList = result.body.list;
                // Slice last 4 api categories (if available) to display to maintain card height
                const displayingList = allCategoriesList.slice(Math.max(allCategoriesList.length - 4, 0));
                setApiCategoriesList(displayingList);
                setNumberOfCategories(allCategoriesList.length);
            })
            .catch(() => {
                setApiCategoriesList([]);
            });
    }, []);

    const noApiCategoriesCard = (
        <Card sx={{ minWidth: 275, minHeight: 270, textAlign: 'center' }}>
            <CardContent>

                <Box>
                    <CategoryIcon color='secondary' style={{ fontSize: 60 }} />
                </Box>

                <Typography sx={{ fontSize: 20, fontWeight: 'fontWeightBold' }} gutterBottom>
                    <FormattedMessage
                        id='Dashboard.apiCategories.noApiCategories.card.title'
                        defaultMessage='API Category based grouping'
                    />
                </Typography>

                <Typography variant='body2' component='p'>
                    <FormattedMessage
                        id='Dashboard.apiCategories.noApiCategories.card.description'
                        values={{
                            learnMoreLink:
    <a
        rel='noopener noreferrer'
        target='_blank'
        href={Configurations.app.docUrl
     + 'develop/customizations/customizing-the-developer-portal/'
     + 'customize-api-listing/categorizing-and-grouping-apis/'
     + 'api-category-based-grouping'}
    >
        Go to Category Documentation
        <LaunchIcon fontSize='inherit' />
    </a>,
                        }}
                        defaultMessage='API categories allow API providers to categorize APIs
                        that have similar attributes. When a categorized API
                        gets published to the Developer Portal, its categories
                        appear as clickable links to the API consumers.
                        The API consumers can use the available API categories
                        to quickly jump to a category of interest. {learnMoreLink}'
                    />
                </Typography>

                <Box mt={3}>
                    <Button
                        size='small'
                        variant='contained'
                        color='primary'
                        component={RouterLink}
                        to='settings/api-categories'
                    >
                        <Typography variant='inherit'>
                            <FormattedMessage
                                id='Dashboard.apiCategories.noApiCategories.card.add.new.link.text'
                                defaultMessage='Add new Category'
                            />
                        </Typography>
                        <LaunchIcon fontSize='inherit' />
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );

    const apiCategoriesListingCard = () => {
        return (
            <Card sx={{ minWidth: 275, minHeight: 270, textAlign: 'center' }} style={{ textAlign: 'left' }}>
                <CardContent>
                    <Box display='flex'>
                        <Box flexGrow={1}>
                            <Typography sx={{ fontSize: 20, fontWeight: 'fontWeightBold' }} gutterBottom>
                                <FormattedMessage
                                    id='Dashboard.apiCategories.apiCategoriesListing.card.title'
                                    defaultMessage='API Categories'
                                />
                            </Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 20, fontWeight: 'fontWeightBold' }} gutterBottom>
                                {numberOfCategories}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ opacity: 0.2 }} />

                    <Box height={170} mt={1} mb={-2}>
                        {apiCategoriesList.map((category) => {
                            return (
                                <Box display='flex' alignItems='center' key={category.name}>
                                    <Box width={50} flexGrow={1} mt={0.5}>
                                        <Typography
                                            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                            variant='subtitle2'
                                        >
                                            {category.name}
                                        </Typography>
                                        <Typography
                                            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                            variant='body2'
                                        >
                                            {category.description || (
                                                <FormattedMessage
                                                    id='Dashboard.apiCategories.apiCategoriesListing.no.description'
                                                    defaultMessage='No description available'
                                                />
                                            )}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant='body2'>
                                            {category.numberOfAPIs}
                                            {' APIs'}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </CardContent>

                <Box m={0.5} display='flex' alignSelf='flex-end' flexDirection='row-reverse'>
                    <Box>
                        <Button
                            size='small'
                            color='primary'
                            component={RouterLink}
                            to='settings/api-categories'
                        >
                            <Typography variant='inherit'>
                                <FormattedMessage
                                    id='Dashboard.apiCategories.apiCategoriesListing.card.view.all.link.text'
                                    defaultMessage='View All'
                                />
                                <LaunchIcon fontSize='inherit' />
                            </Typography>
                        </Button>
                    </Box>
                </Box>
            </Card>
        );
    };

    if (apiCategoriesList) {
        if (apiCategoriesList.length === 0) {
            return noApiCategoriesCard;
        } else {
            return apiCategoriesListingCard();
        }
    } else {
        return <Progress message='Loading Card ...' />;
    }
}
