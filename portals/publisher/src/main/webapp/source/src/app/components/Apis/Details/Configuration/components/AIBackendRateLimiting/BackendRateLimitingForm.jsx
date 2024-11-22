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
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { AccordionDetails, AccordionSummary, Tooltip, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { HelpOutline } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import WrappedExpansionPanel from 'AppComponents/Shared/WrappedExpansionPanel';
import CommonRateLimitingForm from './CommonRateLimitingForm';
import RequestCountRateLimit from './RequestCountRateLimit';
import RequestCountRateLimitUnit from './RequestCountRateLimitUnit';

/**
 * Backend Rate Limiting for AI/LLM APIs
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function BackendRateLimitingForm(props) {
    const { api, configDispatcher, isProduction } = props;
    const intl = useIntl();

    const PREFIX = 'BackendRateLimitingForm';

    const classes = {
        expansionPanel: `${PREFIX}-expansionPanel`,
        expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
        iconSpace: `${PREFIX}-iconSpace`,
        bottomSpace: `${PREFIX}-bottomSpace`,
        subHeading: `${PREFIX}-subHeading`
    };

    const Root = styled('div')(({ theme }) => ({
        [`& .${classes.expansionPanel}`]: {
            marginBottom: theme.spacing(1),
        },

        [`& .${classes.expansionPanelDetails}`]: {
            flexDirection: 'column',
        },

        [`& .${classes.iconSpace}`]: {
            marginLeft: theme.spacing(0.5),
        },

        [`& .${classes.bottomSpace}`]: {
            marginBottom: theme.spacing(4),
        },

        [`& .${classes.subHeading}`]: {
            fontSize: '1rem',
            fontWeight: 400,
            margin: 0,
            display: 'inline-flex',
            lineHeight: 1.5,
        }
    }));

    const titleText = (isProduction ? 'Production ' : 'Sandbox ') + intl.formatMessage({
        id: 'Apis.Details.Configuration.Components.AI.BE.Rate.Limiting.prod',
        defaultMessage: 'Backend Rate Limiting'
    });

    return (
        <Root>
            <WrappedExpansionPanel className={classes.expansionPanel} defaultExpanded
                id={isProduction ? 'production-rate-limit' : 'sandbox-rate-limit'}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography className={classes.subHeading} variant='h6' component='h4'>
                        {titleText}
                        <Tooltip
                            title={(
                                <FormattedMessage
                                    id='Apis.Details.Configuration.Components.AI.BE.Rate.Limiting.tooltip'
                                    defaultMessage={
                                        'This option determines the type of Backend Rate Limiting'
                                        + ' that is applied to the API.'
                                    }
                                />
                            )}
                            aria-label='API BE Rate limiting helper text'
                            placement='right-end'
                            interactive
                        >
                            <HelpOutline className={classes.iconSpace} />
                        </Tooltip>
                    </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.expansionPanelDetails}>
                    <RequestCountRateLimitUnit
                        api={api}
                        configDispatcher={configDispatcher}
                        isProduction={isProduction}
                    />
                    <CommonRateLimitingForm
                        api={api}
                        configDispatcher={configDispatcher}
                        commonFormProps={{
                            key: (isProduction ? 'production' : 'sandbox') + 'MaxPromptTokenCount',
                            label: 'Max Prompt Token Count',
                            // helperText: 'Max Prompt Token Count integer',
                            placeholder: 'Max Prompt Token Count',
                            tooltip: 'Max Prompt Token Count as an Integer value',
                        }}
                    />
                    <CommonRateLimitingForm
                        api={api}
                        configDispatcher={configDispatcher}
                        commonFormProps={{
                            key: (isProduction ? 'production' : 'sandbox') + 'MaxCompletionTokenCount',
                            label: 'Max Completion Token Count',
                            // helperText: 'Max Completion Token Count integer',
                            placeholder: 'Max Completion Token Count',
                            tooltip: 'Max Completion Token Count as an Integer value',
                        }}
                    />
                    <CommonRateLimitingForm
                        api={api}
                        configDispatcher={configDispatcher}
                        commonFormProps={{
                            key: (isProduction ? 'production' : 'sandbox') + 'MaxTotalTokenCount',
                            label: 'Max Total Token Count',
                            // helperText: 'Max Total Token Count integer',
                            placeholder: 'Max Total Token Count',
                            tooltip: 'Max Total Token Count as an Integer value',
                        }}
                    />
                    <RequestCountRateLimit
                        api={api}
                        configDispatcher={configDispatcher}
                        isProduction={isProduction}
                    />
                </AccordionDetails>
            </WrappedExpansionPanel>
        </Root>
    );
}

BackendRateLimitingForm.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
    isProduction: PropTypes.bool.isRequired,
};