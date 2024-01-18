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
import { styled } from '@mui/material/styles';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import EditApplication from 'AppComponents/ApplicationSettings/EditApplication';
import PropTypes from 'prop-types';

const PREFIX = 'AppsTableContent';

const classes = {
    head: `${PREFIX}-head`,
    body: `${PREFIX}-body`,
    root: `${PREFIX}-root`,
    root2: `${PREFIX}-root2`,
    fullHeight: `${PREFIX}-fullHeight`,
    tableRow: `${PREFIX}-tableRow`,
    appOwner: `${PREFIX}-appOwner`,
    appName: `${PREFIX}-appName`,
    appTablePaper: `${PREFIX}-appTablePaper`,
    tableCellWrapper: `${PREFIX}-tableCellWrapper`,
};

const StyledTableBody = styled(TableBody)(({ theme }) => ({
    [`&.${classes.fullHeight}`]: {
        height: '100%',
    },

    [`& .${classes.tableRow}`]: {
        height: theme.spacing(5),
        '& td': {
            padding: theme.spacing(0.5),
        },
    },

    [`& .${classes.appOwner}`]: {
        pointerEvents: 'none',
    },

    [`& .${classes.appName}`]: {
        '& a': {
            color: '#1b9ec7 !important',
        },
    },

    [`& .${classes.appTablePaper}`]: {
        '& table tr td': {
            paddingLeft: theme.spacing(1),
        },
        '& table tr td:first-child, & table tr th:first-child': {
            paddingLeft: theme.spacing(2),
        },
        '& table tr td button.Mui-disabled span.material-icons': {
            color: theme.palette.action.disabled,
        },
    },

    [`& .${classes.tableCellWrapper}`]: {
        '& td': {
            'word-break': 'break-all',
            'white-space': 'normal',
        },
    },
}));

const StyledTableCell = TableCell;

const StyledTableRow = TableRow;

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
            <StyledTableBody className={classes.fullHeight}>
                {apps && apps.map((app) => {
                    return (
                        <StyledTableRow
                            className={classes.tableRow}
                            key={app.applicationId}
                            classes={{
                                root: classes.root2,
                            }}
                        >
                            <StyledTableCell
                                align='left'
                                classes={{
                                    head: classes.head,
                                    body: classes.body,
                                    root: classes.root,
                                }}
                            >
                                {app.name}
                            </StyledTableCell>
                            <StyledTableCell
                                align='left'
                                classes={{
                                    head: classes.head,
                                    body: classes.body,
                                    root: classes.root,
                                }}
                            >
                                {app.owner}
                            </StyledTableCell>
                            <StyledTableCell
                                align='left'
                                classes={{
                                    head: classes.head,
                                    body: classes.body,
                                    root: classes.root,
                                }}
                            >
                                <EditApplication
                                    dataRow={app}
                                    updateList={apiCall}
                                    {...editComponentProps}
                                />
                            </StyledTableCell>
                        </StyledTableRow>
                    );
                })}
            </StyledTableBody>
        );
    }
}
AppsTableContent.propTypes = {
    toggleDeleteConfirmation: PropTypes.func.isRequired,
    apps: PropTypes.instanceOf(Map).isRequired,
};
export default (AppsTableContent);
