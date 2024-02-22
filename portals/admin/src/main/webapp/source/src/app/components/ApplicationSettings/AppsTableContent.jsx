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

import React, { Component } from 'react';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import EditApplication from 'AppComponents/ApplicationSettings/EditApplication';
import PropTypes from 'prop-types';

/**
 *
 *
 * @class AppsTableContent
 * @extends {Component}
 */
class AppsTableContent extends Component {
    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            notFound: false,
        };
        this.handleAppEdit = this.handleAppEdit.bind(this);
    }

    handleAppEdit = (app) => {
        const { EditComponent, editComponentProps, apiCall } = this.props;
        return (
            <>
                {EditComponent && (
                    <EditComponent
                        dataRow={app}
                        updateList={apiCall}
                        {...editComponentProps}
                    />
                )}
            </>
        );
    };

    /**
     * @inheritdoc
     * @memberof AppsTableContent
     */
    render() {
        const {
            apps, editComponentProps, apiCall,
        } = this.props;
        const { notFound } = this.state;

        if (notFound) {
            return <ResourceNotFound />;
        }
        return (
            <TableBody
                sx={{
                    height: '100%',
                    '& tr:nth-of-type(odd) td': {
                        backgroundColor: '#f5f5f5',
                    },
                    '& tr:nth-of-type(even) td': {
                        backgroundColor: '#fff',
                    },
                }}
            >
                {apps && apps.map((app) => {
                    return (
                        <TableRow
                            sx={{ height: 5, '& td': { padding: 0.5 } }}
                            key={app.applicationId}
                        >
                            <TableCell align='left'>
                                {app.name}
                            </TableCell>
                            <TableCell align='left'>
                                {app.owner}
                            </TableCell>
                            <TableCell align='left'>
                                <EditApplication
                                    dataRow={app}
                                    updateList={apiCall}
                                    {...editComponentProps}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        );
    }
}
AppsTableContent.propTypes = {
    toggleDeleteConfirmation: PropTypes.func.isRequired,
    apps: PropTypes.instanceOf(Map).isRequired,
};
export default (AppsTableContent);
