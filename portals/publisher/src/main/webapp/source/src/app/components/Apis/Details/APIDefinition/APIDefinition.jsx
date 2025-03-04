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

import React, { Suspense, lazy } from 'react';
import { styled } from '@mui/material/styles';
import AppContext from 'AppComponents/Shared/AppContext';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import EditRounded from '@mui/icons-material/EditRounded';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import LockRounded from '@mui/icons-material/LockRounded';
import SwapHorizontalCircle from '@mui/icons-material/SwapHorizontalCircle';
import CustomSplitButton from 'AppComponents/Shared/CustomSplitButton';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Progress } from 'AppComponents/Shared';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import YAML from 'js-yaml';
import Alert from 'AppComponents/Shared/Alert';
import API from 'AppData/api.js';
import { doRedirectToLogin } from 'AppComponents/Shared/RedirectToLogin';
import { withRouter } from 'react-router';
import { isRestricted } from 'AppData/AuthManager';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import Box from '@mui/material/Box';
import { ToggleButton, ToggleButtonGroup } from '@mui/lab';
import debounce from 'lodash.debounce'; // WARNING: This is coming from mui-datatable as a transitive dependency
import ResourceNotFound from '../../../Base/Errors/ResourceNotFound';
import APISecurityAudit from './APISecurityAudit';
import ImportDefinition from './ImportDefinition';
import DefinitionOutdated from './DefinitionOutdated';
import { getLinterResultsFromContent } from "./Linting/Linting";
import APILintingSummary from './Linting/APILintingSummary';

const EditorDialog = lazy(() => import('./SwaggerEditorDrawer' /* webpackChunkName: "EditorDialog" */));
const AsyncAPIEditor = lazy(() => import('./AsyncApiEditorDrawer'));

const PREFIX = 'APIDefinition';

