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
import { green, orange } from '@material-ui/core/colors';
import { oas } from '@stoplight/spectral-rulesets';
import { FormattedMessage } from 'react-intl';
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';
import FormatAlignJustifyIcon from '@material-ui/icons/FormatAlignJustify';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Box from '@material-ui/core/Box';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

// TODO tmkasun: Possible to extend AsyncAPI rule set as well
const defaultRuleSet = { extends: [oas], rules: {} };

type APILintingProps = {
    document: string;
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
const spectralSeverityMap: { [key: number]: JSX.Element } = {
    0: <ErrorIcon color="error" />,
    1: <WarningIcon style={{ color: orange[500] }} />,
    2: <InfoIcon color="primary" />,
    3: <HelpOutlineIcon style={{ color: green[500] }} />,
};

export const APILinting = (props: APILintingProps) => {
    const { document: apiDocument } = props;
    const [linterResults, setLinterResults] = useState<
        ISpectralDiagnostic[] | null
    >(null);
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
                    onChange={() => {}}
                    aria-label="text alignment"
                    size="small"
                >
                    {Object.entries(spectralSeverityMap).map(([severity, component]) => (
                        <ToggleButton
                            size="small"
                            aria-disabled
                            disableRipple
                            disableTouchRipple
                            disableFocusRipple
                            value="right"
                            aria-label="right aligned"
                        >
                            {component}
                            <Box color="text.primary" ml={1}>{severityCounts[Number(severity)] || '-'}</Box>
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            )}
        </Box>
    );
};

export default APILinting;
