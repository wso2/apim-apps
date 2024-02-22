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

import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import ServiceCatalog from 'AppData/ServiceCatalog';
import { Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';

/**
* Service Catalog service usages
* @param {any} props Props for usage of a service in APIs.
* @returns {any} Returns the rendered UI for service usage in APIs.
*/
function Usages(props) {
    const [open, setOpen] = useState(false);
    const [usage, setUsage] = useState(null);
    const toggleOpen = () => {
        setOpen(!open);
    };
    const {
        serviceDisplayName,
        serviceId,
        usageNumber,
        isOverview,
        classes,
    } = props;

    useEffect(() => {
        const settingPromise = ServiceCatalog.getAPIUsages(serviceId);
        settingPromise.then((response) => {
            const { list } = response;
            setUsage(list);
        });
    }, []);

    const handleCancel = () => {
        setOpen(!open);
    };

    const handleClose = () => {
        setOpen(false);
    };

    if (usageNumber > 0 && !usage) {
        return <CircularProgress />;
    }

    let usageDisplayText = null;

    if (usageNumber !== 0) {
        if (!isOverview) {
            usageDisplayText = (
                <Button
                    onClick={toggleOpen}
                    style={{ backgroundColor: 'transparent' }}
                    disableRipple
                    color='primary'
                >
                    {usageNumber !== null ? usageNumber : 0}
                </Button>
            );
        } else {
            usageDisplayText = (
                <Button
                    className={classes.apiUsageStyle}
                    style={{ backgroundColor: 'transparent', marginLeft: -3 }}
                    disableRipple
                    color='primary'
                    onClick={toggleOpen}
                >
                    <Typography color='primary'>
                        <FormattedMessage
                            id='ServiceCatalog.Listing.Usages.service.usage'
                            defaultMessage='Used by {usage} API(s)'
                            values={{ usage: usageNumber !== null ? usageNumber : 0 }}
                        />
                    </Typography>
                </Button>
            );
        }
    } else if (!isOverview) {
        usageDisplayText = (
            <Button disabled>
                {usageNumber !== null ? usageNumber : 0}
            </Button>
        );
    } else {
        usageDisplayText = (
            <Typography className={classes.apiUsageStyle}>
                <FormattedMessage
                    id='ServiceCatalog.Listing.Usages.service.usage'
                    defaultMessage='Used by {usage} API(s)'
                    values={{ usage: usageNumber }}
                />
            </Typography>
        );
    }

    return (
        <>
            {usageDisplayText}
            {usage && (
                <Dialog open={open} onClose={handleClose} maxWidth='xl'>
                    <DialogTitle>
                        <Typography variant='h6'>
                            <FormattedMessage
                                id='ServiceCatalog.Listing.Usages.usage'
                                defaultMessage='Usages of {serviceName}'
                                values={{ serviceName: serviceDisplayName }}
                            />
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Table style={{ minWidth: '450px' }} stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <b>
                                            <FormattedMessage
                                                id='ServiceCatalog.Listing.Usages.api.name'
                                                defaultMessage='API Name'
                                            />
                                        </b>
                                    </TableCell>
                                    <TableCell>
                                        <b>
                                            <FormattedMessage
                                                id='ServiceCatalog.Listing.Usages.api.context'
                                                defaultMessage='Context'
                                            />
                                        </b>
                                    </TableCell>
                                    <TableCell>
                                        <b>
                                            <FormattedMessage
                                                id='ServiceCatalog.Listing.Usages.api.version'
                                                defaultMessage='Version'
                                            />
                                        </b>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usage.map((api) => (
                                    <TableRow>
                                        <TableCell>
                                            <Link
                                                to={'/apis/' + api.id + '/overview'}
                                            >
                                                <span>{api.name}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <span>{api.context}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span>{api.version}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancel} color='primary'>
                            <FormattedMessage
                                id='ServiceCatalog.Listing.Usages.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
}

Usages.defaultProps = {
    isOverview: false,
};

Usages.propTypes = {
    serviceDisplayName: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    usageNumber: PropTypes.number.isRequired,
    isOverview: PropTypes.string,
};

export default Usages;
