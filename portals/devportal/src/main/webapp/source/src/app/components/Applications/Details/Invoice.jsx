/*
 * Copyright (c), WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MUIDataTable from 'mui-datatables';
import Icon from '@mui/material/Icon';
import { FormattedMessage } from 'react-intl';
import Subscription from 'AppData/Subscription';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

const PREFIX = 'Invoice';

const classes = {
    dialogWrapper: `${PREFIX}-dialogWrapper`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.dialogWrapper}`]: {
        '& span,& p , & h5, & label, & td, & li': {
            color: theme.palette.getContrastText(theme.palette.background.paper),
        },
        '& div, & input, & p.MuiFormHelperText-root': {
            color: theme.palette.getContrastText(theme.palette.background.paper),
        },
    },
}));

const columns = ['Name', 'Value'];

const options = {
    filterType: 'checkbox',
    sort: false,
    search: false,
    viewColumns: false,
    filter: false,
    selectableRowsHeader: false,
    selectableRows: 'none',
    pagination: false,
    download: false,
};

/**
 *
 * @param {JSON} props props passed from parent
 * @returns {JSX} jsx output
 */
function Invoice(props) {
    const {
        subscriptionId, tiers,
    } = props;
    const [showPopup, setShowPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [invoice, setInvoice] = useState(null);

    /**
     * Handle the popup for invoice
     */
    const handlePopup = () => {
        setShowPopup(true);
        setInvoice(null);
        const client = new Subscription();
        const promiseInvoice = client.getMonetizationInvoice(subscriptionId);
        promiseInvoice.then((response) => {
            if (response && response.obj) {
                const invoiceData = [];
                const { obj: { properties } } = response;
                Object.keys(properties).forEach((invoiveItem) => {
                    const insideArray = [];
                    insideArray.push(invoiveItem);
                    insideArray.push(properties[invoiveItem]);
                    invoiceData.push(insideArray);
                });
                setInvoice(invoiceData);
            }
        }).catch((error) => {
            console.error(error);
            setShowErrorPopup(true);
        });
    };

    /**
     * Handle closing the popup for invoice
     */
    const handleClose = () => {
        setShowPopup(false);
    };

    const handleAlertClose = () => {
        setShowErrorPopup(false);
    };

    return (
        <Root>
            <Button
                color='grey'
                onClick={handlePopup}
                startIcon={<Icon>receipt</Icon>}
                disabled={tiers.length === 0}
            >
                <FormattedMessage
                    id='Applications.Details.Invoice.view.btn'
                    defaultMessage='View Invoice'
                />
            </Button>
            {invoice ? (
                <Dialog
                    open={showPopup}
                    onClose={handleClose}
                    fullWidth='true'
                    className={classes.dialogWrapper}
                >
                    {invoice && (
                        <MUIDataTable
                            title='Upcoming Invoice'
                            data={invoice}
                            columns={columns}
                            options={options}
                        />
                    )}
                </Dialog>
            ) : (
                <Dialog
                    open={showErrorPopup}
                    onClose={handleAlertClose}
                    fullWidth='true'
                    className={classes.dialogWrapper}
                >
                    <DialogTitle>
                        <FormattedMessage
                            id='Applications.Details.Invoice.no.data.available'
                            defaultMessage='No Data Available'
                        />
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id='invoice-dialog-description'>
                            <FormattedMessage
                                id='Applications.Details.Invoice.pending.invoice.data'
                                defaultMessage='Pending invoice data not found for this subscription.'
                            />

                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleAlertClose} color='primary'>
                            <FormattedMessage
                                id='Applications.Details.Invoice.close'
                                defaultMessage='Close'
                            />

                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Root>
    );
}
Invoice.defaultProps = {
    tiers: [],
};
Invoice.propTypes = {
    subscriptionId: PropTypes.string.isRequired,
    tiers: PropTypes.arrayOf(PropTypes.string),
};

export default (Invoice);
