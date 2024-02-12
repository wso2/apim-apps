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
import { useIntl } from 'react-intl';
import { Box, Typography } from '@material-ui/core';
import { useStyles } from '../ApiChat.styles';

// interface APIChatPoweredByProps {
//   openSampleQueries: () => void;
//   showSampleQueries?: boolean;
//   goBack: () => void;
//   disableGoBack: boolean;
// }

/**
 * Renders the API Chat powered by section.
 * @returns {TSX} API Chat powered by section to render.
 */
const ApiChatPoweredBy: React.FC = () => {
    const classes = useStyles();
    const intl = useIntl();
    // const {
    //     openSampleQueries,
    //     showSampleQueries = false,
    //     goBack,
    //     disableGoBack,
    // } = props;
    return (
        <Box className={classes.poweredBy}>
            <Box display='flex' flexDirection='column' flexGrow={1} m={3}>
                <Typography id='itest-api-details-api-chat-title' variant='h3' component='h3'>
                    {intl.formatMessage({
                        id: 'Apis.Details.ApiChat.components.ApiChatPoweredBy.apiChatMainHeader',
                        defaultMessage: 'API Chat',
                    })}
                </Typography>
                {/* </Box> */}
                <Typography variant='body2' color='textSecondary' component='p'>
                    {intl.formatMessage({
                        id: 'modules.testComponent.TryWithAIViewer.TryWithAIViews.TryAIPoweredBy.poweredByText',
                        defaultMessage: 'Powered by Azure OpenAI',
                    })}
                </Typography>
            </Box>
            {/* <Box>
                {showSampleQueries && (
                    <Box display='flex'>
                        <Box mr={3}>
                            <Button
                                startIcon={<ArrowLeftLong />}
                                testId='view-sample-queries'
                                variant='link'
                                size='tiny'
                                onClick={goBack}
                                disabled={disableGoBack}
                            >
                                {intl.formatMessage({
                                    id: 'modules.testComponent.TryWithAIViewer.TryWithAIViews.TryAIPoweredBy.goBack',
                                    defaultMessage: 'Go Back',
                                })}
                            </Button>
                        </Box>
                        <Box>
                            <Button
                                testId='view-sample-queries'
                                variant='link'
                                size='tiny'
                                onClick={openSampleQueries}
                            >
                                {intl.formatMessage({
                                    id: 'modules.testComponent.TryWithAIViewer.TryWithAIViews.TryAIPoweredBy.sampleQueries',
                                    defaultMessage: 'Sample Queries',
                                })}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box> */}
        </Box>
    );
};

// ApiChatPoweredBy.propTypes = {
//     openSampleQueries: PropTypes.func.isRequired,
//     goBack: PropTypes.func.isRequired,
//     disableGoBack: PropTypes.bool.isRequired,
//     showSampleQueries: PropTypes.bool,
// };

export default ApiChatPoweredBy;
