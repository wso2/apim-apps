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
import React, { useEffect, useState } from 'react';
import {
    Spectral,
    Document,
    ISpectralDiagnostic,
} from '@stoplight/spectral-core';
import { green, orange } from '@mui/material/colors';
import { oas } from '@stoplight/spectral-rulesets';
import { FormattedMessage } from 'react-intl';
import ToggleButton from '@mui/lab/ToggleButton';
import ToggleButtonGroup from '@mui/lab/ToggleButtonGroup';
import Box from '@mui/material/Box';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {makeStyles} from "@mui/styles";

// TODO tmkasun: Possible to extend AsyncAPI rule set as well
const defaultRuleSet = { extends: [oas], rules: {} };

type APILintingProps = {
    document: string;
    setIsSwaggerUI: Function;
    linterResults: ISpectralDiagnostic[];
    setLinterResults: Function;
};

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
export const spectralSeverityMap: { [key: number]: JSX.Element } = {
    0: <ErrorIcon color="error" />,
    1: <WarningIcon style={{ color: orange[500] }} />,
    2: <InfoIcon color="primary" />,
    3: <HelpOutlineIcon style={{ color: green[500] }} />,
};

const useStyles = makeStyles((theme) => ({
    activeButton: {
        "&:selected": {
            backgroundColor: theme.palette.background.default,
        }
    }
}));

export const APILinting = (props: APILintingProps) => {
    const { document: apiDocument, setIsSwaggerUI, linterResults, setLinterResults } = props;
    const classes = useStyles();
    const [isSwaggerUIButtonSelected, setIsSwaggerUIButtonSelected] = useState<boolean>(true);

    useEffect(() => {
        if (apiDocument) {
            (async () => {
                const linter = new Spectral();
                linter.setRuleset(defaultRuleSet);
                const results = await linter.run(apiDocument);
                console.log(results);
                setLinterResults(results);
            })();
        }
    }, [apiDocument]);
    const severityCounts: { [key: number]: number } = {};

    function openSwaggerUI(open: boolean) {
        setIsSwaggerUI(open);
        setIsSwaggerUIButtonSelected(open);
    };

    if (linterResults) {
        linterResults.map(({ severity }) => {
            severityCounts[severity] = severityCounts[severity] + 1 || 1;
        });
    }
    return (
        <Box ml={3}>
            {linterResults === null && (
                <FormattedMessage
                    id="Apis.Details.APIDefinition.Linting.APILinting.loading"
                    defaultMessage="Linting . . ."
                />
            )}
            {linterResults && linterResults.length !== 0 && (
                <ToggleButtonGroup
                    exclusive
                    aria-label="text alignment"
                    size="small"
                >
                    <ToggleButton
                        className={classes.activeButton}
                        size="small"
                        aria-disabled
                        disableRipple
                        disableTouchRipple
                        disableFocusRipple
                        value="right"
                        aria-label="right aligned"
                        onClick={() => { openSwaggerUI(true) }}
                        selected={isSwaggerUIButtonSelected}
                    >
                        Swagger UI
                    </ToggleButton>
                    <ToggleButton
                        className={classes.activeButton}
                        size="small"
                        aria-disabled
                        disableRipple
                        disableTouchRipple
                        disableFocusRipple
                        value="right"
                        aria-label="right aligned"
                        onClick={() => { openSwaggerUI(false) }}
                        selected={!isSwaggerUIButtonSelected}
                    >
                        {Object.entries(spectralSeverityMap).map(([severity, component]) => (
                            <Box ml={1} display="flex">
                                {component}
                                {severityCounts[Number(severity)] || '-'}
                            </Box>
                        ))}
                    </ToggleButton>
                </ToggleButtonGroup>
            )}
        </Box>
    );
};

export default APILinting;
