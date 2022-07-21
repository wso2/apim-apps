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
import React, {useReducer, useState} from 'react';
import Box from '@material-ui/core/Box';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import CopyToClipboard from 'react-copy-to-clipboard';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import {FormattedMessage, useIntl} from 'react-intl';
import PropTypes from 'prop-types';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import ViewCurl from "AppComponents/Shared/AppsAndKeys/ViewCurl";
import ViewToken from "AppComponents/Shared/AppsAndKeys/ViewToken";
import DialogActions from "@material-ui/core/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import Application from "AppData/Application";
import Loading from "AppComponents/Base/Loading/Loading";
import Alert from "AppComponents/Shared/Alert";
import Tokens from "AppComponents/Shared/AppsAndKeys/Tokens";
import {TableBody, TableCell, TableRow} from "@material-ui/core";
import Table from "@material-ui/core/Table";

const styles = (theme) => ({
        FormControl: {
            paddingTop: 0,
            paddingBottom: theme.spacing(2),
            paddingLeft: 0,
            width: '100%',
        },
        FormControlOdd: {
            padding: theme.spacing(2),
            width: '100%',
        },
        button: {
            marginLeft: theme.spacing(1),
        },
        quotaHelp: {
            position: 'relative',
        },
        checkboxWrapper: {
            display: 'flex',
        },
        generateWrapper: {
            padding: '10px 0px',
            marginLeft: theme.spacing(1.25),
        },
        checkboxWrapperColumn: {
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            whiteSpace: 'nowrap',
        },
        group: {
            flexDirection: 'row',
        },
        removeHelperPadding: {
            '& p': {
                margin: '8px 0px',
            },
        },
        iconStyle: {
            cursor: 'pointer',
            padding: '0 0 0 10px',
        },
        iconButton: {
            padding: '0 0 0 10px',
            '& .material-icons': {
                fontSize: 16,
            },
        },
        titleColumn: {
            width: 150,
            fontWeight: 500,
        },
        keyInfoTable: {
            marginBottom: 20,
            borderCollapse: 'collapse',
            '& td': {
                paddingBottom: 5,
                borderBottom: 'solid 1px #cccc',
            },
        },
        leftCol: {
            width: 180,
        },
        stepLabel: {
            color: "#5567d5",
            alignSelf: 'center',
        },
        stepContent: {
            color: '#1D2028',
            fontSize: '0.75rem',
        },
        keyLabel: {
            color: '#222228',
            fontSize: '0.75rem',
            marginLeft: theme.spacing(1)
        },
        idpGrid: {
            textAlign: 'left',
            margin: theme.spacing(0),
            alignSelf: 'center',
        },
        helperTextError: {
            display: "flex",
            alignItems: "center",
            fontSize: 10.5
        },
        input: {
            marginLeft: theme.spacing(1),
            flex: 1,
        },
        avatar: {
            width: 30,
            height: 30,
            background: 'transparent',
            border: `solid 1px ${theme.palette.grey[300]}`
        },
        copyIconStyle: {
            cursor: 'pointer',
            margin: '-10px 0',
            padding: '0 0 0 5px',
            '& .material-icons': {
                fontSize: 18,
                color: '#9c9c9c',
            },
        },
        hr: {
            border: 'solid 1px #efefef',
        },
        divCenter: {
            alignSelf: 'center',
            width: 180
        },
        tableHeader: {
            borderBottom: 'none',

        },
        helperText: {
            marginLeft: 0,
            color: '#8D91A3',
            lineHeight: 1.6,
            maxWidth: 410
        },
        dialogWrapper: {
            '& label,& h5, & label, & td, & li, & input, & h2, & p.MuiTypography-root,& p.MuiFormHelperText-root': {
                color: theme.palette.getContrastText(theme.palette.background.paper),
            },
        },
        margin: {
            marginRight: theme.spacing(2),
        },
        tokenSection: {
            marginTop: 0,
            marginBottom: theme.spacing(0.5),
        },
        inputWrapper: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            '& span, & h5, & label, & td, & li, & div, & input': {
                color: theme.palette.getContrastText(theme.palette.background.paper),
            },
        },
        bottomInfo: {
            fontSize: 12,
            marginBottom: '10px',
        }
    }
);

