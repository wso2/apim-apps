/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import AssistantIcon from '@mui/icons-material/Assistant';
import Alert from 'AppComponents/Shared/Alert';
import DropZoneLocal from 'AppComponents/Shared/DropZoneLocal';
import { styled } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

/**
 * Renders the AI Vendor API Definition add/edit UI.
 * @param {JSON} props Input props form parent components.
 * @returns {JSX} AI Vendor API Definition manage UI.
 */
export default function AIAPIDefinition(props) {
    const intl = useIntl();
    const {
        apiDefinition,
        dispatch,
        vendorName,
        file,
        setFile,
    } = props;

    const onDrop = (acceptedFile) => {
        const reader = new FileReader();
        setFile(acceptedFile[0]);
        reader.readAsText(acceptedFile[0], 'UTF-8');
        reader.onload = (evt) => {
            dispatch({
                field: 'apiDefinition',
                value: evt.target.result,
            });
        };
        reader.onerror = () => {
            Alert.success(intl.formatMessage({
                id: 'AiVendors.OpenAPI.file.error',
                defaultMessage: 'Error reading file',
            }));
        };
    };

    const getFileExtension = (apiDefinitionInput) => {
        try {
            JSON.parse(apiDefinitionInput);
            return 'json';
        } catch (e) {
            return 'yaml';
        }
    };

    const fileExtension = getFileExtension(apiDefinition);

    return (
        <>
            {(apiDefinition && vendorName) ? (
                <Box m={1} display='flex' flexDirection='row' alignItems='center'>
                    <AssistantIcon />
                    <Box flex='1' ml={1}>
                        <a
                            href={`data:text/plain;charset=utf-8,${encodeURIComponent(apiDefinition)}`}
                            download={`${vendorName}.${fileExtension}`}
                        >
                            {(file && file.name) || `${vendorName}.${fileExtension}`}
                        </a>
                    </Box>
                    <IconButton
                        edge='end'
                        aria-label='delete'
                        onClick={() => {
                            dispatch({
                                field: 'apiDefinition',
                                value: '',
                            });
                            setFile(null);
                        }}
                        data-testid='ai-api-definition-delete-button'
                        sx={{ mr: 1 }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ) : (
                <>
                    <InputLabel sx={{ position: 'relative', marginBottom: 1 }}>
                        <FormattedMessage
                            id='AiVendors.AddEditAiVendor.apiDefinition.upload'
                            defaultMessage='Upload API Definition'
                        />
                        <StyledSpan>*</StyledSpan>
                    </InputLabel>
                    <DropZoneLocal
                        onDrop={onDrop}
                        accept='.json, .yaml, .yml'
                        baseStyle={{ padding: '16px 20px' }}
                    >
                        <FormattedMessage
                            id='AiVendors.AiAPIDefinition.drag.and.drop.message'
                            defaultMessage='Drag and Drop files here {break} or {break}'
                            values={{ break: <br /> }}
                        />
                        <Button variant='contained'>
                            <FormattedMessage
                                id='AiVendors.AiAPIDefinition.browse.files.to.upload'
                                defaultMessage='Browse File to Upload'
                            />
                        </Button>
                    </DropZoneLocal>
                </>
            )}
        </>
    );
}
