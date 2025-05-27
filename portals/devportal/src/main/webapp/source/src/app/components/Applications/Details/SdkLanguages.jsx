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

import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import JSFileDownload from 'js-file-download';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Alert from 'AppComponents/Shared/Alert';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import AuthManager from 'AppData/AuthManager';
import { app } from 'Settings';
import { useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CodeIcon from '@mui/icons-material/Code';
import DownloadIcon from '@mui/icons-material/Download';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import Api from '../../../data/api';

const PREFIX = 'DownloadSDK';

const classes = {
    genericMessageWrapper: `${PREFIX}-genericMessageWrapper`,
    titleSub: `${PREFIX}-titleSub`,
    gridRoot: `${PREFIX}-gridRoot`,
    titleWrappper: `${PREFIX}-titleWrappper`,
    cardTitle: `${PREFIX}-cardTitle`,
    cardRoot: `${PREFIX}-cardRoot`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.genericMessageWrapper}`]: {
        margin: theme.spacing(2),
    },

    [`& .${classes.titleSub}`]: {
        marginLeft: theme.spacing(3),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        color: theme.palette.getContrastText(theme.palette.background.default),
    },

    [`& .${classes.gridRoot}`]: {
        marginLeft: theme.spacing(2),
    },

    [`& .${classes.titleWrappper}`]: {
        display: 'flex',
        alignItems: 'center',
        '& h4': {
            marginRight: theme.spacing(1),
        },
    },

    [`& .${classes.cardTitle}`]: {
        background: theme.palette.grey[50],
    },

    [`& .${classes.cardRoot}`]: {
        background: theme.custom.apiDetailPages.sdkBackground,
    },
}));

class SdkLanguages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: null,
            selectedLanguage: null,
            codeWizardOpen: false,
            codeLanguage: null,
            useCase: '',
        };
        const { match, apiId } = this.props;
        this.api_uuid = match ? match.params.apiUuid : apiId;
        this.filter_threshold = 5;
        this.addDefaultSrc = this.addDefaultSrc.bind(this);
        this.handleCardClick = this.handleCardClick.bind(this);
        this.handleUseCaseChange = this.handleUseCaseChange.bind(this);
    }

    componentDidMount() {
        const api = new Api();
        const user = AuthManager.getUser();
        if (user != null) {
            const promisedLanguages = api.getSdkLanguages();

            promisedLanguages
                .then((response) => {
                    if (response.obj.length === 0) {
                        return;
                    }
                    this.setState({ items: response.obj });
                })
                .catch((error) => {
                    console.log(error);
                    Alert.error(error);
                });
        }
    }

    handleCodeDownload = (language) => {
        const {
            selectedSubscriptions,
            intl,
        } = this.props;

        if (!selectedSubscriptions || selectedSubscriptions.length === 0) {
            Alert.error(
                intl.formatMessage({
                    defaultMessage: 'Please select at least one API for SDK generation.',
                    id: 'DownloadSDK.subscriptions.not.selected',
                }),
            );
            return;
        }

        this.setState({
            codeWizardOpen: true,
            codeLanguage: language,
            useCase: '',
        });
    };

    handleCloseCodeWizard = () => {
        this.setState({
            codeWizardOpen: false,
            codeLanguage: null,
        });
    };

    handleCodeWizardDownload = () => {
        const { codeLanguage } = this.state;

        this.handleCardClick(codeLanguage);

        this.setState({
            codeWizardOpen: false,
            codeLanguage: null,
            useCase: '',
        });
    };

    getSdkForApi(apiId, language) {
        const api = new Api();
        const promisedSdk = api.getSdk(apiId, language);

        promisedSdk
            .then((response) => {
                const sdkZipName = response.headers['content-disposition'].match(/filename="(.+)"/)[1];
                const sdkZip = response.data;
                JSFileDownload(sdkZip, sdkZipName);
            })
            .catch((error) => {
                console.log(error);
                Alert.error(error);
            });
    }

    getSdkForMultipleApi(applicationId, language, apiIds, useCase) {
        const { intl } = this.props;
        const api = new Api();

        const payload = {
            apiIdsList: apiIds,
            useCaseDescription: useCase,
        };

        const promisedSdk = api.generateSdkForApis(applicationId, language, payload);
        promisedSdk
            .then((response) => {
                const sdkZipName = response.headers['content-disposition'].match(/filename="(.+)"/)[1];
                const sdkZip = response.data;

                JSFileDownload(sdkZip, sdkZipName);

                Alert.info(intl.formatMessage({
                    id: 'DownloadSDK.generation.successful',
                    defaultMessage: 'SDK downloaded successfully',
                }));
            })
            .catch((error) => {
                console.log(error);
                Alert.error(
                    this.props.intl.formatMessage({
                        defaultMessage: 'Failed to generate SDK. Please try again.',
                        id: 'DownloadSDK.generation.error',
                    }),
                );
            });
    }

    handleUseCaseChange(event) {
        this.setState({
            useCase: event.target.value,
        });
    }

    addDefaultSrc = (ev) => {
        const evLocal = ev;
        evLocal.target.src = app.context + '/site/public/images/sdks/default.svg';
    };

    handleCardClick(language) {
        const {
            selectedSubscriptions,
            applicationId,
            intl,
        } = this.props;

        const { useCase } = this.state;

        this.setState((prevState) => ({
            selectedLanguage: prevState.selectedLanguage === language ? null : language,
        }), () => {
            if (this.state.selectedLanguage) {
                const validationErrors = [];
                if (!selectedSubscriptions || selectedSubscriptions.length === 0) {
                    validationErrors.push(
                        intl.formatMessage({
                            defaultMessage: 'Please select at least one API for SDK generation.',
                            id: 'DownloadSDK.subscriptions.not.selected',
                        }),
                    );
                }

                if (validationErrors.length > 0) {
                    validationErrors.forEach((error) => Alert.error(error));
                    return;
                }

                Alert.info(intl.formatMessage({
                    id: 'DownloadSDK.download.started',
                    defaultMessage: 'SDK generation in progress. Your download will start shortly.',
                }));

                const ListOfApiIds = selectedSubscriptions.map((subscription) => subscription.apiId);
                const useCaseValue = useCase && useCase.trim() !== '' ? useCase : null;

                if (ListOfApiIds.length === 1 && (useCaseValue === null || useCaseValue === undefined || useCaseValue.trim() === '')) {
                    this.getSdkForApi(ListOfApiIds[0], this.state.selectedLanguage);
                } else {
                    const apiIds = {
                        list: ListOfApiIds.map((subscription) => ({
                            apiId: subscription,
                        })),
                    };
                    this.getSdkForMultipleApi(applicationId, this.state.selectedLanguage, apiIds, useCaseValue);
                }
            }
        });

        if (this.props.onLanguageSelect) {
            this.props.onLanguageSelect(language);
        }
    }

    render() {
        const { items: languageList } = this.state;
        const {
            onlyIcons, intl, theme,
        } = this.props;

        const {
            custom: {
                apiDetailPages: { onlyShowSdks },
            },
        } = theme;
        const filteredLanguageList = languageList && languageList.length > 0 && onlyShowSdks && onlyShowSdks.length > 0
            ? languageList.filter((lang) => onlyShowSdks.includes(lang.toLowerCase()))
            : languageList;

        const languagesWithCodeDownload = ['java', 'javascript'];

        if (onlyIcons) {
            return (
                filteredLanguageList && (
                    <Root>
                        {filteredLanguageList.map((language, index) => index < 3 && (
                            <Grid item xs={4} key={language}>
                                <Button
                                    onClick={() => this.handleCardClick(language)}
                                    onKeyDown={() => this.handleCardClick(language)}
                                    style={{ cursor: 'pointer' }}
                                    aria-label={'Download ' + language + ' SDK'}
                                    id='download-sdk-btn'
                                >
                                    <img
                                        alt={language}
                                        src={
                                            app.context
                                            + '/site/public/images/sdks/'
                                            + String(language)
                                            + '.svg'
                                        }
                                        style={{
                                            width: 80,
                                            height: 80,
                                            margin: 10,
                                        }}
                                    />
                                </Button>
                            </Grid>
                        ))}
                    </Root>
                )
            );
        }
        return (
            <Root>
                {filteredLanguageList ? (
                    <Grid container spacing={0} className={classes.gridRoot} justifyContent='center' alignItems='center'>
                        <Grid item xs={12} sm={6} md={9} lg={9} xl={10} justifyContent='center' alignItems='center'>
                            <Grid container justifyContent='center' alignItems='center' rowSpacing={3} columnSpacing={3}>
                                {filteredLanguageList.map((language) => (
                                    <Grid key={language} item>
                                        <div
                                            style={{
                                                width: 'auto',
                                                textAlign: 'center',
                                                margin: '10px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Card
                                                className={classes.cardRoot}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    width: '295px',
                                                    height: '100px',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <CardMedia
                                                    title={language.toString().toUpperCase()}
                                                    src={
                                                        app.context + '/site/public/images/sdks/'
                                                        + String(language)
                                                        + '.svg'
                                                    }
                                                    classes={{ root: classes.cardTitle }}
                                                    style={{
                                                        padding: '10px',
                                                        width: '70px',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <img
                                                        alt={language}
                                                        onError={this.addDefaultSrc}
                                                        src={`${app.context}/site/public/images/sdks/${language}.svg`}
                                                        style={{
                                                            width: '70px',
                                                            height: '70px',
                                                        }}
                                                    />
                                                </CardMedia>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        padding: '8px 16px',
                                                        flex: 1,
                                                        height: '100%',
                                                    }}
                                                >
                                                    {languagesWithCodeDownload.includes(language.toLowerCase()) ? (
                                                        <>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    width: '100%',
                                                                    paddingBottom: '4px',
                                                                }}
                                                            >
                                                                <span>{language.toString().toUpperCase()}</span>
                                                                <IconButton
                                                                    size='medium'
                                                                    aria-label='download'
                                                                    onClick={() => this.handleCardClick(language)}
                                                                    sx={{
                                                                        color: '#666',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                                        },
                                                                    }}
                                                                >
                                                                    <DownloadIcon sx={{ fontSize: 26 }} />
                                                                </IconButton>
                                                            </div>

                                                            {/* Divider */}
                                                            <div
                                                                style={{
                                                                    width: '100%',
                                                                    height: '1px',
                                                                    backgroundColor: '#e0e0e0',
                                                                    margin: '2px 0',
                                                                }}
                                                            />
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    width: '100%',
                                                                    paddingTop: '4px',
                                                                }}
                                                            >
                                                                <span>Sample Code</span>
                                                                <Tooltip title='Generate SDK with Sample Application Code' arrow>
                                                                    <IconButton
                                                                        size='medium'
                                                                        aria-label='download code'
                                                                        onClick={() => this.handleCodeDownload(language)}
                                                                        sx={{
                                                                            color: '#666',
                                                                            '&:hover': {
                                                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                                            },
                                                                        }}
                                                                    >
                                                                        <CodeIcon sx={{ fontSize: 26 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                width: '100%',
                                                            }}
                                                        >
                                                            <span>{language.toString().toUpperCase()}</span>
                                                            <IconButton
                                                                size='medium'
                                                                aria-label='download'
                                                                onClick={() => this.handleCardClick(language)}
                                                                sx={{
                                                                    color: '#666',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                                    },
                                                                }}
                                                            >
                                                                <DownloadIcon sx={{ fontSize: 28 }} />
                                                            </IconButton>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                ) : (
                    <div className={classes.genericMessageWrapper}>
                        <InlineMessage type='info' className={classes.dialogContainer}>
                            <Typography variant='h5' component='h3'>
                                <FormattedMessage id='Apis.Details.Sdk.no.sdks' defaultMessage='No SDKs' />
                            </Typography>
                            <Typography component='p'>
                                <FormattedMessage
                                    id='Apis.Details.Sdk.no.sdks.content'
                                    defaultMessage='No SDKs available for this API'
                                />
                            </Typography>
                        </InlineMessage>
                    </div>
                )}
                {/* Code Download Wizard Dialog */}
                <Dialog
                    open={this.state.codeWizardOpen}
                    onClose={this.handleCloseCodeWizard}
                    aria-labelledby='sdk-code-dialog-title'
                    maxWidth='md'
                    fullWidth
                >
                    <DialogTitle id='sdk-code-dialog-title' sx={{ paddingBottom: 1 }}>
                        {this.state.codeLanguage && `Generate ${this.state.codeLanguage} SDK with Sample Application Code`}
                    </DialogTitle>
                    <DialogContent>
                        <Box
                            component='form'
                            sx={{
                                width: '100%',
                                mb: 2,
                                mt: 2,
                            }}
                            noValidate
                            autoComplete='off'
                        >
                            <TextField
                                id='usecase-input'
                                fullWidth
                                placeholder='Enter your use case to receive customized sample application code along with the SDK.'
                                multiline
                                minRows={2}
                                maxRows={8}
                                value={this.state.useCase}
                                onChange={this.handleUseCaseChange}
                                variant='outlined'
                                InputProps={{
                                    sx: {
                                        '&.Mui-focused': {
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#1C6584',
                                                borderWidth: '2px',
                                            },
                                        },
                                    },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.23)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.23)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1C6584 !important',
                                            borderWidth: '2px',
                                        },
                                    },
                                    '& .MuiInputBase-multiline': {
                                        transition: 'min-height 0.2s ease',
                                    },
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                borderRadius: 1,
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            <Typography variant='body2' color='text.secondary' sx={{ display: 'flex', alignItems: 'center' }}>
                                <InfoIcon sx={{ fontSize: 18, mr: 1, color: 'info.main' }} />
                                {intl.formatMessage({
                                    id: 'Apis.Details.CodeWizard.ai.disclaimer',
                                    defaultMessage: 'The sample application code is generated using AI technology and '
                                    + 'is only provided as a starting point for development.',
                                })}
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 2 }}>
                        <Button
                            onClick={this.handleCloseCodeWizard}
                            color='primary'
                            variant='outlined'
                        >
                            {intl.formatMessage({
                                id: 'Apis.Details.CodeWizard.back.button',
                                defaultMessage: 'Cancel',
                            })}
                        </Button>
                        <Button
                            onClick={this.handleCodeWizardDownload}
                            color='primary'
                            variant='contained'
                            startIcon={<DownloadIcon />}
                        >
                            {intl.formatMessage({
                                id: 'Apis.Details.CodeWizard.download.button',
                                defaultMessage: 'Download',
                            })}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Root>
        );
    }
}

function Sdk(props) {
    const {
        match, apiId, onlyIcons, intl, onLanguageSelect, selectedSubscriptions, applicationId,
    } = props;
    const theme = useTheme();
    return (
        <SdkLanguages
            match={match}
            apiId={apiId}
            onlyIcons={onlyIcons}
            intl={intl}
            theme={theme}
            onLanguageSelect={onLanguageSelect}
            selectedSubscriptions={selectedSubscriptions}
            applicationId={applicationId}
        />
    );
}

export default injectIntl((Sdk));
