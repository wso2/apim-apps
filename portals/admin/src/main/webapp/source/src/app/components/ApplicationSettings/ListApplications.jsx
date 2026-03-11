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
import API from 'AppData/api';
import TabbedContentBase from 'AppComponents/AdminPages/Addons/TabbedContentBase';
import ChangeAppOwner from 'AppComponents/ApplicationSettings/ChangeAppOwner';
import UpgradeTokenType from 'AppComponents/ApplicationSettings/UpgradeTokenType';

export default function ListApplications() {
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

    const tabs = [
        {
            label: 'Change Owner',
            content: <ChangeAppOwner {...childProps} />,
        },
        {
            label: 'Upgrade Token Type',
            content: <UpgradeTokenType {...childProps} />,
        },
    ];

    return (
        <TabbedContentBase
            title='Change Application Settings'
            tabs={tabs}
        />
    );
}
