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

import React, {useEffect, useState} from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {Typography} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import UsageIcon from '@material-ui/icons/List';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import API from 'AppData/api';
import MUIDataTable from "mui-datatables";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = {
    appBar: {
        position: 'relative',
    },
    flex: {
        flex: 1,
    },
    popupHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    splitWrapper: {
        padding: 0,
    },
    docName: {
        alignItems: 'center',
        display: 'flex',
    },
    button: {
        height: 30,
        marginLeft: 30,
    },
};

const useStyles = makeStyles(() => ({
    root: {
        width: '100%',
        flexDirection: 'row',
        display: 'flex',
    },
    usageDialogHeader: {
        fontWeight: '600',
        fontSize: 'h6.fontSize',
        marginRight: 10,
    },
    buttonIcon: {
        marginRight: 10,
    },
}));

/**
 *
 * @param {any} props Props for usage function.
 * @returns {any} Returns the rendered UI for scope usage.
 */
function CertificateUsage(props) {
    const { certAlias } = props;
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [usageData, setUsageData] = useState( []);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [count, setCount] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsage = (alias, limit, offset) => {
        setIsLoading( true);
        API.getEndpointCertificateUsage(alias,limit,offset).then((response) => {
            const {list} = response.body;
            const {pagination} = response.body;
            const usageList = list.map((api) => {
                const usageListItem = [];
                usageListItem.push(api.name);
                usageListItem.push(api.context);
                usageListItem.push(api.version);
                usageListItem.push(api.provider);
                return usageListItem;
            });
            setUsageData(usageList);
            setIsLoading(false);
            setCount(pagination.total);
        });
    }

    useEffect(() => {
        fetchUsage(certAlias,5,0);
    }, []);

    const changePage = (newPage) => {
        const offset = rowsPerPage * newPage;
        fetchUsage(certAlias, rowsPerPage, offset);
        setPage(newPage);
    };

    const changeRowsPerPage = (newRowsPerPage) => {
        let offset = newRowsPerPage * page;
        let newPage;
        if (offset > count) {
            newPage = 0;
        } else if (count - 1 === offset && page !== 0) {
            newPage = page - 1;
        }
        offset = newRowsPerPage * newPage;
        fetchUsage(certAlias, newRowsPerPage, offset);
        setRowsPerPage(newRowsPerPage);
    };

    const handleUsageOpen = () => {
        setOpen(true);
    };

    const handleUsageCancel = () => {
        setOpen(false);
    };

    const columns = [
        'API Name',
        'Context',
        'Version',
        'Provider',
    ];

    const options = {
        filterType: 'multiselect',
        selectableRows: 'none',
        title: false,
        filter: false,
        sort: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: false,
        search: false,
        paginated: true,
        rowsPerPageOptions: [5, 10, 15],
        serverSide: true,
        rowsPerPage,
        count,
        page,
        onChangePage: changePage,
        onChangeRowsPerPage: changeRowsPerPage
    };

    const dialogTitle = (
        <div className={classes.root}>
            <Typography compnent='div' variant='h5' className={classes.usageDialogHeader}>
                <FormattedMessage
                    id='APIs.details.endpoints.certificate.usage'
                    defaultMessage='Usages of certificate - '
                />
                {certAlias}
                {isLoading && (
                    <CircularProgress
                        size={24}
                        style={{ marginLeft: 15, position: "relative", top: 4 }}
                    />
                )}
            </Typography>
        </div>
    );

    const dialogContent = (
        <MUIDataTable title={false} data={usageData} columns={columns} options={options} />
    );

    return (
        <div>
            <Button onClick={handleUsageOpen} >
                <UsageIcon />
            </Button>
            <Dialog onBackdropClick={setOpen} open={open} maxWidth='xl'>
                <DialogTitle>
                    <Typography className={classes.usageDialogHeader}>
                        {dialogTitle}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {dialogContent}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleUsageCancel}>
                        <FormattedMessage
                            id='APIs.details.endpoints.certificate.usage.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
CertificateUsage.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    certAlias: PropTypes.string.isRequired,
    intl: PropTypes.shape({}).isRequired
};

export default injectIntl(withStyles(styles)(CertificateUsage));
