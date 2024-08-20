/**
 * Copyright (c)  WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Icon,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
} from '@mui/material';
import { FormattedMessage, injectIntl } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import UploadCertificate from 'AppComponents/Apis/Details/Endpoints/GeneralConfiguration/UploadCertificate';
import CertificateUsage from "AppComponents/Apis/Details/Endpoints/GeneralConfiguration/CertificateUsage.tsx";
import API from '../../../../../data/api';
import { API_SECURITY_KEY_TYPE_PRODUCTION, API_SECURITY_KEY_TYPE_SANDBOX } 
    from '../../Configuration/components/APISecurity/components/apiSecurityConstants';

const PREFIX = 'Certificates';

const classes = {
    fileinput: `${PREFIX}-fileinput`,
    dropZoneWrapper: `${PREFIX}-dropZoneWrapper`,
    uploadedFile: `${PREFIX}-uploadedFile`,
    certificatesHeader: `${PREFIX}-certificatesHeader`,
    addCertificateBtn: `${PREFIX}-addCertificateBtn`,
    certificateList: `${PREFIX}-certificateList`,
    certDetailsHeader: `${PREFIX}-certDetailsHeader`,
    uploadCertDialogHeader: `${PREFIX}-uploadCertDialogHeader`,
    alertWrapper: `${PREFIX}-alertWrapper`,
    warningIcon: `${PREFIX}-warningIcon`,
    deleteIcon: `${PREFIX}-deleteIcon`,
    deleteIconDisable: `${PREFIX}-deleteIconDisable`,
    productionCertificatesListTitle: `${PREFIX}-productionTitle`,
    sandboxCertificatesListTitle: `${PREFIX}-sandboxTitle`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.fileinput}`]: {
        display: 'none',
    },

    [`& .${classes.dropZoneWrapper}`]: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '& span.material-icons': {
            color: theme.palette.primary.main,
        },
    },

    [`& .${classes.uploadedFile}`]: {
        fontSize: 11,
    },

    [`& .${classes.certificatesHeader}`]: {
        fontWeight: 600,
        marginTop: theme.spacing(1),
    },

    [`& .${classes.addCertificateBtn}`]: {
        borderColor: '#c4c4c4',
        borderRadius: '8px',
        borderStyle: 'dashed',
        borderWidth: 'thin',
    },

    [`& .${classes.certificateList}`]: {
        maxHeight: '250px',
        overflow: 'auto',
    },

    [`& .${classes.certDetailsHeader}`]: {
        fontWeight: '600',
    },

    [`& .${classes.uploadCertDialogHeader}`]: {
        fontWeight: '600',
    },

    [`& .${classes.alertWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.warningIcon}`]: {
        marginRight: 13,
        color: theme.custom.warningColor,
        '& .material-icons': {
            fontSize: 30,
        },
    },

    [`& .${classes.deleteIcon}`]: {
        color: theme.palette.error.dark,
        cursor: 'pointer',
    },

    [`& .${classes.deleteIconDisable}`]: {
        color: theme.palette.disabled,
    }
}));

const infoIconStyle = { mr: 1, minWidth: 'initial'};

/**
 * TODO: Generalize this component to work in Configuration page , upload mutual SSL certificates action
 * in source/src/app/components/Apis/Details/Configuration/components/APISecurity/components/TransportLevel.jsx ~tmkb
 * The base component for advanced endpoint configurations.
 * @param {any} props The input props.
 * @returns {any} The HTML representation of the Certificates.
 */
