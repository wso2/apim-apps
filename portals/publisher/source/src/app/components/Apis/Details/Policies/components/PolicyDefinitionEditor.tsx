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

import React, {
    useState, Suspense, Dispatch, SetStateAction, useEffect,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Box, Grid,
} from '@material-ui/core';
import { Progress } from 'AppComponents/Shared';
import { ControlledEditor, monaco } from "@monaco-editor/react";
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import policyDefJsonSchema from './JsonSchema.json'

const useStyles = makeStyles((theme: any) => ({
    root: {
        marginBottom: theme.spacing(5),
    },
    error: {
        color: theme.palette.error.dark,
    },
}));

interface PolicyDefinitionProps {
    policyCategory: string;
    policyName: string;
    policyDisplayName: string;
    policyDescription: string;
    multipleAllowed: boolean;
    applicableFlows: string[];
    supportedGateways: string[];
    supportedApiTypes: string[];
    policyAttributes: any;
}

interface PolicyDefinitionEditorProps {
    isReadOnly: boolean;
    policyDefinition: PolicyDefinitionProps;
    setPolicyDefinition: Dispatch<SetStateAction<PolicyDefinitionProps>>;
}

/**
 * Renders the policy definition add & view options using the monaco editor.
 * @param {any} PolicyDefinitionEditorProps Input props from parent components.
 * @returns {TSX} Policy definition editor UI.
 */
const PolicyDefinitionEditor: React.FC<PolicyDefinitionEditorProps> = ({
    isReadOnly, policyDefinition, setPolicyDefinition,
}) => {
    const classes = useStyles();
    const [policyDefinitionSchema, setPolicyDefinitionSchema] = useState<any>();
    
    useEffect(() => {
        // const policyDefSchemaVal;
        // restApi.tenantConfSchemaGet().then((result) => {
        //     tenantConfSchemaVal = result.body;
        //     dispatch({ field: 'tenantConfSchema', value: tenantConfSchemaVal });
        // });
        const policyDefSchemaVal = policyDefJsonSchema;
        setPolicyDefinitionSchema(policyDefSchemaVal);
    }, [policyDefinitionSchema]);

    
    monaco
        .init()
        .then((monacol) => {
            monacol.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                schemas: [{
                    uri: 'http://myserver/foo-schema.json',
                    fileMatch: ['*'],
                    schema: policyDefinitionSchema,
                }]
            });
        })
        .catch((error) => {
            console.error('An error occurred during initialization of Monaco editor: ', error);
        })

    const monacoEditorOptions = {
        readOnly: isReadOnly,
    };

    const handleEditorChange = (ev: monacoEditor.editor.IModelContentChangedEvent, value: string | undefined) => {
        setPolicyDefinition(JSON.parse(value || ''));
    }

    return (
        <>
            <Box component='div' m={2} className={classes.root}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12} lg={12}>
                        <Suspense fallback={<Progress />}>
                            <ControlledEditor
                                height='350px'
                                language='json'
                                theme='vs-dark'
                                options={monacoEditorOptions}
                                value={JSON.stringify(policyDefinition, null, 2)}
                                onChange={handleEditorChange}
                            />
                        </Suspense>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default PolicyDefinitionEditor;
