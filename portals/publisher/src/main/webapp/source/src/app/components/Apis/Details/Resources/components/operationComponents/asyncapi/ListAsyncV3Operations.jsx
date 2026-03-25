/*
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com/).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { isRestricted } from 'AppData/AuthManager';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

function ListAsyncV3Operations({
    operationsSnapshot, operations, markedOperations, onDeleteOperation, onUndoDeleteOperation,
    disableDelete, spec,
}) {
    const allOperations = (operationsSnapshot.length > 0 ? operationsSnapshot : operations)
        .filter((op) => operations.includes(op) || (markedOperations || []).includes(op));

    function getOperationMessages(opName) {
        if (!spec?.operations?.[opName]?.messages) return [];

        const opMessages = spec.operations[opName].messages;
        const result = [];

        opMessages.forEach((msgRef) => {
            const msgName = msgRef.$ref?.split('/messages/')[1];
            if (!msgName) return;

            const chKey = spec.operations[opName]?.channel?.$ref?.replace('#/channels/', '');
            const channelMsg = spec.channels?.[chKey]?.messages?.[msgName];
            if (!channelMsg?.$ref) return;

            const refParts = channelMsg.$ref.split('/').filter(Boolean);
            let componentMsg = spec;
            refParts.forEach((part) => { if (part !== '#') componentMsg = componentMsg?.[part]; });
            if (!componentMsg) return;

            let payloadSchema = componentMsg.payload;
            if (payloadSchema?.$ref) {
                const schemaParts = payloadSchema.$ref.split('/').filter(Boolean);
                payloadSchema = spec;
                schemaParts.forEach((part) => { if (part !== '#') payloadSchema = payloadSchema?.[part]; });
            }

            const properties = payloadSchema?.properties || {};
            const isAutoGen = spec.components?.messages?.[msgName]?.['x-wso2-default'] === true;

            result.push({
                msgName: isAutoGen ? 'Default Message' : msgName,
                properties: Object.entries(properties).map(([propName, propVal]) => ({
                    name: propName,
                    type: propVal.type || '—',
                    description: propVal.description || '—',
                })),
            });
        });

        return result;
    }

    return (
        <>
            <Grid item xs={12} md={12}>
                <Typography variant='subtitle1'>
                    <FormattedMessage
                        id='Apis.Details.Operations.Operations.title'
                        defaultMessage='Operations'
                    />
                    <Divider variant='middle' />
                </Typography>
            </Grid>
            <Grid item md={1} />
            <Grid item md={10}>
                {allOperations && allOperations.length > 0 ? (
                    allOperations.map((opName) => {
                        const messages = getOperationMessages(opName);
                        const isMarked = (markedOperations || []).includes(opName);
                        return (
                            <Box key={opName} sx={{ position: 'relative', mb: 1 }}>
                                {isMarked && (
                                    <Box sx={{
                                        position: 'absolute',
                                        zIndex: 10,
                                        right: '10%',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                    }}>
                                        <Tooltip title='Marked for delete'>
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUndoDeleteOperation(opName);
                                                }}
                                                variant='outlined'
                                            >
                                                <FormattedMessage
                                                    id='Apis.Details.Resources.components.Operation.undo.delete'
                                                    defaultMessage='Undo Delete'
                                                />
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                )}
                                <Accordion
                                    disabled={isMarked}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ border: '1px solid #f2d4a7' }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            minHeight: '40px',
                                            backgroundColor: 'rgba(242, 212, 167, 0.15)',
                                            '& .MuiAccordionSummary-content': { my: 0.5 },
                                        }}
                                    >
                                        <Box display='flex' alignItems='center'
                                            justifyContent='space-between' width='100%' pr={1}>
                                            <Typography>{opName}</Typography>
                                            {!disableDelete && !isMarked && (
                                                <Tooltip title={
                                                    <FormattedMessage
                                                        id='Apis.Details.Resources.components.Operation.Delete'
                                                        defaultMessage='Delete'
                                                    />
                                                }>
                                                    <div>
                                                        <IconButton
                                                            disabled={isRestricted(['apim:api_publish',
                                                                'apim:api_create'])}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteOperation(opName);
                                                            }}
                                                            size='small'
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </div>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 2, py: 1.5 }}>
                                        {messages.length > 0 ? (
                                            <>
                                                <Typography>
                                                    <FormattedMessage
                                                        id={'Apis.Details.Resources.components.operationComponents.'
                                                            + 'asyncapi.ListAsyncV3Operations.messages.title'}
                                                        defaultMessage='Messages'
                                                    />
                                                </Typography>
                                                <Divider sx={{ mb: 1.5 }} />
                                                <Table
                                                    size='small'
                                                    sx={{
                                                        '& .MuiTableCell-root': {
                                                            border: '1px solid rgba(224, 224, 224, 1)',
                                                            py: 1,
                                                            px: 1.5,
                                                        },
                                                        '& .MuiTableHead-root .MuiTableCell-root': {
                                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                                        },
                                                    }}
                                                >
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>
                                                                <FormattedMessage
                                                                    id={'Apis.Details.Resources.components.'
                                                                        + 'operationComponents.asyncapi.'
                                                                        + 'ListAsyncV3Operations.message.name'}
                                                                    defaultMessage='Message Name'
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormattedMessage
                                                                    id={'Apis.Details.Resources.components.'
                                                                        + 'operationComponents.asyncapi.'
                                                                        + 'ListAsyncV3Operations.message.property'}
                                                                    defaultMessage='Property Name'
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormattedMessage
                                                                    id={'Apis.Details.Resources.components.'
                                                                        + 'operationComponents.asyncapi.'
                                                                        + 'ListAsyncV3Operations.message.type'}
                                                                    defaultMessage='Data Type'
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormattedMessage
                                                                    id={'Apis.Details.Resources.components.'
                                                                        + 'operationComponents.asyncapi.'
                                                                        + 'ListAsyncV3Operations.message.description'}
                                                                    defaultMessage='Description'
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {messages.map(({ msgName, properties }) =>
                                                            properties.length > 0 ? (
                                                                properties.map((prop, propIndex) => (
                                                                    <TableRow key={`${msgName}_${prop.name}`}>
                                                                        {propIndex === 0 && (
                                                                            <TableCell
                                                                                rowSpan={properties.length}
                                                                                sx={{ verticalAlign: 'middle' }}
                                                                            >
                                                                                {msgName}
                                                                            </TableCell>
                                                                        )}
                                                                        <TableCell>{prop.name}</TableCell>
                                                                        <TableCell>{prop.type}</TableCell>
                                                                        <TableCell>{prop.description}</TableCell>
                                                                    </TableRow>
                                                                ))
                                                            ) : (
                                                                <TableRow key={msgName}>
                                                                    <TableCell> {msgName}</TableCell>
                                                                    <TableCell colSpan={3}>
                                                                        <Typography
                                                                        >
                                                                            <FormattedMessage
                                                                                id={'Apis.Details.Resources.components.'
                                                                                    + 'operationComponents.asyncapi.'
                                                                                    + 'ListAsyncV3Operations.no.props'}
                                                                                defaultMessage='No properties defined'
                                                                            />
                                                                        </Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </>
                                        ) : (
                                            <Box py={1}>
                                                <Typography color='text.secondary'>
                                                    <FormattedMessage
                                                        id={'Apis.Details.Resources.components.operationComponents.'
                                                            + 'asyncapi.ListAsyncV3Operations.no.messages'}
                                                        defaultMessage='No messages defined'
                                                    />
                                                </Typography>
                                            </Box>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        );
                    })
                ) : (
                    <Typography color='text.secondary'>
                        <FormattedMessage
                            id={'Apis.Details.Resources.components.operationComponents.asyncapi.'
                                + 'ListAsyncV3Operations.no.operations'}
                            defaultMessage='No operations'
                        />
                    </Typography>
                )}
            </Grid>
            <Grid item md={1} />
        </>
    );
}

ListAsyncV3Operations.propTypes = {
    operations: PropTypes.arrayOf(PropTypes.string).isRequired,
    operationsSnapshot: PropTypes.arrayOf(PropTypes.string),
    markedOperations: PropTypes.arrayOf(PropTypes.string),
    onDeleteOperation: PropTypes.func,
    onUndoDeleteOperation: PropTypes.func,
    disableDelete: PropTypes.bool,
    spec: PropTypes.shape({}),
};

ListAsyncV3Operations.defaultProps = {
    operationsSnapshot: [],
    markedOperations: [],
    onDeleteOperation: () => {},
    onUndoDeleteOperation: () => {},
    disableDelete: false,
    spec: {},
};

export default ListAsyncV3Operations;
