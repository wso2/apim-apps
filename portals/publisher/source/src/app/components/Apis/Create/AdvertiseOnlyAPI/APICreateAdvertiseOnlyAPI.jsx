/**
 * Copyright (c) 2021, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useReducer, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, useIntl } from 'react-intl';
import { withRouter } from 'react-router';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import Banner from 'AppComponents/Shared/Banner';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import AuthManager from 'AppData/AuthManager';

const APICreateAdvertiseOnlyAPI = (props) => {
    const { history } = props;
    const intl = useIntl();
    const [pageError, setPageError] = useState(null);
    const [isCreating, setIsCreating] = useState();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublishButtonClicked, setIsPublishButtonClicked] = useState(false);

    /**
     *
     * Reduce the events triggered from API input fields to current state
     */
    function apiInputsReducer(currentState, inputAction) {
        const { action, value } = inputAction;
        switch (action) {
            case 'name':
            case 'version':
            case 'context':
            case 'originalDevPortalUrl':
            case 'isFormValid':
                return { ...currentState, [action]: value };
            default:
                return currentState;
        }
    }
    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        formValidity: false,
    });

    const isAPICreatable = apiInputs.name && apiInputs.context && apiInputs.version && !isCreating;
    const isPublishable = true;

    /**
     *
     * Handle the change of the fields
     * @param {*} event
     */
    function handleOnChange(event) {
        const { name: action, value } = event.target;
        inputsDispatcher({ action, value });
    }

    /**
     *
     * Set the validity of the API Inputs form
     * @param {*} isFormValid validity of the form field values
     */
    function handleOnValidate(isFormValid) {
        inputsDispatcher({
            action: 'isFormValid',
            value: isFormValid,
        });
    }

    /**
     *
     * Create an 'OTHER' type API
     */
    function createAPI() {
        setIsCreating(true);
        const {
            name, version, context, originalDevPortalUrl,
        } = apiInputs;

        const apiData = {
            name,
            version,
            context,
            type: 'OTHER',
        };

        if (originalDevPortalUrl) {
            apiData.advertiseInfo = {
                advertised: true,
                originalDevPortalUrl,
                apiOwner: 'admin',
                vendor: 'WSO2',
            };
        }

        const newAPI = new API(apiData);
        const promisedCreatedAPI = newAPI
            .saveAPI()
            .then((api) => {
                Alert.info('API created successfully');
                return api;
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error('Something went wrong while adding the API');
                }
                console.error(error);
                setIsPublishing(false); // We don't publish if something when wrong
            })
            .finally(() => {
                setIsCreating(false);
            });
        return promisedCreatedAPI.finally(() => setIsCreating(false));
    }

    /**
     *
     * Create and publish API
     */
    function createAndPublish() {
        setIsPublishButtonClicked(true);
        createAPI().then((api) => {
            api.publish()
                .then((response) => {
                    const { workflowStatus } = response.body;
                    if (workflowStatus === APICreateAdvertiseOnlyAPI.WORKFLOW_STATUS.CREATED) {
                        Alert.info(intl.formatMessage({
                            id: 'Apis.Create.AdvertiseOnlyAPI.APICreateAdvertiseOnlyAPI.success.publishStatus',
                            defaultMessage: 'Lifecycle state change request has been sent',
                        }));
                    } else {
                        Alert.info(intl.formatMessage({
                            id: 'Apis.Create.AdvertiseOnlyAPI.APICreateAdvertiseOnlyAPI.success.otherStatus',
                            defaultMessage: 'API updated successfully',
                        }));
                    }
                    history.push(`/apis/${api.id}/overview`);
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                        setPageError(error.response.body);
                    } else {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Create.AdvertiseOnlyAPI.APICreateAdvertiseOnlyAPI.error.errorMessage.publish',
                            defaultMessage: 'Something went wrong while publishing the API',
                        }));
                        setPageError('Something went wrong while publishing the API');
                    }
                    console.error(error);
                })
                .finally(() => {
                    setIsPublishing(false);
                    setIsPublishButtonClicked(false);
                });
        });
    }

    /**
     *
     * Create the API without publishing
     */
    function createAPIOnly() {
        createAPI().then((api) => {
            history.push(`/apis/${api.id}/overview`);
        });
    }

    const pageTitle = (
        <>
            <Typography variant='h5'>
                <FormattedMessage
                    id='Apis.Create.AdvertiseOnlyAPI.APICreateAdvertiseOnlyAPI.api.heading'
                    defaultMessage='Create an Advertise Only API'
                />
            </Typography>
            <Typography variant='caption'>
                <FormattedMessage
                    id='Apis.Create.AdvertiseOnlyAPI.APICreateAdvertiseOnlyAPI.api.sub.heading'
                    defaultMessage='Create an API by providing a Name, a Version, a Context and the External Store URL'
                />
            </Typography>
        </>
    );

    return (
        <APICreateBase title={pageTitle}>
            <Grid container direction='row' justify='center' alignItems='center' spacing={3}>
                {/* Page error banner */}
                {pageError && (
                    <Grid item xs={11}>
                        <Banner
                            onClose={() => setPageError(null)}
                            disableActions
                            dense
                            paperProps={{ elevation: 1 }}
                            type='error'
                            message={pageError}
                        />
                    </Grid>
                )}
                {/* end of Page error banner */}
                <Grid item xs={12} />
                <Grid item md={1} xs={0} />
                <Grid item md={11} xs={12}>
                    <DefaultAPIForm
                        onValidate={handleOnValidate}
                        onChange={handleOnChange}
                        api={apiInputs}
                        isAPIProduct={false}
                        hideEndpoint
                        externalStoreURL
                    />
                </Grid>
                <Grid item md={1} xs={0} />
                <Grid item md={11} xs={12}>
                    <Grid container direction='row' justify='flex-start' alignItems='center' spacing={2}>
                        <Grid item>
                            <Button
                                variant='contained'
                                color='primary'
                                disabled={!(isAPICreatable && apiInputs.isFormValid)}
                                onClick={createAPIOnly}
                            >
                                Create
                                {' '}
                                {isCreating && !isPublishButtonClicked && <CircularProgress size={24} />}
                            </Button>
                        </Grid>
                        {!AuthManager.isNotPublisher() && (
                            <Grid item>
                                <Button
                                    id='itest-id-apicreatedefault-createnpublish'
                                    variant='contained'
                                    color='primary'
                                    disabled={!isPublishable || !isAPICreatable || !apiInputs.isFormValid}
                                    onClick={createAndPublish}
                                >
                                    {!isPublishing && 'Create & Publish'}
                                    {isPublishing && <CircularProgress size={24} />}
                                    {isCreating && isPublishing && 'Creating API . . .'}
                                    {!isCreating && isPublishing && 'Publishing API . . .'}
                                </Button>
                            </Grid>
                        )}
                        <Grid item>
                            <Link to='/apis/'>
                                <Button variant='text'>
                                    <FormattedMessage
                                        id='Apis.Create.AdvertiseOnlyAPI.APICreateAdvertiseOnlyAPI.cancel'
                                        defaultMessage='Cancel'
                                    />
                                </Button>
                            </Link>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </APICreateBase>
    );
};
APICreateAdvertiseOnlyAPI.WORKFLOW_STATUS = {
    CREATED: 'CREATED',
};

export default withRouter(APICreateAdvertiseOnlyAPI);
