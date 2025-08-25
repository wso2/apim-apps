/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Typography,
    Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { isRestricted } from 'AppData/AuthManager';
import { FormattedMessage, useIntl } from 'react-intl';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import Certificates from './GeneralConfiguration/Certificates';

const PREFIX = 'GeneralConfiguration';

const classes = {
    configHeaderContainer: `${PREFIX}-configHeaderContainer`,
    generalConfigContent: `${PREFIX}-generalConfigContent`,
    secondaryHeading: `${PREFIX}-secondaryHeading`,
    endpointConfigSection: `${PREFIX}-endpointConfigSection`,
    generalConfigPanel: `${PREFIX}-generalConfigPanel`,
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.configHeaderContainer}`]: {
        display: 'flex',
        justifyContent: 'space-between',
    },

    [`& .${classes.generalConfigContent}`]: {
        boxShadow: 'inset -1px 2px 3px 0px #c3c3c3',
    },

    [`& .${classes.secondaryHeading}`]: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
        display: 'flex',
    },

    [`& .${classes.endpointConfigSection}`]: {
        padding: '10px',
    },

    [`& .${classes.generalConfigPanel}`]: {
        width: '100%',
    },
}));

const GeneralEndpointConfigurations = ({
    endpointList,
}) => {
    const [isConfigExpanded, setConfigExpand] = useState(false);
    const [endpointCertificates, setEndpointCertificates] = useState([]);
    const [aliasList, setAliasList] = useState([]);

    const intl = useIntl();

    /**
     * Method to save the certificate.
     * @param {*} certificate certificate
     * @param {*} endpoint endpoint
     * @param {*} alias alas
     * @returns {Promise} promise
     */
    const saveCertificate = (certificate, endpoint, alias) => {
        return API.addCertificate(certificate, endpoint, alias)
            .then((resp) => {
                if (resp.status === 201) {
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Details.Endpoints.GeneralConfiguration.Certificates.certificate.add.success',
                        defaultMessage: 'Certificate added successfully',
                    }));
                    const tmpCertificates = [...endpointCertificates];
                    tmpCertificates.push({
                        alias: resp.obj.alias,
                        endpoint: resp.obj.endpoint,
                    });
                    setEndpointCertificates(tmpCertificates);
                }
            })
            .catch((err) => {
                console.error(err.message);
                if (err.message === 'Conflict') {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Endpoints.GeneralConfiguration.Certificates.certificate.alias.exist',
                        defaultMessage: 'Adding Certificate Failed. Certificate Alias Exists.',
                    }));
                } else if (err.response && err.response.body && err.response.body.description) {
                    Alert.error(err.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Endpoints.GeneralConfiguration.Certificates.certificate.error',
                        defaultMessage: 'Something went wrong while adding the certificate.',
                    }));
                }
                return Promise.reject(err);
            });
    };

    /**
     * Method to delete the selected certificate.
     *
     * @param {string} alias The alias of the certifcate to be deleted
     * @returns {Promise} promise
     */
    const deleteCertificate = (alias) => {
        return API.deleteEndpointCertificate(alias)
            .then((resp) => {
                setEndpointCertificates(() => {
                    if (resp.status === 200) {
                        return endpointCertificates.filter((cert) => {
                            return cert.alias !== alias;
                        });
                    } else {
                        return -1;
                    }
                });
                Alert.info(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.GeneralConfiguration.Certificates.certificate.delete.success',
                    defaultMessage: 'Certificate Deleted Successfully',
                }));
            })
            .catch((err) => {
                console.log(err);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Endpoints.GeneralConfiguration.Certificates.certificate.delete.error',
                    defaultMessage: 'Error Deleting Certificate',
                }));
                return Promise.reject(err);
            });
    };

    // Get the certificates from backend.
    useEffect(() => {
        if (!isRestricted(['apim:ep_certificates_view', 'apim:api_view'])) {
            const endpointCertificatesList = [];
            const aliases = [];

            let endpoints = endpointList;
            const filteredEndpoints = [];
            const epLookup = [];
            for (const ep of endpoints) {
                if (ep) {
                    if (!epLookup.includes(ep.url)) {
                        filteredEndpoints.push(ep);
                        epLookup.push(ep.url);
                    }
                }
            }
            endpoints = filteredEndpoints;

            for (const ep of endpoints) {
                if (ep && ep.url) {
                    const params = {};
                    params.endpoint = ep.url;
                    API.getEndpointCertificates(params)
                        .then((response) => {
                            const { certificates } = response.obj;
                            for (const cert of certificates) {
                                endpointCertificatesList.push(cert);
                                aliases.push(cert.alias);
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                }
            }
            setEndpointCertificates(endpointCertificatesList);
            setAliasList(aliases);
        } else {
            setEndpointCertificates([]);
        }
    }, []);

    return (
        <Root>
            <Accordion
                expanded={isConfigExpanded}
                onChange={() => setConfigExpand(!isConfigExpanded)}
                className={classes.generalConfigPanel}
                disabled={isRestricted(['apim:ep_certificates_view', 'apim:api_view'])}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    id='panel1bh-header'
                    className={classes.configHeaderContainer}
                >
                    <Typography
                        className={classes.secondaryHeading}
                    >
                        <FormattedMessage
                            id='Apis.Details.Endpoints.GeneralConfiguration.certificates.sub.heading'
                            defaultMessage='Certificates'
                        />
                        :
                        {' '}
                        {endpointCertificates.length}
                        {isRestricted(['apim:ep_certificates_view', 'apim:api_view']) && (
                            <Box ml={2}>
                                <Typography variant='body2' color='primary'>
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.GeneralConfiguration.not.allowed'
                                        defaultMessage={'*You are not authorized to view certificates'
                                            + ' due to insufficient permissions'}
                                    />
                                </Typography>
                            </Box>
                        )}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.generalConfigContent}>
                    <Grid
                        container
                        className={classes.endpointConfigSection}
                    >
                        <Certificates
                            endpoints={endpointList}
                            certificates={endpointCertificates}
                            uploadCertificate={saveCertificate}
                            deleteCertificate={deleteCertificate}
                            aliasList={aliasList}
                        />
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Root>
    );
};

export default GeneralEndpointConfigurations;
