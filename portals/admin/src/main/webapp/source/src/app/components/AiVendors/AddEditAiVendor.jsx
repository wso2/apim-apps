import React, { useReducer, useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';
import {
    MenuItem,
    Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import { MuiChipsInput } from 'mui-chips-input';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import AIAPIDefinition from './AIAPIDefinition';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

const StyledHr = styled('hr')({ border: 'solid 1px #efefef' });

const StyledContentBase = styled(ContentBase)({
    '@global': {
        '.MuiFormControl-root': {
            marginTop: '20px',
        },
        '.MuiFormControl-root:first-of-type': {
            marginTop: '0',
        },
    },
});

/**
 * Reducer
 * @param {JSON} state The second number.
 * @returns {Promise}
 */
function reducer(state, newValue) {
    const { field, value } = newValue;
    switch (field) {
        case 'name':
        case 'apiVersion':
        case 'description':
        case 'apiDefinition':
            return { ...state, [field]: value };
        case 'model':
        case 'promptTokenCount':
        case 'completionTokenCount':
        case 'totalTokenCount':
            return {
                ...state,
                configurations: {
                    ...state.configurations,
                    metadata: state.configurations.metadata.map((item) => (
                        item.attributeName === field
                            ? { ...item, ...value }
                            : item
                    )),
                },
            };
        case 'additionalHeaders':
        case 'additionalQueryParameters':
        case 'connectorType':
            return {
                ...state,
                configurations: {
                    ...state.configurations,
                    [field]: value,
                },
            };
        case 'all':
            return value;
        default:
            return state;
    }
}

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
export default function AddEditAiVendor(props) {
    const intl = useIntl();
    const [saving, setSaving] = useState(false);
    const { match: { params: { id } }, history } = props;
    const inputSource = ['payload', 'header', 'queryParams'];
    const [validating, setValidating] = useState(false);
    const [file, setFile] = useState(null);
    const [initialState] = useState({
        name: '',
        apiVersion: '',
        description: '',
        configurations: {
            metadata: [
                {
                    attributeName: 'model',
                    inputSource: 'payload',
                    attributeIdentifier: '',
                },
                {
                    attributeName: 'promptTokenCount',
                    inputSource: 'payload',
                    attributeIdentifier: '',
                },
                {
                    attributeName: 'completionTokenCount',
                    inputSource: 'payload',
                    attributeIdentifier: '',
                },
                {
                    attributeName: 'totalTokenCount',
                    inputSource: 'payload',
                    attributeIdentifier: '',
                },
            ],
            connectorType: '',
            additionalHeaders: [],
            additionalQueryParameters: [],
        },
        apiDefinition: '',
    });

    const [state, dispatch] = useReducer(reducer, initialState);

    const pageTitle = id ? `${intl.formatMessage({
        id: 'AiVendors.AddEditAiVendor.title.edit',
        defaultMessage: 'AI Vendor - Edit ',
    })} ${state.name}` : intl.formatMessage({
        id: 'AiVendors.AddEditAiVendor.title.new',
        defaultMessage: 'AI Vendor - Create new',
    });

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                const aiVendorResult = await new API().aiVendorGet(id);
                const aiVendorBody = aiVendorResult.body;

                if (aiVendorBody) {
                    const newState = {
                        name: aiVendorBody.name || '',
                        apiVersion: aiVendorBody.apiVersion || '',
                        description: aiVendorBody.description || '',
                        configurations: JSON.parse(aiVendorBody.configurations),
                        apiDefinition: aiVendorBody.apiDefinition || '',
                    };

                    dispatch({ field: 'all', value: newState });

                    setFile(new Blob([aiVendorBody.apiDefinition || ''], { type: 'text/plain;charset=utf-8' }));
                }
            }
        };

        fetchData();
    }, [id]);

    const camelCaseToTitleCase = (camelCaseStr) => {
        return camelCaseStr
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    const hasErrors = (fieldName, fieldValue, validatingActive) => {
        let error = false;
        if (!validatingActive) {
            return false;
        }
        switch (fieldName) {
            case 'name':
                if (fieldValue.trim() === '') {
                    error = `AI Vendor name ${intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error',
                        defaultMessage: ' is empty',
                    })}`;
                }
                break;
            case 'apiVersion':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error.apiVersion',
                        defaultMessage: 'Required field is empty.',
                    });
                }
                break;
            case 'inputSource':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error.inputSource',
                        defaultMessage: 'Input source is required.',
                    });
                }
                break;
            case 'attributeIdentifier':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error.attributeIdentifier',
                        defaultMessage: 'Attribute identifier is required.',
                    });
                }
                break;
            case 'connectorType':
                if (fieldValue.trim() === '') {
                    error = intl.formatMessage({
                        id: 'AiVendors.AddEditAiVendor.is.empty.error.connectorType',
                        defaultMessage: 'Connector type is required.',
                    });
                }
                break;
            default:
                break;
        }
        return error;
    };

    const formHasErrors = (validatingActive = false) => {
        const metadataErrors = state.configurations.metadata.map((meta) => {
            return hasErrors('attributeIdentifier', meta.attributeIdentifier, validatingActive)
                || hasErrors('inputSource', meta.inputSource, validatingActive);
        });

        return hasErrors('name', state.name, validatingActive)
            || hasErrors('apiVersion', state.apiVersion, validatingActive)
            || hasErrors('connectorType', state.configurations.connectorType, validatingActive)
            || metadataErrors.some((error) => error);
    };

    const formSaveCallback = async () => {
        setValidating(true);
        if (formHasErrors(true)) {
            Alert.error(intl.formatMessage({
                id: 'AiVendors.AddEditAiVendor.form.has.errors',
                defaultMessage: 'One or more fields contain errors.',
            }));
            return false;
        }

        setSaving(true);

        try {
            if (id) {
                await new API().updateAiVendor(id, { ...state, apiDefinition: file });
                Alert.success(`${state.name} ${intl.formatMessage({
                    id: 'AiVendor.edit.success',
                    defaultMessage: ' - AI Vendor edited successfully.',
                })}`);
            } else {
                await new API().addAiVendor({ ...state, apiDefinition: file });
                Alert.success(`${state.name} ${intl.formatMessage({
                    id: 'AiVendor.add.success.msg',
                    defaultMessage: ' - AI Vendor added successfully.',
                })}`);
            }
            setSaving(false);
            history.push('/settings/ai-vendors/');
        } catch (e) {
            if (e.message) {
                Alert.error(e.message);
            }
            setSaving(false);
        }

        setSaving(false);

        return true;
    };

    return (
        <StyledContentBase
            pageStyle='half'
            title={pageTitle}
            help={<div />}
        >
            <Box component='div' m={2} sx={(theme) => ({ mb: theme.spacing(10) })}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography
                            color='inherit'
                            variant='subtitle2'
                            component='div'
                            id='AiVendors.AddEditAiVendor.general.details.div'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.general.details'
                                defaultMessage='General Details'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiVendors.AddEditAiVendor.general.details.description.div'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.general.details.description'
                                defaultMessage='Provide name and description of the AI Vendor.'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <Grid container>
                                <Grid item xs={6}>
                                    <TextField
                                        id='name'
                                        autoFocus
                                        margin='dense'
                                        name='name'
                                        label={(
                                            <span>
                                                <FormattedMessage
                                                    id='AiVendors.AddEditAiVendor.form.name'
                                                    defaultMessage='Name'
                                                />

                                                <StyledSpan>*</StyledSpan>
                                            </span>
                                        )}
                                        fullWidth
                                        variant='outlined'
                                        value={state.name}
                                        disabled={!!id}
                                        onChange={(e) => dispatch({
                                            field: 'name',
                                            value: e.target.value,
                                        })}
                                        error={hasErrors('name', state.name, validating)}
                                        helperText={hasErrors('name', state.name, validating) || intl.formatMessage({
                                            id: 'AiVendors.AddEditAiVendor.form.name.help',
                                            defaultMessage: 'Name of the AI Vendor.',
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Box ml={1}>
                                        <TextField
                                            id='api-version'
                                            margin='dense'
                                            name='apiVersion'
                                            fullWidth
                                            variant='outlined'
                                            value={state.apiVersion}
                                            disabled={!!id}
                                            onChange={(e) => dispatch({
                                                field: 'apiVersion',
                                                value: e.target.value,
                                            })}
                                            label={(
                                                <span>
                                                    <FormattedMessage
                                                        id='Admin.AiVendor.label.apiVersion'
                                                        defaultMessage='API Version'
                                                    />
                                                    <StyledSpan>*</StyledSpan>
                                                </span>
                                            )}
                                            error={hasErrors('apiVersion', state.apiVersion, validating)}
                                            helperText={hasErrors('apiVersion', state.apiVersion, validating)
                                                || intl.formatMessage({
                                                    id: 'AiVendors.AddEditAiVendor.form.displayName.help',
                                                    defaultMessage: 'API Version of the AI Vendor.',
                                                })}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <TextField
                                id='description'
                                multiline
                                minRows={4}
                                maxRows={10}
                                margin='dense'
                                name='description'
                                label={(
                                    <FormattedMessage
                                        id='AiVendors.AddEditAiVendor.form.description'
                                        defaultMessage='Description'
                                    />
                                )}
                                fullWidth
                                variant='outlined'
                                value={state.description}
                                onChange={(e) => dispatch({
                                    field: 'description',
                                    value: e.target.value,
                                })}
                                helperText={intl.formatMessage({
                                    id: 'AiVendors.AddEditAiVendor.form.description.help',
                                    defaultMessage: 'Description of the AI Vendor.',
                                })}
                            />
                        </Box>
                    </Grid>
                    <>
                        <Grid item xs={12}>
                            <Box marginTop={2} marginBottom={2}>
                                <StyledHr />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={12} lg={3}>
                            <Typography
                                color='inherit'
                                variant='subtitle2'
                                component='div'
                                id='llm-configurations'
                            >
                                <FormattedMessage
                                    id='AiVendors.AddEditAiVendor.AiVendor.configurations.llm'
                                    defaultMessage='LLM Configurations'
                                />
                            </Typography>
                            <Typography
                                color='inherit'
                                variant='caption'
                                component='p'
                                id='AddEditAiVendor.External.AiVendor.configurations.llm.container'
                            >
                                <FormattedMessage
                                    id={'AiVendors.AddEditAiVendor.AiVendor'
                                        + '.general.details.description.llm'}
                                    defaultMessage='Configure to extract LLM related metadata'
                                />
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={12} lg={9}>
                            {state.configurations.metadata.map((metadata) => (
                                <>
                                    <Box display='flex' marginBottom={2}>
                                        <Typography
                                            color='inherit'
                                            variant='subtitle2'
                                            component='div'
                                            id={
                                                'AiVendors.AddEditAiVendor.llm.configuration.'
                                                + `${metadata.attributeName}.div`
                                            }
                                        >
                                            <FormattedMessage
                                                id={
                                                    'AiVendors.AddEditAiVendor.llm.configuration.'
                                                    + `${metadata.attributeName}`
                                                }
                                                defaultMessage={camelCaseToTitleCase(metadata.attributeName)}
                                            />
                                        </Typography>
                                    </Box>
                                    <Box component='div' m={1}>
                                        <FormControl
                                            variant='outlined'
                                            fullWidth
                                            error={!!hasErrors('inputSource', metadata.inputSource, validating)}
                                        >
                                            <Select
                                                variant='outlined'
                                                id={`Admin.AiVendor.form.llm.${metadata.attributeName}.select`}
                                                name='inputSource'
                                                value={metadata.inputSource || inputSource[0]}
                                                onChange={(e) => dispatch({
                                                    field: `${metadata.attributeName}`,
                                                    value: {
                                                        inputSource: e.target.value,
                                                    },
                                                })}
                                                data-testid={`ai-vendor-llm-${metadata.attributeName}-select`}
                                            >
                                                {inputSource
                                                    .map((modelSource) => (
                                                        <MenuItem key={modelSource} value={modelSource}>
                                                            {modelSource}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            <TextField
                                                id={`Admin.AiVendor.form.llm.${metadata.attributeName}.select.input`}
                                                margin='dense'
                                                name='model.attributeIdentifier'
                                                label={(
                                                    <span>
                                                        <FormattedMessage
                                                            id={
                                                                'Admin.AiVendor.form.llm.'
                                                                + `${metadata.attributeName}.select.input.message`
                                                            }
                                                            defaultMessage={`Path to ${metadata.attributeName}`}
                                                        />

                                                        <StyledSpan>*</StyledSpan>
                                                    </span>
                                                )}
                                                fullWidth
                                                variant='outlined'
                                                value={metadata.attributeIdentifier}
                                                onChange={(e) => dispatch({
                                                    field: `${metadata.attributeName}`,
                                                    value: {
                                                        attributeIdentifier: e.target.value,
                                                    },
                                                })}
                                                error={hasErrors(
                                                    'attributeIdentifier',
                                                    metadata.attributeIdentifier,
                                                    validating,
                                                )}
                                            />
                                        </FormControl>
                                    </Box>
                                </>
                            ))}
                        </Grid>
                    </>
                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography
                            color='inherit'
                            variant='subtitle2'
                            component='div'
                            id='AiVendors.AddEditAiVendor.apiDefinition.header'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.apiDefinition'
                                defaultMessage='API Definition'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiVendors.AddEditAiVendor.apiDefinition.body'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.apiDefinition.description'
                                defaultMessage='Upload API Definition of the AI Vendor.'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <AIAPIDefinition
                                apiDefinition={state.apiDefinition}
                                vendorName={state.name}
                                file={file}
                                setFile={setFile}
                                dispatch={dispatch}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography
                            color='inherit'
                            variant='subtitle2'
                            component='div'
                            id='AiVendors.AddEditAiVendor.headers.header'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.headers'
                                defaultMessage='Additional Headers'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiVendors.AddEditAiVendor.headers.body'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.headers.description'
                                defaultMessage={'Add additional headers'
                                    + '. Press enter to add each header.'}
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <MuiChipsInput
                                variant='outlined'
                                fullWidth
                                value={state.configurations.additionalHeaders}
                                onAddChip={(header) => {
                                    state.configurations.additionalHeaders.push(header);
                                }}
                                onDeleteChip={(headerToDelete) => {
                                    const filteredHeaders = state.configurations.additionalHeaders.filter(
                                        (header) => header !== headerToDelete,
                                    );
                                    dispatch({ field: 'additionalHeaders', value: filteredHeaders });
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'AiVendors.AddEditAiVendor.form.headers.placeholder',
                                    defaultMessage: 'Type headers and press Enter',
                                })}
                                helperText={(
                                    <div style={{ position: 'absolute', marginTop: '10px' }}>
                                        {intl.formatMessage({
                                            id: 'AiVendors.AddEditAiVendor.form.header.help',
                                            defaultMessage: 'Type Additional Headers and '
                                                + 'press Enter/Return to add them.',
                                        })}
                                    </div>
                                )}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography
                            color='inherit'
                            variant='subtitle2'
                            component='div'
                            id='AiVendors.AddEditAiVendor.queryParameters.header'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.queryParameters'
                                defaultMessage='Additional Query Parameters'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiVendors.AddEditAiVendor.queryParameters.body'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.queryParameters.description'
                                defaultMessage={'Add additional query parameters'
                                    + '. Press enter to add each header.'}
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <MuiChipsInput
                                variant='outlined'
                                fullWidth
                                value={state.configurations.additionalQueryParameters}
                                onAddChip={(queryParameter) => {
                                    state.configurations.additionalQueryParameters.push(queryParameter);
                                }}
                                onDeleteChip={(queryParameterToDelete) => {
                                    const filteredQueryParameters = state
                                        .configurations
                                        .additionalQueryParameters.filter(
                                            (queryParameter) => queryParameter !== queryParameterToDelete,
                                        );
                                    dispatch({ field: 'additionalQueryParameters', value: filteredQueryParameters });
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'AiVendors.AddEditAiVendor.form.queryParameters.placeholder',
                                    defaultMessage: 'Type query parameters and press Enter',
                                })}
                                helperText={(
                                    <div style={{ position: 'absolute', marginTop: '10px' }}>
                                        {intl.formatMessage({
                                            id: 'AiVendors.AddEditAiVendor.form.queryParameters.help',
                                            defaultMessage: 'Type Additional Query Parameters and '
                                                + 'press Enter/Return to add them.',
                                        })}
                                    </div>
                                )}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={12} lg={3}>
                        <Typography
                            color='inherit'
                            variant='subtitle2'
                            component='div'
                            id='AiVendors.AddEditAiVendor.connectorType.header'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.connectorType'
                                defaultMessage='Connector Type for AI Vendor'
                            />
                        </Typography>
                        <Typography
                            color='inherit'
                            variant='caption'
                            component='p'
                            id='AiVendors.AddEditAiVendor.connectorType.body'
                        >
                            <FormattedMessage
                                id='AiVendors.AddEditAiVendor.connectorType.description'
                                defaultMessage='Reference to the connector model for the AI vendor'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={9}>
                        <Box component='div' m={1}>
                            <TextField
                                id='connectorType'
                                margin='dense'
                                name='connectorType'
                                label={(
                                    <span>
                                        <FormattedMessage
                                            id='AiVendors.AddEditAiVendor.form.connectorType'
                                            defaultMessage='Connector Type'
                                        />

                                        <StyledSpan>*</StyledSpan>
                                    </span>
                                )}
                                fullWidth
                                variant='outlined'
                                value={state.configurations.connectorType}
                                disabled={!!id}
                                onChange={(e) => dispatch({
                                    field: 'connectorType',
                                    value: e.target.value,
                                })}
                                error={hasErrors('connectorType', state.configurations.connectorType, validating)}
                                helperText={hasErrors(
                                    'connectorType',
                                    state.configurations.connectorType,
                                    validating,
                                ) || intl.formatMessage({
                                    id: 'AiVendors.AddEditAiVendor.form.name.help',
                                    defaultMessage: 'Connector Type for AI Vendor.',
                                })}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box marginTop={2} marginBottom={2}>
                            <StyledHr />
                        </Box>
                    </Grid>
                    <Grid item xs={12} mb={2}>
                        <Box component='span' m={1}>
                            <Button
                                id='aivendor-add'
                                variant='contained'
                                color='primary'
                                onClick={formSaveCallback}
                            >
                                {saving ? (<CircularProgress size={16} />) : (
                                    <>
                                        {id ? (
                                            <FormattedMessage
                                                id='AiVendors.AddEditAiVendor.form.update.btn'
                                                defaultMessage='Update'
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='AiVendors.AddEditAiVendor.form.add'
                                                defaultMessage='Add'
                                            />
                                        )}
                                    </>
                                )}
                            </Button>
                        </Box>
                        <RouterLink to='/settings/ai-vendors'>
                            <Button variant='outlined'>
                                <FormattedMessage
                                    id='AiVendors.AddEditAiVendor.form.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </RouterLink>
                    </Grid>
                </Grid>
            </Box>

        </StyledContentBase>
    );
}
