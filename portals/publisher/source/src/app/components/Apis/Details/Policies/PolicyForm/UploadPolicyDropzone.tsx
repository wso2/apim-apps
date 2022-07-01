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

import React, { FC } from 'react';
import { List, makeStyles, IconButton, Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { FormattedMessage } from 'react-intl';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import DeleteIcon from '@material-ui/icons/Delete';
import Dropzone from 'react-dropzone';
import clsx from 'clsx';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import Icon from '@material-ui/core/Icon';
import { HelpOutline } from '@material-ui/icons';
import { GATEWAY_TYPE_LABELS } from './SourceDetails';

const useStyles = makeStyles((theme: Theme) => ({
    dropZoneWrapper: {
        border: '1px dashed ' + theme.palette.primary.main,
        borderRadius: '5px',
        cursor: 'pointer',
        padding: `${theme.spacing(2)}px ${theme.spacing(2)}px`,
        position: 'relative',
        textAlign: 'center',
        width: '75%',
        height: '4em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        '& span': {
            fontSize: 64,
            color: theme.palette.primary.main,
        },
    },
    acceptDrop: {
        backgroundColor: green[50],
        borderColor: 'green',
    },
    rejectDrop: {
        backgroundColor: red[50],
        borderColor: 'red',
    },
    uploadedFileDetails: {
        width: '75%',
    },
    mandatoryStar: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },
}));

interface UploadPolicyDropzoneProps {
    policyDefinitionFile: any[];
    setPolicyDefinitionFile: React.Dispatch<React.SetStateAction<any[]>>;
    gateway: string;
}

/**
 * Handles the policy file upload.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy file upload managing UI.
 */
const UploadPolicyDropzone: FC<UploadPolicyDropzoneProps> = ({
    policyDefinitionFile,
    setPolicyDefinitionFile,
    gateway,
}) => {
    const classes = useStyles();

    const handleDrop = (policyDefinition: any) => {
        setPolicyDefinitionFile(policyDefinition);
    };

    const renderPolicyFileDropzone = () => {
        return (
            <Dropzone
                multiple={false}
                // accept='.j2' TODO: https://github.com/react-dropzone/react-dropzone/issues/171
                onDrop={handleDrop}
            >
                {({
                    getRootProps,
                    getInputProps,
                    isDragAccept,
                    isDragReject,
                }) => {
                    return (
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        <div {...getRootProps({})}>
                            <div
                                className={clsx(
                                    classes.dropZoneWrapper,
                                    isDragAccept ? classes.acceptDrop : null,
                                    isDragReject ? classes.rejectDrop : null,
                                )}
                                data-testid='file-drop-zone'
                            >
                                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                <input {...getInputProps()} />
                                <Icon>cloud_upload</Icon>
                                <Typography id='upload-policy-file-for-policy'>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.PolicyForm.UploadPolicyDropzone.dropzone.description'
                                        defaultMessage='Click or drag the policy file to upload'
                                    />
                                </Typography>
                            </div>
                        </div>
                    );
                }}
            </Dropzone>
        );
    };

    return (
        <>
            <Box display='flex' flexDirection='row' alignItems='center'>
                <Box mt={2}>
                    <Typography
                        color='inherit'
                        variant='subtitle2'
                        component='div'
                    >
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.UploadPolicyDropzone.title'
                            defaultMessage='Upload Policy File for {gateway}'
                            values={{ gateway }}
                        />
                        <sup className={classes.mandatoryStar}>*</sup>
                        <Tooltip
                            title={
                                gateway === GATEWAY_TYPE_LABELS.SYNAPSE
                                    ? 'Regular gateway only supports .j2 and .xml file uploads'
                                    : 'Choreo Connect only supports .gotmpl file uploads'
                            }
                            placement='right'
                            interactive
                        >
                            <IconButton aria-label='policy-file-upload-helper-text'>
                                <HelpOutline fontSize='small' />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Typography color='inherit' variant='caption' component='p'>
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.UploadPolicyDropzone.description'
                            defaultMessage='Policy file contains the business logic of the policy'
                        />
                    </Typography>
                </Box>
            </Box>
            <Box mt={2} mb={4}>
                {policyDefinitionFile.length === 0 ? (
                    renderPolicyFileDropzone()
                ) : (
                    <List className={classes.uploadedFileDetails}>
                        <ListItem key={policyDefinitionFile[0].path}>
                            <ListItemAvatar>
                                <Avatar>
                                    <InsertDriveFile />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={`${policyDefinitionFile[0].path}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge='end'
                                    aria-label='delete'
                                    onClick={() => setPolicyDefinitionFile([])}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                )}
            </Box>
        </>
    );
};

export default UploadPolicyDropzone;
