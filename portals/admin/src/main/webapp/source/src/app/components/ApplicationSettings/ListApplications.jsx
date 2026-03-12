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
import { useIntl } from 'react-intl';
import API from 'AppData/api';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import TabbedContentBase from 'AppComponents/AdminPages/Addons/TabbedContentBase';
import ChangeAppOwner from 'AppComponents/ApplicationSettings/ChangeAppOwner';
import UpgradeTokenType from 'AppComponents/ApplicationSettings/UpgradeTokenType';
import Configurations from 'Config';

export default function ListApplications() {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);
    const [applicationList, setApplicationList] = useState(null);
    const [totalApps, setTotalApps] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    /**
    * API call to get application list
    * @returns {Promise}.
    */
    function apiCall(pageNo, user = searchQuery, name = searchQuery) {
        setLoading(true);
        const restApi = new API();
        return restApi
            .getApplicationList({
                limit: rowsPerPage, offset: pageNo * rowsPerPage, user, name,
            })
            .then((result) => {
                setApplicationList(result.body.list);
                const { pagination: { total } } = result.body;
                setTotalApps(total);
                return result.body.list;
            })
            .catch((error) => {
                throw error;
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        apiCall(page).then((result) => {
            setApplicationList(result);
        });
    }, [page]);

    useEffect(() => {
        apiCall(page).then((result) => {
            setApplicationList(result);
        });
    }, [rowsPerPage]);

    function handleChangePage(event, pageNo) {
        setPage(pageNo);
        apiCall(pageNo).then((result) => {
            setApplicationList(result);
        });
    }

    function handleChangeRowsPerPage(event) {
        const nextRowsPerPage = event.target.value;
        const rowsPerPageRatio = rowsPerPage / nextRowsPerPage;
        const nextPage = Math.floor(page * rowsPerPageRatio);
        setPage(nextPage);
        setRowsPerPage(nextRowsPerPage);
        apiCall(page).then((result) => {
            setApplicationList(result);
        });
    }

    function clearSearch() {
        setPage(0);
        setSearchQuery('');
        apiCall(page, '', '').then((result) => {
            setApplicationList(result);
        });
    }

    function setQuery(event) {
        const newQuery = event.target.value;
        if (newQuery === '') {
            clearSearch();
        } else {
            setSearchQuery(newQuery);
        }
    }

    function filterApps(e) {
        e.preventDefault();
        setPage(0);
        apiCall(page).then((result) => {
            setApplicationList(result);
        });
    }
    const childProps = {
        loading,
        applicationList,
        totalApps,
        page,
        rowsPerPage,
        searchQuery,
        apiCall,
        handleChangePage,
        handleChangeRowsPerPage,
        clearSearch,
        setQuery,
        filterApps,
    };

    function getTimeAgo(fromTime) {
        const now = new Date();
        const past = new Date(fromTime);

        let years = now.getFullYear() - past.getFullYear();
        let months = now.getMonth() - past.getMonth();
        let days = now.getDate() - past.getDate();

        if (days < 0) {
            months -= 1;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        if (years > 0) {
            return months > 0
                ? `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`
                : `${years} year${years > 1 ? 's' : ''}`;
        }

        if (months > 0) {
            return `${months} month${months > 1 ? 's' : ''}`;
        }

        return `${days} day${days > 1 ? 's' : ''}`;
    }

    const upgradableApps = applicationList?.filter(
        (app) => app.tokenType !== 'JWT',
    );

    const oldestCreatedTime = upgradableApps?.length
        ? upgradableApps.reduce(
            (oldest, app) => (new Date(app.createdTime) < new Date(oldest) ? app.createdTime : oldest),
            upgradableApps[0].createdTime,
        )
        : null;

    const timeAgo = oldestCreatedTime ? getTimeAgo(oldestCreatedTime) : null;

    const warning = timeAgo ? (
        <>
            You have legacy applications using opaque access tokens that were created over
            {' '}
            {timeAgo}
            {' '}
            ago.
            {' '}
            Support for opaque access tokens will be deprecated. Please upgrade these applications
            to use JWT-based access tokens.
            {' '}
            <Link
                href={`${Configurations.app.docUrl}api-security/key-management/tokens/jwt-tokens/`}
                target='_blank'
                rel='noopener noreferre'
            >
                Learn More…
            </Link>
        </>
    ) : null;

    const tabs = [
        {
            label: 'Change Owner',
            content: <ChangeAppOwner {...childProps} />,
        },
        {
            label: (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                    <WarningAmberIcon sx={{ fontSize: 18, mr: 1 }} />
                    Upgrade Legacy Applications
                </Box>
            ),
            content: <UpgradeTokenType {...childProps} />,
        },
    ];

    return (
        upgradableApps?.length ? (
            <TabbedContentBase
                title='Change Application Settings'
                tabs={tabs}
                warning={warning}
            />
        ) : (
            <ContentBase
                title={intl.formatMessage({
                    defaultMessage: 'Change Application Owner',
                    id: 'Applications.Listing.Listing.title',
                })}
            >
                <ChangeAppOwner {...childProps} />
            </ContentBase>
        )
    );
}
