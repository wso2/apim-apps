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

import React from 'react';
import { styled } from '@mui/material/styles';
import StarRate from '@mui/icons-material/StarRate';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';

const PREFIX = 'StarRatingSummary';

const classes = {
    starRate: `${PREFIX}-starRate`,
    userRating: `${PREFIX}-userRating`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.starRate}`]: {
        marginRight: theme.spacing(),
        color: theme.custom.infoBar.starColor || theme.palette.getContrastText(theme.custom.infoBar.background),
        '&.material-icons': {
            fontSize: 30,
        },
    },

    [`& .${classes.userRating}`]: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
}));

/**
 *
 * @param {JSON} props props passed from parent
 * @returns {JSX} summary of the rating
 */
function StarRatingSummary(props) {
    const {
        avgRating, reviewCount, returnCount,
    } = props;
    const theme = useTheme();
    return (
        <Root>
            {returnCount > 0 ? (
                <>
                    <Icon className={classes.starRate}>star</Icon>
                    <div className={classes.ratingSummary}>
                        <div aria-label='User rating' className={classes.userRating}>
                            <Typography variant='body1'>{avgRating}</Typography>
                            <Typography aria-label='out of five' variant='body1'>/5.0</Typography>
                        </div>
                        <Typography aria-label='Number of users who has rated' variant='body1' gutterBottom align='left'>
                            {reviewCount}
                            {' '}
                            {reviewCount === 1 ? (
                                <FormattedMessage defaultMessage='user' id='Apis.Details.StarRatingSummary.user' />
                            ) : (
                                <FormattedMessage defaultMessage='users' id='Apis.Details.StarRatingSummary.users' />
                            )}
                        </Typography>
                    </div>
                </>
            ) : (
                <>
                    <StarRate className={classes.starRate} style={{ color: theme.palette.grey.A200 }} />
                    <div className={classes.ratingSummary}>
                        <Typography variant='caption' gutterBottom align='left'>
                            <FormattedMessage defaultMessage='Not Rated' id='Apis.Details.StarRatingSummary.not.rated' />
                        </Typography>
                    </div>
                </>
            )}
        </Root>
    );
}

export default (StarRatingSummary);
