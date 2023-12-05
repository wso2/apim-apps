/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 LLC. licenses this file to you under the Apache License,
* Version 2.0 (the "License"); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { Component } from 'react';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import { IconButton } from '@material-ui/core';

/**
 * @inheritdoc
 * @param {*} theme theme object
 */
const styles = (theme) => ({
    fullHeight: {
        height: '100%',
    },
    tableRow: {
        height: theme.spacing(5),
        '& td': {
            padding: theme.spacing(0.5),
        },
    },
    appOwner: {
        pointerEvents: 'none',
    },
    appName: {
        '& a': {
            color: '#1b9ec7 !important',
        },
    },
    appTablePaper: {
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
    tableCellWrapper: {
        '& td': {
            'word-break': 'break-all',
            'white-space': 'normal',
        },
    },
});
const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
    root: {
        '&:first-child': {
            paddingLeft: theme.spacing(2),
        },
    },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
}))(TableRow);

/**
 *
 *
 * @class ApisTableContent
 * @extends {Component}
 */
class ApisTableContent extends Component {
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
     * @memberof ApisTableContent
     */
    render() {
        const {
            apis, classes, editComponentProps, apiCall,
        } = this.props;
        const { notFound } = this.state;

        if (notFound) {
            return <ResourceNotFound />;
        }
        return (
            <TableBody className={classes.fullHeight}>
                {apis && apis.map((app) => {
                    return (
                        <StyledTableRow className={classes.tableRow} key={app.apiId}>
                            <StyledTableCell align='left'>
                                {app.name}
                            </StyledTableCell>
                            <StyledTableCell align='left'>{app.version}</StyledTableCell>
                            <StyledTableCell align='left'>
                                {app.provider}
                                {/* <Tooltip title='Change Api Provider'> */}
                                <IconButton color="primary" onClick={()=>console.log("123")}>
                                    <EditIcon aria-label='edit-api-settings' />
                                </IconButton>
                                {/* </Tooltip> */}
                            </StyledTableCell>
                        </StyledTableRow>
                    );
                })}
            </TableBody>
        );
    }
}
ApisTableContent.propTypes = {
    toggleDeleteConfirmation: PropTypes.func.isRequired,
    apis: PropTypes.instanceOf(Map).isRequired,
};
export default withStyles(styles)(ApisTableContent);
