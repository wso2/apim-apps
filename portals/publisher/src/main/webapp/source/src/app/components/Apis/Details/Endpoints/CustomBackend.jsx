/* eslint-disable */
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

import React, { useEffect, useState } from 'react';
import { isRestricted } from 'AppData/AuthManager';
import CircularProgress from '@mui/material/CircularProgress';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { styled } from '@mui/material/styles';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Typography,
} from '@mui/material';
import Icon from '@mui/material/Icon';
import PropTypes from 'prop-types';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormattedMessage, injectIntl } from 'react-intl';
import { 
    API_SECURITY_KEY_TYPE_PRODUCTION, 
    API_SECURITY_KEY_TYPE_SANDBOX 
} from '../Configuration/components/APISecurity/components/apiSecurityConstants';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Dropzone from 'react-dropzone';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import Utils from 'AppData/Utils';

const PREFIX = 'CustomBackend';

const classes = {
    input: `${PREFIX}-input`,
    addCustomBackendBtn: `${PREFIX}-addCustomBackendBtn`,
    uploadCustomBackendDialogHeader: `${PREFIX}-uploadCustomBackendDialogHeader`,
    productionBackendTitle: `${PREFIX}-productionTitle`,
    backendList: `${PREFIX}-backendList`,
}

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({}));

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

    [`& .${classes.addCustomBackendBtn}`]: {
        borderColor: '#c4c4c4',
        borderRadius: '8px',
        borderStyle: 'dashed',
        borderWidth: 'thin',
    },

    [`& .${classes.backendList}`]: {
        maxHeight: '250px',
        overflow: 'scroll',
    },

    [`& .${classes.uploadCustomBackendDialogHeader}`]: {
        fontWeight: '600',
    },

    [`& .${classes.deleteIconDisable}`]: {
        color: theme.palette.disabled,
    },

    [`& .${classes.deleteIcon}`]: {
        color: theme.palette.error.dark,
        cursor: 'pointer',
    },

    [`& .${classes.customBackendHeader}`]: {
        fontWeight: 600,
        marginTop: theme.spacing(1),
    },
    [`& .${classes.uploadSequenceBackendDialogHeader}`]: {
        fontWeight: '600',
    },
    [`& .${classes.alertWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
}));

const infoIconStyle = { mr: 1, minWidth: 'initial'};

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
 * This is Custom Backend component.
 * 
 * @param {any} props The input props
 * @returns {any} The HTML representation of the component.
 */
export default function CustomBackend(props) {
    const {
        api,
        intl,
        sandBoxBackendList,
        productionBackendList,
        setSandBoxBackendList,
        setProductionBackendList,
        isValidSequenceBackend,
        setIsValidSequenceBackend,
    } = props;

    const restAPI = new API();
    let backenCount = 0;

    const [customBackend, setCustomBackend] = useState({ name: '', content: {} });
    const [isSaving, setSaving] = useState(false);
    const [keyType, setKeyType] = useState(API_SECURITY_KEY_TYPE_PRODUCTION);
    const [isRejected, setIsRejected] = useState(false);
    const [apiFromContext] = useAPI();
    const [uploadCustomBackendOpen, setUploadCustomBackendOpen] = useState(false);
    const [sequenceBackendToDelete, setSequenceBackendToDelete] = useState({ open: false, keyType: '', name: '' });
    const [isDeleting, setDeleting] = useState(false);
    
    const closeCustomBackendUpload = () => {
        setUploadCustomBackendOpen(false);
        setCustomBackend({ name: '', content: '' });
        setKeyType(API_SECURITY_KEY_TYPE_PRODUCTION);
    };

    useEffect(() => {
        setIsValidSequenceBackend(false);
        restAPI.getSequenceBackends(api.id)
            .then((result) => {
                console.log(result);
                const allSequenceBackends = result.body.list;
                setProductionBackendList(allSequenceBackends.filter((backend) => backend.sequenceType === API_SECURITY_KEY_TYPE_PRODUCTION));
                setSandBoxBackendList(allSequenceBackends.filter((backend) => backend.sequenceType === API_SECURITY_KEY_TYPE_SANDBOX));

                if (result.body.count > 0) {
                    setIsValidSequenceBackend(true);
                }
            })
            .catch(() => {
                console.error('Error while fetching sequence backends');
            });
    }, []);

    /**
     * Show certificate deletion dialog box.
     *
     * @param {any} event The button click event.
     * @param {string} certAlias  The alias of the certificate which information is required.
     * */
    const showSequenceBackendDeleteDialog = async (event, keyType, name) => {
        setSequenceBackendToDelete({ open: true, keyType: keyType, name: name });
    };

    const downloadCustomBackend = (keyType) => {
        console.log("Downloading");
        restAPI.getSequenceBackendContentByAPIID(api.id, keyType).then((resp) => {
            Utils.forceDownload(resp);
            console.log('Custom backend downloaded successfully' + resp);
        })
        .catch((error) => {
            console.log(error);
        });
    };

    const deleteSequenceBackendByKey = (keyType) => {
        setDeleting(true);
        restAPI.deleteSequenceBackend(keyType, api.id).then((resp) => {
            console.log('Custom backend deleted successfully');
        }).finally(() => {
            setDeleting(false);
            setSequenceBackendToDelete({ open: false, keyType: '', name: '' });
            if (keyType === API_SECURITY_KEY_TYPE_SANDBOX) {
                setSandBoxBackendList([]);
                if (productionBackendList.length === 0) {
                    setIsValidSequenceBackend(false);
                }
            } else {
                setProductionBackendList([]);
                if (sandBoxBackendList.length === 0) {
                    setIsValidSequenceBackend(false);
                }
            }
        });
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
     * Method to upload the certificate content by calling the rest api.
     * */
    const saveCustomBackend = () => {
        setSaving(true);
        setUploadCustomBackendOpen(false);
        backenCount = backenCount + 1;
        if (keyType === API_SECURITY_KEY_TYPE_SANDBOX) {
            sandBoxBackendList.push({"sequenceName": customBackend.name, "content": customBackend.content});
        } else {
            productionBackendList.push({"sequenceName": customBackend.name, "content": customBackend.content});
        }
        restAPI.uploadCustomBackend(customBackend.content, keyType, api.id).then((resp) => {
            console.log('Custom backend uploaded successfully' + resp);
        }).finally(() => {
            setSaving(false);
            setCustomBackend({ name: '', content: '' });
            if (sandBoxBackendList.length > 0 || productionBackendList.length > 0) {
                setIsValidSequenceBackend(true);
            }
        });
    };

    /**
     * Handled the file upload action of the dropzone.
     *
     * @param {array} file The accepted file list by the dropzone.
     * */
    const onDrop = (file) => {
        const customBackendFile = file[0];
        const acceptedFiles = ['xml'];
        const extension = customBackendFile.name.split('.');
        if (!acceptedFiles.includes(extension[1])) {
            setIsRejected(true);
        } else {
            setIsRejected(false);
        }
        if (customBackendFile) {
            setCustomBackend({ name: customBackendFile.name, content: customBackendFile });
        }
    };

    const iff = (condition, then, otherwise) => (condition ? then : otherwise);
    return (
        <StyledGrid container direction='column'>
            <Grid>
                <Typography className={classes.customBackendHeader}>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.CustomBackend'
                        defaultMessage='Custom Backend'
                    />
                </Typography>
            </Grid>
            <Grid item>
                <List>
                    <ListItem
                        button
                        disabled={(isRestricted(['apim:api_create'], apiFromContext))}
                        className={classes.addCustomBackendBtn}
                        onClick={() => setUploadCustomBackendOpen(true)}
                        id='custom-backend-add-btn'
                    >
                        <ListItemAvatar>
                            <IconButton size='large'>
                                <Icon>add</Icon>
                            </IconButton>
                        </ListItemAvatar>
                        <ListItemText>
                            <FormattedMessage
                                    id='Apis.Details.Endpoints.CustomBackend.AddCertificat'
                                    defaultMessage='Add Custom Backend' 
                                />
                        </ListItemText>
                    </ListItem>
                </List>
                <Box my={1} />
                    <>
                        <Typography className={classes.productionBackendTitle}>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.production.certificates'
                                defaultMessage='Production' 
                            />
                        </Typography>
                        <List className={classes.backendList} data-testid='list-production-backend'>
                            {productionBackendList?.length > 0 ? (
                                productionBackendList.map((backend) => {
                                    return (
                                        <ListItem id={`production-backend-list-item-${backend.sequenceName}`}>
                                            <ListItemAvatar>
                                                <TextSnippetIcon />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={backend.sequenceName}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                                    onClick={() => downloadCustomBackend(API_SECURITY_KEY_TYPE_PRODUCTION)}  
                                                    id='download-backend-btn'
                                                >
                                                    <CloudDownloadIcon className={isRestricted(['apim:api_create'], apiFromContext)
                                                        ? classes.deleteIconDisable : classes.deleteIcon} />
                                                </IconButton>
                                                
                                                <IconButton
                                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                                    onClick={(event) => showSequenceBackendDeleteDialog(event,
                                                        API_SECURITY_KEY_TYPE_PRODUCTION, backend.sequenceName)}
                                                    id='delete-backend-btn'
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
                                            id='Apis.Details.Endpoints.CustomBackend.no.production.backend'
                                            defaultMessage='You do not have any production type backend uploaded'
                                        />
                                    </ListItemText>
                                </ListItem>
                            )}
                        </List>
                        <Box my={2} />
                        <Typography className={classes.sandboxCertificatesListTitle}>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.GeneralConfiguration.CustomBackend.sandbox.backend'
                                defaultMessage='Sandbox' 
                            />
                        </Typography>
                        <List className={classes.backendList} data-testid='list-sandbox-backend'>
                            {sandBoxBackendList?.length > 0 ? (
                                sandBoxBackendList.map((backend) => {
                                    return (
                                        <ListItem id={`sandbox-backend-list-item-${backend.sequenceName}`}>
                                            <ListItemAvatar>
                                                <TextSnippetIcon />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={backend.sequenceName}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                                    onClick={() => downloadCustomBackend(API_SECURITY_KEY_TYPE_SANDBOX)}  
                                                    id='download-backend-btn'                                           
                                                >
                                                    <CloudDownloadIcon className={isRestricted(['apim:api_create'], apiFromContext)
                                                            ? classes.deleteIconDisable : classes.deleteIcon} />
                                                </IconButton>
                                                <IconButton
                                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                                    onClick={(event) => showSequenceBackendDeleteDialog(event,
                                                        API_SECURITY_KEY_TYPE_SANDBOX, backend.sequenceName)}
                                                    id='delete-backend-btn'
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
                                            id='Apis.Details.Endpoints.CustomBackend.no.sandbox.backend'
                                            defaultMessage='You do not have any sandbox type backend uploaded'
                                        />
                                    </ListItemText>
                                </ListItem>
                            )}
                        </List>
                    </>
            </Grid>
            <StyledDialog open = {uploadCustomBackendOpen}>
                <DialogTitle>
                    <Typography className={classes.uploadCustomBackendDialogHeader}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.CustomBackend.uploadCustomBackend'
                            defaultMessage='Upload Custom Backend'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid>
                        <div>
                            { api.gatewayType === 'wso2/synapse' && (sandBoxBackendList.length === 0 || productionBackendList.length === 0) && (
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
                                            disabled={productionBackendList.length > 0}
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
                                            disabled={sandBoxBackendList.length > 0}
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
                                </>
                            )}
                            <Dropzone
                                multiple={false}
                                accept={
                                    'application/xml,'
                                        + 'text/xml,'
                                        + '.xml'
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
                                        <div className={classes.dropZoneWrapper} data-testid='custom-backend-upload-btn'>
                                            {customBackend.name === '' ? (
                                                <div>
                                                    <Icon style={{ fontSize: 56 }}>cloud_upload</Icon>
                                                    <Typography>
                                                        <FormattedMessage
                                                            id={
                                                                'Apis.Details.Endpoints'
                                                                    + '.UploadCustomBackend.click.or.drop.to.upload.file'
                                                            }
                                                            defaultMessage={
                                                                'Click or drag the custom backend'
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
                                                            {customBackend.name}
                                                        </Grid>
                                                        <Grid xs={12}>
                                                            <Typography variant='caption' color='error'>
                                                                <FormattedMessage
                                                                    id={
                                                                        'Apis.Details.Endpoints'
                                                                + '.UploadCustomBackend.invalid.file'
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
                                                            {customBackend.name}
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
                    <Button onClick={closeCustomBackendUpload}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.UploadCustomBackend.cancel.button'
                            defaultMessage='Close'
                        />
                    </Button>
                    <Button
                        id='upload-custom-backend-save-btn'
                        onClick={saveCustomBackend}
                        variant='contained'
                        color='primary'
                        autoFocus
                        disabled={
                                customBackend.name === ''
                                || isSaving
                                || isRejected
                        }
                    >
                        <FormattedMessage
                            id='Apis.Details.Endpoints.UploadCustomBackend.config.save.button'
                            defaultMessage='Save'
                        />
                        {isSaving && <CircularProgress size={24} />}
                    </Button>
                </DialogActions>
            </StyledDialog>
            <Dialog open={sequenceBackendToDelete.open}>
                <DialogTitle>
                    <Typography className={classes.uploadSequenceBackendDialogHeader}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.SequenceBackend.deleteCustomBackend'
                            defaultMessage='Delete with caution!'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.alertWrapper}>
                    <div id='warning-message'>
                        <Typography>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.GeneralConfiguration.Certificates.confirm.certificate.delete'
                                defaultMessage='Are you sure you want to delete '
                            />
                            {' '}
                            { sequenceBackendToDelete.name + '?'}
                        </Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => 
                            deleteSequenceBackendByKey(sequenceBackendToDelete.keyType)
                        }
                        variant='contained'
                        color='primary'
                        disabled={isDeleting}
                        autoFocus
                        id='delete-backend-confirm-btn'
                    >
                        <FormattedMessage
                            id='Apis.Details.Endpoints.SequenceBackend.delete.ok.button'
                            defaultMessage='OK'
                        />
                        {isDeleting && <CircularProgress size={24} />}

                    </Button>
                    <Button onClick={() => setSequenceBackendToDelete({ open: false, keyType: '', alias: '' })}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.SequenceBackend.delete.cancel.button'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledGrid>
    );
}

CustomBackend.defaultProps = {
    sandBoxBackendList: [],
    productionBackendList: [],
};

CustomBackend.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    productionBackendList: PropTypes.shape([]),
    sandBoxBackendList: PropTypes.shape([]),
    setSandBoxBackendList: PropTypes.func.isRequired,
    setProductionBackendList: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    uploadCustomBackendOpen: PropTypes.bool.isRequired,
    setUploadCustomBackendOpen: PropTypes.func.isRequired,
    isValidSequenceBackend: PropTypes.bool.isRequired,
    setIsValidSequenceBackend: PropTypes.func.isRequired,
};
