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

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
    Grid,
    Tooltip,
    InputAdornment,
    IconButton, Icon,
} from '@mui/material';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { 
    API_SECURITY_KEY_TYPE_PRODUCTION, 
    API_SECURITY_KEY_TYPE_SANDBOX 
} from '../../Configuration/components/APISecurity/components/apiSecurityConstants';
import { set } from 'msw/lib/types/context';


const PREFIX = 'CustomBackend';

const classes = {
    endpointInputWrapper: `${PREFIX}-endpointInputWrapper`,
    textField: `${PREFIX}-textField`,
    input: `${PREFIX}-input`,
    iconButton: `${PREFIX}-iconButton`,
    addCustomBackendBtn: `${PREFIX}-addCustomBackendBtn`,
    uploadCustomBackendDialogHeader: `${PREFIX}-uploadCustomBackendDialogHeader`,
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

    [`& .${classes.addCustomBackendBtn}`]: {
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

    [`& .${classes.uploadCustomBackendDialogHeader}`]: {
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
 * This is Custom Backend component.
 * 
 * @param {any} props The input props
 * @returns {any} The HTML representation of the component.
 */
export default function CustomBackend(props) {
    const {
        api,
        uploadCustomBackendOpen,
        uploadCustomBackend,
        sandBoxList,
        productionList,
    } = props;
    const [customBackend, setCustomBackend] = useState({ name: '', content: {} });
    const [isSaving, setSaving] = useState(false);
    const [keyType, setKeyType] = useState(API_SECURITY_KEY_TYPE_PRODUCTION);
    const [isRejected, setIsRejected] = useState(false);
    const intl = useIntl();
    
    const closeCustomBackendUpload = () => {
        setUploadCustomBackendOpen(false);
        setCustomBackend({ name: '', content: '' });
        setKeyType(API_SECURITY_KEY_TYPE_PRODUCTION);
    };

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
        uploadCustomBackend(customBackend.content, keyType)
        .then(() => {
            closeCustomBackendUpload();
            if (keyType === API_SECURITY_KEY_TYPE_SANDBOX) {
                sandBoxList.push(customBackend);
            } else {
                productionList.push(customBackend);
            }
        })
        .finally(() => setSaving(false));
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

    return (
        <StyledDialog open={uploadCustomBackendOpen}>
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
                        { api.gatewayType === 'wso2/synapse' (
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
                                        {backend.name === '' ? (
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
                                                        {backend.name}
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
    );
}

CustomBackend.defaultProps = {
    productionList: [],
    sandBoxList: [],
};

CustomBackend.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    productionList: PropTypes.shape({}),
    sandBoxList: PropTypes.shape({}),
    uploadCustomBackend: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    uploadCustomBackendOpen: PropTypes.bool.isRequired,
    uploadCustomBackend: PropTypes.bool.isRequired,
    setUploadCustomBackendOpen: PropTypes.func.isRequired,
};
