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
import React, { useState } from "react";
import { makeStyles } from '@mui/styles';
import { Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress, Grid, List, ListItem, 
    ListItemIcon, ListItemText, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { FormattedMessage } from "react-intl";
import LinterUI from "AppComponents/Apis/Details/APIDefinition/LinterUI/LinterUI";
import APILintingSummary from "AppComponents/Apis/Details/APIDefinition/Linting/APILintingSummary";
import {  
    spectralSeverityMap as severityMap } from "../../../Details/APIDefinition/Linting/Linting"

const useStyles = makeStyles(() => ({
    importDefinitionDialogHeader: {
        fontWeight: 600,
    }
}));

type APILintingProps = {
    inputValue: any,
    isValidating: boolean,
    isLinting: boolean,
    linterResults: any,
    validationErrors: any,
    onLinterLineSelect: Function,
};

export default function ValidationResults(props: APILintingProps) {
    const {inputValue, isValidating, isLinting, linterResults, validationErrors, onLinterLineSelect} = props;
    const [expandValidationErrors, setExpandValidationErrors] = useState(true);
    const [expandLinterResults, setExpandLinterResults] = useState(false);
    const [linterSelectedSeverity, setLinterSelectedSeverity] = useState(-1);
    const classes = useStyles();

    return (
        <>
            <Grid item xs={10} md={11}>
                <List>
                    {inputValue && isValidating && (
                        <ListItem>
                            <ListItemIcon><CircularProgress /></ListItemIcon>
                            <ListItemText>
                                <FormattedMessage
                                    id='Apis.Create.OpenAPI.Steps.ValidationResults.validating'
                                    defaultMessage='Validating API definition'
                                />
                            </ListItemText>
                        </ListItem>
                    )}
                    {inputValue && !isValidating && isLinting && (
                        <ListItem>
                            <ListItemIcon><CircularProgress /></ListItemIcon>
                            <ListItemText>
                                <FormattedMessage
                                    id='Apis.Create.OpenAPI.Steps.ValidationResults.linting'
                                    defaultMessage='Generating Linter Results'
                                />
                            </ListItemText>
                        </ListItem>
                    )}
                </List>
            </Grid>
            {!isValidating && validationErrors.length>0 && (
                <Grid item xs={10} md={11}>
                    <Accordion
                        expanded={expandValidationErrors}
                        onChange={()=>{setExpandValidationErrors(!expandValidationErrors)}}>
                        <AccordionSummary
                            expandIcon={<ExpandMore/>}
                            aria-controls='panel1bh-content'
                            id='panel1bh-header'>
                            <Grid container direction='row' 
                                justifyContent='space-between' alignItems='center'>
                                <Typography className={classes.importDefinitionDialogHeader}>
                                    <FormattedMessage
                                        id='Apis.Create.OpenAPI.Steps.ValidationResults.validation.errros'
                                        defaultMessage='Validation Errors'
                                    />
                                </Typography>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {validationErrors.map((error:any)=>(
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
                        expanded={expandLinterResults}
                        onChange={()=>{setExpandLinterResults(!expandLinterResults)}}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls='panel1bh-content'
                            id='panel1bh-header'>
                            <Grid container direction='row' 
                                justifyContent='space-between' alignItems='center'>
                                <Typography className={classes.importDefinitionDialogHeader}>
                                    <FormattedMessage
                                        id='Apis.Create.OpenAPI.Steps.ValidationResults.linter.results'
                                        defaultMessage='Linter Results'
                                    />
                                </Typography>
                                <APILintingSummary
                                    linterResults={ linterResults }
                                    handleChange = { (event:any, value:any)=>{
                                        event.stopPropagation();
                                        setLinterSelectedSeverity(value);
                                        setExpandLinterResults(true);
                                    } }
                                />
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails
                            style={{padding:0}}>
                                <LinterUI
                                    linterResults={ linterResults.filter(
                                        (item: any)=> linterSelectedSeverity===-1||
                                            item.severity===Number(linterSelectedSeverity))
                                    }
                                    severityMap={ severityMap }
                                    handleRowClick={ (line: any) => { 
                                        if(onLinterLineSelect) onLinterLineSelect(line);
                                    } }
                                />
                        </AccordionDetails>
                        
                    </Accordion>
                </Grid>
            )}
        </>
    );
}