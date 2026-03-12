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

/**
 * Renders the application management view with support for:
 * - Displaying a paginated and searchable list of applications.
 * - Filtering applications by name or owner.
 * - Changing the application owner.
 * - Upgrading legacy applications from opaque tokens to JWT-based tokens.
 *
 * @returns {JSX.Element} The rendered component with tabs for changing owner and upgrading tokens.
 */
export default function ListApplications() {
    const intl = useIntl();
    const [loading, setLoading] = useState(false);
    const [applicationList, setApplicationList] = useState(null);
    const [totalApps, setTotalApps] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    /**
     * Fetches a paginated list of applications from the API.
     *
     * @param {number} pageNo - The current page number (0-indexed).
     * @param {string} [user=searchQuery] - Optional filter by application owner.
     * @param {string} [name=searchQuery] - Optional filter by application name.
     * @returns {Promise<Array>} A promise resolving to the list of applications.
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

    /**
     * Handles page change in the paginated table.
     *
     * @param {React.MouseEvent} event - The page change event.
     * @param {number} pageNo - The new page number.
     */
    function handleChangePage(event, pageNo) {
        setPage(pageNo);
        apiCall(pageNo).then((result) => {
            setApplicationList(result);
        });
    }

    /**
     * Handles change in rows per page for the paginated table.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - The change event.
     */
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

    /**
     * Clears the search input and reloads the full application list.
     */
    function clearSearch() {
        setPage(0);
        setSearchQuery('');
        apiCall(page, '', '').then((result) => {
            setApplicationList(result);
        });
    }

    /**
     * Handles search input change.
     * Clears search if input is empty, otherwise updates search query state.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - The change event from the search input.
     */
    function setQuery(event) {
        const newQuery = event.target.value;
        if (newQuery === '') {
            clearSearch();
        } else {
            setSearchQuery(newQuery);
        }
    }

    /**
     * Filters applications based on the current search query.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - Form submission event.
     */
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

    /**
     * Calculates the elapsed time between the current date and a given date.
     *
     * @param {string|Date} fromTime - The past date to compare with the current date.
     * @returns {string} Human-readable time difference (e.g., "2 years 3 months").
     */
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
            {intl.formatMessage({
                defaultMessage: 'You have legacy applications using opaque access tokens that were created over '
                + ' {timeAgo} ago. Support for opaque access tokens will be deprecated. Please upgrade these '
                + ' applications to use JWT-based access tokens.',
                id: 'ApplicationSettings.ListApplications.opaque.token.warning',
            }, { timeAgo })}
            {' '}
            <Link
                href={`${Configurations.app.docUrl}api-security/key-management/tokens/jwt-tokens/`}
                target='_blank'
                rel='noopener noreferre'
            >
                {intl.formatMessage({
                    defaultMessage: 'Learn More…',
                    id: 'ApplicationSettings.ListApplications.learn.more.link',
                })}
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
                title={intl.formatMessage({
                    defaultMessage: 'Change Application Settings',
                    id: 'ApplicationSettings.ListApplications.change.app.settings.title',
                })}
                tabs={tabs}
                warning={warning}
            />
        ) : (
            <ContentBase
                title={intl.formatMessage({
                    defaultMessage: 'Change Application Owner',
                    id: 'ApplicationSettings.ListApplications.change.app.owner.title',
                })}
            >
                <ChangeAppOwner {...childProps} />
            </ContentBase>
        )
    );
}
