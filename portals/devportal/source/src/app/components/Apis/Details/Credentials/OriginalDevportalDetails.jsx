/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You maRefactor code of AsyncApiUIy obtain a copy of the License at
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
import { FormattedMessage } from 'react-intl';
import { Paper, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import LaunchIcon from '@material-ui/icons/Launch';

const OriginalDevportalDetails = (props) => {
    const {
        classes, originalDevPortalUrl,
    } = props;
    return (
        <Paper elevation={0} className={classes.paper}>
            <Typography variant='h5' component='h2'>
                <FormattedMessage
                    id={'Apis.Details.Credentials.OriginalDevportalDetails.'
                    + 'original.developer.portal.title'}
                    defaultMessage='Original Developer Portal'
                />
            </Typography>
            <Link
                target='_blank'
                rel='noopener noreferrer'
                href={originalDevPortalUrl}
                variant='body2'
            >
                <div className={classes.originalDevPortalLink}>
                    <FormattedMessage
                        id='Apis.Details.Credentials.OriginalDevportalDetails.visit.original.developer.portal'
                        defaultMessage='Visit Original Developer Portal'
                    />
                    <LaunchIcon className={classes.launchIcon} />
                </div>
            </Link>
        </Paper>
    );
};

export default OriginalDevportalDetails;
