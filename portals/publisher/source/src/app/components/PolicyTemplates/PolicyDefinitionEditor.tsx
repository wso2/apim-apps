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

import React, {
    useState, Suspense, Dispatch, SetStateAction, useEffect,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Box, Grid,
} from '@material-ui/core';
// import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { ControlledEditor, monaco } from "@monaco-editor/react";
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import policyDefJsonSchema from './JsonSchema.json';

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

    useEffect(() => {
        // const policyDefSchemaVal;
        // restApi.tenantConfSchemaGet().then((result) => {
        //     tenantConfSchemaVal = result.body;
        //     dispatch({ field: 'tenantConfSchema', value: tenantConfSchemaVal });
        // });
        const policyDefSchemaVal = policyDefJsonSchema;
        setPolicyDefinitionSchema(policyDefSchemaVal);
    }, [policyDefinitionSchema]);

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

//  ------------------------------------------
// //
// /*
//  * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
//  *
//  * WSO2 Inc. licenses this file to you under the Apache License,
//  * Version 2.0 (the "License"); you may not use this file except
//  * in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  * http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing,
//  * software distributed under the License is distributed on an
//  * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
//  * KIND, either express or implied. See the License for the
//  * specific language governing permissions and limitations
//  * under the License.
//  */

// // import { Box, Grid, Button } from '@material-ui/core';
// // import { Progress } from 'AppComponents/Shared';
// // import React, { Suspense } from 'react';
// // import { FormattedMessage } from 'react-intl';
// // import MonacoEditor from 'react-monaco-editor';
// import React, {
//     useReducer, useState, Suspense, lazy, useEffect, useRef, Dispatch, SetStateAction,
// } from 'react';
// // import { FormattedMessage } from 'react-intl';
// import { makeStyles } from '@material-ui/core/styles';
// import {
//     Box, Grid,
// } from '@material-ui/core';
// import API from 'AppData/api';
// // import Alert from 'AppComponents/Shared/Alert';
// import { Progress } from 'AppComponents/Shared';
// // import { monaco } from 'react-monaco-editor';
// // import {} from 'monaco-editor/react';
// import policyDefJsonSchema from './JsonSchema.json';

// const MonacoEditor = lazy(() => import('react-monaco-editor' /* webpackChunkName: "PolicyDefinitionMonaco" */));

// const useStyles = makeStyles((theme: any) => ({
//     root: {
//         marginBottom: theme.spacing(5),
//     },
//     error: {
//         color: theme.palette.error.dark,
//     },
// }));

// interface PolicyDefinitionProps {
//     policyCategory: string;
//     policyName: string;
//     policyDisplayName: string;
//     policyDescription: string;
//     multipleAllowed: boolean;
//     applicableFlows: string[];
//     supportedGateways: string[];
//     supportedApiTypes: string[];
//     policyAttributes: any;
// }

// interface PolicyDefinitionEditorProps {
//     isReadOnly: boolean;
//     policyDefinition: PolicyDefinitionProps;
//     setPolicyDefinition: Dispatch<SetStateAction<PolicyDefinitionProps>>;
// }

// // const DefaultPolicyDefinition = {
// //     policyCategory: 'Mediation',
// //     policyName: '',
// //     policyDisplayName: '',
// //     policyDescription: '',
// //     multipleAllowed: false,
// //     applicableFlows: ['Request', 'Response', 'Fault'],
// //     supportedGateways: ['Synapse'],
// //     supportedApiTypes: ['REST'],
// //     policyAttributes: [],
// // };

// // const reducer = (state: any, { field, value }: any) => {
// //     switch (field) {
// //         case 'policyDefinition':
// //             return { ...state, [field]: value };
// //         case 'policyDefinitionSchema':
// //             return { ...state, [field]: value };
// //         // case 'editDetails':
// //         //     return value;
// //         // case 'reset':
// //         //     return { tenantConf: '', tenantConfSchema: '' };
// //         default:
// //             return state;
// //     }
// // }

// /**
//  * Renders the policy definition add & view options using the monaco editor.
//  * @param {JSON} props Input props from parent components.
//  * @returns {TSX} Policy definition editor UI.
//  */
// const PolicyDefinitionEditor: React.FC<PolicyDefinitionEditorProps> = ({
//     isReadOnly, policyDefinition, setPolicyDefinition
// }) => {
//     const classes = useStyles();
//     // const [policyDefinition, setPolicyDefinition] = useState(DefaultPolicyDefinition);
//     // const [policyDefinitionSchema, setpolicyDefinitionSchema] = useState(policyDefJsonSchema);
//     // const [isEditorReady, setIsEditorReady] = useState(false);
//     // const valueGetter = useRef();
//     // const [initialState] = useState({
//     //     policyDefinition: DefaultPolicyDefinition,
//     //     policyDefinitionSchema: policyDefJsonSchema,
//     // });
//     // const [state, dispatch] = useReducer(reducer, initialState);

