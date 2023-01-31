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
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Loading from 'AppComponents/Base/Loading/Loading';
import CircularProgress from '@material-ui/core/CircularProgress';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Alert from 'AppComponents/Shared/Alert';
import ImportExternalApp from 'AppComponents/Shared/AppsAndKeys/ImportExternalApp';
import Application from 'AppData/Application';
import AuthManager from 'AppData/AuthManager';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import WarningIcon from '@material-ui/icons/Warning';
import API from 'AppData/api';
import KeyConfiguration from './KeyConfiguration';
import ViewKeys from './ViewKeys';
import WaitingForApproval from './WaitingForApproval';
import { ScopeValidation, resourceMethods, resourcePaths } from '../ScopeValidation';
import TokenMangerSummary from './TokenManagerSummary';
import Progress from '../Progress';
import TokenExchangeKeyConfiguration from "AppComponents/Shared/AppsAndKeys/TokenExchangeKeyConfiguration";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import {
    Dialog,
    DialogActions, DialogContent,
    DialogContentText,
    FormControlLabel,
    Radio,
    RadioGroup,
    TableCell
} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";

const styles = (theme) => ({
    root: {
        padding: theme.spacing(3),
        '& span, & h6, & label, & input': {
            color: theme.palette.getContrastText(theme.palette.background.paper),
        },
        '& .Mui-disabled span': {
            color: theme.palette.grey[500],
        },
        '& input:disabled': {
            backgroundColor: theme.palette.grey[100],
            color: theme.palette.grey[500],
        },
        position: 'relative',
    },
    button: {
        marginLeft: 0,
        '& span': {
            color: theme.palette.getContrastText(theme.palette.primary.main),
        },
        marginRight: theme.spacing(2),
    },
    cleanUpButton: {
        marginLeft: 15,
    },
    cleanUpInfoText: {
        padding: '10px 0px 10px 15px',
    },
    tokenSection: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    margin: {
        marginRight: theme.spacing(2),
    },
    keyConfigWrapper: {
        flexDirection: 'column',
        marginBottom: 0,
    },
    generateWrapper: {
        padding: '10px 0px',
        marginLeft: theme.spacing(1.25),
    },
    paper: {
        background: 'none',
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2),
    },
    muiFormGroupRoot: {
        flexDirection: 'row',
    },
    formControl: {
    },
    subTitle: {
        fontWeight: 400,
    },
    tabPanel: {
        paddingLeft: theme.spacing(2),
        '& .MuiBox-root': {
            padding: 0,
        },
    },
    warningIcon: {
        color: '#ff9a00',
        fontSize: 20,
        marginRight: 10,
    },
    leftCol: {
        width: 180,
    },
});

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
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const StyledTabs = withStyles({
    indicator: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        '& > span': {
            width: '98%',
            backgroundColor: '#ffffff',
        },
        transition: 'none',
    },
    flexContainer: {
        borderBottom: 'solid 1px #666',
        backgroundColor: '#efefef',
        '& button:first-child': {
            borderLeft: 'none',
        },
    },
})((props) => <Tabs {...props} TabIndicatorProps={{children: <span/>}}/>);


const StyledTab = withStyles((theme) => ({
    root: {
        textTransform: 'none',
        color: '#666',
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.pxToRem(15),
        marginRight: theme.spacing(1),
        '&:focus': {
            opacity: 1,
        },
    },
    selected: {
        backgroundColor: '#fff',
        borderLeft: 'solid 1px #666',
        borderRight: 'solid 1px #666',
    },
}))((props) => <Tab disableRipple {...props} />);

/**
 *  @param {event} event event
 *  @param {String} value description
 */
class TokenManager extends React.Component {
    static contextType = Settings;

    /**
     *
     * @param {*} props props
     */
    constructor(props) {
        super(props);
        const { selectedApp, keyType } = this.props;
        this.state = {
            isLoading: false,
            keys: null,
            isKeyJWT: false,
            hasError: false,
            initialToken: '',
            initialValidityTime: 0,
            initialScopes: [],
            keyRequest: {
                keyType,
                selectedGrantTypes: null,
                callbackUrl: '',
                additionalProperties: {},
                keyManager: '',
                validityTime: 3600,
                scopes: ['default'],
            },
            keyManagers: null,
            selectedTab: null,
            providedConsumerKey: '',
            providedConsumerSecret: '',
            validating: false,
            importDisabled: false,
            mode: null,
            tokenType: 'DIRECT',
            isExchangeTokenError:false,
        };
        this.keyStates = {
            COMPLETED: 'COMPLETED',
            APPROVED: 'APPROVED',
            CREATED: 'CREATED',
            REJECTED: 'REJECTED',
        };
        if (selectedApp) {
            this.appId = selectedApp.appId || selectedApp.value;
            this.application = Application.get(this.appId);
        }
        this.updateKeyRequest = this.updateKeyRequest.bind(this);
        this.generateKeys = this.generateKeys.bind(this);
        this.updateKeys = this.updateKeys.bind(this);
        this.cleanUpKeys = this.cleanUpKeys.bind(this);
        this.handleOnChangeProvidedOAuth = this.handleOnChangeProvidedOAuth.bind(this);
        this.provideOAuthKeySecret = this.provideOAuthKeySecret.bind(this);
    }

