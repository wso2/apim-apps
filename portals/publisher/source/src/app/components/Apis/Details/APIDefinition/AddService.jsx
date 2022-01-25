/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import Alert from 'AppComponents/Shared/Alert';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import ServiceCatalog from 'AppData/ServiceCatalog';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import API from 'AppData/api.js';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
// import ReactDiffViewer from 'react-diff-viewer';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Link } from 'react-router-dom';


// eslint-disable-next-line valid-jsdoc
/**
 * Renders an Environments list
 * @class Environments
 * @extends {React.Component}
 */
export default function AddService(props) {
    const {
        api,
        classes,
    } = props;
    // const [serviceKey, setserviceKey] = useState();
    // const [showEndpointReady, setshowEndpointReady] = useState(false);
    // const [isRendering, setIsRendering] = useState(false);
    const { updateAPI } = useContext(APIContext);
    const [openDialog, setopenDialog] = useState(false);
    const [servicesList, setServicesList] = useState([]);
    // eslint-disable-next-line no-console
    // setserviceKey("SwaggerPetstore-1.0.0")

    /**
     * Re import service definition
    * */
    function updateSwaggerByServiceKey() {
        const newAPI = new API();
        const promisedReimportService = newAPI.updateSwaggerByServiceKey(api.id, "SwaggerPetstore-1.0.0");
        promisedReimportService.then(() => {
            Alert.info(
                <FormattedMessage
                    id='Apis.Details.APIDefinition.Addservice.success'
                    defaultMessage='Service added to the API successfully!'
                />,
            );
            setopenDialog(false);
        }).catch((error) => {
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(
                    <FormattedMessage
                        id='Apis.Details.APIDefinition.Addservice.error'
                        defaultMessage='Error while adding service to the API'
                    />,
                );
            }
        }).finally(() => {
            updateAPI();
        });
    }


    /**
     * Show diff between old service definition and new service definition
     */
    function findEndpointReady() {
        // setIsRendering(true);
        const promisedServices = ServiceCatalog.searchServiceByKey("SwaggerPetstore-1.0.0");
        promisedServices.then((response) => {
            setServicesList(response.body.list);
            // setserviceKey(serviceKeyn);
            console.log(servicesList);

        }).catch((error) => {
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(
                    <FormattedMessage
                        id='Apis.Details.APIDefinition.DefinitionOutdated.service.retrieve.error'
                        defaultMessage='Something went wrong while rendering diff for API Definition'
                    />,
                );
            }
            console.error(error);
        }).finally(() => {
            // setIsRendering(false);
        });
    }

    useEffect(() => {
        if (api.lifeCycleStatus === "CREATED") {
            findEndpointReady();
        }
    }, []);



    const handleOpen = () => {
        setopenDialog(true);
    };

    const handleClose = () => {
        setopenDialog(false);
    };


    return (
        <>
            <div>
                {(api.lifeCycleStatus === "CREATED" && servicesList.length) && (
                    <div>
                        <Button
                            size='small'
                            className={classes.button}
                            onClick={handleOpen}
                        >

                            <FormattedMessage
                                id='Apis.Details.APIDefinition.Addservice.endpoint.ready'
                                defaultMessage='Endpoint is ready'
                            />
                        </Button>
                        <Dialog
                            open={openDialog}
                            onClose={handleClose}
                            aria-labelledby='alert-dialog-title'
                            aria-describedby='alert-dialog-description'
                            fullWidth
                            maxWidth='md'
                        >
                            <DialogTitle id='alert-dialog-title'>
                                <Typography align='left'>
                                    <FormattedMessage
                                        id='Apis.Details.APIDefinition.DefinitionOutdated.outdated.definition'
                                        defaultMessage='Available Services'
                                    />
                                </Typography>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id='alert-dialog-description'>
                                    <FormattedMessage
                                        id='Apis.Details.APIDefinition.DefinitionOutdated.api.outdated.definition'
                                        defaultMessage='Current API definition is outdated.
                               You can either re-import the new definition or create a new version of this API.'
                                    />
                                </DialogContentText>

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
                                        {servicesList.map((service) => (
                                            <TableRow>
                                                <TableCell>
                                                    <Link
                                                        to={'/service-catalog/' + service.id + '/overview'}
                                                    >
                                                        <span>{service.name}</span>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <span>{service.version}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        onClick={updateSwaggerByServiceKey}
                                                        color='primary'
                                                        autoFocus
                                                        variant='contained'
                                                    >
                                                        <FormattedMessage
                                                            id='Apis.Details.APIDefinition.DefinitionOutdated.
                                                            btn.reimport'
                                                            defaultMessage='Re-import'
                                                        />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color='primary'>
                                    <FormattedMessage
                                        id='Apis.Details.APIDefinition.DefinitionOutdated.btn.cancel'
                                        defaultMessage='Cancel'
                                    />
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                )}

            </div>
        </>
    )
}


AddService.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};
