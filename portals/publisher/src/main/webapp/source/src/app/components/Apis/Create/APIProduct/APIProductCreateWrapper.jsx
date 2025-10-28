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
import React, { useReducer, useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import APIProduct from 'AppData/APIProduct';
import Alert from 'AppComponents/Shared/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import APICreateProductBase from 'AppComponents/Apis/Create/Components/APICreateProductBase';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import ProductResourcesEditWorkspace from 'AppComponents/Apis/Details/ProductResources/ProductResourcesEditWorkspace';
import API from 'AppData/api';
import AuthManager from 'AppData/AuthManager';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';

const PREFIX = 'APIProductCreateWrapper';

const classes = {
    Paper: `${PREFIX}-Paper`,
    saveButton: `${PREFIX}-saveButton`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    buttonWrapper: `${PREFIX}-buttonWrapper`,
    alternativeLabel: `${PREFIX}-alternativeLabel`
};


const Root = styled('div')(({ theme }) => ({
    [`& .${classes.Paper}`]: {
        height: '40px',
    },

    [`& .${classes.saveButton}`]: {
        padding: '0px 0px 0px 10px',
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: theme.spacing(2),
    },

    [`& .${classes.buttonWrapper}`]: {
        marginTop: theme.spacing(4),
    },

    [`& .${classes.alternativeLabel}`]: {
        marginTop: theme.spacing(1),
    }
}));

/**
 * Handle API creation from GraphQL Definition.
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function ApiProductCreateWrapper(props) {
    const { history } = props;
    const intl = useIntl();
    const [wizardStep, setWizardStep] = useState(0);
    const [apiResources, setApiResources] = useState([]);
    const { data: settings } = usePublisherSettings();
    const [isPublishButtonClicked, setIsPublishButtonClicked] = useState(false);
    const [isRevisioning, setIsRevisioning] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const [policies, setPolicies] = useState([]);

    useEffect(() => {
        API.policies('subscription').then((response) => {
            const allPolicies = response.body.list;
            if (allPolicies.length === 0) {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.APIProduct.APIProductCreateWrapper.error.policies.not.available',
                    defaultMessage: 'Throttling policies not available. Contact your administrator',
                }));
            } else if (allPolicies.filter((p) => p.name === 'Unlimited').length > 0) {
                setPolicies(['Unlimited']);
            } else {
                setPolicies([allPolicies[0].name]);
            }
        });
    }, []);
    const pageTitle = (
        (<Root>
            <Typography variant='h5'>
                <FormattedMessage
                    id='Apis.Create.APIProduct.APIProductCreateWrapper.heading'
                    defaultMessage='Create an API Product'
                />
            </Typography>
            <Typography variant='caption'>
                <FormattedMessage
                    id='Apis.Create.APIProduct.APIProductCreateWrapper.sub.heading'
                    defaultMessage={
                        'Create an API Product by providing a Name, a Context, a Version, Resources, '
                        + 'and Business Plans (optional).'
                    }
                />
            </Typography>
        </Root>)
    );
    /**
     *
     * Reduce the events triggered from API input fields to current state
     * @param {*} currentState
     * @param {*} inputAction
     * @returns
     */
    function apiInputsReducer(currentState, inputAction) {
        const { action, value } = inputAction;
        switch (action) {
            case 'type':
            case 'name':
            case 'displayName':
            case 'context':
            case 'version':
            case 'isFormValid':
                return { ...currentState, [action]: value };
            case 'apiResources':
                return { ...currentState, [action]: value };
            case 'preSetAPI':
                return {
                    ...currentState,
                    name: value.name.replace(/[&/\\#,+()$~%.'":*?<>{}\s]/g, ''),
                    context: value.context,
                };
            default:
                return currentState;
        }
    }

    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        type: 'ApiProductCreateWrapper',
        inputValue: '',
        formValidity: false,
    });

    /**
     *
     *
     * @param {*} event
     */
    function handleOnChange(event) {
        const { name: action, value } = event.target;
        inputsDispatcher({ action, value });
    }

    /**
     *
     * Set the validity of the API Inputs form
     * @param {*} isValidForm
     * @param {*} validationState
     */
    function handleOnValidate(isFormValid) {
        inputsDispatcher({
            action: 'isFormValid',
            value: isFormValid,
        });
    }
    function getSteps() {
        return [
            <FormattedMessage
                variant='caption'
                id='Apis.Create.APIProduct.APIProductCreateWrapper.defineProvide'
                defaultMessage='Define API Product'
            />, <FormattedMessage
                variant='caption'
                id='Apis.Create.APIProduct.APIProductCreateWrapper.resources'
                defaultMessage='Add Resources'
            />];
    }

    const [isCreating, setCreating] = useState();

    const steps = getSteps();
    let newAPIProduct;

    const createAPIProduct = () => {
        setCreating(true);
        const {
            name, context, version, displayName,
        } = apiInputs;
        const apiData = {
            name,
            displayName,
            context,
            version,
            policies,
            apis: apiResources,
        };
        apiData.transport = ['http', 'https'];
        newAPIProduct = new APIProduct(apiData);
        const promisedCreatedAPIProduct = newAPIProduct
            .saveProduct(apiData)
            .then((apiProduct) => {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.APIProduct.APIProductCreateWrapper.created.success',
                    defaultMessage: 'API Product created successfully',
                }));
                return apiProduct;
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.APIProductCreateWrapper.error.errorMessage.create.api.product',
                        defaultMessage: 'Something went wrong while adding the API Product',
                    }));
                }
            })
            .finally(() => setCreating(false));
        return promisedCreatedAPIProduct.finally(() => setCreating(false));
    };

    const createAPIProductOnly = () => {
        createAPIProduct().then((apiProduct) => {
            history.push(`/api-products/${apiProduct.id}/overview`);
        });
    };

    const createAndPublishAPIProduct = () => {
        setIsPublishButtonClicked(true);
        createAPIProduct()
            .then((apiProduct) => {
                setIsRevisioning(true);
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.APIProduct.APIProductCreateWrapper.created.success',
                    defaultMessage: 'API Product created successfully',
                }));
                const body = {
                    description: 'Initial Revision',
                };
                newAPIProduct.createProductRevision(apiProduct.id, body)
                    .then((api1) => {
                        setIsRevisioning(false);
                        const revisionId = api1.body.id;
                        Alert.info(intl.formatMessage({
                            id: 'Apis.Create.APIProduct.APIProductCreateWrapper.revision.created.success',
                            defaultMessage: 'API Revision created successfully',
                        }));
                        const envList = settings.environment.map((env) => env.name);
                        const body1 = [];
                        const getFirstVhost = (envName) => {
                            const env = settings.environment.find(
                                (e) => e.name === envName && e.mode !== 'READ_ONLY' && e.vhosts.length > 0,
                            );
                            return env && env.vhosts[0].host;
                        };
                        if (envList && envList.length > 0) {
                            if (envList.includes('Default') && getFirstVhost('Default')) {
                                body1.push({
                                    name: 'Default',
                                    displayOnDevportal: true,
                                    vhost: getFirstVhost('Default'),
                                });
                            } else if (getFirstVhost(envList[0])) {
                                body1.push({
                                    name: envList[0],
                                    displayOnDevportal: true,
                                    vhost: getFirstVhost(envList[0]),
                                });
                            }
                        }
                        setIsDeploying(true);
                        newAPIProduct.deployProductRevision(apiProduct.id, revisionId, body1)
                            .then(() => {
                                Alert.info(intl.formatMessage({
                                    id: 'Apis.Create.APIProduct.APIProductCreateWrapper.revision.deployed.success',
                                    defaultMessage: 'API Revision Deployed Successfully',
                                }));
                                setIsDeploying(false);
                                setIsPublishing(true);
                                newAPIProduct.updateLcState(apiProduct.id, 'Publish')
                                    .then((response) => {
                                        const { workflowStatus } = response.body;
                                        if (workflowStatus === 'CREATED') {
                                            Alert.info(intl.formatMessage({
                                                id: 'Apis.Create.APIProduct.APIProductCreateWrapper.publishStatus',
                                                defaultMessage: 'Lifecycle state change request has been sent',
                                            }));
                                        } else {
                                            Alert.info(intl.formatMessage({
                                                id: 'Apis.Create.APIProduct.APIProductCreateWrapper.otherStatus',
                                                defaultMessage: 'API Product status updated successfully',
                                            }));
                                        }
                                        history.push(`/api-products/${apiProduct.id}/overview`);
                                    });
                            })
                            .catch((error) => {
                                if (error.response) {
                                    Alert.error(error.response.body.description);
                                } else {
                                    Alert.error(intl.formatMessage({
                                        id: 'Apis.APIProductCreateWrapper.error.errorMessage.deploy.revision',
                                        defaultMessage: 'Something went wrong while deploying the API Product Revision',
                                    }));
                                }
                                console.error(error);
                            })
                            .finally(() => {
                                setIsPublishing(false);
                                setIsPublishButtonClicked(false);
                            });
                    })
                    .catch((error) => {
                        if (error.response) {
                            Alert.error(error.response.body.description);
                        } else {
                            Alert.error(intl.formatMessage({
                                id: 'Apis.APIProductCreateWrapper.error.errorMessage.create.revision',
                                defaultMessage: 'Something went wrong while creating the API Product Revision',
                            }));
                        }
                        console.error(error);
                    });
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.APIProductCreateWrapper.error.errorMessage.create.api.product',
                        defaultMessage: 'Something went wrong while adding the API Product',
                    }))
                }
            })
            .finally(() => setCreating(false));
    };

    return <>
        <APICreateProductBase
            title={pageTitle}
        >
            <Box sx={{ mb: 3 }}>
                <Stepper alternativeLabel activeStep={wizardStep}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel className={classes.alternativeLabel}>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
            <Grid container>
                <Grid item md={12}>
                    {wizardStep === 0 && (
                        <DefaultAPIForm
                            onValidate={handleOnValidate}
                            onChange={handleOnChange}
                            api={apiInputs}
                            isAPIProduct
                            settings={settings}
                        />
                    )}
                    {wizardStep === 1 && (
                        <ProductResourcesEditWorkspace
                            apiResources={apiResources}
                            setApiResources={setApiResources}
                            isStateCreate
                            api={apiInputs}
                        />
                    )}
                </Grid>
                {/* {wizardStep === 0 && <Grid item md={1} />} */}
                <Grid item md={12} sx={{ mt: 3 }}>
                    <Grid
                        className={wizardStep === 1 && classes.saveButton}
                        container
                        direction='row'
                        justifyContent='flex-start'
                        alignItems='center'
                        spacing={2}
                    >
                        <Grid item>
                            {wizardStep === 1
                                && (
                                    <Button
                                        onClick={() => setWizardStep((step) => step - 1)}
                                    >
                                        <FormattedMessage
                                            id='Apis.Create.APIProduct.APIProductCreateWrapper.back'
                                            defaultMessage='Back'
                                        />
                                    </Button>
                                )}
                            {wizardStep === 0 && (
                                <Link to='/api-products/'>
                                    <Button>
                                        <FormattedMessage
                                            id='Apis.Create.APIProduct.APIProductCreateWrapper.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                        </Grid>
                        <Grid item>
                            {wizardStep === 1 && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid || isCreating || (apiResources.length === 0)
                                                || isPublishButtonClicked}
                                    onClick={createAPIProductOnly}
                                    id='create-api-product-btn'
                                >
                                    <FormattedMessage
                                        id='Apis.Create.APIProduct.APIProductCreateWrapper.create'
                                        defaultMessage='Create'
                                    />
                                    {isCreating && !isPublishButtonClicked && <CircularProgress size={24} />}
                                </Button>
                            )}
                            {wizardStep === 0 && (
                                <Button
                                    onClick={() => setWizardStep((step) => step + 1)}
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid}
                                    id='api-product-next-btn'
                                >
                                    <FormattedMessage
                                        id='Apis.Create.APIProduct.APIProductCreateWrapper.next'
                                        defaultMessage='Next'
                                    />
                                </Button>
                            )}
                        </Grid>
                        <Grid item>
                            {wizardStep === 1 && !AuthManager.isNotPublisher() && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    id='create-and-publish-api-product-btn'
                                    disabled={
                                        !apiInputs.isFormValid || isCreating || (apiResources.length === 0)
                                        || isDeploying || isRevisioning || !apiInputs.isFormValid
                                    }
                                    onClick={createAndPublishAPIProduct}
                                >
                                    {(!isPublishing && !isRevisioning && !isDeploying) &&
                                        <FormattedMessage
                                            id='Apis.Create.APIProduct.APIProductCreateWrapper.create.and.publish.btn'
                                            defaultMessage='Create & Publish'
                                        />
                                    }
                                    {(isPublishing || isRevisioning || isDeploying)
                                    && <CircularProgress size={24} />}
                                    {isCreating && isPublishing &&
                                        <FormattedMessage
                                            id='Apis.Create.APIProduct.APIProductCreateWrapper.create.status'
                                            defaultMessage='Creating API Product. . .'
                                        />
                                    }
                                    {!isCreating && isRevisioning && !isDeploying &&
                                        <FormattedMessage
                                            id={'Apis.Create.APIProduct.APIProductCreateWrapper.create.'
                                                + 'revision.status'}
                                            defaultMessage='Creating Revision . . .'
                                        />
                                    }
                                    {!isCreating && isPublishing
                                    && !isRevisioning && !isDeploying &&
                                        <FormattedMessage
                                            id={'Apis.Create.APIProduct.APIProductCreateWrapper.create.'
                                                + 'publish.status'}
                                            defaultMessage='Publishing API Product. . .'
                                        />
                                    }
                                    {!isCreating && isPublishing
                                    && !isRevisioning && isDeploying &&
                                        <FormattedMessage
                                            id={'Apis.Create.APIProduct.APIProductCreateWrapper.create.'
                                                + 'deploy.revision.status'}
                                            defaultMessage='Deploying Revision . . .'
                                        />

                                    }
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </APICreateProductBase>
    </>;
}

ApiProductCreateWrapper.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};