    /**
     *
     *
     * @memberof TokenManager
     */
    componentDidMount() {
        this.loadApplication();
    }

    componentDidUpdate(nextProps) {
        const { keyType: nextKeyType } = nextProps;
        const { keyType: prevKeyType } = this.props;
        if (nextKeyType !== prevKeyType) {
            this.loadApplication();
        }
    }

    getDefaultAdditionalProperties(selectedKM) {
        const { availableGrantTypes, applicationConfiguration } = selectedKM;
        // Fill the keyRequest.additionalProperties from the selectedKM.applicationConfiguration defaultValues.
        const additionalProperties = {};

        applicationConfiguration.forEach((confItem) => {
            additionalProperties[confItem.name] = confItem.default || '';
        });
        return additionalProperties;
    }

    isTokenExchangeEnabled() {
        const { keyManagers } = this.state;
        let isEnabled = false;
        if (keyManagers && keyManagers.length > 1) {
            keyManagers.map((keymanager) => {
                if (keymanager.tokenType === 'EXCHANGED' || keymanager.tokenType === 'BOTH') {
                    isEnabled = true;
                }
            });
        }
        return isEnabled;
    }

    handleTabChange = (event, newSelectedTab) => {
        const { keys, keyManagers, keyRequest } = this.state;
        const { keyType } = this.props;
        const selectedKM = keyManagers.find((x) => x.name === newSelectedTab);
        const { availableGrantTypes } = selectedKM;
        const selectedGrantsByDefault = [];
        if(availableGrantTypes.find( gt => gt ==='password')){
            selectedGrantsByDefault.push('password');
        }
        if(availableGrantTypes.find( gt => gt ==='client_credentials')){
            selectedGrantsByDefault.push('client_credentials');
        }

        if (keys.size > 0 && keys.get(newSelectedTab) && keys.get(newSelectedTab).keyType === keyType) {
            const { callbackUrl, supportedGrantTypes, additionalProperties, mode } = keys.get(newSelectedTab);
            const newRequest = {
                ...keyRequest,
                callbackUrl,
                selectedGrantTypes: supportedGrantTypes
                    || selectedGrantsByDefault,
                additionalProperties: additionalProperties || this.getDefaultAdditionalProperties(selectedKM),
            };
            this.setState({
                keyRequest: newRequest,
                selectedTab: newSelectedTab,
                mode,
                importDisabled: (mode === 'MAPPED' || mode === 'CREATED'),
            });
        } else {
            // Fill the keyRequest.additionalProperties from the selectedKM.applicationConfiguration defaultValues.
            this.setState({
                keyRequest: {
                    ...keyRequest,
                    selectedGrantTypes: selectedGrantsByDefault,
                    additionalProperties: this.getDefaultAdditionalProperties(selectedKM),
                },
                selectedTab: newSelectedTab,
                importDisabled: false,
            });
        }
    };