// generate classes const with all the class names used in this component
const classes = {
    titleWrapper: `${PREFIX}-titleWrapper`,
    swaggerEditorWrapper: `${PREFIX}-swaggerEditorWrapper`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    buttonWarningColor: `${PREFIX}-buttonWarningColor`,
    topBar: `${PREFIX}-topBar`,
    converterWrapper: `${PREFIX}-converterWrapper`,
    downloadLink: `${PREFIX}-downloadLink`,
    button: `${PREFIX}-button`,
    progressLoader: `${PREFIX}-progressLoader`,
    updateApiWarning: `${PREFIX}-updateApiWarning`,
    warningIconStyle: `${PREFIX}-warningIconStyle`,
    activeButton: `${PREFIX}-activeButton`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    [`& .${classes.swaggerEditorWrapper}`]: {
        height: '100vh',
        overflowY: 'auto',
    },
    [`& .${classes.buttonIcon}`]: {
        marginRight: 10,
    },
    [`& .${classes.buttonWarningColor}`]: {
        color: theme.palette.warning.light,
    },
    [`& .${classes.topBar}`]: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: theme.spacing(2),
    },
    [`& .${classes.converterWrapper}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: '1',
        fontSize: '0.6964285714285714rem',
    },
    [`& .${classes.downloadLink}`]: {
        color: 'black',
    },
    [`& .${classes.button}`]: {
        marginLeft: theme.spacing(1),
        '&:hover': {
            'text-decoration': 'none',
        },
    },
    [`& .${classes.progressLoader}`]: {
        marginLeft: theme.spacing(1),
    },
    [`& .${classes.updateApiWarning}`]: {
        marginLeft: theme.spacing(5),
        color: theme.custom.serviceCatalog.onboarding.buttonText,
        borderColor: theme.custom.serviceCatalog.onboarding.buttonText,
    },
    [`& .${classes.warningIconStyle}`]: {
        color: theme.custom.serviceCatalog.onboarding.buttonText,
    },
    [`& .${classes.activeButton}`]: {
        "&:selected": {
            backgroundColor: theme.palette.background.default,
        }
    }
}));
/**
 * This component holds the functionality of viewing the api definition content of an api. The initial view is a
 * read-only representation of the api definition file.
 * Users can either edit the content by clicking the 'Edit' button or upload a new api definition file by clicking
 * 'Import API Definition'.
 * */
class APIDefinition extends React.Component {
    /**
     * @inheritDoc
     */
    constructor(props) {
        super(props);
        this.state = {
            openEditor: false,
            swagger: null,
            swaggerModified: null,
            swaggerImporting: null,
            graphQL: null,
            format: null,
            convertTo: null,
            isAuditApiClicked: false,
            securityAuditProperties: [],
            isSwaggerValid: true,
            isUpdating: false,
            asyncAPI: null,
            asyncAPIModified: null,
            isAsyncAPIValid: true,
            errors: [],
            isSwaggerUI: true,
            linterResults: [],
            linterSelectedSeverity: null,
            linterSelectedLine: null,
            isImporting: false,
        };
        this.handleNo = this.handleNo.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleSaveAndDeploy = this.handleSaveAndDeploy.bind(this);
        this.openEditor = this.openEditor.bind(this);
        this.openEditorToImport = this.openEditorToImport.bind(this);
        this.transition = this.transition.bind(this);
        this.closeEditor = this.closeEditor.bind(this);
        this.hasJsonStructure = this.hasJsonStructure.bind(this);
        this.getConvertToFormat = this.getConvertToFormat.bind(this);
        this.onAuditApiClick = this.onAuditApiClick.bind(this);
        this.onChangeFormatClick = this.onChangeFormatClick.bind(this);
        this.openUpdateConfirmation = this.openUpdateConfirmation.bind(this);
        this.updateSwaggerDefinition = this.updateSwaggerDefinition.bind(this);
        this.updateAsyncAPIDefinitionAndDeploy = this.updateAsyncAPIDefinitionAndDeploy.bind(this);
        this.onChangeSwaggerContent = this.onChangeSwaggerContent.bind(this);
        this.updateAsyncAPIDefinition = this.updateAsyncAPIDefinition.bind(this);
        this.onChangeAsyncAPIContent = this.onChangeAsyncAPIContent.bind(this);
        this.setErrors = this.setErrors.bind(this);
    }

    /**
     * @inheritdoc
     */
    componentDidMount() {
        const { api } = this.props;
        const { settings } = this.context;
        let promisedApi;
        if (api.type === 'GRAPHQL') {
            promisedApi = api.getSchema(api.id);
        } else if (api.type === 'WS' || api.type === 'WEBSUB' || api.type === 'SSE' || api.type === 'ASYNC') {
            promisedApi = api.getAsyncAPIDefinition(api.id);
        } else {
            promisedApi = api.getSwagger(api.id);
        }

        if (settings) {
            this.setState({ securityAuditProperties: settings.securityAuditProperties });
        }
        
        promisedApi
            .then((response) => {
                if (api.type === 'GRAPHQL') {
                    this.setState({
                        graphQL: response.obj.schemaDefinition,
                        format: 'txt',
                    });
                } else if (api.type === 'WS' || api.type === 'WEBSUB' || api.type === 'SSE' || api.type === 'ASYNC') {
                    this.setState({
                        asyncAPI: YAML.safeDump(YAML.safeLoad(response.data)),
                        asyncAPIModified: YAML.safeDump(YAML.safeLoad(response.data)),
                        format: 'yaml',
                        convertTo: this.getConvertToFormat('yaml'),
                    });
                } else {
                    this.setState({
                        swagger: YAML.safeDump(YAML.safeLoad(response.data)),
                        swaggerModified: YAML.safeDump(YAML.safeLoad(response.data)),
                        format: 'yaml',
                        convertTo: this.getConvertToFormat('yaml'),
                    });
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    this.setState({ notFound: true });
                } else if (status === 401) {
                    doRedirectToLogin();
                }
            });
    }


    /**
     * Method to handle asyncAPI content change
     *
     * @param {string} modifiedContent : The modified asyncAPI content.
     * */
    onChangeAsyncAPIContent(modifiedContent) {
        const { format } = this.state;
        /**
         * Validate for the basic json/ yaml format.
         * */
        try {
            if (format === 'json') {
                JSON.parse(modifiedContent, null);
            } else {
                YAML.load(modifiedContent);
            }
            this.setState({ isAsyncAPIValid: true, asyncAPIModified: modifiedContent });
        } catch (e) {
            this.setState({ isAsyncAPIValid: false, asyncAPIModified: modifiedContent });
        }
    }

    /**
     * Toggle the format of the api definition.
     * JSON -> YAML, YAML -> JSON
     */
    onChangeFormatClick() {
        const {
            format, swagger, convertTo, asyncAPI,
        } = this.state;
        let formattedString = '';
        if (asyncAPI === null) {
            if (convertTo === 'json') {
                formattedString = JSON.stringify(YAML.load(swagger), null, 1);
            } else {
                formattedString = YAML.safeDump(YAML.safeLoad(swagger));
            }
            this.setState({
                swagger: formattedString,
                swaggerModified: formattedString,
                format: convertTo,
                convertTo: format,
            });
        } else {
            if (convertTo === 'json') {
                formattedString = JSON.stringify(YAML.load(asyncAPI), null, 1);
            } else {
                formattedString = YAML.safeDump(YAML.safeLoad(asyncAPI));
            }
            this.setState({
                asyncAPI: formattedString,
                asyncAPIModified: formattedString,
                format: convertTo,
                convertTo: format,
            });
        }
    }

    /**
      * Set isAuditApiClicked to true when Audit API is clicked
      */
    onAuditApiClick() {
        this.setState({ isAuditApiClicked: true });
    }

    /**
     * Method to handle swagger content change
     *
     * @param {string} modifiedContent : The modified swagger content.
     * */
    onChangeSwaggerContent(modifiedContent) {
        const { format } = this.state;
        /**
         * Validate for the basic json/ yaml format.
         * */
        try {
            let file = null;
            if (format === 'json') {
                JSON.parse(modifiedContent, null);
                const blobJson = new Blob([modifiedContent], { type: 'text/json' });
                file = new File([blobJson], 'modifiedContent.json', { type: 'text/json;charset=utf-8' });
            } else {
                YAML.load(modifiedContent);
                const blobYaml = new Blob([modifiedContent], { type: 'text/yaml' });
                file = new File([blobYaml], 'modifiedContent.yaml', { type: 'text/yaml;charset=utf-8' });
            }

            if (this.state.isImporting) {
                this.setState({ swaggerImporting: modifiedContent });
            } else {
                this.setState({ swaggerModified: modifiedContent });
            }

            const validateDebounced = debounce(() => {
                API.validateOpenAPIByFile(file)
                    .then((response) => {
                        const {
                            body: { isValid },
                        } = response;
                        this.setState({ isSwaggerValid: isValid });
                        console.log("isValid:", isValid);
                    });
            }, 500);

            validateDebounced();
            
        } catch (e) {
            if (this.state.isImporting) {
                this.setState({ isSwaggerValid: false, swaggerImporting: modifiedContent });
            } else {
                this.setState({ isSwaggerValid: false, swaggerModified: modifiedContent });
            }
        }

        getLinterResultsFromContent(modifiedContent, this.props.api.id).then((results) => {
            this.setState({ linterResults: results });
        });
    }

    /**
     * @param {Array} errors list of errors to be set
     */
    setErrors(errors) {
        this.setState({ errors });
    }

    setSchemaDefinition = (schemaContent, contentType) => {
        const { api } = this.props;
        const isGraphql = api.isGraphql();
        const isWebSocket = api.isWebSocket();
        const isWebSub = api.isWebSub();
        if (isGraphql) {
            this.setState({ graphQL: schemaContent });
        } else if (isWebSocket || isWebSub) {
            this.setState({
                asyncAPI: schemaContent,
                asyncAPIModified: schemaContent,
                convertTo: this.getConvertToFormat(contentType),
                format: contentType,
            });
        } else {
            this.setState({
                swagger: schemaContent,
                swaggerModified: schemaContent,
                convertTo: this.getConvertToFormat(contentType),
                format: contentType,
            });
        }
    };

    /**
     * Util function to get the format which the definition can be converted to.
     * @param {*} format : The current format of definition.
     * @returns {string} The possible conversion format.
     */
    getConvertToFormat(format) {
        return format === 'json' ? 'yaml' : 'json';
    }

    /**
     * Handles the No button action of the save api definition confirmation dialog box.
     */
    handleNo() {
        this.setState({ openDialog: false });
    }

    /**
     * Handles the yes button action of the save api definition confirmation dialog box.
     */
    handleSave() {
        const { swaggerModified, asyncAPIModified, swaggerImporting } = this.state;
        if (this.state.isImporting) {
            this.setState({ openDialog: false }, () => this.updateSwaggerDefinition(swaggerImporting, '', ''));
        } else if (asyncAPIModified !== null) {
            this.setState({ openDialog: false }, () => this.updateAsyncAPIDefinition(asyncAPIModified, '', ''));
        } else {
            this.setState({ openDialog: false }, () => this.updateSwaggerDefinition(swaggerModified, '', ''));
        }
    }

    /**
     * Handle save and deploy
     * */
    handleSaveAndDeploy() {
        const { swaggerModified, asyncAPIModified } = this.state;
        const { api, history } = this.props;
        if (asyncAPIModified !== null) {
            this.updateAsyncAPIDefinitionAndDeploy(asyncAPIModified, '', '');
            history.push({
                pathname: api.isAPIProduct() ? `/api-products/${api.id}/deployments`
                    : `/apis/${api.id}/deployments`,
                state: 'deploy',
            });
        } else {
            this.updateSwaggerDefinition(swaggerModified, '', '');
            history.push({
                pathname: api.isAPIProduct() ? `/api-products/${api.id}/deployments`
                    : `/apis/${api.id}/deployments`,
                state: 'deploy',
            });
        }
    }

    /**
     * Checks whether the swagger content is json type.
     * @param {string} definition The swagger string.
     * @return {boolean} Whether the content is a json or not.
     * */
    hasJsonStructure(definition) {
        if (typeof definition !== 'string') return false;
        try {
            const result = JSON.parse(definition);
            return result && typeof result === 'object';
        } catch (err) {
            return false;
        }
    }

    /**
     * Method to set the state for opening the swagger editor drawer.
     * Swagger editor loads the definition content from the local storage. Hence we set the swagger content to the
     * local storage.
     * */
    openEditor() {
        this.setState({ isImporting: false, linterSelectedLine: null });
        getLinterResultsFromContent(this.state.swaggerModified, this.props.api.id).then((results) => {
            this.setState({ linterResults: results, openEditor: true });
        });
        
    }

    openEditorToImport(importingSwagger, linterSelectedLine) {
        this.setState({ isImporting: true, swaggerImporting: importingSwagger, 
            linterSelectedLine, isSwaggerUI: false });
        getLinterResultsFromContent(importingSwagger, this.props.api.id).then((results) => {
            this.setState({ linterResults: results, openEditor: true });
        });
    }

    /**
     * Sets the state to close the swagger-editor drawer.
     * */
    closeEditor() {
        this.setState({ openEditor: false });
        const { intl, api, history } = this.props;
        const { isAuditApiClicked } = this.state;
        if (isAuditApiClicked === true) {
            Alert.info(intl.formatMessage({
                id: 'Apis.Details.APIDefinition.info.updating.auditapi',
                defaultMessage: 'To reflect the changes made, you need to click Audit API',
            }));
            const redirectUrl = '/apis/' + api.id + '/api-definition';
            history.push(redirectUrl);
        }
    }

    /**
     * Handles the transition of the drawer.
     * @param {object} props list of props
     * @return {object} The Slide transition component
     * */
    transition(props) {
        return <Slide direction='up' {...props} />;
    }

    /**
     * Updates swagger content in the local storage.
     * */
    openUpdateConfirmation() {
        this.setState({ openDialog: true });
    }

    /**
     * Updates swagger definition of the api.
     * @param {string} swaggerContent The swagger file that needs to be updated.
     * @param {string} specFormat The current format of the definition
     * @param {string} toFormat The format it can be converted to.
     * */
    updateSwaggerDefinition(swaggerContent, specFormat, toFormat) {
        const { api, intl, updateAPI } = this.props;
        this.setState({ isUpdating: true });
        let parsedContent = {};
        let swaggerFile = null;

        try {
            if (this.hasJsonStructure(swaggerContent)) {
                parsedContent = JSON.parse(swaggerContent);
                const blob = new Blob([swaggerContent], { type: 'text/json' });
                swaggerFile = new File([blob], 'swagger.json', { type: 'text/json;charset=utf-8' });
            } else {
                parsedContent = YAML.load(swaggerContent);
                const blobYaml = new Blob([swaggerContent], { type: 'text/yaml' });
                swaggerFile = new File([blobYaml], 'swagger.yaml', { type: 'text/yaml;charset=utf-8' });
            }
            const promiseValidation = api.validateSwagger(swaggerFile);
            promiseValidation.then((ValidationResponse) => {
                const { isValid, errors } = ValidationResponse.body;
                // if isValid = true/false the error always returned as an array
                this.setState({ errors });
                if (!isValid) {
                    console.log(ValidationResponse);
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.APIDefinition.APIDefinition.error.while.updating.api.definition',
                        defaultMessage: 'Error occurred while updating the API Definition',
                    }));
                    this.setState({ isUpdating: false });
                } else {
                    const promise = api.updateSwagger(parsedContent);
                    promise
                        .then((response) => {
                            const { endpointImplementationType } = api;
                            if (endpointImplementationType === 'INLINE') {
                                api.generateMockScripts(api.id);
                            }
                            if (response) {
                                Alert.success(intl.formatMessage({
                                    id: 'Apis.Details.APIDefinition.APIDefinition.api.definition.updated.successfully',
                                    defaultMessage: 'API Definition updated successfully',
                                }));
                                if (specFormat && toFormat) {
                                    this.setState({ swagger: swaggerContent, format: specFormat, convertTo: toFormat });
                                } else {
                                    this.setState({ swagger: swaggerContent });
                                }
                            }
                            /*
                             *updateAPI() will make a /GET call to get the latest api once the swagger
                             definition is updated.
                             *Otherwise, we need to refresh the page to get changes.
                             */
                            updateAPI();
                            this.setState({ isUpdating: false });
                        })
                        .catch((err) => {
                            console.log(err);
                            Alert.error(intl.formatMessage({
                                id: 'Apis.Details.APIDefinition.APIDefinition.error.while.updating.api.definition',
                                defaultMessage: 'Error occurred while updating the API Definition',
                            }));
                            this.setState({ isUpdating: false });
                        });
                }
            }).catch((validateErr) => {
                console.log(validateErr);
                Alert.error(validateErr);
            });
        } catch (err) {
            console.log(err);
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.APIDefinition.APIDefinition.error.while.updating.api.definition',
                defaultMessage: 'Error occurred while updating the API Definition',
            }));
        }
    }


    /**
     * Updates asyncAPI definition of the API
     * @param {string} asyncAPIContent The AsyncAPi file that needs to be updated.
     * @param {string} specFormat The current format of the definition
     * @param {string} toFormat The format it can be converted to.
     */
    updateAsyncAPIDefinitionAndDeploy(asyncAPIContent, specFormat, toFormat) {
        const { api, intl } = this.props;
        this.setState({ isUpdating: true });
        let parsedContent = {};
        if (this.hasJsonStructure(asyncAPIContent)) {
            parsedContent = JSON.parse(asyncAPIContent);
        } else {
            try {
                parsedContent = YAML.load(asyncAPIContent);
            } catch (err) {
                console.log(err);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.APIDefinition.APIDefinition.error.while.updating.async.api.definition',
                    defaultMessage: 'Error occurred while updating the API Definition',
                }));
                return;
            }
        }
        const promise = api.updateAsyncAPIDefinition(parsedContent);
        promise
            .then((response) => {
                /* const { endpointImplementationType } = api; */
                /* if (endpointImplementationType === 'INLINE') {
                    api.generateMockScripts(api.id);
                } */
                if (response) {
                    Alert.success(intl.formatMessage({
                        id: 'Apis.Details.APIDefinition.APIDefinition.async.api.definition.updated.successfully',
                        defaultMessage: 'API Definition updated successfully',
                    }));
                    if (specFormat && toFormat) {
                        this.setState({ asyncAPI: asyncAPIContent, format: specFormat, convertTo: toFormat });
                    } else {
                        this.setState({ asyncAPI: asyncAPIContent });
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                const { response: { body: { description, message } } } = err;
                if (description && message) {
                    Alert.error(`${message} ${description}`);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.APIDefinition.APIDefinition.error.while.updating.async.api.definition',
                        defaultMessage: 'Error occurred while updating the API Definition',
                    }));
                }
                this.setState({ isUpdating: false });
            });
    }

    /**
     * Updates asyncAPI definition of the API
     * @param {string} asyncAPIContent The AsyncAPi file that needs to be updated.
     * @param {string} specFormat The current format of the definition
     * @param {string} toFormat The format it can be converted to.
     */
    updateAsyncAPIDefinition(asyncAPIContent, specFormat, toFormat) {
        const { api, intl, updateAPI } = this.props;
        this.setState({ isUpdating: true });
        let parsedContent = {};
        if (this.hasJsonStructure(asyncAPIContent)) {
            parsedContent = JSON.parse(asyncAPIContent);
        } else {
            try {
                parsedContent = YAML.load(asyncAPIContent);
            } catch (err) {
                console.log(err);
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.APIDefinition.APIDefinition.error.while.updating.async.api.definition',
                    defaultMessage: 'Error occurred while updating the API Definition',
                }));
                return;
            }
        }
        const promise = api.updateAsyncAPIDefinition(parsedContent);
        promise
            .then((response) => {
                /* const { endpointImplementationType } = api; */
                /* if (endpointImplementationType === 'INLINE') {
                    api.generateMockScripts(api.id);
                } */
                if (response) {
                    Alert.success(intl.formatMessage({
                        id: 'Apis.Details.APIDefinition.APIDefinition.async.api.definition.updated.successfully',
                        defaultMessage: 'API Definition updated successfully',
                    }));
                    if (specFormat && toFormat) {
                        this.setState({ asyncAPI: asyncAPIContent, format: specFormat, convertTo: toFormat });
                    } else {
                        this.setState({ asyncAPI: asyncAPIContent });
                    }
                }
                /*
                 * updateAPI() will make a /GET call to get the latest api once the asyncAPI definition is updated.
                 * Otherwise, we need to refresh the page to get changes.
                 */
                updateAPI();
                this.setState({ isUpdating: false });
            })
            .catch((err) => {
                console.log(err);
                const { response: { body: { description, message } } } = err;
                if (description && message) {
                    Alert.error(`${message} ${description}`);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.APIDefinition.APIDefinition.error.while.updating.async.api.definition',
                        defaultMessage: 'Error occurred while updating the API Definition',
                    }));
                }
                this.setState({ isUpdating: false });
            });
    }


    /**
     * @inheritdoc
     */
    render() {
        const {
            swagger, graphQL, openEditor, openDialog, format, convertTo, notFound, isAuditApiClicked,
            securityAuditProperties, isSwaggerValid, swaggerModified, isUpdating,
            asyncAPI, asyncAPIModified, isAsyncAPIValid, errors, isSwaggerUI, linterResults, linterSelectedSeverity, 
            linterSelectedLine, isImporting, swaggerImporting
        } = this.state;

        const {
            resourceNotFountMessage, api, match,
        } = this.props;

        const { settings } = this.context;

        const isApiProduct = match.path.search('/api-products/') !== -1 ;

        let downloadLink;
        let fileName;
        let isGraphQL = 0;

        if (graphQL !== null) {
            downloadLink = 'data:text/' + format + ';charset=utf-8,' + encodeURIComponent(graphQL);
            fileName = api.provider + '-' + api.name + '-' + api.version + '.graphql';
            isGraphQL = 1;
        } else if (asyncAPI !== null) {
            downloadLink = 'data:text/' + format + ';charset=utf-8,' + encodeURIComponent(asyncAPI);
            fileName = 'asyncapi.' + format;
        } else {
            downloadLink = 'data:text/' + format + ';charset=utf-8,' + encodeURIComponent(swagger);
            fileName = 'swagger.' + format;
        }
        const editorOptions = {
            selectOnLineNumbers: true,
            readOnly: true,
            smoothScrolling: true,
            wordWrap: 'on',
        };

        if (notFound) {
            return <ResourceNotFound message={resourceNotFountMessage} />;
        }
        if (!swagger && !graphQL && !asyncAPI && api === 'undefined') {
            return <Progress />;
        }

        // @ts-ignore
        // @ts-ignore
        return <Root>
            {/* TODO tmkasun: use <Box> component for alignment  */}
            <div className={classes.topBar}>
                <div className={classes.titleWrapper}>
                    <Typography id='itest-api-details-api-definition-head' variant='h4' component='h2'>
                        {/* eslint-disable-next-line no-nested-ternary */}
                        {graphQL ? (
                            <FormattedMessage
                                id='Apis.Details.APIDefinition.APIDefinition.schema.definition'
                                defaultMessage='Schema Definition'
                            />
                        ) : asyncAPI ? (
                            <FormattedMessage
                                id='Apis.Details.APIDefinition.APIDefinition.asyncAPI.definition'
                                defaultMessage='AsyncAPI Definition'
                            />
                        ) : (
                            <FormattedMessage
                                id='Apis.Details.APIDefinition.APIDefinition.api.definition'
                                defaultMessage='API Definition'
                            />
                        )}
                    </Typography>
                    {asyncAPI ? (
                        <Button
                            size='small'
                            className={classes.button}
                            onClick={this.openEditor}
                            disabled={isRestricted(['apim:api_create'], api)}
                        >
                            <EditRounded className={classes.buttonIcon} />
                            <FormattedMessage
                                id='Apis.Details.APIDefinition.APIDefinition.edit'
                                defaultMessage='Edit'
                            />
                        </Button>
                    ) : (
                        !(graphQL || isApiProduct) && (
                            <Button
                                size='small'
                                className={classes.button}
                                onClick={this.openEditor}
                                disabled={isRestricted(['apim:api_create'], api) || api.isRevision
                                || (settings && settings.portalConfigurationOnlyModeEnabled)}
                                id='edit-definition-btn'
                            >
                                <EditRounded className={classes.buttonIcon} />
                                <FormattedMessage
                                    id='Apis.Details.APIDefinition.APIDefinition.edit'
                                    defaultMessage='Edit'
                                />
                            </Button>
                        )
                    )}
                    {!isApiProduct && (
                        <ImportDefinition setSchemaDefinition={this.setSchemaDefinition} 
                            editAndImport={this.openEditorToImport}/>
                    )}
                    {(api.serviceInfo && api.serviceInfo.outdated && api.type !== 'SOAP') && (
                        <DefinitionOutdated
                            api={api}
                            classes={classes}
                        />
                    )}
                    <Button
                        size='small'
                        className={classes.button}
                        component={Link}
                        download={fileName}
                        href={downloadLink}
                        id='download-definition-btn'
                    >
                        <CloudDownloadRounded className={classes.buttonIcon} />
                        <FormattedMessage
                            id='Apis.Details.APIDefinition.APIDefinition.download.definition'
                            defaultMessage='Download Definition'
                        />
                    </Button>
                    {(securityAuditProperties.apiToken && securityAuditProperties.collectionId
                    && api.type !== 'GRAPHQL' && !asyncAPI)
                        && (
                            <Button size='small' className={classes.button} onClick={this.onAuditApiClick}>
                                <LockRounded className={classes.buttonIcon} />
                                <FormattedMessage
                                    id='Apis.Details.APIDefinition.APIDefinition.audit.api'
                                    defaultMessage='Audit API'
                                />
                            </Button>
                        )}
                </div>
                {isGraphQL === 0 && (
                    <div className={classes.titleWrapper}>
                        <Button size='small' className={classes.button} onClick={this.onChangeFormatClick}>
                            <SwapHorizontalCircle className={classes.buttonIcon} />
                            <FormattedMessage
                                id='Apis.Details.APIDefinition.APIDefinition.convert.to'
                                defaultMessage='Convert to'
                            />
                            {' '}
                            {convertTo}
                        </Button>
                    </div>
                )}
            </div>
            <div>
                <Suspense fallback={<Progress />}>
                    {isAuditApiClicked ? (
                        <APISecurityAudit apiId={api.id} key={swagger}/>
                    ) : (
                        <MonacoEditor
                            language={format}
                            width='100%'
                            height='calc(100vh - 51px)'
                            theme='vs-dark'
                            /* eslint-disable-next-line no-nested-ternary */
                            value={swagger !== null ? swagger : asyncAPI !== null ? asyncAPI : graphQL}
                            options={editorOptions}
                        />
                    )}
                </Suspense>
            </div>
            <Dialog fullScreen open={openEditor} onClose={this.closeEditor} TransitionComponent={this.transition}>
                <Paper square className={classes.popupHeader}>
                    <Box display='flex' flexDirection='row' justifyContent='space-between'>
                        <Box>
                            <IconButton
                                className={classes.button}
                                color='inherit'
                                onClick={this.closeEditor}
                                aria-label={(
                                    <FormattedMessage
                                        id='Apis.Details.APIDefinition.APIDefinition.btn.close'
                                        defaultMessage='Close'
                                    />
                                )}
                                size='large'>
                                <Icon>close</Icon>
                            </IconButton>

                            <Button
                                className={classes.button}
                                variant='contained'
                                color='primary'
                                onClick={this.openUpdateConfirmation}
                                disabled={(!isSwaggerValid || isUpdating) || (!isAsyncAPIValid || isUpdating)}
                            >
                                {isImporting? (
                                    <FormattedMessage
                                        id={'Apis.Details.APIDefinition.APIDefinition.documents.swagger.editor.'
                                            + 'import.content'}
                                        defaultMessage='Import Content'
                                    />
                                ):(
                                    <FormattedMessage
                                        id={'Apis.Details.APIDefinition.APIDefinition.documents.swagger.editor.'
                                            + 'update.content'}
                                        defaultMessage='Update Content'
                                    />
                                )}
                                {isUpdating && <CircularProgress className={classes.progressLoader} size={24}/>}
                            </Button>
                        </Box>
                        <Box margin='3px'>
                            <ToggleButtonGroup
                                data-testid='editor-drawe-toggle'
                                exclusive
                                aria-label='toggle'
                                size='small'
                                onChange={(event, value) => {
                                    this.setState({ isSwaggerUI: value === "swagger" })
                                }}
                            >
                                <ToggleButton
                                    className={classes.activeButton}
                                    value='swagger'
                                    aria-label='swagger'
                                    selected={this.state.isSwaggerUI}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.APIDefinition.APIDefinition.editor.drawer.toggle.swagger'
                                        defaultMessage='Swagger'
                                    />
                                </ToggleButton>
                                <ToggleButton
                                    className={classes.activeButton}
                                    value='linter'
                                    aria-label='linter'
                                    selected={!this.state.isSwaggerUI}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.APIDefinition.APIDefinition.editor.drawer.toggle.linter'
                                        defaultMessage='Linter'
                                    />
                                </ToggleButton>
                                <APILintingSummary 
                                    linterResults={linterResults}
                                    handleChange = { (event, value)=> {
                                        this.setState({linterSelectedSeverity: value});
                                        this.setState({ isSwaggerUI: false }) }}
                                />
                            </ToggleButtonGroup>
                            
                        </Box>
                    </Box>
                </Paper>
                <Suspense
                    fallback={(
                        <Progress />
                    )}
                >
                    {swagger ? (
                        <EditorDialog
                            swagger={isImporting? swaggerImporting : swaggerModified}
                            language={format}
                            onEditContent={this.onChangeSwaggerContent}
                            errors={errors}
                            setErrors={this.setErrors}
                            isSwaggerUI={ isSwaggerUI }
                            linterResults={ linterResults.filter((item)=> 
                                linterSelectedSeverity===null||
                                item.severity===Number(linterSelectedSeverity))
                            }
                            linterSelectedSeverity={linterSelectedSeverity}
                            linterSelectedLine={linterSelectedLine}
                        />
                    ) : (
                        <AsyncAPIEditor
                            asyncAPI={asyncAPIModified}
                            language={format}
                            onEditContent={this.onChangeAsyncAPIContent}
                        />
                    )}
                </Suspense>
            </Dialog>
            <Dialog
                open={openDialog}
                onClose={this.handleNo}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>
                    <Typography align='left'>
                        <FormattedMessage
                            id='Apis.Details.APIDefinition.APIDefinition.save.api.definition'
                            defaultMessage='Save API Definition'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-description'>
                        <FormattedMessage
                            id='Apis.Details.APIDefinition.APIDefinition.api.definition.save.confirmation'
                            defaultMessage={
                                'Are you sure you want to save the API Definition? This might affect the'
                                + ' existing resources.'
                            }
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Grid
                        container
                        direction='row'
                        alignItems='flex-start'
                        spacing={1}
                    >
                        <Grid item>
                            <Button onClick={this.handleNo} color='primary'>
                                <FormattedMessage
                                    id='Apis.Details.APIDefinition.APIDefinition.btn.no'
                                    defaultMessage='CANCEL'
                                />
                            </Button>
                        </Grid>
                        <Grid item>
                            <CustomSplitButton
                                advertiseInfo={api.advertiseInfo}
                                api={api}
                                handleSave={this.handleSave}
                                handleSaveAndDeploy={this.handleSaveAndDeploy}
                                isUpdating={isUpdating}
                            />
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </Root>;
    }
}

APIDefinition.contextType = AppContext;
APIDefinition.propTypes = {
    classes: PropTypes.shape({
        button: PropTypes.shape({}),
        popupHeader: PropTypes.shape({}),
        buttonIcon: PropTypes.shape({}),
        root: PropTypes.shape({}),
        topBar: PropTypes.shape({}),
        titleWrapper: PropTypes.shape({}),
        mainTitle: PropTypes.shape({}),
        converterWrapper: PropTypes.shape({}),
        dropzone: PropTypes.shape({}),
        downloadLink: PropTypes.shape({}),
    }).isRequired,
    api: PropTypes.shape({
        updateSwagger: PropTypes.func,
        getSwagger: PropTypes.func,
        id: PropTypes.string,
        apiType: PropTypes.oneOf([API.CONSTS.API, API.CONSTS.APIProduct]),
    }).isRequired,
    history: PropTypes.shape({
        push: PropTypes.shape({}),
    }).isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.shape({}),
    }).isRequired,
    resourceNotFountMessage: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    updateAPI: PropTypes.func.isRequired,
};
export default withRouter(injectIntl((APIDefinition)));