//     // useEffect(() => {
//     //     let policyDefinitionVal;
//     //     let policyDefinitionSchemaVal;
//     //     restApi.tenantConfSchemaGet().then((result) => {
//     //         tenantConfSchemaVal = result.body;
//     //         dispatch({ field: 'tenantConfSchema', value: tenantConfSchemaVal });
//     //     });
//     //     restApi.tenantConfGet().then((result) => {
//     //         tenantConfVal = JSON.stringify(result.body, null, '\t');
//     //         dispatch({ field: 'tenantConf', value: tenantConfVal });
//     //     });
//     // }, []);

//     // ]);
//     // const [state, dispatch] = useReducer(reducer, initialState);
//     const monacoEditorOptions = {
//         readOnly: isReadOnly,
//     };

//     // const handleEditorDidMount = (monaco: any) => {
//     //     // const jsonSchema = policyDefinitionSchema;
//     //     monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
//     //         completion: true,
//     //         validate: true,
//     //         format: true,
//     //         schemas: [{
//     //             uri: 'http://myserver/foo-schema.json',
//     //             fileMatch: ['*'],
//     //             schema: policyDefJsonSchema,
//     //         }],
//     //     });
//     // };


//     // // const handleEditorDidMount = (_valueGetter: monaco.editor.IStandaloneCodeEditor) => {
//     // const handleEditorDidMount = (_valueGetter: any) => {
//     //     // editor.IStandaloneCodeEditor
//     //     setIsEditorReady(true);
//     //     valueGetter.current = _valueGetter;
//     // };

//     // const editorDidMount = (editor: any, monaco: any) => {
//     //     console.log('editorDidMount', editor);
//     //     editor.focus();
//     // };


//     // const handleChange = (newValue: string, e: any) => {
//     //     console.log('onChange', newValue, e);
//     //     // setPolicyDefinition({
//     //     //     ...policyDefinition,

//     //     // })
//     // };

//     // const handleChange = (newValue: string) => {
//     //     dispatch({ field: 'policyDefinition', value: newValue });
//     // };

//     // const onSave = () => {
//     //     // eslint-disable-next-line no-alert
//     //     alert(valueGetter.current());
//     //     // console.log('Policy Def: ' + valueGetter.current());
//     // };

//     const editorWillMount = (monaco: any) => {
//         monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
//             completion: true,
//             validate: true,
//             format: true,
//             schemas: [{
//                 uri: 'http://myserver/foo-schema.json',
//                 fileMatch: ['*'],
//                 schema: policyDefJsonSchema,
//             }],
//         });
//     };

//     const onChange = (newValue: string, event: any) => {
//         console.log('onChange', newValue, event);
//     };

//     return (
//         <>
//             <Box component='div' m={2} className={classes.root}>
//                 <Grid container spacing={3}>
//                     <Grid item xs={12} md={12} lg={12}>
//                         <Suspense fallback={<Progress />}>
//                             <MonacoEditor
//                                 language='json'
//                                 height='400px'
//                                 theme='vs-dark'
//                                 options={monacoEditorOptions}
//                                 value={JSON.stringify(policyDefinition, null, 2)}
//                                 editorWillMount={editorWillMount}
//                                 onChange={onChange}
//                                 // onChange={handleChange}
//                                 // editorDidMount={handleEditorDidMount}
//                             />
//                         </Suspense>
//                     </Grid>
//                 </Grid>
//             </Box>
//         </>
//     );
// };

// export default PolicyDefinitionEditor;

// -----------------------------------------
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

// import React, {
//     useState, Suspense, Dispatch, SetStateAction, useEffect, useRef,
// } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import {
//     Box, Grid,
// } from '@material-ui/core';
// import API from 'AppData/api';
// import { Progress } from 'AppComponents/Shared';
// import Editor from "@monaco-editor/react";
// import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
// import policyDefJsonSchema from './JsonSchema.json';

// const useStyles = makeStyles((theme: any) => ({
//     root: {
//         marginBottom: theme.spacing(5),
//     },
//     error: {
//         color: theme.palette.error.dark,
//     },
// }));

