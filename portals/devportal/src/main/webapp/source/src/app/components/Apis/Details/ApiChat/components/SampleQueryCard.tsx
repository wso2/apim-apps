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

import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { CardActionArea } from '@mui/material';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';

const PREFIX = 'SampleQueryCard';

const classes = {
    sampleQuery: `${PREFIX}-sampleQuery`,
    sampleQueryCard: `${PREFIX}-SampleQueryCard`,
};

const Root = styled('div')(() => ({
    [`& .${classes.sampleQuery}`]: {
        maxHeight: '25px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    [`& .${classes.sampleQueryCard}`]: {
        // transition: 'border-color 0.3s',
        '&:hover': {
            borderColor: '#006e9c',
            borderWidth: '1px',
            borderStyle: 'solid',
        },
    },
}));

export interface SampleQuery {
    scenario: string;
    query: string;
}

interface SampleQueryCardProps {
  onExecuteClick: (query: string) => void;
  queryData: SampleQuery;
  onCopyClick: (query: string) => void;
//   disabled: boolean;
//   boxShadow?: CardBoxShadow;
//   bgColor?: CardBgColor;
}

const SampleQueryCard: React.FC<SampleQueryCardProps> = ({
    onExecuteClick,
    queryData,
    onCopyClick,
}) => {
    const intl = useIntl();

    const copyText = intl.formatMessage({
        id: 'Apis.Details.ApiChat.components.CopyToClipboard.copyText',
        defaultMessage: 'Copy to Clipboard',
    });
    const copiedText = intl.formatMessage({
        id: 'Apis.Details.ApiChat.components.CopyToClipboard.copiedText',
        defaultMessage: 'Copied',
    });

    const [copyBtnText, setCopyBtnText] = useState(copyText);

    const handleTooltipClose = () => {
        setCopyBtnText(copyText);
    };

    const handleCopyClick = (query: string) => {
        setCopyBtnText(copiedText);
        onCopyClick(query);
    };

    return (
        <Root>
            <Card className={classes.sampleQueryCard}>
                {/* boxShadow={boxShadow}
                id={`query-card-${queryData.scenario}`}
                fullHeight
                bgColor={bgColor}
            > */}
                <CardActionArea
                    // id={`query-card-action-${queryData.scenario}`}
                    // fullHeight
                    // className={classes.sampleCardActionArea}
                    onClick={() => onExecuteClick(queryData.query)}
                >
                    <CardContent>
                        <Box display='flex' flexDirection='column' height={1}>
                            <Box mb={2}>
                                <Typography variant='body1'>
                                    {queryData.scenario}
                                </Typography>
                                <Typography variant='body2' color='textSecondary' component='p' className={classes.sampleQuery}>
                                    {queryData.query}
                                </Typography>
                            </Box>
                            <Box mt='auto'>
                                <Box>
                                    <Button
                                        size='small'
                                        // id='sample-query-execute'
                                        variant='outlined'
                                        // className={classes.sampleExecuteButton}
                                        // disabled={disabled}
                                        onClick={(e) => {
                                            onExecuteClick(queryData.query);
                                            e.stopPropagation();
                                        }}
                                    >
                                        {intl.formatMessage({
                                            id: 'modules.testComponent.TryWithAIViewer.TryWithAIViews.SampleQueryCard.executeButton',
                                            defaultMessage: 'Execute',
                                        })}
                                    </Button>
                                    <Tooltip
                                        title={copyBtnText}
                                        onClose={handleTooltipClose}
                                        placement='top-end'
                                    >
                                        <IconButton
                                            // testId='sample-query-copy'
                                            // size='small'
                                            // variant='text'
                                            // color='secondary'
                                            onClick={(e: any) => {
                                                handleCopyClick(queryData.query);
                                                e.stopPropagation();
                                            }}
                                        >
                                            <ContentCopyIcon fontSize='inherit' />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Root>
    );
};

export default SampleQueryCard;
