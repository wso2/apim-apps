/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Icon,
    TextField,
    Typography,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Dropzone from 'react-dropzone';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import APIValidation from 'AppData/APIValidation';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import SelectEndpoint from 'AppComponents/Apis/Details/Endpoints/GeneralConfiguration/SelectEndpoint';
import SelectPolicies from '../../../Create/Components/SelectPolicies';
import { 
    API_SECURITY_KEY_TYPE_PRODUCTION, 
    API_SECURITY_KEY_TYPE_SANDBOX 
} from '../../Configuration/components/APISecurity/components/apiSecurityConstants';

const PREFIX = 'UploadCertificate';

const classes = {
    fileinput: `${PREFIX}-fileinput`,
    dropZoneWrapper: `${PREFIX}-dropZoneWrapper`,
    uploadedFile: `${PREFIX}-uploadedFile`,
    certificatesHeader: `${PREFIX}-certificatesHeader`,
    addCertificateBtn: `${PREFIX}-addCertificateBtn`,
    certificateList: `${PREFIX}-certificateList`,
    certDetailsHeader: `${PREFIX}-certDetailsHeader`,
    uploadCertDialogHeader: `${PREFIX}-uploadCertDialogHeader`
};

const StyledDialog = styled(Dialog)((
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
        marginTop: 20,
    },

    [`& .${classes.addCertificateBtn}`]: {
        borderColor: '#c4c4c4',
        borderRadius: '8px',
        borderStyle: 'dashed',
        borderWidth: 'thin',
    },

    [`& .${classes.certificateList}`]: {
        maxHeight: '250px',
        overflow: 'scroll',
    },

    [`& .${classes.certDetailsHeader}`]: {
        fontWeight: '600',
    },

    [`& .${classes.uploadCertDialogHeader}`]: {
        fontWeight: '600',
    }
}));

const dropzoneStyles = {
    border: '1px dashed #c4c4c4',
    borderRadius: '5px',
    cursor: 'pointer',
    height: 75,
    padding: '8px 0px',
    position: 'relative',
    textAlign: 'center',
    width: '100%',
    margin: '10px 0',
};

/**
 * This component is used to upload the certificates
 * @param {any} props The input props.
 * @returns {any} The HTML representation of the Certificates.
 */
