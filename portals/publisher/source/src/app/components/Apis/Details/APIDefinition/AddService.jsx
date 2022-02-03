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
import {
    FormControl,
    Grid,
    Paper,
    Box,
    Typography,
    withStyles,
    Radio,
    FormControlLabel,
    Collapse,
    RadioGroup, Checkbox, Dialog, DialogTitle, DialogContent, DialogContentText,
    IconButton, Button, DialogActions, Icon,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import Alert from 'AppComponents/Shared/Alert';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import ServiceCatalog from 'AppData/ServiceCatalog';
import { FormattedMessage } from 'react-intl';
import API from 'AppData/api.js';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import CloudDownloadRounded from '@material-ui/icons/CloudDownloadRounded';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        height: 250,
    },
    container: {
        flexGrow: 1,
        position: 'relative',
    },
    paper: {
        position: 'absolute',
        zIndex: theme.zIndex.goToSearch,
        marginTop: theme.spacing(2),
        padding: theme.spacing(1),
        left: 0,
        right: 0,
    },
    chip: {
        margin: theme.spacing(0.5, 0.25),
    },
    inputRoot: {
        flexWrap: 'wrap',
    },
    inputInput: {
        width: 'auto',
        flexGrow: 1,
        fontSize: '20px',
    },
    divider: {
        height: theme.spacing(2),
    },
    linkButton: {
        display: 'grid',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 10,
        cursor: 'pointer',
        minWidth: 30,
    },
    goToWrapper: {
        position: 'relative',
    },
    downshiftWrapper: {
        padding: theme.spacing(1),
        background: theme.palette.background.paper,
        borderRadius: 10,
        width: '70vw',
        marginBottom: '20%',
        boxShadow: '0px 0px 20px 3px rgb(0 0 0 / 56%)',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        backdropFilter: 'blur(1px)',
    },
}));


// eslint-disable-next-line valid-jsdoc
/**
 * Renders an Environments list
 * @class Environments
 * @extends {React.Component}
 */
