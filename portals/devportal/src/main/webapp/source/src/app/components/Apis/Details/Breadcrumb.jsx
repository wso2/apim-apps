/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useEffect, useState, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import { Link as MUILink } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Box from '@material-ui/core/Box';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
import { useIntl } from 'react-intl';

const useStyles = makeStyles((theme) => {
    const mainBack = theme.custom.infoBar.background || '#ffffff';
    return {
        root: {
            paddingTop: theme.spacing(),
            paddingBottom: theme.spacing(),
            paddingLeft: theme.spacing(3),
            background: mainBack,
            color: theme.palette.getContrastText(mainBack),
            borderBottom: 'solid 1px ' + theme.palette.grey.A200,
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
    };
});

/**
 * @returns {JSX} breadcrumb
 */
export default function Breadcrumb(props) {
    const { api } = useContext(ApiContext);
    const { breadcrumbDocument } = props;
    const classes = useStyles();
    const history = useHistory();
    const intl = useIntl();
    const pages = [
        {
            route: 'overview',
            text: intl.formatMessage({
                defaultMessage: 'Overview',
                id: 'Apis.Details.Breadcrumb.overview',
            }),
        },
        {
            route: 'credentials',
            text: intl.formatMessage({
                defaultMessage: 'Subscriptions',
                id: 'Apis.Details.Breadcrumb.subscriptions',
            }),
        },
        {
            route: 'test',
            text: intl.formatMessage({
                defaultMessage: 'Try Out',
                id: 'Apis.Details.Breadcrumb.try.out',
            }),
        },
        {
            route: 'comments',
            text: intl.formatMessage({
                defaultMessage: 'Comments',
                id: 'Apis.Details.Breadcrumb.comments',
            }),
        },
        {
            route: 'documents',
            text: intl.formatMessage({
                defaultMessage: 'Documents',
                id: 'Apis.Details.Breadcrumb.documents',
            }),
        },
        {
            route: 'sdk',
            text: intl.formatMessage({
                defaultMessage: 'SDKs',
                id: 'Apis.Details.Breadcrumb.sdks',
            }),
        },
    ];

    const [selected, setSelected] = useState(pages[0]);

    const detectCurrentMenu = (location = null) => {
        let locationLocal = location;
        if (!locationLocal) {
            locationLocal = window.location;
        }
        const { pathname } = locationLocal;
        for (let i = 0; i < pages.length; i++) {
            const test1 = new RegExp('/' + pages[i].route + '$', 'g');
            const test2 = new RegExp('/' + pages[i].route + '/', 'g');
            if (pathname.match(test1) || pathname.match(test2)) {
                setSelected(pages[i]);
            }
        }
    };
    useEffect(() => {
        detectCurrentMenu();
    }, []);
    history.listen((location) => {
        detectCurrentMenu(location);
    });
    return (
        <div className={classes.root}>
            <Box display='flex' flexDirection='row' alignItems='center'>
                <Typography color='textPrimary' component='h1' variant='h6'>{selected.text}</Typography>
                <VerticalDivider height={15} />
                <Breadcrumbs separator={<NavigateNextIcon fontSize='small' />} aria-label='breadcrumb'>
                    <MUILink color='textPrimary' to={'/apis/' + api.id + '/overview'} component={Link}>
                        {api.name}
                    </MUILink>
                    { (selected.route === 'documents' && document) && (
                        <MUILink color='textPrimary' to={'/apis/' + api.id + '/documents/default'} component={Link}>
                            {selected.text}
                        </MUILink>
                    ) }
                    { (selected.route === 'documents' && !document) && <Typography color='textPrimary'>{selected.text}</Typography> }
                    { (selected.route === 'documents' && document) && <Typography color='textPrimary'>{breadcrumbDocument}</Typography> }
                    { (selected.route !== 'documents') && <Typography color='textPrimary'>{selected.text}</Typography> }
                </Breadcrumbs>
            </Box>

        </div>
    );
}
