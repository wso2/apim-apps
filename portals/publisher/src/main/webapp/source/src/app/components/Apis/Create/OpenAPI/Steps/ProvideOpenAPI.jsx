/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputAdornment from '@material-ui/core/InputAdornment';
import CheckIcon from '@material-ui/icons/Check';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { ExpandMore } from '@material-ui/icons';
import { Accordion, AccordionDetails, AccordionSummary, Box, ListItemIcon, Typography } from '@material-ui/core';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import debounce from 'lodash.debounce'; // WARNING: This is coming from mui-datatable as a transitive dependency

import APIValidation from 'AppData/APIValidation';
import API from 'AppData/api';
import LinterUI from 'AppComponents/Apis/Details/APIDefinition/LinterUI/LinterUI';
import APILintingSummary from 'AppComponents/Apis/Details/APIDefinition/Linting/APILintingSummary';
import DropZoneLocal, { humanFileSize } from 'AppComponents/Shared/DropZoneLocal';
import {  
    getLinterResultsFromContent,
    spectralSeverityMap as severityMap } from "../../../Details/APIDefinition/Linting/Linting";

const useStyles = makeStyles((theme) => ({
    mandatoryStar: {
        color: theme.palette.error.main,
    },
    importDefinitionDialogHeader: {
        fontWeight: '600',
    },
}));

/**
 * Sub component of API Create using OpenAPI UI, This is handling the taking input of WSDL file or URL from the user
 * In the create API using OpenAPI wizard first step out of 2 steps
 * @export
 * @param {*} props
 * @returns {React.Component} @inheritdoc
 */