export default function AddService(props) {
    const {
        api,
        services
    } = props;
    const classes = useStyles();
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
    function updateSwaggerByServiceKey(serviceKey) {

        const newAPI = new API();
        const promisedReimportService = newAPI.updateSwaggerByServiceKey(api.id,
            serviceKey);
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
     * Find a service which is mapped to the perticular API
     */
    function findEndpointReady() {
        // setIsRendering(true);
        const promisedServices = ServiceCatalog.getServiceList();
        promisedServices.then((response) => {

            setServicesList(response.list);

        }).catch((error) => {
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(
                    <FormattedMessage
                        id='Apis.Details.APIDefinition.Addservice.service.retrieve.error'
                        defaultMessage='Something went wrong while retrieving the services'
                    />,
                );
            }
            console.error(error);
        }).finally(() => {
            
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

            <div className={classes.goToWrapper}>
                {(servicesList.length > 0) &&
                    <>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <Autocomplete
                                    id="combo-box-demo"
                                    options={servicesList}
                                    getOptionLabel={(option) => option.name}
                                    style={{ width: 300 }}
                                    renderInput={(params) => <TextField {...params} label="Services" variant="outlined" />}
                                />
                            </Grid>
                            <Grid item xs={9}>
                                <div className={classes.endpointInputWrapper}>
                                    <TextField
                                        disabled
                                        label={name}
                                        id={id}
                                        className={classes.textField}
                                        value={serviceUrl}
                                        placeholder={!serviceUrl ? 'http://appserver/resource' : ''}
                                        onChange={(event) => setServiceUrl(event.target.value)}
                                        onBlur={() => {
                                            editEndpoint(index, category, serviceUrl);
                                        }}
                                        error={!serviceUrl}
                                    
                                        variant='outlined'
                                        margin='normal'
                                        required
                                        InputProps={{
                                            readOnly,
                                            autoFocus,
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    {statusCode && (
                                                        <Chip
                                                            label={statusCode}
                                                            className={isEndpointValid ? classes.endpointValidChip : iff(
                                                                isErrorCode,
                                                                classes.endpointErrorChip, classes.endpointInvalidChip,
                                                            )}
                                                            variant='outlined'
                                                        />
                                                    )}
                                                   
                                                    {type === 'prototyped'
                                                        ? <div />
                                                        : (
                                                            <>
                                                                <IconButton
                                                                    className={classes.iconButton}
                                                                    aria-label='Settings'
                                                                    onClick={() => setAdvancedConfigOpen(index, type, category)}
                                                                    disabled={(isRestricted(['apim:api_create'], api))}
                                                                >
                                                                    <Tooltip
                                                                        placement='top-start'
                                                                        interactive
                                                                        title={(
                                                                            <FormattedMessage
                                                                                id='Apis.Details.Endpoints.GenericEndpoint.config.endpoint'
                                                                                defaultMessage='Endpoint configurations'
                                                                            />
                                                                        )}
                                                                    >
                                                                        <Icon>
                                                                            settings
                                                                        </Icon>
                                                                    </Tooltip>
                                                                </IconButton>
                                                                <IconButton
                                                                    className={classes.iconButton}
                                                                    aria-label='Security'
                                                                    onClick={() => setESConfigOpen(type, esCategory)}
                                                                    disabled={(isRestricted(['apim:api_create'], api))}
                                                                >
                                                                    <Tooltip
                                                                        placement='top-start'
                                                                        interactive
                                                                        title={(
                                                                            <FormattedMessage
                                                                                id='Apis.Details.Endpoints.GenericEndpoint.security.endpoint'
                                                                                defaultMessage='Endpoint security'
                                                                            />
                                                                        )}
                                                                    >
                                                                        <Icon>
                                                                            security
                                                                        </Icon>
                                                                    </Tooltip>
                                                                </IconButton>
                                                                <IconButton
                                                                    className={classes.iconButton}
                                                                    aria-label='Security'
                                                                    onClick={() => setConfigureBackendOpen(type, esCategory)}
                                                                    disabled={(isRestricted(['apim:api_create'], api))}
                                                                >
                                                                    <Tooltip
                                                                        placement='top-start'
                                                                        interactive
                                                                        title={(
                                                                            <FormattedMessage
                                                                                id='Apis.Details.Endpoints.GenericEndpoint.available.services'
                                                                                defaultMessage='Available services'
                                                                            />
                                                                        )}
                                                                    >
                                                                        <Icon>
                                                                            ballot
                                                                        </Icon>
                                                                    </Tooltip>
                                                                </IconButton>
                                                            </>
                                                        )}
                                                    {(index > 0) ? <Divider className={classes.divider} /> : <div />}
                                                    {(type === 'load_balance' || type === 'failover') ? (
                                                        <IconButton
                                                            className={classes.iconButton}
                                                            aria-label='Delete'
                                                            color='secondary'
                                                            onClick={() => deleteEndpoint(index, type, category)}
                                                            disabled={(isRestricted(['apim:api_create'], api))}
                                                        >
                                                            <Icon>
                                                                delete
                                                            </Icon>
                                                        </IconButton>
                                                    ) : (<div />)}
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </div>
                            </Grid>

                        </Grid>










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
                                        id='Apis.Details.APIDefinition.Addservice.available.services'
                                        defaultMessage='Available Services'
                                    />
                                </Typography>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id='alert-dialog-description'>
                                    <FormattedMessage
                                        id='Apis.Details.APIDefinition.Addservice.link.service'
                                        defaultMessage='Select a service to link to the API.'
                                    />
                                </DialogContentText>

                                <Table style={{ minWidth: '450px' }} stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <b>
                                                    <FormattedMessage
                                                        id='Apis.Details.APIDefinition.service.name'
                                                        defaultMessage='Service Name'
                                                    />
                                                </b>
                                            </TableCell>
                                            <TableCell>
                                                <b>
                                                    <FormattedMessage
                                                        id='Apis.Details.APIDefinition.service.version'
                                                        defaultMessage='Version'
                                                    />
                                                </b>
                                            </TableCell>
                                            <TableCell />
                                            <TableCell />
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

                                                    <FormattedMessage
                                                        id='Apis.Details.APIDefinition.add.service.compatible'
                                                        defaultMessage='Compatible contract'
                                                    />

                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        onClick={() => updateSwaggerByServiceKey(service.serviceKey)}
                                                        color='primary'
                                                        autoFocus
                                                        variant='contained'
                                                        on
                                                    >
                                                        <FormattedMessage
                                                            id='Apis.Details.APIDefinition.add.service.configure'
                                                            defaultMessage='Confgure Endpoint'
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
                    </>
                }

            </div>
        </>
    )
}


AddService.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    services: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};