function reducer(state, newValue) {
    const {field, value} = newValue;
    switch (field) {
        case 'tokenResponse':
        case 'token':
        case 'tokenScopes':
        case 'tokenValidityTime':
        case 'accessTokenRequest':
        case 'subscriptionScopes':
        case 'externalIDPToken':
        case 'externalIDPTokenError':
        case 'isKeyJWT':
        case 'initialExecution':
            return {...state, [field]: value};
        case 'all':
            return value;
        default:
            return newValue;
    }
}


/**
 *
 *
 * @class TokenExchangeKeyConfiguration
 * @extends {React.Component}
 */
const TokenExchangeKeyConfiguration = (props) => {
    const [urlCopied, setUrlCopied] = useState(false);
    const [showCS, setShowCS] = useState(false);
    const [open, setOpen] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [showCurl, setShowCurl] = useState(false);
    const [showSecretGen, setShowSecretGen] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isResidenceTokenAvailable, setIsResidenceTokenAvailable] = useState(true);


    const [initialState] = useState({
        tokenResponse: '',
        token: '',
        tokenScope: '',
        tokenValidityTime: '',
        accessTokenRequest: {
            timeout: 3600,
            scopesSelected: [],
            keyType: '',
        },
        subscriptionScopes: [],
        externalIDPToken: '',
        externalIDPTokenError: '',
        isKeyJWT: false,
        initialExecution: true,
    });

    const [state, dispatch] = useReducer(reducer, initialState);

    const {
        tokenResponse, accessTokenRequest, externalIDPToken, externalIDPTokenError, subscriptionScopes,
        tokenValidityTime, token, isKeyJWT, initialExecution
    } = state

    const intl = useIntl();

    const {
        classes,  keyManagerConfig,
        defaultTokenEndpoint, selectedApp, selectedTab, selectedApp: {hashEnabled}, keys, fullScreen, keyType
    } = props;

    let appId;
    if (selectedApp) {
        appId = selectedApp.appId || selectedApp.value;
    }

    const applicationPromise = Application.get(appId);

    if (initialExecution) {
        applicationPromise
            .then((application) => {
                application.getKeys().then(() => {
                    const newRequest = {...accessTokenRequest, keyType};
                    const subscriptionScopes = application.subscriptionScopes
                        .map((scope) => {
                            return scope.key;
                        });
                    dispatch({field: 'accessTokenRequest', value: newRequest});
                    dispatch({field: 'subscriptionScopes', value: subscriptionScopes});
                    dispatch({field: 'initialExecution', value: false});
                });
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                const {status} = error;
                if (status === 404) {
                    setNotFound(true)
                }
                dispatch({field: 'initialExecution', value: false});
            });
    }

    const generateAccessToken = () => {
        setIsUpdating(true);
        applicationPromise.then((application) => application.generateToken(
            selectedTab,
            accessTokenRequest.keyType,
            accessTokenRequest.timeout,
            accessTokenRequest.scopesSelected,
            true,
            externalIDPToken,
        ))
            .then((response) => {
                console.log('token generated successfully ' + response);
                setShowToken(true);
                dispatch({field: 'tokenResponse', value: response});
                dispatch({field: 'token', value: response.accessToken});
                dispatch({field: 'tokenScopes', value: response.tokenScopes})
                dispatch({field: 'tokenValidityTime', value: response.validityTime})
                setIsUpdating(false);
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                const {status} = error;
                if (status === 404) {
                    setNotFound(true)
                } else if (status === 400) {
                    Alert.error(error.description
                        || intl.formatMessage({
                            id: 'Shared.AppsAndKeys.TokenManager.key.generate.bad.request.error',
                            defaultMessage: 'Error occurred when generating Access Token',
                        }));
                }
                setIsUpdating(false);
                const {response} = error;
                if (response && response.body) {
                    Alert.error(response.body.message);
                }
            });
    };

    const onCopy = () => {
        setUrlCopied(true);
        const caller = function () {
            setUrlCopied(false);
        };
        setTimeout(caller, 2000);
    };

    let dialogHead;
    if (showCurl) {
        dialogHead = 'Get CURL to Generate Access Token';
    } else if (showSecretGen) {
        dialogHead = 'Generate Consumer Secret';
    } else {
        dialogHead = 'Generate Access Token';
    }

    const validateExternalIDPToken = (token) => {
        if (token === "") {
            return (
                <FormattedMessage
                    id='application.productionKeys.oAuth.externalIdp.tokenGeneration.token.empty.helperText'
                    defaultMessage={`{selectedIdPType} token cannot be empty`}
                    values={{selectedIdPType: keyManagerConfig.type}}

                />
            );
        }
        {
            return "";
        }
    };

    const onExternalIDPTokenChange = (event) => {
        const externalIDPToken = event.target.value;
        dispatch({field: 'externalIDPTokenError', value: validateExternalIDPToken(externalIDPToken)})
        dispatch({field: 'externalIDPToken', value: externalIDPToken})
    };


    if (notFound) {
        return <ResourceNotFound/>;
    }
    if (!keys) {
        return <Loading/>;
    }


    /**
     * Set accesstoken request in state
     * @param {*} accessTokenRequest access token request object
     * @memberof ViewKeys
     */
    const updateAccessTokenRequest = (accessTokenRequest) => {
        dispatch({field: 'accessTokenRequest', value: accessTokenRequest})
    }

    /**
     * Handle on close of dialog for generating access token and get curl
     * */
    const handleClose = () => {
        setOpen(false);
        setShowCurl(false);
        setShowSecretGen(false);
        dispatch({field: "isKeyJWT", value: false})

    };

    /**
     * Handle on open of dialog for generating access token
     * */
    const handleClickOpen = () => {
            setOpen(true);
    };
    /**
     * Handle on open of dialog for generating access token and get curl
     * */
    const handleClickOpenCurl = () => {
        setOpen(true);
        setShowCurl(true)
    };


    const csCkKeys = keys.size > 0 && keys.get("Resident Key Manager") && (keys.get("Resident Key Manager").keyType === keyType)
        && keys.get("Resident Key Manager") || false;
    const consumerKey = csCkKeys && csCkKeys.consumerKey;
    const consumerSecret = csCkKeys && csCkKeys.consumerSecret;
    return (
        <>
                    <Box display='flex' alignItems='center'>
                        <Table className={classes.table}>
                            <TableBody>
                                <TableRow>
                                    <TableCell component='th' scope='row'
                                               className={[classes.leftCol, classes.tableHeader]}>
                                        <FormattedMessage
                                            id="application.productionKeys.oAuth.externalIdp.tokenGeneration.step1"
                                            defaultMessage="Step 1:"
                                        />
                                    </TableCell>
                                    <TableCell className={classes.tableHeader}>
                                        <FormattedMessage
                                            id='application.productionKeys.oAuth.externalIdp.tokenGeneration.step1.description'
                                            defaultMessage={`Obtain an access token from {selectedIdpType}. `}
                                            values={{selectedIdpType: keyManagerConfig.type}}

                                        />

                                        <FormattedMessage
                                            id='application.productionKeys.oAuth.externalIdp.tokenGeneration.audience'
                                            defaultMessage='Use the audience value "{allowedAudience}", '
                                            values={{allowedAudience: <b>{keyManagerConfig.alias}</b>}}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.leftCol}>
                                        <FormattedMessage
                                            id='application.productionKeys.oAuth.tokenEndpoint'
                                            defaultMessage='Token Endpoint'
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormattedMessage
                                            id='application.productionKeys.oAuth.tokenEndpoint.value'
                                            defaultMessage={'{tokenEndpoint}'}
                                            values={{tokenEndpoint: keyManagerConfig.tokenEndpoint}}
                                        />

                                        <Tooltip
                                            title={
                                                urlCopied
                                                    ? intl.formatMessage({
                                                        defaultMessage: 'Copied',
                                                        id: 'Shared.AppsAndKeys.TokenExchangeKeyConfiguration.copied',
                                                    })
                                                    : intl.formatMessage({
                                                        defaultMessage: 'Copy to clipboard',
                                                        id: 'Shared.AppsAndKeys.TokenExchangeKeyConfiguration.copy.to.clipboard',
                                                    })
                                            }
                                            placement='right'
                                            className={classes.iconStyle}
                                        >
                                            <CopyToClipboard
                                                text={keyManagerConfig.tokenEndpoint}
                                                onCopy={onCopy}
                                            >
                                                <IconButton
                                                    aria-label='Copy to clipboard'
                                                    classes={{root: classes.iconButton}}
                                                >
                                                    <Icon color='secondary'>file_copy</Icon>
                                                </IconButton>
                                            </CopyToClipboard>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component='th' scope='row'
                                               className={[classes.leftCol, classes.tableHeader]}>
                                        <FormattedMessage
                                            id="application.productionKeys.oAuth.tokenGeneration.step2"
                                            defaultMessage="Step 2:"
                                        />
                                    </TableCell>
                                    <TableCell className={classes.tableHeader}>
                                        <FormattedMessage
                                            id='application.productionKeys.oAuth.tokenGeneration.step2.description'
                                            defaultMessage='Obtain test token'
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component='th' scope='row' className={classes.leftCol}>
                                        <FormattedMessage
                                            id='application.productionKeys.oAuth.externalIdp.tokenGeneration.token'
                                            defaultMessage={`{selectedIdpType} Token`}
                                            values={{selectedIdpType: keyManagerConfig.type}}

                                        />
                                        <span className={classes.error}> *</span>
                                    </TableCell>
                                    <TableCell>
                                        <Box maxWidth={600}>
                                            <TextField
                                                id='external-idp-token'
                                                onChange={onExternalIDPTokenChange}
                                                size="small"
                                                fullWidth
                                                rows={1}
                                                value={externalIDPToken}
                                                variant="outlined"
                                                error={externalIDPTokenError !== ""}
                                                FormHelperTextProps={{
                                                    className: classes.helperText
                                                }}
                                                helperText={externalIDPTokenError === "" ?
                                                    externalIDPTokenError :
                                                    <div className={classes.helperTextError}>
                                                        <p> {externalIDPTokenError} </p>
                                                    </div>
                                                }
                                                className={classes.textField}
                                                data-testid='external-idp-token'
                                            />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>
                    <Box>
                        <div className={classes.inputWrapper}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Dialog
                                        fullScreen={fullScreen}
                                        open={open}
                                        onClose={handleClose}
                                        aria-labelledby='responsive-dialog-title'
                                        className={classes.dialogWrapper}
                                    >
                                        <DialogTitle id='responsive-dialog-title'>
                                            {dialogHead}
                                        </DialogTitle>
                                        <DialogContent>
                                            {(!showCurl && !isKeyJWT && !showSecretGen) && (
                                                <DialogContentText>
                                                    {(!showToken && isResidenceTokenAvailable) && (
                                                        <Tokens
                                                            updateAccessTokenRequest={updateAccessTokenRequest}
                                                            accessTokenRequest={accessTokenRequest}
                                                            subscriptionScopes={subscriptionScopes}
                                                        />
                                                    )}
                                                    {(!showToken && !isResidenceTokenAvailable) && (
                                                        <React.Fragment>
                                                            <Typography>
                                                                <FormattedMessage
                                                                    id='Shared.AppsAndKeys.ViewCurl.error'
                                                                    defaultMessage='Please generate the Consumer Key and Secret for Residence Key Manager with selecting the urn:ietf:params:oauth:grant-type:token-exchange grant type in
                                                                            order to use the token Exchange Approach. '
                                                                />
                                                            </Typography>
                                                        </React.Fragment>
                                                    )}
                                                    {showToken &&
                                                    <ViewToken token={{...tokenResponse, isOauth: true}} isResidenceTokenAvailable={isResidenceTokenAvailable} isTokenExchange />}
                                                </DialogContentText>
                                            )}
                                            {showCurl && (
                                                <DialogContentText>
                                                    <ViewCurl
                                                        keys={{consumerKey, consumerSecret}}
                                                        keyType={keyType}
                                                        jwtToken={externalIDPToken}
                                                        keyManagerConfig={keyManagerConfig}
                                                        defaultTokenEndpoint={defaultTokenEndpoint}
                                                    />
                                                </DialogContentText>
                                            )}
                                        </DialogContent>
                                        <DialogActions>
                                            {isUpdating && <CircularProgress size={24}/>}
                                            {(!showToken && !showCurl && !showSecretGen && isResidenceTokenAvailable) && (
                                                <Button onClick={generateAccessToken} color='primary'
                                                        disabled={isUpdating}>
                                                    <FormattedMessage
                                                        id='Shared.AppsAndKeys.ViewKeys.consumer.generate.btn'
                                                        defaultMessage='Generate'
                                                    />
                                                </Button>
                                            )}
                                            <Button onClick={handleClose} color='primary' autoFocus>
                                                <FormattedMessage
                                                    id='Shared.AppsAndKeys.ViewKeys.consumer.close.btn'
                                                    defaultMessage='Close'
                                                />
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                    <div className={classes.generateWrapper}>
                                        <Grid className={classes.bottomInfo}>
                                            <FormattedMessage
                                                id='application.productionKeys.oAuth.externalIdp.tokenGeneration.token.description'
                                                defaultMessage={`In Exchange token flow, A JWT token has to be generated from the {selectedIdpType}
                                             idp and then exchange for a token with the Resident Key Manager which can used to invoke APIs`}
                                                values={{selectedIdpType: keyManagerConfig.type}}
                                            />
                                        </Grid>
                                        <Button
                                            variant='outlined'
                                            size='small'
                                            color='primary'
                                            className={classes.margin}
                                            onClick={handleClickOpen}
                                            disabled={externalIDPTokenError || externalIDPToken === ''}
                                        >
                                            <FormattedMessage
                                                id='Shared.AppsAndKeys.ViewKeys.generate.access.token'
                                                defaultMessage='Generate Access Token'
                                            />
                                        </Button>
                                        <Button
                                            id='curl-to-generate-access-token-btn'
                                            variant='outlined'
                                            size='small'
                                            color='primary'
                                            className={classes.margin}
                                            onClick={handleClickOpenCurl}
                                            disabled={externalIDPTokenError || externalIDPToken === ''}
                                        >
                                            <FormattedMessage
                                                id='Shared.AppsAndKeys.ViewKeys.curl.to.generate'
                                                defaultMessage='CURL to Generate Access Token'
                                            />
                                        </Button>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </Box>
            </>
    );
}
TokenExchangeKeyConfiguration.defaultProps = {
    notFound: false,
    validating: false,
    fullScreen: false,
    summary: false,
};
TokenExchangeKeyConfiguration.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    keyRequest: PropTypes.shape({
        callbackUrl: PropTypes.string,
        selectedGrantTypes: PropTypes.array,
    }).isRequired,
    isUserOwner: PropTypes.bool.isRequired,
    isKeysAvailable: PropTypes.bool.isRequired,
    keyManagerConfig: PropTypes.any.isRequired,
    notFound: PropTypes.bool,
    setGenerateEnabled: PropTypes.func,
    updateKeyRequest: PropTypes.func.isRequired,
    validating: PropTypes.bool,
    defaultTokenEndpoint: PropTypes.string,
    selectedApp: PropTypes.shape({
        tokenType: PropTypes.string.isRequired,
        appId: PropTypes.string,
        value: PropTypes.string,
        owner: PropTypes.string,
        hashEnabled: PropTypes.bool,
    }),
};


export default withStyles(styles)(TokenExchangeKeyConfiguration);
