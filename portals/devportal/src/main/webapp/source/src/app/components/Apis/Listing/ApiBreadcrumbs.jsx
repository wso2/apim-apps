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
import { styled, useTheme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import Paper from '@mui/material/Paper';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import Icon from '@mui/material/Icon';

const PREFIX = 'ApiBreadcrumbs';

const classes = {
    root: `${PREFIX}-root`,
    link: `${PREFIX}-link`,
    linkNotActive: `${PREFIX}-linkNotActive`,
    icon: `${PREFIX}-icon`,
    selectedTagText: `${PREFIX}-selectedTagText`,
    apiGroup: `${PREFIX}-apiGroup`,
};

const StyledPaper = styled(Paper)((
    {
        theme,
    },
) => ({
    [`&.${classes.root}`]: {
        padding: theme.spacing(1, 3),
    },

    [`& .${classes.link}`]: {
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.linkNotActive}`]: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'default',
    },

    [`& .${classes.icon}`]: {
        marginRight: theme.spacing(0.5),
        width: 20,
        height: 20,
    },

    [`& .${classes.selectedTagText}`]: {
        textIndent: 4,
    },

    [`& .${classes.apiGroup}`]: {
        color: theme.palette.grey[800],
    },
}));

/**
 * Render no api breadcrumb section.
 * @param {JSON} props properties passed down from the parent.
 * @returns {JSX} Api breadcrumb section.
 */
export default function ApiBreadcrumbs(props) {
    const theme = useTheme();
    const { selectedTag } = props;
    return (
        <StyledPaper elevation={0} className={classes.root}>
            <Breadcrumbs aria-label='breadcrumb'>
                <RouterLink
                    to={theme.custom.tagWise.active && theme.custom.tagWise.style === 'page' ? '/api-groups' : '/apis'}
                    className={classes.apiGroup}
                >
                    <Link color='inherit' className={classes.link} underline='hover'>
                        <Icon className={classes.icon}>dynamic_feed</Icon>
                        <FormattedMessage defaultMessage='API Groups' id='Apis.Listing.ApiBreadcrumbs.apigroups.main' />
                    </Link>
                </RouterLink>

                {selectedTag && (
                    <Link color='inherit' className={classes.linkNotActive} underline='hover'>
                        <CustomIcon width={16} height={16} icon='api' />
                        <span className={classes.selectedTagText}>{selectedTag}</span>
                    </Link>
                )}
            </Breadcrumbs>
        </StyledPaper>
    );
}
