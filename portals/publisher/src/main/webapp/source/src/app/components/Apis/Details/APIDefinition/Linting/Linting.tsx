/* eslint-disable */
/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import API from 'AppData/api.js';
import {
    Spectral,
    ISpectralDiagnostic,
} from '@stoplight/spectral-core';
import *  as spectralFunc from "@stoplight/spectral-functions";
import { oas } from '@stoplight/spectral-rulesets';
import { green, orange } from '@material-ui/core/colors';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Alert from 'AppComponents/Shared/Alert';
import { FormattedMessage } from 'react-intl';

/** @type DiagnosticSeverity 
 * 
 * 
Something not allowed by the rules of a language or other means.
    Error = 0,
Something suspicious but allowed.
    Warning = 1,
Something to inform about but not a problem.
    Information = 2,
Something to hint to a better way of doing it, like proposing a refactoring.
    Hint = 3
*/

const spectralFunctions: { [key: string]: any} = {
    "alphabetical": spectralFunc.alphabetical,
    "casing": spectralFunc.casing,
    "defined": spectralFunc.defined,
    "enumeration": spectralFunc.enumeration,
    "falsy": spectralFunc.falsy,
    "length": spectralFunc.length,
    "pattern":spectralFunc.pattern,
    "truthy": spectralFunc.truthy,
    "undefined": spectralFunc.undefined,
    "unreferencedReusableObject": spectralFunc.unreferencedReusableObject,
    "xor": spectralFunc.xor,
}

export const spectralSeverityMap: { [key: number]: JSX.Element } = {
    0: <ErrorIcon color="error" />,
    1: <WarningIcon style={{ color: orange[500] }} />,
    2: <InfoIcon color="primary" />,
    3: <HelpOutlineIcon style={{ color: green[500] }} />,
};

export const spectralSeverityNames: { [key: number]: string } = {
    0: "Errors",
    1: "Warnings",
    2: "Info",
    3: "Hints"
};

export async function getLinterResultsFromContent(swagger: string|undefined) {
    let validationResults: ISpectralDiagnostic[] = [];
    
    if (swagger) {
        // Validate againt default ruleset by Spectral
        let defaultRuleSet = { extends: [oas], rules: {} };
        const linter = new Spectral();
        linter.setRuleset(defaultRuleSet);
        
        try {
            
            await linter.run(swagger).then((results)=> {
                if (results) {
                    validationResults = validationResults.concat(results);
                }
            });
        } catch (err) {
            console.error("OpenAPI linter default ruleset validation failed", err);
            Alert.error(
            <FormattedMessage
                id='Apis.Details.APIDefinition.Linting.Linting.default.ruleset.validation.failed'
                defaultMessage='OpenAPI linter default ruleset validation failed'
            />);
        }


        // Validate againt custom ruleset defined in tenant config
        let customRuleset:JSON = await API.getLinterCustomRules().then((LinterCustomRuleset: JSON) => {
            return LinterCustomRuleset;
        }).catch((error: any) => {
            console.log("Error retrieving custom linter rules", error);
            Alert.error(
            <FormattedMessage
                id='Apis.Details.APIDefinition.Linting.Linting.error.retrieving.custom.rules'
                defaultMessage='Error retrieving custom linter rules'
            />);
        });
        if (customRuleset) {
            //Parse JSON to JS object to support spectral
            const parsedCustomRuleset = JSON.parse(
                JSON.stringify(customRuleset), 
                function (key, value) {
                    if (key === "function") {
                        return spectralFunctions[value];
                    } else {
                        return value;
                    }
                }
            );

            linter.setRuleset(parsedCustomRuleset);
            
            try {
                await linter.run(swagger).then((results)=> {
                    if (results) {
                        validationResults = validationResults.concat(results);
                    }
                });
            } catch (error) {
                if (error instanceof Error) {
                    console.error("OpenAPI linter custom ruleset validation failed\n", error, error.stack);
                }
                Alert.error(
                    <FormattedMessage
                        id='Apis.Details.APIDefinition.Linting.Linting.custom.ruleset.validation.failed'
                        defaultMessage='OpenAPI linter custom ruleset validation failed'
                    />);
            }
        }

        //Sort linter results order based of severity
        validationResults = validationResults.sort( function compare(a, b) {
            if (a.severity < b.severity){
              return -1;
            }
            if (a.severity > b.severity){
              return 1;
            }
            return 0;
        });
    }
    return validationResults;
}
