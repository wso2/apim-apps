/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
// import { useIntl } from 'react-intl';
// import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
// import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
// import UnfoldLessIcon from '@material-ui/icons/UnfoldLess';
// import FindInPageIcon from '@material-ui/icons/FindInPage';
// import CodeIcon from '@material-ui/icons/Code';
// import ToggleButton from '@mui/material/ToggleButton';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';

const PREFIX = 'ResultsHeading';

const classes = {
    testResultsHeading: `${PREFIX}-testResultsHeading`,
    testResultsTitle: `${PREFIX}-testResultsTitle`,
    testResultsActions: `${PREFIX}-testResultsActions`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.testResultsHeading}`]: {
        display: 'flex',
        gridGap: theme.spacing(2),
        alignItems: 'center',
        marginBottom: theme.spacing(2.5),
    },
    [`& .${classes.testResultsTitle}`]: {
        flexGrow: 1,
    },
    [`& .${classes.testResultsActions}`]: {
        display: 'flex',
        alignItems: 'center',
        gridGap: theme.spacing(2),
    },
}));

// export interface ExecutionResult {
//   id: number;
//   result: string;
// }

// interface ResultsHeadingProps {
//   executionResults: ExecutionResult[];
//   handleExpandAll: () => void;
//   isExpandAllDisabled: boolean;
//   handleCollapseAll: () => void;
//   isCollapseAllDisabled: boolean;
//   resultView: string | null;
//   handleToggleResultView: (
//     event: React.MouseEvent<HTMLElement>,
//     newView: string | null
//   ) => void;
// }

const ResultsHeading = () => {
    return (
        <Root>
            <Box className={classes.testResultsHeading}>
                <Box className={classes.testResultsTitle}>
                    <Typography gutterBottom variant='h7'>
                        <FormattedMessage
                            id='Apis.Details.ApiChat.ApiChat.ResultsHeading.title'
                            defaultMessage='Execution Results'
                        />
                    </Typography>
                </Box>
                {/* {executionResults.length > 0 && (
                    <Box className={classes.testResultsActions}>
                        <Box>
                            <Button
                                variant='outlined'
                                id='expand-accordion'
                                onClick={handleExpandAll}
                                disabled={isExpandAllDisabled}
                                startIcon={<UnfoldMoreIcon fontSize='inherit' />}
                            >
                                {intl.formatMessage({
                                    id: 'Apis.Details.ApiChat.ApiChat.ResultsHeading.expandAll',
                                    defaultMessage: 'Expand All',
                                })}
                            </Button>
                        </Box>
                        <Box>
                            <Button
                                variant='outlined'
                                id='collapse-accordion'
                                onClick={handleCollapseAll}
                                disabled={isCollapseAllDisabled}
                                startIcon={<UnfoldLessIcon fontSize='inherit' />}
                            >
                                {intl.formatMessage({
                                    id: 'Apis.Details.ApiChat.ApiChat.ResultsHeading.collapseAll',
                                    defaultMessage: 'Collapse All',
                                })}
                            </Button>
                        </Box>
                        <Box>
                            <ToggleButtonGroup
                                value={resultView}
                                exclusive
                                onChange={handleToggleResultView}
                                aria-label='storybook toggle button group'
                                id='results-view-toggle-button'
                            >
                                <ToggleButton
                                    value='summary'
                                    aria-label='summary'
                                    id='summary-view'
                                >
                                    <FindInPageIcon fontSize='inherit' />
                                </ToggleButton>
                                <ToggleButton value='json' aria-label='json' id='json-view'>
                                    <CodeIcon fontSize='inherit' />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Box>
                )} */}
            </Box>
        </Root>
    );
};

export default ResultsHeading;
