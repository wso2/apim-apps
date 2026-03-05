/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from 'AppComponents/Shared/Alert';
import Application from 'AppData/Application';
import API from 'AppData/api';
import { FormattedMessage, useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Settings from 'Settings';
import ButtonPanel from './ButtonPanel';

const PREFIX = 'generateKeysStep';

const classes = {
    keyConfigWrapper: `${PREFIX}-keyConfigWrapper`,
    radioWrapper: `${PREFIX}-radioWrapper`,
    paper: `${PREFIX}-paper`,
    subTitle: `${PREFIX}-subTitle`,
    tabPanel: `${PREFIX}-tabPanel`,
    hr: `${PREFIX}-hr`,
    muiFormGroupRoot: `${PREFIX}-muiFormGroupRoot`,
    table: `${PREFIX}-table`,
    leftCol: `${PREFIX}-leftCol`,
    iconAligner: `${PREFIX}-iconAligner`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.keyConfigWrapper}`]: {
        paddingLeft: theme.spacing(4),
        flexDirection: 'column',
    },

    [`& .${classes.radioWrapper}`]: {
        flexDirection: 'row',
    },

    [`& .${classes.paper}`]: {
        background: 'none',
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2),
    },

    [`& .${classes.subTitle}`]: {
        fontWeight: 400,
    },

    [`& .${classes.tabPanel}`]: {
        '& .MuiBox-root': {
            padding: 0,
        },
    },

    [`& .${classes.hr}`]: {
        border: 'solid 1px #efefef',
    },

    [`& .${classes.muiFormGroupRoot}`]: {
        flexDirection: 'row',
    },

    [`& .${classes.table}`]: {
        minWidth: '100%',
        '& td, & th': {
            padding: theme.spacing(),
        },
    },

    [`& .${classes.leftCol}`]: {
        width: 200,
    },

    [`& .${classes.iconAligner}`]: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
}));

function TabPanel(props) {
    const {
        children, value, index, ...other
    } = props;

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`nav-tabpanel-${index}`}
            aria-labelledby={`nav-tab-${index}`}
            {...other}
        >
            {value === index && (
                (<Root>{children}</Root>)
            )}
        </div>
    );
}
TabPanel.defaultProps = {
    children: <div />,
};

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const generateKeysStep = (props) => {
    const intl = useIntl();

    const keyStates = {
        COMPLETED: 'COMPLETED',
        APPROVED: 'APPROVED',
        CREATED: 'CREATED',
        REJECTED: 'REJECTED',
    };
    const [nextActive, setNextActive] = useState(true);
    const [keyManager, setKeyManager] = useState(null);
    const selectedTab = 'Resident Key Manager';

    const [keyRequest, setKeyRequest] = useState({
        keyType: 'SANDBOX',
        supportedGrantTypes: [],
        callbackUrl: '',
        additionalProperties: {},
        keyManager: '',
    });

    const {
        currentStep, createdApp, incrementStep, setCreatedKeyType,
        setStepStatus, stepStatuses, setCreatedSelectedTab,
    } = props;

    useEffect(() => {
        const api = new API();
        const promisedKeyManagers = api.getKeyManagers();
        promisedKeyManagers
            .then((response) => {
                const responseKeyManagerList = [];
                response.body.list.map((item) => responseKeyManagerList.push(item));

                // Selecting a key manager from the list of key managers.
                let selectedKeyManager;
                if (responseKeyManagerList.length > 0) {
                    const responseKeyManagerListDefault = responseKeyManagerList.filter((x) => x.name === 'Resident Key Manager');
                    selectedKeyManager = responseKeyManagerListDefault.length > 0 ? responseKeyManagerListDefault[0]
                        : responseKeyManagerList[0];
                }

                // Filtering Grant Types for Token Exchange
                const filteredGrantTypes = selectedKeyManager.availableGrantTypes
                    .filter((k) => (k !== 'urn:ietf:params:oauth:grant-type:token-exchange'));
                setKeyManager({ ...selectedKeyManager, availableGrantTypes: filteredGrantTypes });

                // Setting key request
                try {
                    const newKeyRequest = { ...keyRequest };
                    newKeyRequest.keyManager = selectedKeyManager.id;
                    newKeyRequest.supportedGrantTypes = selectedKeyManager.availableGrantTypes;
                    if (selectedKeyManager.availableGrantTypes.includes('implicit')
                        || selectedKeyManager.availableGrantTypes.includes('authorization_code')) {
                        newKeyRequest.callbackUrl = 'http://localhost';
                    }
                    if (!selectedKeyManager.availableGrantTypes.includes('client_credentials')) {
                        setNextActive(false);
                    }
                    setKeyRequest(newKeyRequest);
                } catch (e) {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Credentials.Wizard.GenerateKeysStep.error.keymanager',
                        defaultMessage: 'Error while selecting the key manager',
                    }));
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            });
    }, []);

    const generateKeys = () => {
        Application.get(createdApp.value).then((application) => {
            return application.generateKeys(
                keyRequest.keyType, keyRequest.supportedGrantTypes
                    .filter((k) => (k !== 'urn:ietf:params:oauth:grant-type:token-exchange')),
                keyRequest.callbackUrl,
                keyRequest.additionalProperties, keyRequest.keyManager,
            );
        }).then((response) => {
            if (response.keyState === keyStates.CREATED || response.keyState === keyStates.REJECTED) {
                setStepStatus(stepStatuses.BLOCKED);
            } else {
                incrementStep();
                setCreatedKeyType(keyRequest.keyType);
                setCreatedSelectedTab(selectedTab);
                setStepStatus(stepStatuses.PROCEED);
                console.log('Keys generated successfully with ID : ' + response);
            }
        }).catch((error) => {
            if (process.env.NODE_ENV !== 'production') {
                console.log(error);
            }
            const { status } = error;
            if (status === 404) {
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Credentials.Wizard.GenerateKeysStep.error.404',
                    defaultMessage: 'Resource not found.',
                }));
            }
        });
    };

    return (
        <Root>
            <Box component='div' marginLeft={4}>
                <Grid container spacing={2}>
                    {keyManager && (
                        <>
                            <Grid item xs={12} md={20} lg={3}>
                                <Typography color='inherit' variant='subtitle2' component='div'>
                                    <FormattedMessage
                                        defaultMessage='Key Configuration'
                                        id='Apis.Details.Credentials.Wizard.GenerateKeysStep.key.configuration'
                                    />
                                </Typography>
                                <Typography color='inherit' variant='caption' component='p'>
                                    <FormHelperText>
                                        <FormattedMessage
                                            defaultMessage={'These configurations are set for the purpose of the wizard.'
                                                + 'You have more control over them when you go to the application view. '}
                                            id='Apis.Details.Credentials.Wizard.GenerateKeysStep.key.configuration.help'
                                        />
                                    </FormHelperText>

                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={12} lg={9}>
                                <Table className={classes.table}>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                                <FormattedMessage
                                                    id='Apis.Details.Credentials.Wizard.GenerateKeysStep.config.km.name'
                                                    defaultMessage='Key Manager'
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div>{keyManager.displayName || keyManager.name}</div>
                                                <Typography variant='caption' component='div'>{keyManager.description}</Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                                <FormattedMessage
                                                    id='Apis.Details.Credentials.Wizard.GenerateKeysStep.list.environment'
                                                    defaultMessage='Environment'
                                                />
                                            </TableCell>
                                            <TableCell>Sandbox</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                                <FormattedMessage
                                                    id='Apis.Details.Credentials.Wizard.GenerateKeysStep.list.tokenEndpoint'
                                                    defaultMessage='Token Endpoint'
                                                />
                                            </TableCell>
                                            <TableCell>{keyManager.tokenEndpoint}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                                <FormattedMessage
                                                    id='Apis.Details.Credentials.Wizard.GenerateKeysStep.list.revokeEndpoint'
                                                    defaultMessage='Revoke Endpoint'
                                                />
                                            </TableCell>
                                            <TableCell>{keyManager.revokeEndpoint}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                                <FormattedMessage
                                                    id='Apis.Details.Credentials.Wizard.GenerateKeysStep.list.userInfoEndpoint'
                                                    defaultMessage='User Info Endpoint'
                                                />
                                            </TableCell>
                                            <TableCell>{keyManager.userInfoEndpoint}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                                <FormattedMessage
                                                    id='Apis.Details.Credentials.Wizard.GenerateKeysStep.list.grantTypes'
                                                    defaultMessage='Grant Types'
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {keyManager.availableGrantTypes.map((gt) => (
                                                    <span>
                                                        {Settings.grantTypes[gt] || gt}
                                                        ,
                                                        {' '}
                                                    </span>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Grid>
                        </>
                    )}
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box component='span' m={1}>
                            <ButtonPanel
                                classes={classes}
                                currentStep={currentStep}
                                handleCurrentStep={generateKeys}
                                nextActive={nextActive}
                            />
                        </Box>

                    </Grid>
                </Grid>
            </Box>
        </Root>
    );
};

export default generateKeysStep;
