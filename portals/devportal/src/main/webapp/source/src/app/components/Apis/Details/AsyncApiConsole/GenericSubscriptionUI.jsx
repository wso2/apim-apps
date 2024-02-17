/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import AccordionActions from '@mui/material/AccordionActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from 'AppComponents/Shared/Alert';
import { FormattedMessage } from 'react-intl';
import Utils from 'AppData/Utils';
import Grid from '@mui/material/Grid';
import Badge from '@mui/material/Badge';
import { useTheme } from '@mui/material';

export default function GenericSubscriptionUI(props) {
    const verb = props.topic.type.toLowerCase();
    const trimmedVerb = verb === 'publish' || verb === 'subscribe' ? verb.substr(0, 3) : verb;
    const theme = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[trimmedVerb];
    const { generateGenericSubscriptionCommand, topic, expandable } = props;
    const [command, setCommand] = useState(generateGenericSubscriptionCommand(topic));

    const handleClick = () => {
        setCommand(generateGenericSubscriptionCommand(topic));
    };

    return (
        <Accordion
            sx={{
                marginBottom: '10px',
                border: `1px solid ${backgroundColor}`,
            }}
            style={{ pointerEvents: expandable ? 'auto' : 'none' }}
        >
            <AccordionSummary
                expandIcon={expandable && (<ExpandMoreIcon />)}
                aria-controls='generic-subscription-content'
                id='generic-subscription-header'
                sx={{
                    backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1),
                    maxHeight: '40px',
                    '&$expanded': {
                        maxHeight: '40px',
                    },
                }}
            >
                <Grid container direction='row' justifyContent='space-between' alignItems='center' spacing={0}>
                    <Grid item md={11}>
                        <Badge invisible='false' color='error' variant='dot'>
                            <Button
                                disableFocusRipple
                                variant='outlined'
                                size='small'
                                sx={{
                                    backgroundColor: '#ffffff',
                                    borderColor: backgroundColor,
                                    color: backgroundColor,
                                    width: theme.spacing(2),
                                }}
                            >
                                {trimmedVerb.toUpperCase()}
                            </Button>
                        </Badge>
                        <Typography display='inline' style={{ margin: '0px 30px' }} gutterBottom>
                            {topic.name}
                        </Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container direction='column' wrap='nowrap'>
                    <TextField
                        variant='filled'
                        label='cURL'
                        defaultValue=''
                        value={command}
                        multiline
                        InputProps={{
                            disableUnderline: true,
                            classes: {
                                root: {
                                    padding: 0,
                                    'label + &': {
                                        marginTop: theme.spacing(1),
                                    },
                                },
                                input: {
                                    borderRadius: 4,
                                    backgroundColor: theme.custom.curlGenerator.backgroundColor,
                                    color: theme.custom.curlGenerator.color,
                                    border: '1px solid #ced4da',
                                    padding: '5px 12px',
                                    marginTop: '11px',
                                    marginBottom: '11px',
                                    width: '100%',
                                    transition: theme.transitions.create(['border-color', 'box-shadow']),
                                    '&:focus': {
                                        borderColor: '#80bdff',
                                        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                                    },
                                    fontSize: 12,
                                    fontFamily: 'monospace',
                                    fontWeight: 600,
                                },
                            },
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
            </AccordionDetails>
            <AccordionActions style={{ paddingRight: '18px' }}>
                <Button size='small' onClick={handleClick}>
                    <FormattedMessage id='Apis.Details.AsyncApiConsole.Curl' defaultMessage='Generate Curl' />
                </Button>
                <Button
                    size='small'
                    onClick={() => {
                        navigator.clipboard.writeText(command).then(() => Alert.info(
                            <FormattedMessage id='Apis.Details.AsyncApiConsole.Copied' defaultMessage='cURL copied' />,
                        ));
                    }}
                >
                    <FormattedMessage id='Apis.Details.AsyncApiConsole.Copy' defaultMessage='Copy Curl' />
                </Button>
            </AccordionActions>
        </Accordion>
    );
}