export default function ProvideOpenAPI(props) {
    const { apiInputs, inputsDispatcher, onValidate, onLinterLineSelect } = props;
    const isFileInput = apiInputs.inputType === 'file';
    const { inputType, inputValue } = apiInputs;
    const classes = useStyles();
    // If valid value is `null`,that means valid, else an error object will be there
    const [isValid, setValidity] = useState({});
    const [linterResults, setLinterResults] = useState ([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isLinting, setIsLinting] = useState(false);
    const [linterSelectedSeverity, setLinterSelectedSeverity] = useState(null);
    const [expandLinter, setExpandLinter] = useState(false);
    const [expandValidationErrors, setExpandValidationErrors] = useState(true);
    
    function lint(content) {
        // Validate and linting
        setIsLinting(true);
        getLinterResultsFromContent(content).then((results)=>{
            if (results) {
                setLinterResults(results);
            } else {
                setLinterResults([]);
            }
        }).finally(()=>{setIsLinting(false);});
    }

    function reset() {
        setIsLinting(false);
        setLinterResults([]);
        setValidationErrors([]);
        inputsDispatcher({ action: 'importingContent', value: null });
        inputsDispatcher({ action: 'inputValue', value: null });
        inputsDispatcher({ action: 'isFormValid', value: false });
    }

    const validateURLDebounced = useCallback(
        debounce((newURL) => { // Example: https://codesandbox.io/s/debounce-example-l7fq3?file=/src/App.js
            API.validateOpenAPIByUrl(newURL, { returnContent: true }).then((response) => {
                const {
                    body: {
                        isValid: isValidURL, info, content, errors,
                    },
                } = response;
                const formattedConent = JSON.stringify(JSON.parse(content), null, 2);
                lint(formattedConent);
                inputsDispatcher({ action: 'importingContent', value: formattedConent });
                if (isValidURL) {
                    info.content = content;
                    inputsDispatcher({ action: 'preSetAPI', value: info });
                    setValidity({ ...isValid, url: null });
                } else {
                    setValidity({ ...isValid, url: { message: 'OpenAPI content validation failed!' } });
                    setValidationErrors(errors);
                }
                onValidate(isValidURL);
                setIsValidating(false);
            }).catch((error) => {
                setValidity({ url: { message: error.message } });
                onValidate(false);
                setIsValidating(false);
                console.error(error);
            });
        }, 750),
        [],
    );
    /**
     *
     *
     * @param {*} files
     */
    function onDrop(files) {
        setIsValidating(true);

        // Why `files.pop()` below is , We only handle one OpenAPI file at a time,
        // So if use provide multiple, We would only
        // accept the first file. This information is shown in the dropdown helper text
        const file = files.pop();
        let validFile = null;
        API.validateOpenAPIByFile(file)
            .then((response) => {
                const {
                    body: { isValid: isValidFile, info, errors },
                } = response;
                if (isValidFile) {
                    validFile = file;
                    inputsDispatcher({ action: 'preSetAPI', value: info });
                    setValidity({ ...isValid, file: null });
                } else {
                    setValidity({ ...isValid, file: { message: 'OpenAPI content validation failed!' } });
                    setValidationErrors(errors);
                }
            })
            .catch((error) => {
                setValidity({ ...isValid, file: { message: 'OpenAPI content validation failed!' } });
                console.error(error);
            })
            .finally(() => {
                setIsValidating(false); // Stop the loading animation
                onValidate(validFile !== null); // If there is a valid file then validation has passed
                // If the given file is valid , we set it as the inputValue else set `null`
                inputsDispatcher({ action: 'inputValue', value: file });
            });

        if (!file.path.endsWith(".zip")){
            const read = new FileReader();
            read.readAsText(file);
            read.onloadend = function(){
                const content = read.result?.toString();
                inputsDispatcher({ action: 'importingContent', value: content });
                lint(content);
            }
        }
    }

    /**
     * Trigger the provided onValidate call back on each input validation run
     * Do the validation state aggregation and call the onValidate method with aggregated value
     * @param {Object} state Validation state object returned from Joi `.validate()` method
     */
    function validateURL(value) {
        const state = APIValidation.url.required().validate(value).error;
        // State `null` means URL is valid, We do backend validation only if it's a valid URL
        if (state === null) {
            setIsValidating(true);
            validateURLDebounced(apiInputs.inputValue);
            // Valid URL string
            // TODO: Handle catch network or api call failures ~tmkb
        } else {
            setValidity({ ...isValid, url: state });
            onValidate(false);
        }
    }

    useEffect(() => {
        reset();
    }, [inputType]);

    useEffect(() => {
        if (inputValue) {
            if (inputType === ProvideOpenAPI.INPUT_TYPES.FILE) {
                onDrop([inputValue]);
            } else if (inputType === ProvideOpenAPI.INPUT_TYPES.URL) {
                validateURL(inputValue);
            }
        }
    }, [inputType, inputValue]);

    // TODO: Use validation + input to separate component that can be share with wsdl,swagger,graphql URL inputs ~tmkb
    const isInvalidURL = Boolean(isValid.url);
    let urlStateEndAdornment = null;
    if (isValidating) {
        urlStateEndAdornment = (
            <InputAdornment position='end'>
                <CircularProgress />
            </InputAdornment>
        );
    } else if (isValid.url !== undefined) {
        if (isInvalidURL) {
            urlStateEndAdornment = (
                <InputAdornment position='end'>
                    <ErrorOutlineIcon fontSize='large' color='error' />
                </InputAdornment>
            );
        } else {
            urlStateEndAdornment = (
                <InputAdornment position='end' id='url-validated'>
                    <CheckIcon fontSize='large' color='primary' />
                </InputAdornment>
            );
        }
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    <FormControl component='fieldset'>
                        <FormLabel component='legend'>
                            <>
                                <sup className={classes.mandatoryStar}>*</sup>
                                {' '}
                                <FormattedMessage
                                    id='Apis.Create.OpenAPI.Steps.ProvideOpenAPI.Input.type'
                                    defaultMessage='Input Type'
                                />
                            </>
                        </FormLabel>
                        <RadioGroup
                            aria-label='Input Source'
                            value={apiInputs.inputType}
                            onChange={(event) => inputsDispatcher({ action: 'inputType', 
                                value: event.target.value })}
                        >
                            <FormControlLabel
                                disabled={isLinting || isValidating}
                                value={ProvideOpenAPI.INPUT_TYPES.URL}
                                control={<Radio color='primary' />}
                                label='OpenAPI URL'
                                id='open-api-url-select-radio'
                            />
                            <FormControlLabel
                                disabled={isLinting || isValidating}
                                value={ProvideOpenAPI.INPUT_TYPES.FILE}
                                control={<Radio color='primary' />}
                                label='OpenAPI File/Archive'
                                aria-label='OpenAPI File/Archive'
                                id='open-api-file-select-radio'
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={10} md={11}>
                    {isFileInput ? (
                        <>
                            {apiInputs.inputValue ? (
                                <List>
                                    <ListItem key={apiInputs.inputValue.path}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <InsertDriveFile />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={`${apiInputs.inputValue.path} -
                                    ${humanFileSize(apiInputs.inputValue.size)}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge='end'
                                                aria-label='delete'
                                                onClick={reset}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </List>
                            ) : (
                                <DropZoneLocal
                                    error={isValid.file}
                                    onDrop={onDrop}
                                    files={apiInputs.inputValue}
                                    accept='.bz,.bz2,.gz,.rar,.tar,.zip,.7z,.json,application/json,.yaml'
                                >
                                    {isValidating ? (<CircularProgress />)
                                        : ([
                                            <FormattedMessage
                                                id='Apis.Create.OpenAPI.Steps.ProvideOpenAPI.Input.file.dropzone'
                                                defaultMessage={'Drag & Drop Open API File/Archive '
                                                 + 'here {break} or {break} Browse files'}
                                                values={{ break: <br /> }}
                                            />,
                                            <Button
                                                color='primary'
                                                variant='contained'
                                                id='browse-to-upload-btn'
                                                onClick={ reset }
                                            >
                                                <FormattedMessage
                                                    id='Apis.Create.OpenAPI.Steps.ProvideOpenAPI.Input.file.upload'
                                                    defaultMessage='Browse File to Upload'
                                                />
                                            </Button>,
                                        ]
                                        )}
                                </DropZoneLocal>
                            )}
                        </>
                    ) : (
                        <TextField
                            autoFocus
                            id='outlined-full-width'
                            label='OpenAPI URL'
                            placeholder='Enter OpenAPI URL'
                            fullWidth
                            margin='normal'
                            variant='outlined'
                            onChange={({ target: { value } }) => inputsDispatcher({ action: 'inputValue', value })}
                            value={apiInputs.inputValue}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            InputProps={{
                                onBlur: ({ target: { value } }) => {
                                    validateURL(value);
                                },
                                endAdornment: urlStateEndAdornment,
                            }}
                            // 'Give the URL of OpenAPI endpoint'
                            helperText={(isValid.url && isValid.url.message) || 'Click away to validate the URL'}
                            error={isInvalidURL}
                            data-testid='swagger-url-endpoint'
                        />
                    )}
                </Grid>
                <Grid item xs={10} md={11}>
                    <List>
                        {inputValue && isValidating && (
                            <ListItem>
                                <ListItemIcon><CircularProgress /></ListItemIcon>
                                <ListItemText>Validating API definition</ListItemText>
                            </ListItem>
                        )}
                        {inputValue && !isValidating && isLinting && (
                            <ListItem>
                                <ListItemIcon><CircularProgress /></ListItemIcon>
                                <ListItemText>Generating Linter Results</ListItemText>
                            </ListItem>
                        )}
                    </List>
                </Grid>
                {!isValidating && validationErrors.length>0 && (
                    <Grid item xs={10} md={11}>
                        <Accordion
                            expanded={expandValidationErrors}
                            onChange={()=>{}}>
                            <AccordionSummary
                                expandIcon={<ExpandMore/>}
                                aria-controls='panel1bh-content'
                                id='panel1bh-header'
                                IconButtonProps={{onClick:()=>{setExpandValidationErrors((prev)=>!prev)}}}>
                                <Grid container direction='row' 
                                    justifyContent='space-between' alignItems='center'>
                                    <Typography className={classes.importDefinitionDialogHeader}>
                                        <FormattedMessage
                                            id='Apis.Details.APIDefinition.APIDefinition.import.
                                                validation.title'
                                            defaultMessage='Validation Errors'
                                        />
                                    </Typography>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {validationErrors.map((error)=>(
                                        <ListItem>
                                            <ListItemIcon>
                                                {severityMap[0]}
                                            </ListItemIcon>
                                            <ListItemText>
                                                <Typography>
                                                    <Box sx={{ fontWeight: 'bold' }}>{error.message}</Box>
                                                </Typography>
                                                <Typography>{error.description}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        
                                    ))}
                                </List>
                                
                            </AccordionDetails>
                            
                        </Accordion>
                    </Grid>
                )}
                {!isLinting && linterResults.length>0 && (
                    <Grid item xs={10} md={11}
                        data-testid='itest-id-linter-results'>
                        <Accordion
                            expanded={expandLinter}
                            onChange={()=>{}}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls='panel1bh-content'
                                id='panel1bh-header'
                                IconButtonProps={{onClick:()=>{setExpandLinter((prev)=>!prev)}}}>
                                <Grid container direction='row' 
                                    justifyContent='space-between' alignItems='center'>
                                    <Typography className={classes.importDefinitionDialogHeader}>
                                        <FormattedMessage
                                            id='Apis.Details.APIDefinition.APIDefinition.import.
                                                validation.title'
                                            defaultMessage='Linter Results'
                                        />
                                    </Typography>
                                    <APILintingSummary
                                        linterResults={ linterResults }
                                        handleChange = { (value)=>{
                                            setLinterSelectedSeverity(value);
                                            setExpandLinter(true);
                                        } }
                                    />
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails
                                style={{padding:0}}>
                                <div style={{width:'100%'}}>
                                    <LinterUI
                                        linterResults={ linterResults.filter(
                                            (item)=> linterSelectedSeverity===null||
                                                item.severity===Number(linterSelectedSeverity))
                                        }
                                        severityMap={ severityMap }
                                        handleRowClick={ (line) => { 
                                            if(onLinterLineSelect) onLinterLineSelect(line);
                                        } }
                                    />
                                </div>
                            </AccordionDetails>
                            
                        </Accordion>
                    </Grid>
                )}
                <Grid item xs={2} md={5} />
            </Grid>
        </>
    );
}

ProvideOpenAPI.defaultProps = {
    onValidate: () => { },
};
ProvideOpenAPI.INPUT_TYPES = {
    URL: 'url',
    FILE: 'file',
};
ProvideOpenAPI.propTypes = {
    apiInputs: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
        inputValue: PropTypes.string,
    }).isRequired,
    inputsDispatcher: PropTypes.func.isRequired,
    onValidate: PropTypes.func,
};
