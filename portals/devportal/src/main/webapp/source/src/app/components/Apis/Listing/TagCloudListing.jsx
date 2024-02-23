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
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import API from 'AppData/api';
import TagCloudListingTags from './TagCloudListingTags';
import CustomIcon from '../../Shared/CustomIcon';

const PREFIX = 'TagCloudListing';

const classes = {
    appBar: `${PREFIX}-appBar`,
    mainIconWrapper: `${PREFIX}-mainIconWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    mainTitleWrapper: `${PREFIX}-mainTitleWrapper`,
    content: `${PREFIX}-content`,
    listContentWrapper: `${PREFIX}-listContentWrapper`,
    iconDefault: `${PREFIX}-iconDefault`,
};

const Root = styled('main')((
    {
        theme,
    },
) => ({
    [`& .${classes.appBar}`]: {
        height: 70,
        background: theme.custom.infoBar.background,
        color: theme.palette.getContrastText(theme.custom.infoBar.background),
        borderBottom: 'solid 1px ' + theme.palette.grey.A200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    [`& .${classes.mainIconWrapper}`]: {
        paddingTop: 13,
        paddingLeft: 20,
        paddingRight: 20,
    },

    [`& .${classes.mainTitle}`]: {
        paddingTop: 10,
    },

    [`& .${classes.mainTitleWrapper}`]: {
        flexGrow: 1,
    },

    [`&.${classes.content}`]: {
        flexGrow: 1,
    },

    [`& .${classes.listContentWrapper}`]: {
        padding: `0 ${theme.spacing(3)}`,
    },

    [`& .${classes.iconDefault}`]: {
        color: theme.palette.getContrastText(theme.custom.infoBar.background),
    },
}));

/**
 * Renders tag cloud.
 * @returns {JSX} Tag cloud listing.
 */
export default function TagCloudListing() {
    const theme = useTheme();
    const [allTags, setAllTags] = useState(null);
    useEffect(() => {
        const restApiClient = new API();
        const promisedTags = restApiClient.getAllTags();
        promisedTags
            .then((response) => {
                setAllTags(response.body.list);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);
    const strokeColorMain = theme.palette.getContrastText(theme.palette.background.paper);

    return (
        <Root className={classes.content}>
            <div className={classes.appBar}>
                <div className={classes.mainIconWrapper}>
                    <CustomIcon strokeColor={strokeColorMain} width={42} height={42} icon='api' />
                </div>
                <div className={classes.mainTitleWrapper}>
                    <Typography variant='h4' className={classes.mainTitle}>
                        <FormattedMessage
                            defaultMessage='API Groups'
                            id='Apis.Listing.TagCloudListing.apigroups.main'
                        />
                    </Typography>
                </div>
            </div>
            <div className={classes.listContentWrapper}>
                {allTags && <TagCloudListingTags allTags={allTags} mainPage />}
            </div>
        </Root>
    );
}
