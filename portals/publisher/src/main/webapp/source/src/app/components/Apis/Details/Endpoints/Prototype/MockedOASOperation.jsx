/*
 *  Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';
import {
    CircularProgress,
    Divider,
    Grid,
    makeStyles,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

const MonacoEditor = lazy(() => import('react-monaco-editor' /* webpackChunkName: "GenResourceMonaco" */));

const useStyles = makeStyles((theme) => {
    return {
        dropdown: {
            marginRight: theme.spacing(5),
        },
    };
});

/**
 * The OAS mock impl for operation.
 *
 * @param {any} props The input props
 * @return {any} The JSX representation of the component.
 * */
function MockedOASOperation(props) {
    const { operation } = props;
    return (
        <>
            {operation.responses ?
                <Grid spacing={2} container direction='row' justify='flex-start' alignItems='flex-start'>
                    <Grid item xs={12}>
                        <Typography gutterBottom variant='subtitle1'>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.Prototype.MockedOAS.title'
                                defaultMessage='Responses'
                            />
                            <Typography style={{ marginLeft: '10px' }} gutterBottom variant='caption'>
                                <FormattedMessage
                                    id='Apis.Details.Endpoints.Prototype.MockedOAS.subTitle'
                                    defaultMessage='Mocked examples generated from OAS'
                                />
                            </Typography>
                            <Divider variant='middle' />
                        </Typography>
                    </Grid>

                    {Object.entries(operation.responses).map(([responseCode, response]) => (
                        <Grid item xs={12} key={responseCode}>
                            <MockedOASExample response={response}
                                responseCode={responseCode} />
                        </Grid>
                    ))}
                </Grid> : <FormattedMessage
                    id='Apis.Details.Endpoints.Prototype.MockedOAS.Response.NotProvided'
                    defaultMessage='Responses are not provided in the API definition'
                />
            }
        </>
    );
}

/**
 * The example response component.
 *
 * @param {any} props The input props
 * @return {any} JSX element
 * */
function MockedOASExample(props) {
    const { response, responseCode } = props
    // oas3 has examples in content, where as oas2 has in examples
    const { content } = response
    const oas2Examples = response.examples
    const isEmptyOAS3Content = !content || Object.keys(content).length < 1
    const isEmptyOAS2Examples = !oas2Examples || Object.keys(oas2Examples).length < 1

    const [selectedMediaType, setSelectedMediaType] = useState(() => {
        if (!isEmptyOAS3Content) {
            return Object.keys(content)[0];
        } else if (!isEmptyOAS2Examples) {
            return Object.keys(oas2Examples)[0]
        }
        return null
    });
    const [selectedExample, setSelectedExample] = useState();
    // in oas3, multiple examples can be provided 
    const [selectedExampleType, setSelectedExampleType] = useState();
    const classes = useStyles();

    useEffect(() => {
        if (!isEmptyOAS3Content && selectedMediaType) {
            const { example, examples } = content[selectedMediaType]
            if (example) {
                setSelectedExample(JSON.stringify(example, null, '\t'))
            } else if (examples && Object.keys(examples).length > 0) {
                setSelectedExampleType(Object.keys(examples)[0])
            }
        } else if (!isEmptyOAS2Examples && selectedMediaType) {
            const example = oas2Examples[selectedMediaType]
            if (example) {
                setSelectedExample(JSON.stringify(example, null, '\t'))
            }
        }
    }, [selectedMediaType]);

    useEffect(() => {
        if (selectedExampleType) {
            const example = content[selectedMediaType].examples[selectedExampleType].value
            if (example) {
                setSelectedExample(JSON.stringify(example, null, '\t'))
            }
        }
    }, [selectedExampleType]);

    return (
        <Grid container>
            <Grid item xs={1}>{responseCode}</Grid>
            <Grid item xs={11}>
                {selectedExample ?
                    <>
                        <TextField
                            select
                            SelectProps={{
                                autoWidth: true,
                                IconComponent: ArrowDropDown,
                            }}
                            className={classes.dropdown}
                            label='Media Type'
                            value={selectedMediaType}
                            onChange={({ target: { value } }) => {
                                setSelectedMediaType(value)
                            }}
                            helperText='Controls Accept header'
                            margin='dense'
                            variant='outlined'
                        >
                            {!isEmptyOAS3Content ? Object.keys(content)
                                .map((mediaType,) => (
                                    <MenuItem
                                        key={mediaType}
                                        value={mediaType}>
                                        {mediaType}
                                    </MenuItem>
                                ))
                                :
                                !isEmptyOAS2Examples && Object.keys(oas2Examples)
                                    .map((mediaType,) => (
                                        <MenuItem
                                            key={mediaType}
                                            value={mediaType}>
                                            {mediaType}
                                        </MenuItem>
                                    ))
                            }
                        </TextField>
                        {selectedExampleType &&
                            <TextField
                                select
                                SelectProps={{
                                    autoWidth: true,
                                    IconComponent: ArrowDropDown,
                                }}
                                className={classes.dropdown}
                                label='Examples'
                                value={selectedExampleType}
                                onChange={({ target: { value } }) => {
                                    setSelectedExampleType(value)
                                }}
                                margin='dense'
                                variant='outlined'
                            >
                                {Object.keys(content[selectedMediaType].examples)
                                    .map((exampleType,) => (
                                        <MenuItem
                                            key={exampleType}
                                            value={exampleType}>
                                            {exampleType}
                                        </MenuItem>
                                    ))
                                }
                            </TextField>}
                        <Typography variant='body1' gutterBottom>
                            <FormattedMessage
                                id='Apis.Details.Endpoints.Prototype.MockedOAS.Response.Example'
                                defaultMessage='Example Value'
                            />
                        </Typography>
                        <Suspense fallback={<CircularProgress />}>
                            <MonacoEditor
                                // 19 is the default line height
                                height={selectedExample.split(/\r\n|\r|\n/).length * 19}
                                theme='vs-dark'
                                value={selectedExample}
                                options={{
                                    readOnly: true,
                                    lineNumbers: 'off',
                                    scrollbar: { vertical: 'hidden' },
                                    renderWhitespace: 'none',
                                    automaticLayout: true,
                                    minimap: { enabled: false },
                                }}
                                language='json'
                            />
                        </Suspense>
                    </>
                    :
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Prototype.MockedOAS.Response.Example.NotProvided'
                        defaultMessage='Response Examples are not provided in the API definition'
                    />
                }
            </Grid>
        </Grid>
    );
}

MockedOASExample.propTypes = {
    responseCode: PropTypes.string.isRequired,
    response: PropTypes.shape({ content: PropTypes.shape({}), examples: PropTypes.shape({}) }).isRequired,
};

MockedOASOperation.propTypes = {
    operation: PropTypes.shape({ responses: PropTypes.shape({}), }).isRequired,
};

export default React.memo(MockedOASOperation);
