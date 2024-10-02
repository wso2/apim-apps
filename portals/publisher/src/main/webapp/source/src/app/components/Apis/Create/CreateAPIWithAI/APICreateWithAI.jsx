/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { styled } from '@mui/material/styles';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from '@mui/material';

const PREFIX = 'APICreateWithAI';

const classes = {
    root: `${PREFIX}-root`,
    table: `${PREFIX}-table`,
};

const Root = styled('div')({
    padding: '20px',
    backgroundColor: '#f5f5f5',
});

const APICreateWithAI = () => {
    // Sample data for the table
    const data = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
        { id: 3, name: 'Test 3' },
    ];

    return (
        <Root>
            <h1>Testing</h1>
            <TableContainer component={Paper}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Column 1</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Root>
    );
};

export default APICreateWithAI;