// interface PolicyDefinitionProps {
//     policyCategory: string;
//     policyName: string;
//     policyDisplayName: string;
//     policyDescription: string;
//     multipleAllowed: boolean;
//     applicableFlows: string[];
//     supportedGateways: string[];
//     supportedApiTypes: string[];
//     policyAttributes: any;
// }

// interface PolicyDefinitionEditorProps {
//     isReadOnly: boolean;
//     policyDefinition: PolicyDefinitionProps;
//     setPolicyDefinition: Dispatch<SetStateAction<PolicyDefinitionProps>>;
// }

// /**
//  * Renders the policy definition add & view options using the monaco editor.
//  * @param {any} props Input props from parent components.
//  * @returns {TSX} Policy definition editor UI.
//  */
// const PolicyDefinitionEditor: React.FC<PolicyDefinitionEditorProps> = ({
//     isReadOnly, policyDefinition, setPolicyDefinition,
// }) => {
//     const classes = useStyles();
//     const [policyDefinitionSchema, setPolicyDefinitionSchema] = useState<any>();
//     const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | undefined>();

//     useEffect(() => {
//         // const policyDefSchemaVal;
//         // restApi.tenantConfSchemaGet().then((result) => {
//         //     tenantConfSchemaVal = result.body;
//         //     dispatch({ field: 'tenantConfSchema', value: tenantConfSchemaVal });
//         // });
//         const policyDefSchemaVal = policyDefJsonSchema;
//         setPolicyDefinitionSchema(policyDefSchemaVal);
//     }, [policyDefinitionSchema]);

//     useEffect(() => {
//         // returned function will be called on component unmoun
//         return () => {
//             setPolicyDefinition(
//                 JSON.parse(editorRef.current?.getValue() || '')
//             );
//         }
//     }, [policyDefinition])

//     const monacoEditorOptions = {
//         readOnly: isReadOnly,
//     };

//     const handleEditorChange = (value: string | undefined, event: monacoEditor.editor.IModelContentChangedEvent) => {
//         console.log("here is the current model value:", value);
//         setPolicyDefinition(JSON.parse(value || ''));
//     }

//     const handleEditorWillMount = (monaco: typeof monacoEditor) => {
//         monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
//             validate: true,
//             schemas: [{
//                 uri: 'http://myserver/foo-schema.json',
//                 fileMatch: ['*'],
//                 schema: policyDefinitionSchema,
//             }],
//         });
//     }

//     const handleEditorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor , monaco: typeof monacoEditor) => {
//         // here is another way to get monaco instance
//         // you can also store it in `useRef` for further usage
//         monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
//             validate: true,
//             enableSchemaRequest: false,
//             // schemaValidation: 
//             schemas: [{
//                 // uri: 'http://myserver/foo-schema.json',
//                 uri: 'https://hello.com',
//                 fileMatch: ['*'],
//                 schema: policyDefinitionSchema,
//             }],
//             // schemaRequest: 'ignore',
//             // schemaValidation: 'error',
//         });
//     }

//     return (
//         <>
//             <Box component='div' m={2} className={classes.root}>
//                 <Grid container spacing={3}>
//                     <Grid item xs={12} md={12} lg={12}>
//                         <Suspense fallback={<Progress />}>
//                             <Editor
//                                 language='json'
//                                 height='350px'
//                                 theme='vs-dark'
//                                 options={monacoEditorOptions}
//                                 value={JSON.stringify(policyDefinition, null, 2)}
//                                 // beforeMount={handleEditorWillMount}
//                                 onMount={handleEditorDidMount}
//                                 onChange={handleEditorChange}
//                             />
//                         </Suspense>
//                     </Grid>
//                 </Grid>
//             </Box>
//         </>
//     );
// };
// 
// PolicyDefinitionEditor.propTypes = {
//     isReadOnly: PropTypes.bool.isRequired,
//     policyDefinition: PropTypes.shape({
//         policyCategory: PropTypes.string.isRequired,
//         policyName: PropTypes.string.isRequired,
//         policyDisplayName: PropTypes.string.isRequired,
//         policyDescription: PropTypes.string.isRequired,
//         multipleAllowed: PropTypes.bool.isRequired,
//         applicableFlows: PropTypes.arrayOf(PropTypes.string).isRequired,
//         supportedGateways: PropTypes.arrayOf(PropTypes.string).isRequired,
//         supportedApiTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
//         // eslint-disable-next-line react/forbid-prop-types
//         policyAttributes: PropTypes.any
//     }).isRequired,
//     setPolicyDefinition: PropTypes.func.isRequired,
// }
// 
// export default PolicyDefinitionEditor;
