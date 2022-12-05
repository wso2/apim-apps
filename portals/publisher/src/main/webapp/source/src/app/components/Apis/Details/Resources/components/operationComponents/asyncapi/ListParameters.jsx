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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { makeStyles } from '@mui/styles';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import EditParameter from './EditParameter';

const useStyles = makeStyles({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        minWidth: 650,
    },
});

/**
 *
 * Renders the operation parameters section
 * @export
 * @param {*} props
 * @returns
 */
export default function ListParameters(props) {
    const {
        operation, operationsDispatcher, target, verb, disableUpdate, disableForSolace,
    } = props;
    const classes = useStyles();
    const [editingParameter, setEditingParameter] = useState(null);

    return <>
        {editingParameter !== null && (
            <EditParameter
                operationsDispatcher={operationsDispatcher}
                target={target}
                verb={verb}
                editingParameter={editingParameter}
                setEditingParameter={setEditingParameter}
                disableForSolaceAPI={disableForSolace}
            />
        )}
        <Table className={classes.table} aria-label='parameters list'>
            <TableHead>
                <TableRow>
                    <TableCell>
                        <FormattedMessage
                            id='Apis.Details.Topics.components.operationComponents.ListParameter.param.name'
                            defaultMessage='Name'
                        />
                    </TableCell>
                    <TableCell align='left'>
                        <FormattedMessage
                            id='Apis.Details.Topics.components.operationComponents.ListParameter.param.datatype'
                            defaultMessage='Data Type'
                        />
                    </TableCell>
                    <TableCell align='left'>
                        <FormattedMessage
                            id='Apis.Details.Topics.components.operationComponents.ListParameter.param.description'
                            defaultMessage='Description'
                        />
                    </TableCell>
                    {!disableUpdate && (
                        <TableCell align='left'>
                            <FormattedMessage
                                id='Apis.Details.Topics.components.operationComponents.ListParameter.actions'
                                defaultMessage='Actions'
                            />
                        </TableCell>
                    )}
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    operation.parameters && Object.entries(operation.parameters).map(([k, v]) => {
                        return (
                            <TableRow key={k}>
                                <TableCell align='left'>{k}</TableCell>
                                <TableCell align='left'>{v.schema.type}</TableCell>
                                <TableCell align='left'>{v.description}</TableCell>
                                <TableCell align='left'>
                                    <Tooltip title={(
                                        <FormattedMessage
                                            id={'Apis.Details.Resources.components.operationComponents.'
                                        + 'ListParameter.edit'}
                                            defaultMessage='Edit'
                                        />
                                    )}
                                    >
                                        <IconButton
                                            disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                                            onClick={() => setEditingParameter({ name: k, ...v })}
                                            fontSize='small'
                                            size='large'>
                                            <EditIcon fontSize='small' />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })
                }
            </TableBody>
        </Table>
    </>;
}

ListParameters.defaultProps = {
    disableUpdate: false,
    disableForSolace: false,
};
ListParameters.propTypes = {
    operation: PropTypes.shape({}).isRequired,
    spec: PropTypes.shape({}).isRequired,
    operationsDispatcher: PropTypes.func.isRequired,
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    disableUpdate: PropTypes.bool,
    resolvedSpec: PropTypes.shape({}).isRequired,
    disableForSolace: PropTypes.bool,
};