    /**
     * load application key generation ui
     */
    loadApplication = () => {
        const { keyType, intl } = this.props;
        if (this.appId) {
            const api = new API();
            const promisedKeyManagers = api.getKeyManagers();
            const promisedGetKeys = this.application
                .then((application) => application.getKeys(keyType));
            Promise.all([promisedKeyManagers, promisedGetKeys])
                .then((response) => {
                    // processing promisedKeyManagers response
                    const responseKeyManagerList = [];
                    response[0].body.list.map((item) => {
                        if (item.enabled) responseKeyManagerList.push(item);
                    });

                    if (responseKeyManagerList.length === 0) {
                        this.setState({ keyManagers: [] });
                        return;
                    }
                    // Selecting a key manager from the list of key managers.
                    let { selectedTab } = this.state;
                    if (!selectedTab && responseKeyManagerList.length > 0) {
                        selectedTab = responseKeyManagerList.find((x) => x.name === 'Resident Key Manager') ? 'Resident Key Manager'
                            : responseKeyManagerList[0].name;
                    }
                    const selectdKM = responseKeyManagerList.find((x) => x.name === selectedTab);
                    // processing promisedGetKeys response
                    const keys = response[1];
                    const { keyRequest } = this.state;

                    if (keys.size > 0 && keys.get(selectedTab) && keys.get(selectedTab).keyType === keyType) {
                        const { callbackUrl, supportedGrantTypes, additionalProperties, mode } = keys.get(selectedTab);
                        const newRequest = {
                            ...keyRequest,
                            callbackUrl: callbackUrl || '',
                            selectedGrantTypes: supportedGrantTypes || [],
                            additionalProperties: additionalProperties || this.getDefaultAdditionalProperties(selectdKM),
                        };
                        this.setState({
                            keys, keyRequest: newRequest, keyManagers: responseKeyManagerList, selectedTab,
                            importDisabled: (mode === 'MAPPED' || mode === 'CREATED'),
                            mode,
                        });
                    } else {
                        const selectedGrantTypes = [];
                        if(selectdKM.availableGrantTypes.find( gt => gt ==='password')){
                            selectedGrantTypes.push('password');
                        }
                        if(selectdKM.availableGrantTypes.find( gt => gt ==='client_credentials')){
                            selectedGrantTypes.push('client_credentials');
                        }

                        this.setState({
                            keys,
                            keyRequest: {
                                ...keyRequest,
                                selectedGrantTypes,
                                additionalProperties: this.getDefaultAdditionalProperties(selectdKM),
                            },
                            keyManagers: responseKeyManagerList,
                            selectedTab,
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    if (error.status === 404) {
                        this.setState({ notFound: true });
                    } else {
                        Alert.error(error.description
                            || intl.formatMessage({
                                id: 'Shared.AppsAndKeys.TokenManager.get.keys.request.error',
                                defaultMessage: 'Error while retrieving the keys',
                            }));
                    }
                });
        }
    }

    /**
     * Update keyRequest state
     * @param {Object} keyRequest parameters requried for key generation request
     */
    updateKeyRequest(keyRequest) {
        this.setState({ keyRequest });
    }

    /**
     * Generate keys for application,
     *
     * @memberof KeyConfiguration
     */
    generateKeys() {
        const { keyRequest, keys, selectedTab } = this.state;
        const {
            keyType, updateSubscriptionData, selectedApp: { tokenType, hashEnabled }, intl,
        } = this.props;

        if ((keyRequest.selectedGrantTypes.includes('implicit')
            || keyRequest.selectedGrantTypes.includes('authorization_code'))) {
            if (keyRequest.callbackUrl === '') {
                Alert.error(intl.formatMessage({
                    id: 'Shared.AppsAndKeys.TokenManager.key.generate.error.callbackempty',
                    defaultMessage: 'Callback URL can not be empty when the Implicit or Application Code grant types selected',
                }));
                return;
            }
        }
        this.setState({ isLoading: true });

        this.application
            .then((application) => {
                return application.generateKeys(
                    keyType, keyRequest.selectedGrantTypes,
                    keyRequest.callbackUrl,
                    keyRequest.additionalProperties, this.getKeyManagerIdentifier(),
                );
            })
            .then((response) => {
                if (updateSubscriptionData) {
                    updateSubscriptionData();
                }
                const newKeys = new Map([...keys]);
                // in case token hashing is enabled, isKeyJWT is set to true even if the token type is JWT.
                // This is to mimic the behavior of JWT tokens (by showing the token in a dialog)
                const isKeyJWT = (tokenType === 'JWT') || hashEnabled;
                newKeys.set(selectedTab, response);
                const initialToken = response.token ? response.token.accessToken : '';
                const initialValidityTime = response.token ? response.token.validityTime : 0;
                const initialScopes = response.token ? response.token.tokenScopes : [];
                this.setState({ keys: newKeys, isKeyJWT, initialToken, initialValidityTime, initialScopes });
                if (response.keyState === this.keyStates.CREATED || response.keyState === this.keyStates.REJECTED) {
                    Alert.info(intl.formatMessage({
                        id: 'Shared.AppsAndKeys.TokenManager.key.generate.success.blocked',
                        defaultMessage: 'Application keys generate request is currently pending approval by the site administrator.',
                    }));
                } else {
                    Alert.info(intl.formatMessage({
                        id: 'Shared.AppsAndKeys.TokenManager.key.generate.success',
                        defaultMessage: 'Application keys generated successfully',
                    }));
                    this.loadApplication();
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                const { status } = error;
                if (status === 404) {
                    this.setState({ notFound: true });
                } else if (status === 500) {
                    this.loadApplication();
                }
                Alert.error(error.description
                    || `${intl.formatMessage({
                        id: 'Shared.AppsAndKeys.TokenManager.key.generate.error',
                        defaultMessage: 'Error occurred when generating application keys',
                })}, ${error.response.body.message}`);
            }).finally(() => this.setState({ isLoading: false }));
    }

    /**
     *
     * @memberof KeyConfiguration
     */
    updateKeys() {
        const { keys, keyRequest, selectedTab } = this.state;
        const { keyType, intl } = this.props;
        const applicationKey = (keys.get(selectedTab).keyType === keyType) && keys.get(selectedTab);
        if ((keyRequest.selectedGrantTypes.includes('implicit')
            || keyRequest.selectedGrantTypes.includes('authorization_code'))) {
            if (keyRequest.callbackUrl === '') {
                Alert.error(intl.formatMessage({
                    id: 'Shared.AppsAndKeys.TokenManager.key.generate.error.callbackempty',
                    defaultMessage: 'Callback URL can not be empty when the Implicit or Application Code grant types selected',
                }));
                return;
            }
        }
        this.setState({ isLoading: true });
        this.application
            .then((application) => {
                return application.updateKeys(
                    applicationKey.tokenType,
                    keyType,
                    keyRequest.selectedGrantTypes,
                    keyRequest.callbackUrl,
                    applicationKey.consumerKey,
                    applicationKey.consumerSecret,
                    keyRequest.additionalProperties,
                    selectedTab,
                    applicationKey.keyMappingId,
                );
            })
            .then((response) => {
                const newKeys = new Map([...keys]);
                newKeys.set(selectedTab, response);
                this.setState({ keys: newKeys });
                Alert.info(intl.formatMessage({
                    id: 'Shared.AppsAndKeys.TokenManager.key.update.success',
                    defaultMessage: 'Application keys updated successfully',
                }));
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                const { status } = error;
                if (status === 404) {
                    this.setState({ notFound: true });
                } else if (status === 500) {
                    this.loadApplication();
                }
                const { response } = error;
                if (response && response.body && response.body.message && response.body.description) {
                    Alert.error(`${response.body.message}: ${response.body.description}`);
                }
            }).finally(() => this.setState({ isLoading: false }));
    }

    /**
     * Cleanup application keys
     */
    cleanUpKeys(selectedTab, keyMappingId) {
        const { keyType, intl } = this.props;
        this.application
            .then((application) => {
                return application.cleanUpKeys(keyType, selectedTab, keyMappingId);
            })
            .then(() => {
                this.loadApplication();
                Alert.info(intl.formatMessage({
                    id: 'Shared.AppsAndKeys.TokenManager.key.cleanup.success',
                    defaultMessage: 'Application keys cleaned successfully',
                }));
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                const { status } = error;
                if (status === 404) {
                    this.setState({ notFound: true });
                }
                Alert.error(error.description || intl.formatMessage({
                    id: 'Shared.AppsAndKeys.TokenManager.key.cleanup.error',
                    defaultMessage: 'Error occurred while cleaning up application keys',
                }));


            });
    }

    /**
     * Handle on change of provided consumer key and consumer secret
     *
     * @param event onChange event
     */
    handleOnChangeProvidedOAuth(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    /**
     * Provide consumer key and secret of an existing OAuth app to an application
     */
    provideOAuthKeySecret() {
        const { keyType, intl } = this.props;
        const { providedConsumerKey, providedConsumerSecret, selectedTab } = this.state;

        this.application
            .then((application) => {
                return application.provideKeys(keyType, providedConsumerKey, providedConsumerSecret, selectedTab);
            })
            .then(() => {
                this.setState({ providedConsumerKey: '', providedConsumerSecret: '' });
                this.loadApplication();
                Alert.info(intl.formatMessage({
                    id: 'Shared.AppsAndKeys.TokenManager.key.provide.success',
                    defaultMessage: 'Application keys provided successfully',
                }));
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                const { status, response } = error;
                if (status === 404) {
                    this.setState({ notFound: true });
                }
                if (response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(error.description || intl.formatMessage({
                        id: 'Shared.AppsAndKeys.TokenManager.key.provide.error',
                        defaultMessage: 'Error occurred when providing application keys',
                    }));
                }
            });
    }

    getKeyManagerDescription() {
        const { keyManagers, selectedTab } = this.state;
        const selectedKMObject = keyManagers.filter((item) => item.name === selectedTab);
        if (selectedKMObject && selectedKMObject.length === 1) {
            return selectedKMObject[0].description;
        }
        return '';
    }

    getKeyManagerIdentifier() {
        const { keyManagers, selectedTab } = this.state;
        const selectedKMObject = keyManagers.filter((item) => item.name === selectedTab);
        if (selectedKMObject && selectedKMObject.length === 1) {
            return selectedKMObject[0].id;
        }
        return selectedTab;
    }

    setValidating = (validatingState) => {
        this.setState({ validating: validatingState });
    }

    updateHasError = (state) => {
        this.setState({ hasError: state });
    }

    toTitleCase = (str) => {
        return str.replace(
            /\w\S*/g,
            (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            },
        );
    };

    handleChange = (e) => {
        this.setState({ tokenType: e.target.defaultValue });
    }

    handleClose=() => {
        this.setState({ tokenType: 'DIRECT' });
    }
    /**
     *  @returns {Component}
     * @memberof Tokenemanager
     */
    render() {
        const {
            classes, selectedApp, keyType, summary, selectedApp: { hashEnabled }, isKeyManagerAllowed,
        } = this.props;
        const {
            keys, keyRequest, isLoading, isKeyJWT, providedConsumerKey,
            providedConsumerSecret, selectedTab, keyManagers, validating, hasError, initialToken,
            initialValidityTime, initialScopes, importDisabled, mode, tokenType
        } = this.state;
        if (keyManagers && keyManagers.length === 0) {
            return (
                <div className={classes.root}>
                    <Box mb={1}>
                        <Typography variant='h5' className={classes.keyTitle}>
                            {this.toTitleCase(keyType)}
                            <FormattedMessage
                                id='Shared.AppsAndKeyhandleCloses.TokenManager.oauth2.keys.main.title'
                                defaultMessage=' OAuth2 Keys'
                            />
                        </Typography>
                    </Box>
                    <InlineMessage type='info' className={classes.dialogContainer}>
                        <Typography variant='h5' component='h3'>
                            <FormattedMessage id='Shared.AppsAndKeys.TokenManager.no.km'
                                              defaultMessage='No Key Managers'/>
                        </Typography>
                        <Typography component='p'>
                            <FormattedMessage
                                id='Shared.AppsAndKeys.TokenManager.no.km.content'
                                defaultMessage='No Key Managers active to generate keys.'
                            />
                        </Typography>
                    </InlineMessage>
                </div>
            );
        }
        if (!keys || !selectedTab || !keyRequest.selectedGrantTypes) {
            return <Loading />;
        }
        const username = AuthManager.getUser().name;
        let isUserOwner = false;

        if (selectedApp.owner && username.toLowerCase() === selectedApp.owner.toLowerCase()) {
            isUserOwner = true;
        }
        const key = keys.size > 0 && keys.get(selectedTab) && (keys.get(selectedTab).keyType === keyType) ? keys.get(selectedTab) : null;

        if (summary) {
            if (keys) {
                return (
                    <TokenMangerSummary
                        keys={keys}
                        key={key}
                        keyStates={this.keyStates}
                        selectedApp={selectedApp}
                        selectedTab={selectedTab}
                        keyType={keyType}
                        isKeyJWT={isKeyJWT}
                        isUserOwner={isUserOwner}
                    />
                );
            } else {
                return (<Progress />);
            }
        }

        let isResidentKeyManagerTokensAvailable = false;
        if (keys.has('Resident Key Manager') && 
            keys.get('Resident Key Manager').supportedGrantTypes &&
            keys.get('Resident Key Manager').supportedGrantTypes.
            includes("urn:ietf:params:oauth:grant-type:token-exchange")){
            isResidentKeyManagerTokensAvailable = true;
        }

        let defaultTokenEndpoint;

        if (keyManagers.length > 0) {
            const residentKMs = keyManagers.filter((item) => item.name === 'Resident Key Manager');
            defaultTokenEndpoint = residentKMs.length > 0 ? (residentKMs)[0].tokenEndpoint: null;
        }

        if (key && key.keyState === 'APPROVED' && !key.consumerKey) {
            return (
                <>
                    <Typography className={classes.cleanUpInfoText} variant='subtitle1'>
                        <FormattedMessage
                            id='Shared.AppsAndKeys.TokenManager.cleanup.text'
                            defaultMessage='Error! You have partially-created keys.
                            Please click `Clean Up` button and try again.'
                        />
                    </Typography>
                    <Button
                        variant='contained'
                        color='primary'
                        className={classes.cleanUpButton}
                        onClick={() => this.cleanUpKeys(selectedTab, keys.get(selectedTab).keyMappingId)}
                    >
                        <FormattedMessage
                            defaultMessage='Clean up'
                            id='Shared.AppsAndKeys.TokenManager.cleanup'
                        />
                    </Button>
                </>
            );
        }
        if (key && (key.keyState === this.keyStates.CREATED || key.keyState === this.keyStates.REJECTED)) {
            return <WaitingForApproval keyState={key.keyState} states={this.keyStates} />;
        }
        return (
            <>
                {(keyManagers && keyManagers.length > 1) && (
                    <AppBar position="static" color="default">
                        <Tabs
                        value={selectedTab}
                        onChange={this.handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="scrollable auto tabs example"
                        >
                            {keyManagers.map((keymanager) => (
                            <Tab
                                label={keymanager.displayName || keymanager.name}
                                value={keymanager.name}
                                disabled={!keymanager.enabled || (isKeyManagerAllowed
                                    && !isKeyManagerAllowed(keymanager.name)
                                    && ((keymanager.name !== 'Resident Key Manager')
                                    || (!this.isTokenExchangeEnabled() && keymanager.name === 'Resident Key Manager')))}
                                id={keymanager.name.replace(/\s/g, '')}
                            />
                            ))}
                        </Tabs>
                    </AppBar>
                )}
                <div className={classes.root}>
                    <Box mb={1}>
                        <Typography variant='h5' className={classes.keyTitle}>
                            {this.toTitleCase(keyType)}
                            <FormattedMessage
                                id='Shared.AppsAndKeys.TokenManager.oauth2.keys.main.title'
                                defaultMessage=' OAuth2 Keys'
                            />
                        </Typography>
                    </Box>
                    {(keyManagers && keyManagers.length > 0) && keyManagers.map((keymanager) => (
                        <div>
                            {keymanager.tokenType === 'DIRECT' && (
                                <TabPanel value={selectedTab} index={keymanager.name} className={classes.tabPanel}>
                                    <Box display='flex' flexDirection='row'>
                                        <Typography className={classes.subTitle} variant='h6' component='h6'>
                                            <FormattedMessage
                                                defaultMessage='Key and Secret'
                                                id='Shared.AppsAndKeys.TokenManager.key.and.secret'
                                            />
                                        </Typography>
                                        {
                                            keymanager.enableMapOAuthConsumerApps && (
                                                <Box ml={2}>
                                                    <ImportExternalApp
                                                        onChange={this.handleOnChangeProvidedOAuth}
                                                        consumerKey={providedConsumerKey}
                                                        consumerSecret={providedConsumerSecret}
                                                        isUserOwner={isUserOwner}
                                                        key={key}
                                                        provideOAuthKeySecret={this.provideOAuthKeySecret}
                                                        importDisabled={importDisabled}
                                                    />
                                                </Box>
                                            )
                                        }
                                    </Box>
                                    <Box m={2}>
                                        <ViewKeys
                                            initialToken={initialToken}
                                            initialValidityTime={initialValidityTime}
                                            initialScopes={initialScopes}
                                            selectedApp={selectedApp}
                                            selectedTab={selectedTab}
                                            keyType={keyType}
                                            keys={keys}
                                            selectedGrantTypes={keyRequest.selectedGrantTypes}
                                            isUserOwner={isUserOwner}
                                            hashEnabled={keymanager.enableTokenHashing || hashEnabled}
                                            keyManagerConfig={keymanager}
                                            mode={mode}
                                        />
                                    </Box>
                                    <Typography className={classes.subTitle} variant='h6' component='h6'>
                                        {
                                            key
                                                ? (
                                                    <FormattedMessage
                                                        defaultMessage='Key Configurations'
                                                        id='Shared.AppsAndKeys.TokenManager.update.configuration'
                                                    />
                                                )
                                                : (
                                                    <FormattedMessage
                                                        defaultMessage='Key Configuration'
                                                        id='Shared.AppsAndKeys.TokenManager.key.configuration'
                                                    />
                                                )
                                        }
                                    </Typography>
                                    <Box m={2}>
                                        <KeyConfiguration
                                            keys={keys}
                                            key={key}
                                            selectedApp={selectedApp}
                                            selectedTab={selectedTab}
                                            keyType={keyType}
                                            updateKeyRequest={this.updateKeyRequest}
                                            keyRequest={keyRequest}
                                            isUserOwner={isUserOwner}
                                            isKeysAvailable={!!key}
                                            keyManagerConfig={keymanager}
                                            validating={validating}
                                            updateHasError={this.updateHasError}
                                            callbackError={hasError}
                                            setValidating={this.setValidating}
                                            defaultTokenEndpoint={defaultTokenEndpoint}
                                            mode={mode}
                                        />
                                        <div className={classes.generateWrapper}>
                                            <ScopeValidation
                                                resourcePath={resourcePaths.APPLICATION_GENERATE_KEYS}
                                                resourceMethod={resourceMethods.POST}
                                            >
                                                {!isUserOwner ? (
                                                    <>
                                                        <Button
                                                            id='generate-keys'
                                                            variant='contained'
                                                            color='primary'
                                                            className={classes.button}
                                                            onClick={
                                                                key ? this.updateKeys : this.generateKeys
                                                            }
                                                            disabled={!isUserOwner || isLoading || !keymanager.enableOAuthAppCreation
                                                                || (isKeyManagerAllowed
                                                                    && !isKeyManagerAllowed(keymanager.name)
                                                                    && ((keymanager.name !== 'Resident Key Manager')
                                                                    || (!this.isTokenExchangeEnabled() && keymanager.name === 'Resident Key Manager')))}
                                                        >
                                                            {key ?
                                                                this.props.intl.formatMessage({
                                                                    id: 'Shared.AppsAndKeys.TokenManager.update.keys',
                                                                    defaultMessage: 'Update Keys'})
                                                            :
                                                                this.props.intl.formatMessage({
                                                                    id: 'Shared.AppsAndKeys.TokenManager.generate.keys',
                                                                    defaultMessage: 'Generate Keys'})
                                                            }
                                                            {isLoading && <CircularProgress size={20}/>}
                                                        </Button>
                                                        <Typography variant='caption'>
                                                            <FormattedMessage
                                                                defaultMessage='Only owner can generate or update keys'
                                                                id='Shared.AppsAndKeys.TokenManager.key.and.user.owner'
                                                            />
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <Box display='flex'>
                                                        <Button
                                                            id='generate-keys'
                                                            variant='contained'
                                                            color='primary'
                                                            className={classes.button}
                                                            onClick={key ? this.updateKeys : this.generateKeys}
                                                            disabled={hasError || (isLoading || !keymanager.enableOAuthAppCreation) || (mode && mode === 'MAPPED')
                                                            || (isKeyManagerAllowed
                                                                && !isKeyManagerAllowed(keymanager.name)
                                                                && ((keymanager.name !== 'Resident Key Manager')
                                                                || (!this.isTokenExchangeEnabled() && keymanager.name === 'Resident Key Manager')))}
                                                        >
                                                            {key ?
                                                                this.props.intl.formatMessage({
                                                                    id: 'Shared.AppsAndKeys.TokenManager.update',
                                                                    defaultMessage: 'Update'})
                                                            :
                                                                this.props.intl.formatMessage({
                                                                    id: 'Shared.AppsAndKeys.TokenManager.generate.keys',
                                                                    defaultMessage: 'Generate Keys'})
                                                            }
                                                            {isLoading && <CircularProgress size={20}/>}
                                                        </Button>
                                                        {!keymanager.enableOAuthAppCreation && (
                                                            <Box m={2} display='flex'>
                                                                <WarningIcon className={classes.warningIcon}/>
                                                                <Typography variant='body1'>
                                                                    <FormattedMessage
                                                                        defaultMessage='Oauth app creation disabled for {kmName} key manager'
                                                                        id='Shared.AppsAndKeys.TokenManager.app.creation.disable.warn'
                                                                        values={{kmName: keymanager.displayName || keymanager.name}}
                                                                    />
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </ScopeValidation>
                                        </div>

                                    </Box>
                                </TabPanel>
                            )}
                            {keymanager.tokenType === 'EXCHANGED' && (
                                <TabPanel value={selectedTab} index={keymanager.name} className={classes.tabPanel}>
                                    <Typography className={classes.subTitle} variant='h6' component='h6'>
                                        <FormattedMessage
                                            defaultMessage='Token Generation'
                                            id='Shared.AppsAndKeys.TokenManager.ExchangeToken.key.configuration'
                                        />
                                    </Typography>
                                    <Box m={2}>
                                        {/*
                                        Token exchange grant flow enable/disable logic
                                        Given that in the key manager selected has the tokenType='EXCHANGE'
                                            If 'Resident Key Manager' disabled we can't proceed with token exchange. So need to show a banner
                                            If 'Resident Key Manager' enabled, we need to check if the resident key manager 'exchange grant' is selected. 
                                            So we need to ask the user to select 'exchange grant' for the 'Resident Key Manager'.
                                            If 'Resident Key Manager' enabled and 'exchange grant' is enabled the token exchange is possible
                                        */}
                                        <TokenExchangeKeyConfiguration
                                            keys={keys}
                                            key={key}
                                            selectedApp={selectedApp}
                                            selectedTab={selectedTab}
                                            keyType={keyType}
                                            updateKeyRequest={this.updateKeyRequest}
                                            keyRequest={keyRequest}
                                            isUserOwner={isUserOwner}
                                            isKeysAvailable={!!key}
                                            keyManagerConfig={keymanager}
                                            validating={validating}
                                            updateHasError={this.updateHasError}
                                            callbackError={hasError}
                                            setValidating={this.setValidating}
                                            defaultTokenEndpoint={defaultTokenEndpoint}
                                        />
                                    </Box>
                                </TabPanel>
                            )}
                            {keymanager.tokenType === 'BOTH' && (
                                <TabPanel value={selectedTab} index={keymanager.name} className={classes.tabPanel}>
                                    <Box m={2}>
                                        <Box m={2}>
                                        <Box display='flex' alignItems='center'>
                                            <Table className={classes.table}>
                                                <TableRow>
                                                    <TableCell component='th' scope='row' className={classes.leftCol}>
                                                        <FormattedMessage
                                                            defaultMessage='API Invocation Method'
                                                            id='Shared.AppsAndKeys.KeyConfiguration.API Invocation.Method.label'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <RadioGroup
                                                            style={{flexDirection: 'row'}}
                                                            aria-label='tokenType'
                                                            name='tokenType'
                                                            value={tokenType}
                                                            onChange={this.handleChange}
                                                        >
                                                            <FormControlLabel value='DIRECT' control={<Radio/>}
                                                                              label='Direct Token' id='direct-token'/>
                                                            <FormControlLabel value='EXCHANGED' control={<Radio/>}
                                                                              label='Exchange Token' id='exchange-token'/>
                                                        </RadioGroup>
                                                    </TableCell>
                                                </TableRow>
                                            </Table>
                                        </Box>
                                        </Box>

                                    {tokenType === 'DIRECT' && (
                                        <>
                                            <Box display='flex' flexDirection='row'>
                                                <Typography className={classes.subTitle} variant='h6' component='h6'>
                                                    <FormattedMessage
                                                        defaultMessage='Key and Secret'
                                                        id='Shared.AppsAndKeys.TokenManager.key.and.secret'
                                                    />
                                                </Typography>
                                                {
                                                    keymanager.enableMapOAuthConsumerApps && (
                                                        <Box ml={2}>
                                                            <ImportExternalApp
                                                                onChange={this.handleOnChangeProvidedOAuth}
                                                                consumerKey={providedConsumerKey}
                                                                consumerSecret={providedConsumerSecret}
                                                                isUserOwner={isUserOwner}
                                                                key={key}
                                                                provideOAuthKeySecret={this.provideOAuthKeySecret}
                                                                importDisabled={importDisabled}
                                                            />
                                                        </Box>
                                                    )
                                                }
                                            </Box>
                                            <Box m={2}>
                                                <ViewKeys
                                                    initialToken={initialToken}
                                                    initialValidityTime={initialValidityTime}
                                                    initialScopes={initialScopes}
                                                    selectedApp={selectedApp}
                                                    selectedTab={selectedTab}
                                                    keyType={keyType}
                                                    keys={keys}
                                                    selectedGrantTypes={keyRequest.selectedGrantTypes}
                                                    isUserOwner={isUserOwner}
                                                    hashEnabled={keymanager.enableTokenHashing || hashEnabled}
                                                    keyManagerConfig={keymanager}
                                                    mode={mode}
                                                />
                                            </Box>
                                            <Typography className={classes.subTitle} variant='h6' component='h6'>
                                                {
                                                    key
                                                        ? (
                                                            <FormattedMessage
                                                                defaultMessage='Key Configurations'
                                                                id='Shared.AppsAndKeys.TokenManager.update.configuration'
                                                            />
                                                        )
                                                        : (
                                                            <FormattedMessage
                                                                defaultMessage='Key Configuration'
                                                                id='Shared.AppsAndKeys.TokenManager.key.configuration'
                                                            />
                                                        )
                                                }
                                            </Typography>
                                            <Box m={2}>
                                                <KeyConfiguration
                                                    keys={keys}
                                                    key={key}
                                                    selectedApp={selectedApp}
                                                    selectedTab={selectedTab}
                                                    keyType={keyType}
                                                    updateKeyRequest={this.updateKeyRequest}
                                                    keyRequest={keyRequest}
                                                    isUserOwner={isUserOwner}
                                                    isKeysAvailable={!!key}
                                                    keyManagerConfig={keymanager}
                                                    validating={validating}
                                                    updateHasError={this.updateHasError}
                                                    callbackError={hasError}
                                                    setValidating={this.setValidating}
                                                    defaultTokenEndpoint={defaultTokenEndpoint}
                                                />
                                                <div className={classes.generateWrapper}>
                                                    <ScopeValidation
                                                        resourcePath={resourcePaths.APPLICATION_GENERATE_KEYS}
                                                        resourceMethod={resourceMethods.POST}
                                                    >
                                                        {!isUserOwner ? (
                                                            <>
                                                                <Button
                                                                    id='generate-keys'
                                                                    variant='contained'
                                                                    color='primary'
                                                                    className={classes.button}
                                                                    onClick={
                                                                        key ? this.updateKeys : this.generateKeys
                                                                    }

                                                                >
                                                                    {key ? 'Update keys' : 'Generate Keys'}
                                                                    {isLoading && <CircularProgress size={20}/>}
                                                                </Button>
                                                                <Typography variant='caption'>
                                                                    <FormattedMessage
                                                                        defaultMessage='Only owner can generate or update keys'
                                                                        id='Shared.AppsAndKeys.TokenManager.key.and.user.owner'
                                                                    />
                                                                </Typography>
                                                            </>
                                                        ) : (
                                                            <Box display='flex'>
                                                                <Button
                                                                    id='generate-keys'
                                                                    variant='contained'
                                                                    color='primary'
                                                                    className={classes.button}
                                                                    onClick={key ? this.updateKeys : this.generateKeys}

                                                                >
                                                                    {key ? 'Update' : 'Generate Keys'}
                                                                    {isLoading && <CircularProgress size={20}/>}
                                                                </Button>
                                                                {!keymanager.enableOAuthAppCreation && (
                                                                    <Box m={2} display='flex'>
                                                                        <WarningIcon className={classes.warningIcon}/>
                                                                        <Typography variant='body1'>
                                                                            <FormattedMessage
                                                                                defaultMessage='Oauth app creation disabled for {kmName} key manager'
                                                                                id='Shared.AppsAndKeys.TokenManager.app.creation.disable.warn'
                                                                                values={{kmName: keymanager.displayName || keymanager.name}}
                                                                            />
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </ScopeValidation>
                                                </div>
                                            </Box>
                                        </>
                                    )}
                                        {(tokenType === 'EXCHANGED'  && isResidentKeyManagerTokensAvailable) && (
                                            <TabPanel value={selectedTab} index={keymanager.name} className={classes.tabPanel}>
                                                <Typography className={classes.subTitle} variant='h6' component='h6'>
                                                    <FormattedMessage
                                                        defaultMessage='Token Generation'
                                                        id='Shared.AppsAndKeys.TokenManager.ExchangeToken.key.configuration'
                                                    />
                                                </Typography>
                                                <Box m={2}>
                                                    <TokenExchangeKeyConfiguration
                                                        keys={keys}
                                                        key={key}
                                                        selectedApp={selectedApp}
                                                        selectedTab={selectedTab}
                                                        keyType={keyType}
                                                        updateKeyRequest={this.updateKeyRequest}
                                                        keyRequest={keyRequest}
                                                        isUserOwner={isUserOwner}
                                                        isKeysAvailable={!!key}
                                                        keyManagerConfig={keymanager}
                                                        validating={validating}
                                                        updateHasError={this.updateHasError}
                                                        callbackError={hasError}
                                                        setValidating={this.setValidating}
                                                        defaultTokenEndpoint={defaultTokenEndpoint}
                                                    />
                                                </Box>
                                            </TabPanel>
                                        )}
                                    </Box>
                                </TabPanel>
                            )}
                        </div>
                    ))}

                </div>
                {(tokenType === 'EXCHANGED' && !isResidentKeyManagerTokensAvailable) && (
                <div className={classes.inputWrapper}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Dialog
                                fullScreen={false}
                                open={true}
                                onClose={this.handleClose}
                                aria-labelledby='responsive-dialog-title'
                                className={classes.dialogWrapper}
                            >
                                <DialogTitle id='responsive-dialog-title'>
                                    {'Resident Key Manager Consumer Key and Secret Not Available '}
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        <React.Fragment>
                                            <Typography>
                                                <FormattedMessage
                                                    id='Shared.AppsAndKeys.ViewCurl.error'
                                                    defaultMessage='Please generate the Consumer Key and Secret for Residence Key Manager with selecting the urn:ietf:params:oauth:grant-type:token-exchange grant type in
                                                                            order to use the token Exchange Approach. '
                                                />
                                            </Typography>
                                        </React.Fragment>
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>

                                    <Button onClick={this.handleClose} color='primary' autoFocus id='close-btn'>
                                        <FormattedMessage
                                            id='Shared.AppsAndKeys.ViewKeys.consumer.close.btn'
                                            defaultMessage='Close'
                                        />
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Grid>
                    </Grid>
                </div>
                )}
            </>
        );
    }
}

TokenManager.defaultProps = {
    updateSubscriptionData: () => { },
    summary: false,
};
TokenManager.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    selectedApp: PropTypes.shape({
        tokenType: PropTypes.string.isRequired,
        appId: PropTypes.string,
        value: PropTypes.string,
        owner: PropTypes.string,
        hashEnabled: PropTypes.bool,
    }).isRequired,
    keyType: PropTypes.string.isRequired,
    updateSubscriptionData: PropTypes.func,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
    summary: PropTypes.bool,
};

export default injectIntl(withStyles(styles)(TokenManager));