export default function UploadCertificate(props) {
    const {
        endpoints,
        uploadCertificate,
        isMutualSSLEnabled,
        uploadCertificateOpen,
        setUploadCertificateOpen,
        aliasList,
        productionAliasList,
        sandboxAliasList,
        api,
    } = props;
    const [alias, setAlias] = useState('');
    const [policy, setPolicy] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [isSaving, setSaving] = useState(false);
    const [certificate, setCertificate] = useState({ name: '', content: {} });
    const [isEndpointEmpty, setIsEndpointEmpty] = useState(false);
    const [isPoliciesEmpty, setPoliciesEmpty] = useState(true);
    const [aliasValidity, setAliasValidity] = useState();
    const [keyType, setKeyType] = useState(API_SECURITY_KEY_TYPE_PRODUCTION);

    const [isRejected, setIsRejected] = useState(false);
    const intl = useIntl();

    const closeCertificateUpload = () => {
        setUploadCertificateOpen(false);
        setAliasValidity();
        setCertificate({ name: '', content: '' });
        setAlias('');
        setKeyType(API_SECURITY_KEY_TYPE_PRODUCTION);
        setEndpoint('');
        setPolicy('');
        setPoliciesEmpty(true);
    };

    const isAliasIncluded = () => {
        if (isMutualSSLEnabled) {
            if (keyType === API_SECURITY_KEY_TYPE_SANDBOX && sandboxAliasList) {
                return sandboxAliasList.includes(alias);
            }
            if (keyType === API_SECURITY_KEY_TYPE_PRODUCTION && productionAliasList) {
                return productionAliasList.includes(alias);
            } 
        }
        if (aliasList) {
            return aliasList.includes(alias);
        }    
        return false;
    };

    /**
     * On change functionality to handle the policy dropdown
     *
     * @param {*} event
     */
    function handleOnChange(event) {
        const { value } = event.target;
        setPolicy(value);
    }

    /**
     * On change functionality to handle the keyType radio button
     *
     * @param {*} event
     */
    function handleOnChangekeyType(event) {
        const { value } = event.target;
        setKeyType(value);
    }

    /**
     * Method to validate the policies.
     * @param {string} value selected policy.
     * */
    const onValidate = (value) => {
        setPoliciesEmpty(value === '');
    };

    /**
     * Method to upload the certificate content by calling the rest api.
     * */
    const saveCertificate = () => {
        setSaving(true);
        if (isMutualSSLEnabled) {
            uploadCertificate(certificate.content, keyType, policy, alias)
                .then(() => {
                    closeCertificateUpload();
                    if (keyType === API_SECURITY_KEY_TYPE_SANDBOX) {
                        sandboxAliasList.push(alias);
                    } else {
                        productionAliasList.push(alias);
                    }
                })
                .finally(() => setSaving(false));
        } else {
            uploadCertificate(certificate.content, endpoint, alias)
                .then(() => {
                    closeCertificateUpload();
                    aliasList.push(alias);
                })
                .finally(() => setSaving(false));
        }
    };

    /**
     * Handled the file upload action of the dropzone.
     *
     * @param {array} file The accepted file list by the dropzone.
     * */
    const onDrop = (file) => {
        const certificateFile = file[0];
        const rejectedFiles = ['pem', 'txt', 'jks', 'key', 'ca-bundle'];
        const extension = certificateFile.name.split('.');
        if (rejectedFiles.includes(extension[1])) {
            setIsRejected(true);
        } else {
            setIsRejected(false);
        }
        if (certificateFile) {
            setCertificate({ name: certificateFile.name, content: certificateFile });
        }
    };

    const handleEndpointOnChange = (value) => {
        setEndpoint(value);
        if (value) {
            setIsEndpointEmpty(false);
        } else {
            setIsEndpointEmpty(true);
        }
    };

    const handleAliasOnBlur = () => {
        const aliasValidation = APIValidation.alias.required().validate(alias).error;
        if (aliasValidation) {
            setAliasValidity({ isValid: false, message: aliasValidation.details[0].message });
        } else {
            setAliasValidity({ isValid: true, message: '' });
        }
    };

    const getHelperText = () => {
        if (aliasValidity && !aliasValidity.isValid) {
            return (aliasValidity.message);
        } else {
            let aliasListToCompare = aliasList;
            if (isMutualSSLEnabled) {
                if (keyType === API_SECURITY_KEY_TYPE_SANDBOX) {
                    aliasListToCompare = productionAliasList;
                } else {
                    aliasListToCompare = sandboxAliasList;
                }
            }
            if (aliasListToCompare && aliasListToCompare.includes(alias)) {
                return (
                    <FormattedMessage
                        id='Apis.Details.Endpoints.GeneralConfiguration.UploadCertificate.alias.exist.error'
                        defaultMessage='Alias already exists'
                    />
                );
            } else {
                return (
                    <FormattedMessage
                        id='Apis.Details.Endpoints.GeneralConfiguration.UploadCertificate.alias.default.message'
                        defaultMessage='Alias for the Certificate'
                    />
                );
            }
        }
    };

    const iff = (condition, then, otherwise) => (condition ? then : otherwise);
    return (
        <StyledDialog open={uploadCertificateOpen}>
            <DialogTitle>
                <Typography className={classes.uploadCertDialogHeader}>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.GeneralConfiguration.UploadCertificate.uploadCertificate'
                        defaultMessage='Upload Certificate'
                    />
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Grid>
                    <div>
                        {isMutualSSLEnabled && (api.gatewayType === 'wso2/synapse' ||
                        api.apiType === 'APIPRODUCT') && (
                            <>
                                <RadioGroup
                                    aria-label='Production Sandbox type selection'
                                    name={API_SECURITY_KEY_TYPE_PRODUCTION}
                                    value={keyType}
                                    onChange={handleOnChangekeyType}
                                    data-testid='radio-group-key-type'
                                    row
                                >
                                    <FormControlLabel
                                        value={API_SECURITY_KEY_TYPE_PRODUCTION}
                                        control={(
                                            <Radio
                                                color='primary' 
                                            />
                                        )}
                                        label='Production'
                                        labelPlacement='end'
                                        data-testid='radio-production' 
                                    />
                                    <FormControlLabel
                                        value={API_SECURITY_KEY_TYPE_SANDBOX}
                                        control={(
                                            <Radio
                                                color='primary' 
                                            />
                                        )}
                                        label='Sandbox'
                                        labelPlacement='end'
                                        data-testid='radio-sandbox' 
                                    />
                                </RadioGroup>
                                <FormHelperText>
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.GeneralConfiguration.UploadCertificate.keyType'
                                        defaultMessage='Choose the key type of the certificate'
                                    />
                                </FormHelperText>
                                <SelectPolicies
                                    multiple={false}
                                    policies={policy}
                                    helperText={intl.formatMessage({
                                        id: 'Apis.Details.Endpoints.GeneralConfiguration.'
                                            + 'UploadCertificate.uploadCertificate.throttle.policy',
                                        defaultMessage: 'Select a throttling policy for the certificate',
                                    })}
                                    onChange={handleOnChange}
                                    required
                                    validate={onValidate} 
                                />
                            </>
                        )}
                        {!isMutualSSLEnabled && (
                            <SelectEndpoint
                                endpoints={endpoints}
                                onChange={handleEndpointOnChange}
                                endpoint={endpoint}
                                isEndpointEmpty={isEndpointEmpty}
                                required
                            />
                        )}
                        <TextField
                            required
                            id='certificateAlias'
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.GeneralConfiguration.UploadCertificate.alias'
                                    defaultMessage='Alias'
                                />
                            )}
                            value={alias}
                            placeholder={intl.formatMessage({
                                id: 'Apis.Details.Endpoints.GeneralConfiguration.'
                                    + 'UploadCertificate.uploadCertificate.alias.placeholder',
                                defaultMessage: 'My Alias',
                            })}
                            onChange={(event) => setAlias(event.target.value)}
                            onBlur={() => handleAliasOnBlur()}
                            margin='normal'
                            variant='outlined'
                            error={
                                (aliasValidity && !aliasValidity.isValid) || isAliasIncluded()
                            }
                            helperText={getHelperText()}
                            fullWidth
                            inputProps={{ maxLength: 45 }}
                        />
                        <Dropzone
                            multiple={false}
                            accept={
                                'application/pkcs8,'
                                    + 'application/pkcs10, application/pkix-crl,'
                                    + 'application/pkcs7-mime,'
                                    + 'application/x-x509-ca-cert,'
                                    + 'application/x-x509-user-cert,'
                                    + 'application/x-pkcs7-crl,'
                                    + 'application/x-pkcs12,'
                                    + 'application/x-pkcs7-certificates,'
                                    + 'application/x-pkcs7-certreqresp,'
                                    + '.p8, .p10, .cer, .cert, .p7c, .crt, .der, .p12, .pfx, .p7b, .spc, .p7r'
                            }
                            className={classes.dropzone}
                            activeClassName={classes.acceptDrop}
                            rejectClassName={classes.rejectDrop}
                            onDrop={(dropFile) => {
                                onDrop(dropFile);
                            }}
                        >
                            {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps({ style: dropzoneStyles })}>
                                    <input {...getInputProps()} />
                                    <div className={classes.dropZoneWrapper} data-testid='cert-upload-btn'>
                                        {certificate.name === '' ? (
                                            <div>
                                                <Icon style={{ fontSize: 56 }}>cloud_upload</Icon>
                                                <Typography>
                                                    <FormattedMessage
                                                        id={
                                                            'Apis.Details.Endpoints.GeneralConfiguration'
                                                                + '.UploadCertificate.click.or.drop.to.upload.file'
                                                        }
                                                        defaultMessage={
                                                            'Click or drag the certificate'
                                                                + ' file to upload.'
                                                        }
                                                    />
                                                </Typography>
                                            </div>
                                        ) : iff(
                                            isRejected,
                                            <div className={classes.uploadedFile}>
                                                <InsertDriveFileIcon color='error' fontSize='large' />
                                                <Box fontSize='h6.fontSize' color='error' fontWeight='fontWeightLight'>
                                                    <Grid xs={12}>
                                                        {certificate.name}
                                                    </Grid>
                                                    <Grid xs={12}>
                                                        <Typography variant='caption' color='error'>
                                                            <FormattedMessage
                                                                id={
                                                                    'Apis.Details.Endpoints.GeneralConfiguration'
                                                            + '.UploadCertificate.invalid.file'
                                                                }
                                                                defaultMessage='Invalid file type'
                                                            />
                                                        </Typography>
                                                    </Grid>
                                                </Box>
                                            </div>,
                                            <div className={classes.uploadedFile}>
                                                <InsertDriveFileIcon color='primary' fontSize='large' />
                                                <Box fontSize='h6.fontSize' fontWeight='fontWeightLight'>
                                                    <Typography>
                                                        {certificate.name}
                                                    </Typography>
                                                </Box>
                                            </div>,
                                        )}
                                    </div>
                                </div>
                            )}
                        </Dropzone>
                    </div>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeCertificateUpload}>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.GeneralConfiguration.UploadCertificate.cancel.button'
                        defaultMessage='Close'
                    />
                </Button>
                <Button
                    id='upload-cert-save-btn'
                    onClick={saveCertificate}
                    variant='contained'
                    color='primary'
                    autoFocus
                    disabled={
                        alias === '' || (aliasValidity && !aliasValidity.isValid)
                            || (!isMutualSSLEnabled && endpoint === '')
                            || certificate.name === ''
                            || (isMutualSSLEnabled && isPoliciesEmpty)
                            || isSaving
                            || isAliasIncluded()
                            || isRejected
                    }
                >
                    <FormattedMessage
                        id='Apis.Details.Endpoints.GeneralConfiguration.UploadCertificate.config.save.button'
                        defaultMessage='Save'
                    />
                    {isSaving && <CircularProgress size={24} />}
                </Button>
            </DialogActions>
        </StyledDialog>
    );
}

UploadCertificate.defaultProps = {
    isMutualSSLEnabled: false,
    endpoints: [],
    aliasList: [],
    productionAliasList: [],
    sandboxAliasList: [],
};

UploadCertificate.propTypes = {
    certificates: PropTypes.shape({}).isRequired,
    uploadCertificate: PropTypes.func.isRequired,
    isMutualSSLEnabled: PropTypes.bool,
    api: PropTypes.shape({}).isRequired,
    setUploadCertificateOpen: PropTypes.func.isRequired,
    uploadCertificateOpen: PropTypes.bool.isRequired,
    endpoints: PropTypes.shape([]),
    aliasList: PropTypes.shape([]),
    productionAliasList: PropTypes.shape([]),
    sandboxAliasList: PropTypes.shape([]),
};
