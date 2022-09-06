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
    ISpectralDiagnostic,
} from '@stoplight/spectral-core';
import { oas } from '@stoplight/spectral-rulesets';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import { makeStyles } from "@material-ui/core/styles";
import { spectralSeverityMap, spectralSeverityNames } from "./Linting"
import { Grid, Tooltip, Typography } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
// TODO tmkasun: Possible to extend AsyncAPI rule set as well
const defaultRuleSet = { extends: [oas], rules: {} };
type APILintingProps = {
    linterResults: ISpectralDiagnostic[],
    handleChange: Function,
};

const useStyles = makeStyles((theme) => ({
    activeButton: {
        "&:selected": {
            backgroundColor: theme.palette.background.default,
        }
    }
}));
export const APILintingSummary = (props: APILintingProps) => {
    const { linterResults, handleChange } = props;
    const classes = useStyles();
    const [selectedSeverity, setSelectedSeverity] = useState(null);
    const severityCounts: { [key: number]: number } = {};
    
    if (linterResults) {
        linterResults.forEach(({ severity }) => {
            severityCounts[severity] = severityCounts[severity] + 1 || 1;
        });
    }
    
    return (
        <Box ml={3}>
            {linterResults === null && (
                <FormattedMessage
                    id="Apis.Details.APIDefinition.Linting.APILintingSummary.loading"
                    defaultMessage="Linting . . ."
                />
            )}
            {linterResults && (
                <Tooltip title={
                    Object.entries(spectralSeverityNames).map(([severity, name]) => {
                        return `${name}:${severityCounts[Number(severity)]||0}${(Number(severity) !== 3) ? ", ": ""}` || '-';
                    })
                }>
                    <ToggleButtonGroup
                        exclusive
                        value={selectedSeverity}
                        size="small"
                        onChange={(event, value) => { 
                            setSelectedSeverity(value);
                            handleChange(value) }}>
                        {Object.entries(spectralSeverityMap).map(([severity, component]) => (
                            <ToggleButton
                                key={Math.random()}
                                value={String(severity)}
                            >
                                <Box ml={1} display="flex">
                                    {component}
                                    <Grid item>
                                        <Typography>
                                            {severityCounts[Number(severity)] || 0}
                                        </Typography>
                                    </Grid>
                                </Box>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Tooltip>
            )}
        </Box>
    );
};
export default APILintingSummary;