function Certificates(props) {
    const {
        api, certificates, productionCertificates, sandboxCertificates, uploadCertificate, deleteCertificate,
        isMutualSSLEnabled, apiId, endpoints, aliasList, productionAliasList, sandboxAliasList, intl
    } = props;
    const [certificateList, setCertificateList] = useState([]);
    const [productionCertificatesList, setProductionCertificateList] = useState([]);
    const [sandboxCertificatesList, setSandboxCertificateList] = useState([]);
    const [openCertificateDetails, setOpenCertificateDetails] = useState({ open: false, anchor: null, details: {} });
    const [certificateToDelete, setCertificateToDelete] = useState({ open: false, keyType: '', alias: '' });
    const [certificateUsageDetails, setCertificateUsageDetails] = useState({ count: 0, apiList: [] });
    const [isDeleting, setDeleting] = useState(false);
    const [uploadCertificateOpen, setUploadCertificateOpen] = useState(false);

    const [apiFromContext] = useAPI();

    /**
     * Show the selected certificate details in a popover.
     *
     * @param {any} event The button click event.
     * @param {string} certAlias  The alias of the certificate which information is required.
     * */
    const showCertificateDetails = (event, certAlias) => {
        API.getCertificateStatus(certAlias)
            .then((response) => {
                setOpenCertificateDetails({
                    details: response.body,
                    open: true,
                    alias: certAlias,
                    anchor: event.currentTarget,
                });
            })
            .catch((err) => {
                console.error(err);
            });
    };

    /**
     * Show the selected client certificate details in a popover.
     *
     * @param {any} event The button click event.
     * @param {string} keyType The key type of the certificate.
     * @param {string} certAlias  The alias of the certificate which information is required.
     * */
    const showClientCertificateDetails = (event, keyType, certAlias) => {
        API.getClientCertificateStatus(keyType, certAlias, apiId)
            .then((response) => {
                setOpenCertificateDetails({
                    details: response.body,
                    open: true,
                    alias: certAlias,
                    anchor: event.currentTarget,
                });
            })
            .catch((error) => {
                console.error(error);
            });
    };

    /**
     * Delete certificate represented by the key type and alias.
     *
     * @param {string} certificateKeyType The key type of the certificate that is needed to be deleted.
     * @param {string} certificateAlias The alias of the certificate that is needed to be deleted.
     * */
    const deleteCertificateByAlias = (certificateKeyType, certificateAlias) => {
        setDeleting(true);
        const deletePromise = certificateKeyType
            ? deleteCertificate(certificateKeyType, certificateAlias)
            : deleteCertificate(certificateAlias);

        deletePromise
            .then(() => { 
                setCertificateToDelete({ open: false, keyType: '', alias: '' })
                // Remove certificateAlias from aliasList.
                if (isMutualSSLEnabled) {
                    if (certificateKeyType === API_SECURITY_KEY_TYPE_SANDBOX) {
                        const index = sandboxAliasList.indexOf(certificateAlias);
                        if (index > -1) {
                            sandboxAliasList.splice(index, 1);
                        }
                    } else {
                        const index = productionAliasList.indexOf(certificateAlias);
                        if (index > -1) {
                            productionAliasList.splice(index, 1);
                        }
                    }
                } else {
                    const index = aliasList.indexOf(certificateAlias);
                    if (index > -1) {
                        aliasList.splice(index, 1);
                    }
                }
            })
            .finally(() => setDeleting(false));
        
    };

    /**
     * Retrieve certificate usage details by alias.
     *
     * @param {string} certAlias  The alias of the certificate which information is required.
     * */
    const getCertificateUsage = async (certAlias) => {
        try {
            const response = await API.getEndpointCertificateUsage(certAlias);
            setCertificateUsageDetails({count: response.body.count, apiList: response.body.list});
        } catch(err) {
            console.error(err);
        }
    }

    /**
     * Show certificate deletion dialog box.
     *
     * @param {any} event The button click event.
     * @param {string} certAlias  The alias of the certificate which information is required.
     * */
    const showCertificateDeleteDialog = async (event, certAlias) => {
        setCertificateToDelete({ open: false, keyType: '', alias: '' });
        await getCertificateUsage(certAlias);
        setCertificateToDelete({ open: true, keyType: '', alias: certAlias });
    };

    /**
     * Show client certificate deletion dialog box.
     *
     * @param {any} event The button click event.
     * @param {string} certKeyType The key type of the certificate.
     * @param {string} certAlias  The alias of the certificate which information is required.
     * */
    const showClientCertificateDeleteDialog = async (event, certKeyType, certAlias) => {
        setCertificateToDelete({ open: false, keyType: '', alias: '' });
        setCertificateToDelete({ open: true, keyType: certKeyType, alias: certAlias });
    };


    const getWarningMessage = () => {
        return certificateToDelete.alias + ' is used by ' +
            certificateUsageDetails.count + ' other APIs. ';
    }


    useEffect(() => {
        setCertificateList(certificates);
        setProductionCertificateList(productionCertificates);
        setSandboxCertificateList(sandboxCertificates);
    }, [certificates, productionCertificates, sandboxCertificates]);

    return (
        <StyledGrid container direction='column'>
            {/* TODO: Add list of existing certificates */}
            <Grid>
                <Typography className={classes.certificatesHeader}>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.certificates'
                        defaultMessage='Certificates'
                    />
                </Typography>
            </Grid>
            <Grid item>
                <List>
                    <ListItem
                        button
                        disabled={(isRestricted(['apim:api_create'], apiFromContext))}
                        className={classes.addCertificateBtn}
                        onClick={() => setUploadCertificateOpen(true)}
                        id='certs-add-btn'
                    >
                        <ListItemAvatar>
                            <IconButton size='large'>
                                <Icon>add</Icon>
                            </IconButton>
                        </ListItemAvatar>
                        <ListItemText primary={intl.formatMessage({
                            id: 'Apis.Details.Endpoints.GeneralConfiguration.Certificates.certificates.AddCertificate',
                            defaultMessage: 'Add Certificate',
                        })}
                        />
                    </ListItem>
                </List>
                <Box my={1} />
                {isMutualSSLEnabled ? (
                    <>
                        <Typography className={classes.productionCertificatesListTitle}>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.production.certificates'
                                defaultMessage='Production' 
                            />
                        </Typography>
                        <List className={classes.certificateList} data-testid='list-production-certs'>
                            {productionCertificatesList?.length > 0 ? (
                                productionCertificatesList.map((cert) => {
                                    return (
                                        <ListItem id={`production-cert-list-item-${cert.alias}`}>
                                            <ListItemAvatar>
                                                <Icon>lock</Icon>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={cert.alias}
                                                secondary={cert.tier} 
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    onClick={(event) => showClientCertificateDetails(event,
                                                        API_SECURITY_KEY_TYPE_PRODUCTION, cert.alias)}
                                                    size='large'>
                                                    <Icon>info</Icon>
                                                </IconButton>
                                                <IconButton
                                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                                    onClick={(event) => showClientCertificateDeleteDialog(event,
                                                        API_SECURITY_KEY_TYPE_PRODUCTION, cert.alias)}
                                                    id='delete-cert-btn'
                                                    size='large'>
                                                    <Icon className={isRestricted(['apim:api_create'], apiFromContext)
                                                        ? classes.deleteIconDisable : classes.deleteIcon}
                                                    >
                                                        {' '}
                                                        delete
                                                    </Icon>
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                })
                            ) : (
                                <ListItem>
                                    <ListItemAvatar sx={infoIconStyle}>
                                        <Icon color='primary'>info</Icon>
                                    </ListItemAvatar>
                                    <ListItemText>
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.GeneralConfiguration.no.production.certifcates'
                                            defaultMessage='You do not have any production type certificates uploaded'
                                        />
                                    </ListItemText>
                                </ListItem>
                            )}
                        </List>
                        <Box my={2} />
                        <Typography className={classes.sandboxCertificatesListTitle}>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.sandbox.certificates'
                                defaultMessage='Sandbox' 
                            />
                        </Typography>
                        <List className={classes.certificateList} data-testid='list-sandbox-certs'>
                            {sandboxCertificatesList?.length > 0 ? (
                                sandboxCertificatesList.map((cert) => {
                                    return (
                                        <ListItem id={`sandbox-cert-list-item-${cert.alias}`}>
                                            <ListItemAvatar>
                                                <Icon>lock</Icon>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={cert.alias}
                                                secondary={cert.tier} 
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    onClick={(event) => showClientCertificateDetails(event,
                                                        API_SECURITY_KEY_TYPE_SANDBOX, cert.alias)}
                                                    size='large'>
                                                    <Icon>info</Icon>
                                                </IconButton>
                                                <IconButton
                                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                                    onClick={(event) => showClientCertificateDeleteDialog(event,
                                                        API_SECURITY_KEY_TYPE_SANDBOX, cert.alias)}
                                                    id='delete-cert-btn'
                                                    size='large'>
                                                    <Icon className={isRestricted(['apim:api_create'], apiFromContext)
                                                        ? classes.deleteIconDisable : classes.deleteIcon}
                                                    >
                                                        {' '}
                                                        delete
                                                    </Icon>
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    );
                                })
                            ) : (
                                <ListItem>
                                    <ListItemAvatar sx={infoIconStyle}>
                                        <Icon color='primary'>info</Icon>
                                    </ListItemAvatar>
                                    <ListItemText>
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.GeneralConfiguration.no.sandbox.certifcates'
                                            defaultMessage='You do not have any sandbox type certificates uploaded'
                                        />
                                    </ListItemText>
                                </ListItem>
                            )}
                        </List>
                    </>
                ): 
                    <List className={classes.certificateList}>
                        {certificateList.length > 0 ? (
                            certificateList.map((cert) => {
                                return (
                                    <ListItem id='endpoint-cert-list'>
                                        <ListItemAvatar>
                                            <Icon>lock</Icon>
                                        </ListItemAvatar>
                                        <ListItemText primary={cert.alias} secondary={cert.endpoint} />
                                        <ListItemSecondaryAction>
                                            <IconButton edge='end' size='large'>
                                                <CertificateUsage certAlias={cert.alias}/>
                                            </IconButton>
                                            <IconButton
                                                onClick={(event) => showCertificateDetails(event, cert.alias)}
                                                size='large'>
                                                <Icon>info</Icon>
                                            </IconButton>
                                            <IconButton
                                                disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                                onClick={(event) => showCertificateDeleteDialog(event, cert.alias)}
                                                id='delete-cert-btn'
                                                size='large'>
                                                <Icon className={isRestricted(['apim:api_create'], apiFromContext)
                                                    ? classes.deleteIconDisable : classes.deleteIcon}
                                                >
                                                    {' '}
                                                    delete
                                                </Icon>
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                );
                            })
                        ) : (
                            <ListItem>
                                <ListItemAvatar sx={infoIconStyle}>
                                    <Icon color='primary'>info</Icon>
                                </ListItemAvatar>
                                <ListItemText>
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.GeneralConfiguration.'
                                            + 'Certificates.NoCertificatesUploaded'}
                                        defaultMessage='You do not have any certificates uploaded'
                                    />
                                </ListItemText>
                            </ListItem>
                        )}
                    </List>
                }
            </Grid>
            <Dialog open={certificateToDelete.open}>
                <DialogTitle>
                    <Typography className={classes.uploadCertDialogHeader}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.deleteCertificate'
                            defaultMessage='Delete with caution!'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.alertWrapper}>
                    <div id='warning-message'>
                        <Typography>
                            { certificateUsageDetails.count > 1 ? getWarningMessage() : ''}
                            <FormattedMessage
                                id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.confirm.certificate.delete'
                                defaultMessage='Are you sure you want to delete '
                            />
                            {' '}
                            { certificateToDelete.alias + '?'}
                        </Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => 
                            deleteCertificateByAlias(certificateToDelete.keyType, certificateToDelete.alias)
                        }
                        variant='contained'
                        color='primary'
                        disabled={isDeleting}
                        autoFocus
                        id='delete-cert-confirm-btn'
                    >
                        <FormattedMessage
                            id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.delete.ok.button'
                            defaultMessage='OK'
                        />
                        {isDeleting && <CircularProgress size={24} />}

                    </Button>
                    <Button onClick={() => setCertificateToDelete({ open: false, keyType: '', alias: '' })}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.delete.cancel.button'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openCertificateDetails.open}>
                <DialogTitle>
                    <Typography className={classes.certDetailsHeader}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.certificate.details.of'
                            defaultMessage='Details of'
                        />
                        {' ' + openCertificateDetails.alias}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.status'
                            defaultMessage='Status'
                        />
                        {' : ' + openCertificateDetails.details.status}
                    </Typography>
                    <Typography>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.subject'
                            defaultMessage='Subject'
                        />
                        {' : ' + openCertificateDetails.details.subject}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenCertificateDetails({ open: false, anchor: null, details: {} })}
                        color='primary'
                    >
                        <FormattedMessage
                            id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.details.close.button'
                            defaultMessage='Close'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
            <UploadCertificate
                endpoints={endpoints}
                certificates={certificates}
                uploadCertificate={uploadCertificate}
                isMutualSSLEnabled={isMutualSSLEnabled}
                setUploadCertificateOpen={setUploadCertificateOpen}
                uploadCertificateOpen={uploadCertificateOpen}
                aliasList={aliasList}
                productionAliasList={productionAliasList}
                sandboxAliasList={sandboxAliasList}
                api={api}
            />
        </StyledGrid>
    );
}

Certificates.defaultProps = {
    isMutualSSLEnabled: false,
    apiId: '',
    certificates: [],
    productionCertificates: [],
    sandboxCertificates: [],
    aliasList: [],
    productionAliasList: [],
    sandboxAliasList: [],
};

Certificates.propTypes = {
    classes: PropTypes.shape({
        fileinput: PropTypes.shape({}),
        button: PropTypes.shape({}),
    }).isRequired,
    certificates: PropTypes.shape({}),
    productionCertificates: PropTypes.shape({}),
    sandboxCertificates: PropTypes.shape({}),
    uploadCertificate: PropTypes.func.isRequired,
    deleteCertificate: PropTypes.func.isRequired,
    apiId: PropTypes.string,
    api: PropTypes.shape({}).isRequired,
    isMutualSSLEnabled: PropTypes.bool,
    endpoints: PropTypes.shape([]).isRequired,
    aliasList: PropTypes.shape([]),
    productionAliasList: PropTypes.shape([]),
    sandboxAliasList: PropTypes.shape([]),
};
export default injectIntl((Certificates));
