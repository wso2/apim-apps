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
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import UsageIcon from '@material-ui/icons/List';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import API from 'AppData/api';
import CertificateUsageViewAPI from './CertificateUsageViewAPI';

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
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [usage, setUsage] = useState( []);
    const { certAlias } = props;

    useEffect(() => {
        API.getEndpointCertificateUsage(certAlias).then((response) => {
            setUsage(response.body.list);
            console.log(response.body.list);
        });
    }, []);

    const handleUsageOpen = () => {
        setOpen(true);
    };

    const handleUsageCancel = () => {
        setOpen(false);
    };

    const dialogTitle = (
        <div className={classes.root}>
            <Typography compnent='div' variant='h5' className={classes.usageDialogHeader}>
                <FormattedMessage
                    id='Scopes.Usage.Usage.usage'
                    defaultMessage='Usages of certificate - '
                />
            </Typography>
            <Typography compnent='div' variant='h5' className={classes.usageDialogHeader}>
                {certAlias}
            </Typography>
        </div>
    );
    const dialogContent = (
        <CertificateUsageViewAPI certUsage={usage} />
    );

    return (
        <div>
            <Button onClick={handleUsageOpen} >
                <UsageIcon />
                <FormattedMessage
                    id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.usage'
                    defaultMessage='Usage'
                />
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
                            id='Scopes.Usage.Usage.usage.cancel'
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
