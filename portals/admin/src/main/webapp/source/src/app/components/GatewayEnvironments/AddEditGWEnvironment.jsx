/* eslint-disable object-curly-newline, operator-linebreak, comma-dangle, implicit-arrow-linebreak, react/jsx-curly-newline, react/jsx-wrap-multilines, indent, max-len */
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

import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { styled } from '@mui/material/styles';
import API from 'AppData/api';
import CONSTS from 'AppData/Constants';
import base64url from 'base64url';
import PropTypes from 'prop-types';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { FormattedMessage, useIntl } from 'react-intl';
import Select from '@mui/material//Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import { MenuItem, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Alert from 'AppComponents/Shared/Alert';
import { Link as RouterLink } from 'react-router-dom';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import { MuiChipsInput } from 'mui-chips-input';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Error from '@mui/icons-material/Error';
import InputAdornment from '@mui/material/InputAdornment';
import { red } from '@mui/material/colors/';
import AddEditVhost from 'AppComponents/GatewayEnvironments/AddEditVhost';
import GatewayConfiguration from 'AppComponents/GatewayEnvironments/GatewayConfiguration';
import cloneDeep from 'lodash.clonedeep';
import CircularProgress from '@mui/material/CircularProgress';
import GatewayTypeOptionCard from './GatewayTypeOptionCard';
import QuickStartGuide from './UniversalGatewayQuickStartGuide';
import {
    buildAdditionalPropertiesArray,
    buildPermissionsDTO,
    buildVhostDTO,
    createDefaultVhost,
    getGatewayProvider,
    getGatewayStatusChipProps,
    getPlatformGatewayUrl,
    getVhostFromBaseUrl,
    normalizeBaseUrl,
    WSO2_GATEWAY_TYPES,
    WSO2_SELF_HOSTED_GATEWAY_TYPES,
    toPlatformGatewayName,
} from './UniversalGatewayUtils';

const PREFIX = 'AddEditGWEnvironment';

const classes = {
    pageContent: `${PREFIX}-pageContent`,
    platformLoadingRow: `${PREFIX}-platformLoadingRow`,
    backButton: `${PREFIX}-backButton`,
    platformSummaryCard: `${PREFIX}-platformSummaryCard`,
    platformSummaryHeader: `${PREFIX}-platformSummaryHeader`,
    platformAvatar: `${PREFIX}-platformAvatar`,
    platformSummaryBody: `${PREFIX}-platformSummaryBody`,
    platformTagRow: `${PREFIX}-platformTagRow`,
    platformEditLayout: `${PREFIX}-platformEditLayout`,
    platformEditFields: `${PREFIX}-platformEditFields`,
    platformEditActions: `${PREFIX}-platformEditActions`,
    platformTitleRow: `${PREFIX}-platformTitleRow`,
    platformConfigPaper: `${PREFIX}-platformConfigPaper`,
    platformConfigSection: `${PREFIX}-platformConfigSection`,
    platformConfigGuide: `${PREFIX}-platformConfigGuide`,
    wso2TypeSelector: `${PREFIX}-wso2TypeSelector`,
    roleContainer: `${PREFIX}-roleContainer`,
    roleErrorAdornment: `${PREFIX}-roleErrorAdornment`,
};

const StyledSpan = styled('span')(({ theme }) => ({
    color: theme.palette.error.dark,
}));

const StyledContentBase = styled(ContentBase)(({ theme }) => ({
    '@global': {
        '.MuiFormControl-root': {
            marginTop: '20px',
        },
        '.MuiFormControl-root:first-of-type': {
            marginTop: '0',
        },
    },
    [`& .${classes.pageContent}`]: {
        marginBottom: theme.spacing(10),
    },
    [`& .${classes.platformLoadingRow}`]: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    [`& .${classes.backButton}`]: {
        marginBottom: theme.spacing(3),
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
    },
    [`& .${classes.platformSummaryCard}`]: {
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: theme.shape.borderRadius * 2,
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        [theme.breakpoints.up('md')]: {
            padding: theme.spacing(3),
        },
    },
    [`& .${classes.platformSummaryHeader}`]: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing(2),
        flexDirection: 'column',
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row',
        },
    },
    [`& .${classes.platformAvatar}`]: {
        width: 96,
        height: 96,
        borderRadius: theme.shape.borderRadius * 2,
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        fontWeight: 700,
        flexShrink: 0,
    },
    [`& .${classes.platformSummaryBody}`]: {
        flex: 1,
        minWidth: 0,
    },
    [`& .${classes.platformTagRow}`]: {
        display: 'flex',
        gap: theme.spacing(1),
        flexWrap: 'wrap',
        marginBottom: theme.spacing(1.5),
    },
    [`& .${classes.platformEditLayout}`]: {
        display: 'flex',
        gap: theme.spacing(1.5),
        alignItems: 'flex-start',
        flexDirection: 'column',
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row',
        },
    },
    [`& .${classes.platformEditFields}`]: {
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
    },
    [`& .${classes.platformEditActions}`]: {
        display: 'flex',
        gap: theme.spacing(1),
        paddingTop: theme.spacing(0.5),
    },
    [`& .${classes.platformTitleRow}`]: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        flexWrap: 'wrap',
        marginBottom: theme.spacing(1),
    },
    [`& .${classes.platformConfigPaper}`]: {
        overflow: 'hidden',
    },
    [`& .${classes.platformConfigSection}`]: {
        padding: theme.spacing(3),
    },
    [`& .${classes.platformConfigGuide}`]: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
        paddingBottom: theme.spacing(3),
    },
    [`& .${classes.wso2TypeSelector}`]: {
        display: 'grid',
        gap: theme.spacing(1.5),
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        width: '100%',
    },
    [`& .${classes.roleContainer}`]: {
        marginRight: theme.spacing(3.75),
        marginLeft: theme.spacing(1.25),
        marginTop: theme.spacing(1.25),
        marginBottom: theme.spacing(1.25),
    },
    [`& .${classes.roleErrorAdornment}`]: {
        position: 'absolute',
        right: '25px',
        top: '50%',
    },
}));

const StyledHr = styled('hr')({ border: 'solid 1px #efefef' });

const getNameValidationError = (value, formatMessage) => {
    if (value === undefined) {
        return false;
    }

    if (value === '') {
        return formatMessage({
            id: 'GatewayEnvironments.AddEditGWEnvironment.form.environment.name.empty',
            defaultMessage: 'Name is empty',
        });
    }

    if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        return formatMessage({
            id: 'GatewayEnvironments.AddEditGWEnvironment.form.environment.name.invalid',
            defaultMessage:
                'Name must not contain special characters or spaces',
        });
    }

    return false;
};

const getDisplayNameValidationError = (
    value,
    formatMessage,
    isUniversalGatewayCreate
) => {
    if (value === undefined) {
        return false;
    }

    if (value === '') {
        return formatMessage({
            id: 'GatewayEnvironments.AddEditGWEnvironment.form.environment.displayName.empty',
            defaultMessage: 'Display name is empty',
        });
    }

    if (isUniversalGatewayCreate && toPlatformGatewayName(value).length < 3) {
        return formatMessage({
            id: 'GatewayEnvironments.AddEditGWEnvironment.form.environment.displayName.invalid',
            defaultMessage:
                'Display Name must contain at least 3 letters or numbers',
        });
    }

    return false;
};

const getVhostValidationError = (
    value,
    formatMessage,
    handleHostValidation
) => {
    if (value === undefined) {
        return false;
    }

    if (value.length === 0) {
        return formatMessage({
            id: 'AdminPagesGatewayEnvironments.AddEditGWEnvironment.form.environment.vhost.empty',
            defaultMessage: 'VHost is empty',
        });
    }

    const hosts = value.map((vhost) => vhost.host);
    if (hosts.length !== new Set(hosts).size) {
        return formatMessage({
            id: 'AdminPagesGatewayEnvironments.AddEditGWEnvironment.form.environment.vhost.duplicate',
            defaultMessage: 'VHosts are duplicated',
        });
    }

    return value.map(handleHostValidation).find(Boolean) || false;
};

const getScheduledIntervalValidationError = (value, formatMessage) => {
    if (value === '') {
        return formatMessage({
            id:
                'AdminPagesGatewayEnvironments.AddEditGWEnvironment.form.environment' +
                '.scheduledInterval.empty',
            defaultMessage: 'Scheduled interval is empty',
        });
    }

    if (parseInt(value, 10) < 0) {
        return formatMessage({
            id:
                'AdminPagesGatewayEnvironments.AddEditGWEnvironment.form.environment' +
                '.scheduledInterval.parse',
            defaultMessage: 'Invalid scheduled interval',
        });
    }

    return '';
};

const getPlatformGatewayBaseUrlValidationError = (
    value,
    formatMessage,
    gatewayType
) => {
    if (gatewayType !== CONSTS.GATEWAY_TYPE.apiPlatform) {
        return false;
    }

    if (!value || value.trim() === '') {
        return formatMessage({
            id: 'GatewayEnvironments.AddEditGWEnvironment.form.platform.base.url.empty',
            defaultMessage: 'URL is Empty',
        });
    }

    const normalizedBaseUrl = normalizeBaseUrl(value);
    if (!getVhostFromBaseUrl(normalizedBaseUrl)) {
        return formatMessage({
            id: 'GatewayEnvironments.AddEditGWEnvironment.form.platform.base.url.invalid',
            defaultMessage: 'Invalid URL',
        });
    }

    return false;
};

const getGatewayConfigValidationError = (value, formatMessage) => {
    if (value === '') {
        return formatMessage({
            id: 'GatewayEnvironments.AddEditGWEnvironment.form.gateway.config.empty',
            defaultMessage: 'Required field is empty',
        });
    }

    return false;
};

/**
 * Reducer
 * @param {JSON} state State
 * @param field form field
 * @param value value of field
 * @returns {Promise}.
 */
function reducer(state, { field, value }) {
    switch (field) {
        case 'name':
        case 'displayName':
        case 'gatewayType':
        case 'gatewayMode':
        case 'description':
        case 'type':
        case 'roles':
        case 'scheduledInterval':
        case 'additionalProperties':
        case 'vhosts':
            return { ...state, [field]: value };
        case 'editDetails':
            return value;
        case 'permissionType':
            return {
                ...state,
                permissions: { ...state.permissions, [field]: value },
            };
        default:
            return state;
    }
}

/**
 * Render a pop-up dialog to add/edit a Gateway Environment
 * @param {JSON} props .
 * @returns {JSX}.
 */
function AddEditGWEnvironment(props) {
    const intl = useIntl();
    const { dataRow } = props;

    const { settings } = useAppContext();
    const [validRoles, setValidRoles] = useState([]);
    const [invalidRoles, setInvalidRoles] = useState([]);
    const [roleValidity, setRoleValidity] = useState(true);
    const [gatewayConfigurations, setGatewayConfiguration] = useState([]);
    const [supportedModes, setSupportedModes] = useState([]);
    const [validating, setValidating] = useState(false);
    const [saving, setSaving] = useState(false);
    const { gatewayTypes } = settings;
    const {
        match: {
            params: { id },
        },
        history,
        location,
    } = props;
    const searchParams = useMemo(
        () => new URLSearchParams(location?.search || ''),
        [location?.search]
    );
    const category = searchParams.get('category');
    const presetGatewayType = searchParams.get('presetType');
    // Limit the available gateway types to the selected category and configured gateway support.
    const filteredGatewayTypes = useMemo(() => {
        const configuredGatewayTypes = Array.isArray(gatewayTypes)
            ? gatewayTypes
            : [];
        if (category === 'wso2') {
            const wso2Types = WSO2_SELF_HOSTED_GATEWAY_TYPES.filter(
                (type) =>
                    configuredGatewayTypes.includes(type) ||
                    type === CONSTS.GATEWAY_TYPE.apiPlatform
            );
            return wso2Types.length > 0 ? wso2Types : configuredGatewayTypes;
        }
        if (category === 'third-party') {
            const thirdPartyTypes = configuredGatewayTypes.filter(
                (type) =>
                    !WSO2_GATEWAY_TYPES.includes(type) &&
                    type !== CONSTS.GATEWAY_TYPE.apiPlatform
            );
            return thirdPartyTypes.length > 0
                ? thirdPartyTypes
                : configuredGatewayTypes;
        }
        return configuredGatewayTypes;
    }, [category, gatewayTypes]);

    // Choose the initial gateway type, honoring valid preset selections before falling back to defaults.
    const initialGatewayType = useMemo(() => {
        if (category === 'wso2' && !id && !presetGatewayType) {
            if (
                filteredGatewayTypes.includes(CONSTS.GATEWAY_TYPE.apiPlatform)
            ) {
                return CONSTS.GATEWAY_TYPE.apiPlatform;
            }
            return filteredGatewayTypes[0] || '';
        }
        if (
            presetGatewayType &&
            filteredGatewayTypes.includes(presetGatewayType)
        ) {
            return presetGatewayType;
        }
        if (filteredGatewayTypes.includes(CONSTS.GATEWAY_TYPE.regular)) {
            return CONSTS.GATEWAY_TYPE.regular;
        }
        return filteredGatewayTypes[0] || CONSTS.GATEWAY_TYPE.regular;
    }, [filteredGatewayTypes, presetGatewayType]);
    const shouldLockGatewayTypeSelection = !id && Boolean(presetGatewayType);
    const isWSO2CreateMode = category === 'wso2' && !id;
    const initialPermissions = useMemo(() => {
        return dataRow?.permissions
            ? dataRow.permissions
            : { roles: [], permissionType: 'PUBLIC' };
    }, [dataRow]);
    const [initialState, setInitialState] = useState({
        name: '',
        displayName: '',
        description: '',
        gatewayType: initialGatewayType,
        gatewayMode: 'WRITE_ONLY',
        scheduledInterval: 0,
        type: 'hybrid',
        vhosts: [
            createDefaultVhost(
                initialGatewayType || CONSTS.GATEWAY_TYPE.regular
            ),
        ],
        permissions: initialPermissions,
        additionalProperties: {},
    });
    const [editMode, setIsEditMode] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(dataRow?.isReadOnly || false);
    const [isPlatformGatewayEdit, setIsPlatformGatewayEdit] = useState(false);
    const [isGatewayEditTypeResolved, setIsGatewayEditTypeResolved] = useState(
        !id
    );
    const [platformGateway, setPlatformGateway] = useState(null);
    const [platformGatewayLoading, setPlatformGatewayLoading] = useState(false);
    const [platformTokenRegenerating, setPlatformTokenRegenerating] =
        useState(false);
    const [confirmReconfigureOpen, setConfirmReconfigureOpen] = useState(false);
    const [showPlatformTokenCommands, setShowPlatformTokenCommands] =
        useState(false);
    const [platformHeaderEditMode, setPlatformHeaderEditMode] = useState(false);
    const [platformHeaderSaving, setPlatformHeaderSaving] = useState(false);
    const [platformDisplayNameDraft, setPlatformDisplayNameDraft] =
        useState('');
    const [platformDescriptionDraft, setPlatformDescriptionDraft] =
        useState('');

    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        name,
        displayName,
        description,
        vhosts,
        type,
        gatewayType,
        gatewayMode,
        scheduledInterval,
        permissions,
        additionalProperties,
    } = state;
    const platformGatewayBaseUrl =
        additionalProperties?.platformGatewayBaseUrl || '';
    const isUniversalGatewayCreate =
        !id && gatewayType === CONSTS.GATEWAY_TYPE.apiPlatform;
    const handleWSO2GatewayTypeSelection = (selectedType) => {
        dispatch({ field: 'gatewayType', value: selectedType });
    };
    const showFormDetails = !isWSO2CreateMode || Boolean(gatewayType);

    const [roles, setRoles] = useState([]);
    const restApi = useMemo(() => new API(), []);

    useEffect(() => {
        if (id) {
            setIsGatewayEditTypeResolved(false);
            setPlatformGatewayLoading(true);
            setIsPlatformGatewayEdit(false);
            setPlatformGateway(null);
            setPlatformHeaderEditMode(false);
            setShowPlatformTokenCommands(false);
            restApi
                .getGatewayEnvironment(id)
                .then(async (result) => {
                    const { body } = result;
                    const tempAdditionalProperties = {};
                    (body.additionalProperties || []).forEach((property) => {
                        tempAdditionalProperties[property.key] = property.value;
                    });
                    const { platformGatewayId } = tempAdditionalProperties;
                    const newState = {
                        name: body.name || '',
                        displayName: body.displayName || '',
                        description: body.description || '',
                        gatewayType: body.gatewayType || '',
                        gatewayMode: body.mode || '',
                        scheduledInterval:
                            body.apiDiscoveryScheduledWindow ?? 0,
                        type: body.type || '',
                        vhosts: body.vhosts || [],
                        permissions: body.permissions || initialPermissions,
                        additionalProperties: tempAdditionalProperties || {},
                    };
                    if (platformGatewayId) {
                        dispatch({ field: 'editDetails', value: newState });
                        setIsPlatformGatewayEdit(true);
                        setIsReadOnly(true);
                        const platformGatewayResponse =
                            await restApi.getPlatformGatewayList();
                        const platformGateways =
                            platformGatewayResponse?.body?.list || [];
                        const matchedGateway = platformGateways.find(
                            (gateway) => gateway.id === platformGatewayId
                        );
                        if (matchedGateway) {
                            setPlatformGateway(matchedGateway);
                        } else {
                            setPlatformGateway({
                                id: platformGatewayId,
                                name: body.name,
                                displayName: body.displayName,
                                isActive: null,
                            });
                        }
                        return;
                    }
                    setIsReadOnly(body.isReadOnly || false);
                    dispatch({ field: 'editDetails', value: newState });
                })
                .catch((error) => {
                    const errorMessage =
                        error?.response?.body?.description || error.message;
                    Alert.error(errorMessage);
                })
                .finally(() => {
                    setPlatformGatewayLoading(false);
                    setIsGatewayEditTypeResolved(true);
                });
            setIsEditMode(true);
        } else {
            setIsGatewayEditTypeResolved(true);
            const newInitialState = {
                name: '',
                displayName: '',
                description: '',
                gatewayType: initialGatewayType,
                gatewayMode: 'WRITE_ONLY',
                scheduledInterval: 0,
                type: 'hybrid',
                vhosts: [
                    createDefaultVhost(
                        initialGatewayType || CONSTS.GATEWAY_TYPE.regular
                    ),
                ],
                permissions: {
                    roles: [],
                    permissionType: 'PUBLIC',
                },
                additionalProperties: {},
            };
            setInitialState(newInitialState);
            dispatch({ field: 'editDetails', value: newInitialState });
        }
    }, [id, initialPermissions, restApi, initialGatewayType]);

    useEffect(() => {
        if (permissions && permissions.roles) {
            setRoles(permissions.roles);
        }
    }, [permissions]);

    useEffect(() => {
        if (!platformHeaderEditMode) {
            setPlatformDisplayNameDraft(
                state.displayName || platformGateway?.displayName || ''
            );
            setPlatformDescriptionDraft(state.description || '');
        }
    }, [
        platformHeaderEditMode,
        platformGateway,
        state.description,
        state.displayName,
    ]);

    useEffect(() => {
        const config = settings.gatewayConfiguration.filter(
            (t) => t.type === gatewayType
        )[0];
        if (
            gatewayType === 'other' ||
            gatewayType === CONSTS.GATEWAY_TYPE.apiPlatform ||
            !config
        ) {
            setGatewayConfiguration([]);
            setSupportedModes([]);
        } else {
            setGatewayConfiguration(config.configurations || []);
            setSupportedModes(config.supportedModes || []);
        }
    }, [gatewayType]);

    let permissionType = '';
    if (permissions) {
        permissionType = state.permissions.permissionType;
    }
    const handleRoleDeletion = (role) => {
        if (invalidRoles.includes(role)) {
            const invalidRolesArray = invalidRoles.filter(
                (existingRole) => existingRole !== role
            );
            setInvalidRoles(invalidRolesArray);
            if (invalidRolesArray.length === 0) {
                setRoleValidity(true);
            }
        } else if (roles.includes(role)) {
            setRoles(roles.filter((existingRole) => existingRole !== role));
        } else {
            setValidRoles(
                validRoles.filter((existingRole) => existingRole !== role)
            );
        }
    };

    const openReconfigureConfirm = () => {
        setConfirmReconfigureOpen(true);
    };

    const closeReconfigureConfirm = () => {
        if (!platformTokenRegenerating) {
            setConfirmReconfigureOpen(false);
        }
    };

    const handleRegeneratePlatformKey = async () => {
        if (!platformGateway?.id) {
            return;
        }
        setPlatformTokenRegenerating(true);
        try {
            const result = await restApi.regeneratePlatformGatewayToken(
                platformGateway.id
            );
            const regeneratedGateway = result?.body || result;
            setPlatformGateway(regeneratedGateway);
            setConfirmReconfigureOpen(false);
            setShowPlatformTokenCommands(true);
            Alert.success(
                intl.formatMessage({
                    id: 'Gateways.AddEditGateway.platform.token.regenerate.success',
                    defaultMessage:
                        'Gateway registration token regenerated successfully.',
                })
            );
        } catch (error) {
            const errorMessage =
                error?.response?.body?.description ||
                error.message ||
                intl.formatMessage({
                    id: 'Gateways.AddEditGateway.platform.token.regenerate.error',
                    defaultMessage:
                        'Failed to regenerate gateway registration token.',
                });
            Alert.error(errorMessage);
        } finally {
            setPlatformTokenRegenerating(false);
        }
    };

    const handleEditPlatformHeader = () => {
        setPlatformDisplayNameDraft(
            state.displayName || platformGateway?.displayName || ''
        );
        setPlatformDescriptionDraft(state.description || '');
        setPlatformHeaderEditMode(true);
    };

    const handleCancelPlatformHeaderEdit = () => {
        setPlatformDisplayNameDraft(
            state.displayName || platformGateway?.displayName || ''
        );
        setPlatformDescriptionDraft(state.description || '');
        setPlatformHeaderEditMode(false);
    };

    const handleSavePlatformHeader = async () => {
        const trimmedDisplayName = platformDisplayNameDraft.trim();
        const trimmedDescription = platformDescriptionDraft.trim();
        if (!trimmedDisplayName) {
            Alert.error(
                intl.formatMessage({
                    id: 'Gateways.AddEditGateway.platform.name.required',
                    defaultMessage: 'Gateway name is required.',
                })
            );
            return;
        }

        const additionalPropertiesArrayDTO =
            buildAdditionalPropertiesArray(additionalProperties);
        const permissionsDTO = buildPermissionsDTO(permissions);
        const vhostDTO = (vhosts || []).map((vhost) => ({
            host: vhost.host,
            wsPort: vhost.wsPort,
            wssPort: vhost.wssPort,
            httpContext: vhost.httpContext,
            httpPort: vhost.httpPort,
            httpsPort: vhost.httpsPort,
        }));
        const provider = getGatewayProvider(gatewayType);

        setPlatformHeaderSaving(true);
        try {
            await restApi.updateGatewayEnvironment(
                id,
                name.trim(),
                trimmedDisplayName,
                type,
                trimmedDescription,
                gatewayType,
                gatewayMode,
                scheduledInterval,
                vhostDTO,
                permissionsDTO,
                additionalPropertiesArrayDTO,
                provider
            );
            dispatch({ field: 'displayName', value: trimmedDisplayName });
            dispatch({ field: 'description', value: trimmedDescription });
            setPlatformHeaderEditMode(false);
            Alert.success(
                intl.formatMessage({
                    id: 'Gateways.AddEditGateway.platform.details.update.success',
                    defaultMessage: 'Gateway details updated successfully.',
                })
            );
        } catch (error) {
            const errorMessage =
                error?.response?.body?.description ||
                error.message ||
                intl.formatMessage({
                    id: 'Gateways.AddEditGateway.platform.details.update.error',
                    defaultMessage: 'Failed to update gateway details.',
                });
            Alert.error(errorMessage);
        } finally {
            setPlatformHeaderSaving(false);
        }
    };

    const handleRoleAddition = (role) => {
        const promise = restApi.validateSystemRole(base64url.encode(role));
        promise
            .then(() => {
                // Check if the role is already added
                if (
                    roles.includes(role) ||
                    validRoles.includes(role) ||
                    invalidRoles.includes(role)
                ) {
                    Alert.error('Role already added: ' + role);
                    return;
                }

                setValidRoles(validRoles.concat(role));
                if (invalidRoles.length === 0) {
                    setRoleValidity(true);
                } else {
                    setRoleValidity(false);
                }
            })
            .catch((error) => {
                if (error.status === 404) {
                    setInvalidRoles(invalidRoles.concat(role));
                    setRoleValidity(false);
                } else {
                    Alert.error('Error when validating role: ' + role);
                    console.error('Error when validating role ' + error);
                }
            });
    };

    const setAdditionalProperties = (key, value) => {
        const clonedAdditionalProperties = cloneDeep(additionalProperties);
        if (value === undefined) {
            delete clonedAdditionalProperties[key];
        } else {
            clonedAdditionalProperties[key] = value;
        }
        dispatch({
            field: 'additionalProperties',
            value: clonedAdditionalProperties,
        });
    };

    const handlePlatformBaseUrlChange = (e) => {
        setAdditionalProperties('platformGatewayBaseUrl', e.target.value);
    };

    const onChange = (e) => {
        if (e.target.name === 'GatewayPermissionRestrict') {
            permissionType = e.target.value;
            dispatch({ field: 'permissionType', value: permissionType });
        }
        dispatch({ field: e.target.name, value: e.target.value });
    };

    useEffect(() => {
        if (
            !supportedModes?.includes(gatewayMode) &&
            supportedModes?.length > 0
        ) {
            onChange({
                target: {
                    name: 'gatewayMode',
                    value: supportedModes[0],
                },
            });
        }
    }, [supportedModes]);

    /* const getBorderColor = (gatewayTypeNew) => {
        return gatewayType === gatewayTypeNew
            ? '2px solid #1976D2'
            : '2px solid gray';
    }; */

    const handleHostValidation = (vhost) => {
        if (!vhost) {
            return false;
        }
        if (!vhost.host) {
            return intl.formatMessage({
                id: 'GatewayEnvironments.AddEditGWEnvironment.form.vhost.host.empty',
                defaultMessage: 'Host of Vhost is empty',
            });
        }

        // same pattern used in admin Rest API
        const httpContextRegex =
            /^\/?(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)?$/;
        // empty http context are valid
        const validHttpContext =
            !vhost.httpContext || vhost.httpContext.match(httpContextRegex);
        if (!validHttpContext) {
            return intl.formatMessage({
                id: 'GatewayEnvironments.AddEditGWEnvironment.form.vhost.context.invalid',
                defaultMessage: 'Invalid Http context',
            });
        }

        // skip port validation for external gateways
        const portValidatingGWTypes = WSO2_GATEWAY_TYPES;
        if (portValidatingGWTypes.includes(gatewayType)) {
            let portError;
            const ports = ['httpPort', 'httpsPort', 'wsPort', 'wssPort'];
            for (const port of ports) {
                portError =
                    Number.isInteger(vhost[port]) &&
                    vhost[port] >= 1 &&
                    vhost[port] <= 65535
                        ? ''
                        : 'Invalid Port';
                if (portError) {
                    return portError;
                }
            }
        }
        return false;
    };

    const hasErrors = (fieldName, value, validatingActive) => {
        if (!validatingActive) {
            return false;
        }
        const validators = {
            name: () => getNameValidationError(value, intl.formatMessage),
            displayName: () =>
                getDisplayNameValidationError(
                    value,
                    intl.formatMessage,
                    isUniversalGatewayCreate
                ),
            vhosts: () =>
                getVhostValidationError(
                    value,
                    intl.formatMessage,
                    handleHostValidation
                ),
            scheduledInterval: () =>
                getScheduledIntervalValidationError(value, intl.formatMessage),
            platformGatewayBaseUrl: () =>
                getPlatformGatewayBaseUrlValidationError(
                    value,
                    intl.formatMessage,
                    gatewayType
                ),
            gatewayConfig: () =>
                getGatewayConfigValidationError(value, intl.formatMessage),
        };

        return validators[fieldName]?.() || false;
    };
    const getAllFormErrors = () => {
        let errorText = '';
        const nameErrors = isUniversalGatewayCreate
            ? false
            : hasErrors('name', name, true);
        const displayNameErrors = hasErrors('displayName', displayName, true);
        const vhostErrors = isUniversalGatewayCreate
            ? false
            : hasErrors('vhosts', vhosts, true);
        const scheduledIntervalErrors = isUniversalGatewayCreate
            ? false
            : hasErrors('scheduledInterval', scheduledInterval, true);
        const platformBaseUrlErrors = hasErrors(
            'platformGatewayBaseUrl',
            platformGatewayBaseUrl,
            true
        );
        if (nameErrors) {
            errorText += nameErrors + '\n';
        }
        if (displayNameErrors) {
            errorText += displayNameErrors + '\n';
        }
        if (platformBaseUrlErrors) {
            errorText += platformBaseUrlErrors + '\n';
        }
        if (vhostErrors) {
            errorText += vhostErrors + '\n';
        }
        if (scheduledIntervalErrors) {
            errorText += scheduledIntervalErrors + '\n';
        }
        let gatewayConnectorConfigHasErrors = false;

        const checkGatewayConnectorConfigErrors = (connectorConfigurations) => {
            for (const connectorConfig of connectorConfigurations) {
                if (
                    connectorConfig.required &&
                    (!additionalProperties[connectorConfig.name] ||
                        additionalProperties[connectorConfig.name] === '')
                ) {
                    return true;
                }

                if (
                    connectorConfig.values &&
                    connectorConfig.values.length > 0 &&
                    additionalProperties[connectorConfig.name]
                ) {
                    const selectedOption = connectorConfig.values.find(
                        (option) => {
                            if (typeof option === 'string') {
                                return (
                                    option ===
                                    additionalProperties[connectorConfig.name]
                                );
                            }
                            return (
                                option.name ===
                                additionalProperties[connectorConfig.name]
                            );
                        }
                    );

                    if (
                        selectedOption &&
                        typeof selectedOption === 'object' &&
                        selectedOption.values
                    ) {
                        if (
                            checkGatewayConnectorConfigErrors(
                                selectedOption.values
                            )
                        ) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        gatewayConnectorConfigHasErrors = checkGatewayConnectorConfigErrors(
            gatewayConfigurations
        );

        if (gatewayConnectorConfigHasErrors) {
            const errorConfig = intl.formatMessage({
                id: 'GatewayEnvironments.AddEditGWEnvironment.form.gateway.config.has.errors',
                defaultMessage: 'Connector configuration has errors',
            });
            errorText += errorConfig + '\n';
        }
        return errorText;
    };
    const hasFormErrors = useMemo(
        () => getAllFormErrors() !== '',
        [
            additionalProperties,
            displayName,
            gatewayConfigurations,
            gatewayMode,
            gatewayType,
            intl,
            isUniversalGatewayCreate,
            name,
            platformGatewayBaseUrl,
            scheduledInterval,
            vhosts,
        ]
    );
    const formSaveCallback = () => {
        setValidating(true);
        const formErrors = getAllFormErrors();
        if (formErrors !== '') {
            Alert.error(
                intl.formatMessage({
                    id: 'GatewayEnvironments.AddEditGWEnvironment.form.has.errors',
                    defaultMessage: 'One or more fields contain errors',
                })
            );
            return false;
        }

        setSaving(true);
        const vhostDto = buildVhostDTO(vhosts, gatewayType);
        const provider = getGatewayProvider(gatewayType);
        const permissionsDTO = buildPermissionsDTO(
            state.permissions,
            roles,
            validRoles
        );
        const additionalPropertiesArrayDTO = buildAdditionalPropertiesArray(
            state.additionalProperties
        );

        let promiseAPICall;
        if (!id && gatewayType === CONSTS.GATEWAY_TYPE.apiPlatform) {
            const normalizedBaseUrl = normalizeBaseUrl(platformGatewayBaseUrl);
            const computedVhost = getVhostFromBaseUrl(normalizedBaseUrl);
            const normalizedDisplayName = displayName.trim();
            const platformGatewayName = toPlatformGatewayName(
                normalizedDisplayName
            );
            promiseAPICall = restApi.createPlatformGateway({
                name: platformGatewayName,
                displayName: normalizedDisplayName,
                description: description.trim(),
                vhost: computedVhost,
                properties: {
                    gatewayController: {
                        enabled: true,
                        baseUrl: normalizedBaseUrl,
                    },
                },
                permissions: {
                    permissionType: permissionsDTO.permissionType,
                    roles: permissionsDTO.roles,
                },
            });
        } else if (id) {
            // assign the update promise to the promiseAPICall
            promiseAPICall = restApi.updateGatewayEnvironment(
                id,
                name.trim(),
                displayName,
                type,
                description,
                gatewayType,
                gatewayMode,
                scheduledInterval,
                vhostDto,
                permissionsDTO,
                additionalPropertiesArrayDTO,
                provider
            );
        } else {
            // assign the create promise to the promiseAPICall
            promiseAPICall = restApi.addGatewayEnvironment(
                name.trim(),
                displayName,
                type,
                description,
                gatewayType,
                gatewayMode,
                scheduledInterval,
                vhostDto,
                permissionsDTO,
                additionalPropertiesArrayDTO,
                provider
            );
        }

        promiseAPICall
            .then((result) => {
                if (id) {
                    Alert.success(
                        `${name} ${intl.formatMessage({
                            id: 'Environment.edit.success',
                            defaultMessage:
                                ' - Gateway Environment edited successfully.',
                        })}`
                    );
                } else {
                    Alert.success(
                        `${name} ${intl.formatMessage({
                            id: 'Environment.add.success',
                            defaultMessage:
                                ' - Gateway Environment added successfully.',
                        })}`
                    );
                }
                setSaving(false);
                if (!id && gatewayType === CONSTS.GATEWAY_TYPE.apiPlatform) {
                    const createdGateway = result?.body || result;
                    const createdGatewayId = createdGateway?.id;
                    if (createdGatewayId) {
                        history.push({
                            pathname: `/settings/environments/universal-gateways/${createdGatewayId}`,
                            state: {
                                createdGateway,
                            },
                        });
                        return;
                    }
                    history.push('/settings/environments/');
                    return;
                }
                history.push('/settings/environments/');
            })
            .catch((error) => {
                const { response } = error;
                if (response.body) {
                    Alert.error(response.body.description);
                }
                setSaving(false);
            });
        return true;
    };

    let pageTitle;
    if (id) {
        pageTitle = `${intl.formatMessage({
            id: 'Gateways.AddEditGateway.title.edit',
            defaultMessage: 'Gateway Environment - Edit ',
        })} ${state.name}`;
    } else if (isWSO2CreateMode) {
        pageTitle = intl.formatMessage({
            id: 'Gateways.AddEditGateway.title.new.wso2',
            defaultMessage: 'Add WSO2 Gateway',
        });
    } else {
        pageTitle = intl.formatMessage({
            id: 'Gateways.AddEditGateway.title.new',
            defaultMessage: 'Gateway Environment - Create new',
        });
    }

    const getDisplayName = (value) => {
        if (value === CONSTS.GATEWAY_TYPE.apiPlatform) {
            return 'Universal Gateway';
        } else if (value === CONSTS.GATEWAY_TYPE.regular) {
            return 'Universal Gateway - Classic';
        } else if (value === CONSTS.GATEWAY_TYPE.apk) {
            return 'Kubernetes Gateway';
        } else {
            return value + ' Gateway';
        }
    };

    const getGatewayTypeDescription = (value) => {
        if (value === CONSTS.GATEWAY_TYPE.apiPlatform) {
            return intl.formatMessage({
                id: 'Gateways.AddEditGateway.type.apiPlatform.description',
                defaultMessage: 'New self-hosted API platform gateway',
            });
        } else if (value === CONSTS.GATEWAY_TYPE.regular) {
            return intl.formatMessage({
                id: 'Gateways.AddEditGateway.type.regular.description',
                defaultMessage: 'Enterprise-grade self-hosted Synapse gateway',
            });
        } else if (value === CONSTS.GATEWAY_TYPE.apk) {
            return intl.formatMessage({
                id: 'Gateways.AddEditGateway.type.apk.description',
                defaultMessage: 'Kubernetes-native gateway runtime',
            });
        }

        return intl.formatMessage({
            id: 'Gateways.AddEditGateway.type.default.description',
            defaultMessage: 'Gateway runtime option',
        });
    };

    const getGatewayTypeBadgeLabel = (value) => {
        if (value === CONSTS.GATEWAY_TYPE.apiPlatform) {
            return 'UG';
        } else if (value === CONSTS.GATEWAY_TYPE.regular) {
            return 'UC';
        } else if (value === CONSTS.GATEWAY_TYPE.apk) {
            return 'KG';
        }

        return 'GW';
    };

    const GW_MODE_METADATA = {
        WRITE_ONLY: {
            displayName: 'Write-Only',
            helperText: 'APIs can only be deployed to the Gateway',
        },
        READ_ONLY: {
            displayName: 'Read-Only',
            helperText: 'APIs can only be discovered from the Gateway',
        },
        READ_WRITE: {
            displayName: 'Read-Write',
            helperText:
                'APIs can be both deployed to and discovered from the Gateway',
        },
    };

    if (id && !isGatewayEditTypeResolved) {
        return (
            <StyledContentBase
                pageStyle='half'
                title={intl.formatMessage({
                    id: 'Gateways.AddEditGateway.title.loading',
                    defaultMessage: 'Gateway Environment',
                })}
                help={<div />}
            >
                <Box
                    component='div'
                    m={2}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    <CircularProgress size={20} />
                    <Typography variant='body2'>
                        {intl.formatMessage({
                            id: 'Gateways.AddEditGateway.loading.gateway.details',
                            defaultMessage: 'Loading gateway details...',
                        })}
                    </Typography>
                </Box>
            </StyledContentBase>
        );
    }

    if (isPlatformGatewayEdit) {
        const title =
            state.displayName ||
            platformGateway?.displayName ||
            platformGateway?.name ||
            state.name ||
            intl.formatMessage({
                id: 'Gateways.AddEditGateway.title.platform',
                defaultMessage: 'Platform Gateway',
            });
        const isPlatformGatewayActive =
            platformGateway?.isActive === true ||
            platformGateway?.isActive === 'true';
        const hasPlatformGatewayStatus =
            platformGateway?.isActive === true ||
            platformGateway?.isActive === false ||
            platformGateway?.isActive === 'true' ||
            platformGateway?.isActive === 'false';
        const platformGatewayStatus = isPlatformGatewayActive
            ? intl.formatMessage({
                  id: 'Gateways.AddEditGateway.platform.status.active',
                  defaultMessage: 'Active',
              })
            : intl.formatMessage({
                  id: 'Gateways.AddEditGateway.platform.status.inactive',
                  defaultMessage: 'Inactive',
              });
        const platformGatewayUrl = getPlatformGatewayUrl(platformGateway);
        const gatewayInitials = (title || 'PG')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join('')
            .toUpperCase();
        return (
            <StyledContentBase pageStyle='half' title={title} help={<div />}>
                <Box
                    component='div'
                    m={2}
                    className={classes.pageContent}
                >
                    {platformGatewayLoading ? (
                        <Box className={classes.platformLoadingRow}>
                            <CircularProgress size={20} />
                            <Typography variant='body2'>
                                {intl.formatMessage({
                                    id: 'Gateways.AddEditGateway.loading.platform.gateway.details',
                                    defaultMessage:
                                        'Loading platform gateway details...',
                                })}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Button
                                component={RouterLink}
                                to='/settings/environments/'
                                startIcon={<ArrowBackIcon />}
                                className={classes.backButton}
                            >
                                <FormattedMessage
                                    id='Gateways.AddEditGateway.back.to.gateways'
                                    defaultMessage='Back to Gateways'
                                />
                            </Button>

                            <Box className={classes.platformSummaryCard}>
                                <Box className={classes.platformSummaryHeader}>
                                    <Box className={classes.platformAvatar}>
                                        {gatewayInitials}
                                    </Box>

                                    <Box className={classes.platformSummaryBody}>
                                        <Box className={classes.platformTagRow}>
                                            <Chip
                                                label={intl.formatMessage({
                                                    id: 'Gateways.AddEditGateway.platform.tag.selfHosted',
                                                    defaultMessage:
                                                        'Self-Hosted Gateway',
                                                })}
                                                variant='outlined'
                                                color='primary'
                                            />
                                            <Chip
                                                label={intl.formatMessage({
                                                    id: 'Gateways.AddEditGateway.platform.tag.apiGateway',
                                                    defaultMessage:
                                                        'API Gateway',
                                                })}
                                                variant='outlined'
                                                color='primary'
                                            />
                                        </Box>

                                        {platformHeaderEditMode ? (
                                            <Box className={classes.platformEditLayout}>
                                                <Box className={classes.platformEditFields}>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        label={intl.formatMessage(
                                                            {
                                                                id: 'Gateways.AddEditGateway.platform.field.gateway.name',
                                                                defaultMessage:
                                                                    'Gateway Name',
                                                            }
                                                        )}
                                                        value={
                                                            platformDisplayNameDraft
                                                        }
                                                        onChange={(event) =>
                                                            setPlatformDisplayNameDraft(
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            platformHeaderSaving
                                                        }
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        minRows={3}
                                                        label={intl.formatMessage(
                                                            {
                                                                id: 'Gateways.AddEditGateway.platform.field.description',
                                                                defaultMessage:
                                                                    'Description',
                                                            }
                                                        )}
                                                        value={
                                                            platformDescriptionDraft
                                                        }
                                                        onChange={(event) =>
                                                            setPlatformDescriptionDraft(
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            platformHeaderSaving
                                                        }
                                                    />
                                                </Box>
                                                <Box className={classes.platformEditActions}>
                                                    <IconButton
                                                        color='primary'
                                                        onClick={
                                                            handleSavePlatformHeader
                                                        }
                                                        disabled={
                                                            platformHeaderSaving
                                                        }
                                                        aria-label='save gateway details'
                                                    >
                                                        {platformHeaderSaving ? (
                                                            <CircularProgress
                                                                size={18}
                                                            />
                                                        ) : (
                                                            <CheckIcon />
                                                        )}
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={
                                                            handleCancelPlatformHeaderEdit
                                                        }
                                                        disabled={
                                                            platformHeaderSaving
                                                        }
                                                        aria-label='cancel gateway details edit'
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <>
                                                <Box className={classes.platformTitleRow}>
                                                    <Typography
                                                        variant='h4'
                                                        sx={{ fontWeight: 700 }}
                                                    >
                                                        {title}
                                                    </Typography>
                                                    <IconButton
                                                        size='small'
                                                        onClick={
                                                            handleEditPlatformHeader
                                                        }
                                                        aria-label='edit gateway details'
                                                    >
                                                        <EditOutlinedIcon fontSize='small' />
                                                    </IconButton>
                                                    {hasPlatformGatewayStatus && (
                                                        <Chip
                                                            size='small'
                                                            label={
                                                                platformGatewayStatus
                                                            }
                                                            {...getGatewayStatusChipProps(
                                                                platformGatewayStatus
                                                            )}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography
                                                    variant='body1'
                                                    color='text.secondary'
                                                >
                                                    {state.description ||
                                                        intl.formatMessage({
                                                            id: 'Gateways.AddEditGateway.platform.description.empty',
                                                            defaultMessage:
                                                                'No description provided.',
                                                        })}
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                <Paper elevation={1} className={classes.platformConfigPaper}>
                                    <Box className={classes.platformConfigSection}>
                                        <Typography variant='h6' sx={{ mb: 2 }}>
                                            <FormattedMessage
                                                id='Gateways.AddEditGateway.platform.configurations.title'
                                                defaultMessage='Configurations'
                                            />
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    size='small'
                                                    label={intl.formatMessage({
                                                        id: 'Gateways.AddEditGateway.platform.field.url',
                                                        defaultMessage: 'URL',
                                                    })}
                                                    value={platformGatewayUrl}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    size='small'
                                                    label={intl.formatMessage({
                                                        id:
                                                            'Gateways.AddEditGateway.platform.field.associated.' +
                                                            'environment',
                                                        defaultMessage:
                                                            'Associated Environment',
                                                    })}
                                                    value={
                                                        state.displayName || '-'
                                                    }
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    <Divider sx={{ mx: 3, mb: 3 }} />
                                    <Box className={classes.platformConfigGuide}>
                                        <QuickStartGuide
                                            gateway={platformGateway}
                                            showReconfigureAction
                                            onReconfigureRequested={
                                                openReconfigureConfirm
                                            }
                                            reconfigureLoading={
                                                platformTokenRegenerating
                                            }
                                            showTokenCommands={
                                                showPlatformTokenCommands
                                            }
                                            embedded
                                        />
                                    </Box>
                                </Paper>
                            </Box>
                        </>
                    )}
                </Box>
                <Dialog
                    open={confirmReconfigureOpen}
                    onClose={closeReconfigureConfirm}
                    aria-labelledby='reconfigure-gateway-dialog-title'
                >
                    <DialogTitle id='reconfigure-gateway-dialog-title'>
                        <FormattedMessage
                            id='Gateways.AddEditGateway.platform.token.dialog.title'
                            defaultMessage='Generate New Registration Token?'
                        />
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <FormattedMessage
                                id='Gateways.AddEditGateway.platform.token.dialog.content'
                                defaultMessage={
                                    'The older registration key will be revoked immediately and the connected gateway ' +
                                    'will be disconnected from the control plane. You must reconfigure the gateway ' +
                                    'with the new key.'
                                }
                            />
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={closeReconfigureConfirm}
                            disabled={platformTokenRegenerating}
                        >
                            <FormattedMessage
                                id='Gateways.AddEditGateway.platform.token.dialog.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                        <Button
                            onClick={handleRegeneratePlatformKey}
                            variant='contained'
                            color='primary'
                            disabled={platformTokenRegenerating}
                        >
                            {platformTokenRegenerating
                                ? intl.formatMessage({
                                      id: 'Gateways.AddEditGateway.platform.token.generating',
                                      defaultMessage: 'Generating...',
                                  })
                                : intl.formatMessage({
                                      id: 'Gateways.AddEditGateway.platform.token.generate.key',
                                      defaultMessage: 'Generate Key',
                                  })}
                        </Button>
                    </DialogActions>
                </Dialog>
            </StyledContentBase>
        );
    }

    return (
        <StyledContentBase pageStyle='half' title={pageTitle} help={<div />}>
            <Box
                component='div'
                m={2}
                className={classes.pageContent}
            >
                <Grid container spacing={2}>
                    {isWSO2CreateMode && (
                        <>
                            <Grid item xs={12} md={12} lg={3}>
                                <Typography
                                    color='inherit'
                                    variant='subtitle2'
                                    component='div'
                                    id='gatewayEnvironment-type'
                                >
                                    <FormattedMessage
                                        id='GatewayEnvironments.AddEditGWEnvironment.GatewayEnvironment.type'
                                        defaultMessage='Gateway Environment Type'
                                    />
                                </Typography>
                                <Typography
                                    color='inherit'
                                    variant='caption'
                                    component='p'
                                    id='AddEditGWEnvironment.External.GatewayEnvironment.description.container'
                                >
                                    <FormattedMessage
                                        id={
                                            'GatewayEnvironments.AddEditGWEnvironment.External.GatewayEnvironment' +
                                            '.general.details.description'
                                        }
                                        defaultMessage='Gateway vendor'
                                    />
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={12} lg={9}>
                                <Grid
                                    container
                                    spacing={2}
                                    sx={{ mt: -0.5 }}
                                >
                                    {filteredGatewayTypes.map((item) => (
                                        <Grid item xs={12} md={4}>
                                            <GatewayTypeOptionCard
                                                key={item}
                                                title={getDisplayName(item)}
                                                description={getGatewayTypeDescription(
                                                    item
                                                )}
                                                badgeLabel={getGatewayTypeBadgeLabel(
                                                    item
                                                )}
                                                selected={gatewayType === item}
                                                onSelect={() =>
                                                    handleWSO2GatewayTypeSelection(
                                                        item
                                                    )
                                                }
                                                disabled={
                                                    isReadOnly ||
                                                    shouldLockGatewayTypeSelection
                                                }
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Box marginTop={2} marginBottom={2}>
                                    <StyledHr />
                                </Box>
                            </Grid>
                        </>
                    )}
                    {showFormDetails && (
                        <>
                            <Grid item xs={12} md={12} lg={3}>
                                <Typography
                                    color='inherit'
                                    variant='subtitle2'
                                    component='div'
                                    id='GatewayEnvironments.AddEditGWEnvironment.general.details.div'
                                >
                                    <FormattedMessage
                                        id='GatewayEnvironments.AddEditGWEnvironment.general.details'
                                        defaultMessage='General Details'
                                    />
                                </Typography>
                                <Typography
                                    color='inherit'
                                    variant='caption'
                                    component='p'
                                    id='GatewayEnvironments.AddEditGWEnvironment.general.details.description.div'
                                >
                                    {isUniversalGatewayCreate ? (
                                        <FormattedMessage
                                            id={
                                                'GatewayEnvironments.' +
                                                'AddEditGWEnvironment.general.details.description.platform'
                                            }
                                            defaultMessage={
                                                'Provide display name and description of ' +
                                                'the Gateway Environment'
                                            }
                                        />
                                    ) : (
                                        <FormattedMessage
                                            id='GatewayEnvironments.AddEditGWEnvironment.general.details.description'
                                            defaultMessage='Provide name and description of the Gateway Environment'
                                        />
                                    )}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={12} lg={9}>
                                <Box component='div' m={1}>
                                    <Grid container>
                                        {!isUniversalGatewayCreate && (
                                            <Grid item xs={6}>
                                                <TextField
                                                    id='name'
                                                    autoFocus
                                                    margin='dense'
                                                    name='name'
                                                    label={
                                                        <span>
                                                            <FormattedMessage
                                                                id='GatewayEnvironments.AddEditGWEnvironment.form.name'
                                                                defaultMessage='Name'
                                                            />
                                                            <StyledSpan>
                                                                *
                                                            </StyledSpan>
                                                        </span>
                                                    }
                                                    fullWidth
                                                    variant='outlined'
                                                    value={state.name}
                                                    disabled={
                                                        !!id || isReadOnly
                                                    }
                                                    onChange={(e) =>
                                                        dispatch({
                                                            field: 'name',
                                                            value: e.target
                                                                .value,
                                                        })
                                                    }
                                                    error={hasErrors(
                                                        'name',
                                                        state.name,
                                                        validating
                                                    )}
                                                    helperText={
                                                        hasErrors(
                                                            'name',
                                                            state.name,
                                                            validating
                                                        ) ||
                                                        intl.formatMessage({
                                                            id:
                                                                'GatewayEnvironments.AddEditGWEnvironment.form.name' +
                                                                '.help',
                                                            defaultMessage:
                                                                'Name of the Gateway ' +
                                                                'Environment.',
                                                        })
                                                    }
                                                />
                                            </Grid>
                                        )}
                                        <Grid
                                            item
                                            xs={
                                                isUniversalGatewayCreate
                                                    ? 12
                                                    : 6
                                            }
                                        >
                                            <Box
                                                ml={
                                                    isUniversalGatewayCreate
                                                        ? 0
                                                        : 1
                                                }
                                            >
                                                <TextField
                                                    id='displayName'
                                                    autoFocus={
                                                        isUniversalGatewayCreate
                                                    }
                                                    margin='dense'
                                                    name='displayName'
                                                    fullWidth
                                                    variant='outlined'
                                                    value={state.displayName}
                                                    disabled={
                                                        !!id || isReadOnly
                                                    }
                                                    onChange={(e) =>
                                                        dispatch({
                                                            field: 'displayName',
                                                            value: e.target
                                                                .value,
                                                        })
                                                    }
                                                    label={
                                                        <span>
                                                            <FormattedMessage
                                                                id={
                                                                    'GatewayEnvironments.AddEditGWEnvironment.form' +
                                                                    '.displayName'
                                                                }
                                                                defaultMessage='Display Name'
                                                            />
                                                            <StyledSpan>
                                                                *
                                                            </StyledSpan>
                                                        </span>
                                                    }
                                                    error={hasErrors(
                                                        'displayName',
                                                        state.displayName,
                                                        validating
                                                    )}
                                                    helperText={
                                                        hasErrors(
                                                            'displayName',
                                                            state.displayName,
                                                            validating
                                                        ) ||
                                                        intl.formatMessage({
                                                            id:
                                                                'GatewayEnvironments.AddEditGWEnvironment.form.name.' +
                                                                'form.displayName.help',
                                                            defaultMessage:
                                                                'Display name of the Gateway Environment.',
                                                        })
                                                    }
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
                                        label={
                                            <FormattedMessage
                                                id='GatewayEnvironments.AddEditGWEnvironment.form.description'
                                                defaultMessage='Description'
                                            />
                                        }
                                        fullWidth
                                        variant='outlined'
                                        value={state.description}
                                        disabled={isReadOnly}
                                        onChange={(e) =>
                                            dispatch({
                                                field: 'description',
                                                value: e.target.value,
                                            })
                                        }
                                        helperText={intl.formatMessage({
                                            id:
                                                'GatewayEnvironments.AddEditGWEnvironment.form.name.form.' +
                                                'description.help',
                                            defaultMessage:
                                                'Description of the Gateway Environment.',
                                        })}
                                    />
                                    {gatewayType ===
                                        CONSTS.GATEWAY_TYPE.apiPlatform && (
                                        <TextField
                                            id='platformGatewayBaseUrl'
                                            margin='dense'
                                            name='platformGatewayBaseUrl'
                                            label={
                                                <span>
                                                    <FormattedMessage
                                                        id={
                                                            'GatewayEnvironments.AddEditGWEnvironment.form.platform' +
                                                            '.base.url'
                                                        }
                                                        defaultMessage='URL'
                                                    />
                                                    <StyledSpan>*</StyledSpan>
                                                </span>
                                            }
                                            placeholder='https://gateway.example.com:8443'
                                            fullWidth
                                            variant='outlined'
                                            value={platformGatewayBaseUrl}
                                            disabled={isReadOnly}
                                            onChange={
                                                handlePlatformBaseUrlChange
                                            }
                                            error={hasErrors(
                                                'platformGatewayBaseUrl',
                                                platformGatewayBaseUrl,
                                                validating
                                            )}
                                            helperText={
                                                hasErrors(
                                                    'platformGatewayBaseUrl',
                                                    platformGatewayBaseUrl,
                                                    validating
                                                ) ||
                                                intl.formatMessage({
                                                    id:
                                                        'GatewayEnvironments.AddEditGWEnvironment.form.platform.base.' +
                                                        'url.help',
                                                    defaultMessage:
                                                        'The base URL where your gateway will be accessible',
                                                })
                                            }
                                        />
                                    )}
                                </Box>
                            </Grid>
                        </>
                    )}

                    {!isWSO2CreateMode && (
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
                                    id='gatewayEnvironment-type'
                                >
                                    <FormattedMessage
                                        id='GatewayEnvironments.AddEditGWEnvironment.GatewayEnvironment.type'
                                        defaultMessage='Gateway Environment Type'
                                    />
                                </Typography>
                                <Typography
                                    color='inherit'
                                    variant='caption'
                                    component='p'
                                    id='AddEditGWEnvironment.External.GatewayEnvironment.description.container'
                                >
                                    <FormattedMessage
                                        id={
                                            'GatewayEnvironments.AddEditGWEnvironment.External.GatewayEnvironment' +
                                            '.general.details.description'
                                        }
                                        defaultMessage='Gateway vendor'
                                    />
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={12} lg={9}>
                                <Box component='div' m={1}>
                                    <FormControl
                                        variant='outlined'
                                        fullWidth
                                        error={hasErrors(
                                            'type',
                                            type,
                                            validating
                                        )}
                                    >
                                        <InputLabel
                                            sx={{ position: 'relative' }}
                                        >
                                            <FormattedMessage
                                                defaultMessage='Gateway Environment Type'
                                                id='Admin.GatewayEnvironment.form.type'
                                            />
                                            <StyledSpan>*</StyledSpan>
                                        </InputLabel>
                                        <Select
                                            variant='outlined'
                                            id='Admin.GatewayEnvironment.form.type.select'
                                            name='gatewayType'
                                            value={gatewayType}
                                            disabled={
                                                !!id ||
                                                isReadOnly ||
                                                shouldLockGatewayTypeSelection
                                            }
                                            onChange={onChange}
                                            data-testid='gateway-environment-type-select'
                                        >
                                            {filteredGatewayTypes.map(
                                                (item) => (
                                                    <MenuItem
                                                        key={item}
                                                        value={item}
                                                    >
                                                        {getDisplayName(item)}
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                        <FormHelperText>
                                            {hasErrors(
                                                'gatewayType',
                                                type,
                                                validating
                                            ) || (
                                                <FormattedMessage
                                                    defaultMessage='Select Gateway Environment Type'
                                                    id='GatewayEnvironments.AddEditGWEnvironment.form.type.help'
                                                />
                                            )}
                                        </FormHelperText>
                                    </FormControl>
                                </Box>
                            </Grid>
                        </>
                    )}
                    {showFormDetails && (
                        <>
                            {!isUniversalGatewayCreate && (
                                <>
                                    <Grid item xs={12}>
                                        <Box marginTop={2} marginBottom={2}>
                                            <StyledHr />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={3}>
                                        <Box
                                            display='flex'
                                            flexDirection='row'
                                            alignItems='center'
                                        >
                                            <Box flex='1'>
                                                <Typography
                                                    color='inherit'
                                                    variant='subtitle2'
                                                    component='div'
                                                >
                                                    <FormattedMessage
                                                        id='GatewayEnvironments.AddEditGWEnvironment.mode'
                                                        defaultMessage='Gateway Mode'
                                                    />
                                                </Typography>
                                                <Typography
                                                    color='inherit'
                                                    variant='caption'
                                                    component='p'
                                                >
                                                    <FormattedMessage
                                                        id='GatewayEnvironments.AddEditGWEnvironment.mode.description'
                                                        defaultMessage='Deployability or discoverabilty of APIs'
                                                    />
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={9}>
                                        <FormControl
                                            variant='outlined'
                                            fullWidth
                                        >
                                            <InputLabel id='demo-simple-select-label'>
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditGWEnvironment.form.mode.label'
                                                    defaultMessage='Mode'
                                                />
                                            </InputLabel>
                                            <Select
                                                labelId='demo-simple-select-label'
                                                id='demo-simple-select'
                                                name='gatewayMode'
                                                value={gatewayMode}
                                                label={
                                                    <FormattedMessage
                                                        id={
                                                            'GatewayEnvironments.AddEditGWEnvironment.form.mode.select' +
                                                            '.label'
                                                        }
                                                        defaultMessage='Mode'
                                                    />
                                                }
                                                onChange={onChange}
                                                disabled={editMode}
                                            >
                                                {supportedModes?.length > 0 &&
                                                    supportedModes.map(
                                                        (item) => (
                                                            <MenuItem
                                                                key={item}
                                                                value={item}
                                                            >
                                                                <Box
                                                                    display='flex'
                                                                    flexDirection='column'
                                                                >
                                                                    <Typography
                                                                        color='inherit'
                                                                        variant='subtitle3'
                                                                        component='div'
                                                                        id={
                                                                            'GatewayEnvironments.AddEditGWEnvironment.' +
                                                                            'mode.select.heading'
                                                                        }
                                                                    >
                                                                        {GW_MODE_METADATA[
                                                                            item
                                                                        ]
                                                                            ?.displayName ||
                                                                            item}
                                                                    </Typography>
                                                                    <Typography
                                                                        color='inherit'
                                                                        variant='caption'
                                                                        component='p'
                                                                        id={
                                                                            'GatewayEnvironments.AddEditGWEnvironment.' +
                                                                            'mode.select.helper'
                                                                        }
                                                                    >
                                                                        {GW_MODE_METADATA[
                                                                            item
                                                                        ]
                                                                            ?.helperText ||
                                                                            item}
                                                                    </Typography>
                                                                </Box>
                                                            </MenuItem>
                                                        )
                                                    )}
                                            </Select>
                                            <FormHelperText>
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditGWEnvironment.form.mode.helper.text'
                                                    defaultMessage='Select the deployability or discoverability of APIs'
                                                />
                                            </FormHelperText>
                                        </FormControl>
                                        {(gatewayMode === 'READ_ONLY' ||
                                            gatewayMode === 'READ_WRITE') && (
                                            <Box
                                                display='flex'
                                                flexDirection='row'
                                            >
                                                <TextField
                                                    margin='dense'
                                                    name='scheduledInterval'
                                                    value={scheduledInterval}
                                                    onChange={onChange}
                                                    disabled={isReadOnly}
                                                    type='number'
                                                    label={
                                                        <FormattedMessage
                                                            id='GatewayEnvironments.AddEditGWEnvironment.form.mode
                                                                .scheduled.interval'
                                                            defaultMessage='API Discovery Scheduling Interval'
                                                        />
                                                    }
                                                    required
                                                    error={hasErrors(
                                                        'scheduledInterval',
                                                        state.scheduledInterval,
                                                        validating
                                                    )}
                                                    helperText={
                                                        hasErrors(
                                                            'scheduledInterval',
                                                            state.scheduledInterval,
                                                            validating
                                                        ) ||
                                                        intl.formatMessage({
                                                            id:
                                                                'GatewayEnvironments.AddEditGWEnvironment.form.' +
                                                                'mode.scheduledInterval.help',
                                                            defaultMessage:
                                                                'Provide interval in minutes for ' +
                                                                'scheduling API discovery',
                                                        })
                                                    }
                                                    sx={{ width: 350, mt: 3 }}
                                                    variant='outlined'
                                                />
                                            </Box>
                                        )}
                                    </Grid>
                                    {gatewayConfigurations &&
                                        gatewayConfigurations.length > 0 && (
                                            <>
                                                <Grid item xs={12}>
                                                    <Box
                                                        marginTop={2}
                                                        marginBottom={2}
                                                    >
                                                        <StyledHr />
                                                    </Box>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={12}
                                                    md={12}
                                                    lg={3}
                                                >
                                                    <Typography
                                                        color='inherit'
                                                        variant='subtitle2'
                                                        component='div'
                                                        id={
                                                            'GatewayEnvironments.AddEditGWEnvironment.connector' +
                                                            '.configurations.header'
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'GatewayEnvironments.AddEditGWEnvironment.connector' +
                                                                '.configurations'
                                                            }
                                                            defaultMessage='Gateway Connector Configurations'
                                                        />
                                                    </Typography>
                                                    <Typography
                                                        color='inherit'
                                                        variant='caption'
                                                        component='p'
                                                        id={
                                                            'GatewayEnvironments.AddEditGWEnvironment.connector' +
                                                            '.configurations.body'
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'GatewayEnvironments.AddEditGWEnvironment.connector' +
                                                                '.configurations.description'
                                                            }
                                                            defaultMessage={
                                                                'Provide connection params for the selected ' +
                                                                'Gateway Environment.'
                                                            }
                                                        />
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={12}
                                                    md={12}
                                                    lg={9}
                                                >
                                                    <Box component='div' m={1}>
                                                        <GatewayConfiguration
                                                            gatewayConfigurations={
                                                                gatewayConfigurations
                                                            }
                                                            additionalProperties={cloneDeep(
                                                                additionalProperties
                                                            )}
                                                            setAdditionalProperties={
                                                                setAdditionalProperties
                                                            }
                                                            hasErrors={
                                                                hasErrors
                                                            }
                                                            validating={
                                                                validating
                                                            }
                                                            gatewayId={cloneDeep(
                                                                id
                                                            )}
                                                            isReadOnly={
                                                                isReadOnly
                                                            }
                                                        />
                                                    </Box>
                                                </Grid>
                                            </>
                                        )}
                                    <Grid item xs={12}>
                                        <Box marginTop={2} marginBottom={2}>
                                            <StyledHr />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={3}>
                                        <Box
                                            display='flex'
                                            flexDirection='row'
                                            alignItems='center'
                                        >
                                            <Box flex='1'>
                                                <Typography
                                                    color='inherit'
                                                    variant='subtitle2'
                                                    component='div'
                                                >
                                                    <FormattedMessage
                                                        id='GatewayEnvironment.type'
                                                        defaultMessage='Key Type'
                                                    />
                                                </Typography>
                                                <Typography
                                                    color='inherit'
                                                    variant='caption'
                                                    component='p'
                                                >
                                                    <FormattedMessage
                                                        id='GatewayEnvironments.AddEditGWEnvironment.type.description'
                                                        defaultMessage='Key type supported by the Gateway Environment'
                                                    />
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={9}>
                                        <FormControl
                                            variant='outlined'
                                            fullWidth
                                        >
                                            <InputLabel id='demo-simple-select-label'>
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditGWEnvironment.form.type.label'
                                                    defaultMessage='Type'
                                                />
                                            </InputLabel>
                                            <Select
                                                labelId='demo-simple-select-label'
                                                id='demo-simple-select'
                                                value={type}
                                                name='type'
                                                label={
                                                    <FormattedMessage
                                                        id='GatewayEnvironments.AddEditGWEnvironment.form.type.label'
                                                        defaultMessage='Type'
                                                    />
                                                }
                                                onChange={onChange}
                                                disabled={editMode}
                                            >
                                                <MenuItem value='hybrid'>
                                                    <FormattedMessage
                                                        id={
                                                            'GatewayEnvironments.AddEditGWEnvironment.form.type.' +
                                                            'hybrid.option'
                                                        }
                                                        defaultMessage='Hybrid'
                                                    />
                                                </MenuItem>
                                                <MenuItem value='production'>
                                                    <FormattedMessage
                                                        id={
                                                            'GatewayEnvironments.AddEditGWEnvironment.form.type.' +
                                                            'prod.option'
                                                        }
                                                        defaultMessage='Production'
                                                    />
                                                </MenuItem>
                                                <MenuItem value='sandbox'>
                                                    <FormattedMessage
                                                        id={
                                                            'GatewayEnvironments.AddEditGWEnvironment.form.type.' +
                                                            'sandbox.option'
                                                        }
                                                        defaultMessage='Sandbox'
                                                    />
                                                </MenuItem>
                                            </Select>
                                            <FormHelperText>
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditGWEnvironment.form.type.helper.text'
                                                    defaultMessage='Supported Key Type of the Gateway Environment'
                                                />
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12}>
                                <Box marginTop={2} marginBottom={2}>
                                    <StyledHr />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={12} lg={3}>
                                <Box
                                    display='flex'
                                    flexDirection='row'
                                    alignItems='center'
                                >
                                    <Box flex='1'>
                                        <Typography
                                            color='inherit'
                                            variant='subtitle2'
                                            component='div'
                                        >
                                            <FormattedMessage
                                                id='GatewayEnvironment.visibility'
                                                defaultMessage='Visibility'
                                            />
                                        </Typography>
                                        <Typography
                                            color='inherit'
                                            variant='caption'
                                            component='p'
                                        >
                                            <FormattedMessage
                                                id={
                                                    'GatewayEnvironments.' +
                                                    'AddEditGWEnvironment.form.visibility.helper.text'
                                                }
                                                defaultMessage='Visibility of the Gateway Environment'
                                            />
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={12} lg={9}>
                                <Box component='div' m={1}>
                                    <FormControl variant='outlined' fullWidth>
                                        <InputLabel
                                            id='demo-simple-select-label'
                                            sx={{ position: 'relative' }}
                                        >
                                            <FormattedMessage
                                                id='GatewayEnvironments.AddEditGWEnvironment.form.visibility'
                                                defaultMessage='Visibility'
                                            />
                                        </InputLabel>
                                        <Select
                                            labelId='demo-simple-select-label'
                                            id='demo-simple-select'
                                            value={permissionType}
                                            name='GatewayPermissionRestrict'
                                            label={
                                                <FormattedMessage
                                                    id='GatewayEnvironments.AddEditGWEnvironment.form.visibility.select'
                                                    defaultMessage='Visibility'
                                                />
                                            }
                                            onChange={onChange}
                                            disabled={isReadOnly}
                                        >
                                            <MenuItem
                                                key='PUBLIC'
                                                value='PUBLIC'
                                            >
                                                <FormattedMessage
                                                    id={
                                                        'GatewayEnvironments.AddEditGWEnvironment.form.visibility.' +
                                                        'public.option'
                                                    }
                                                    defaultMessage='Public'
                                                />
                                            </MenuItem>
                                            <MenuItem
                                                key='Restricted'
                                                value='ALLOW'
                                            >
                                                <FormattedMessage
                                                    id={
                                                        'GatewayEnvironments.AddEditGWEnvironment.form.visibility.' +
                                                        'allow.option'
                                                    }
                                                    defaultMessage='Allow for role(s)'
                                                />
                                            </MenuItem>
                                            <MenuItem
                                                key='Restricted'
                                                value='DENY'
                                            >
                                                <FormattedMessage
                                                    id={
                                                        'GatewayEnvironments.AddEditGWEnvironment.form.visibility.' +
                                                        'deny.option'
                                                    }
                                                    defaultMessage='Deny for role(s)'
                                                />
                                            </MenuItem>
                                        </Select>
                                        <FormHelperText>
                                            <FormattedMessage
                                                id={
                                                    'GatewayEnvironments.AddEditGWEnvironment.form.visibility.' +
                                                    'helper.text'
                                                }
                                                defaultMessage='Visibility of the Gateway Environment'
                                            />
                                        </FormHelperText>
                                        <Box component='div' m={1}>
                                            {(permissionType === 'ALLOW' ||
                                                permissionType === 'DENY') && (
                                                <Box
                                                    display='flex'
                                                    flexDirection='row'
                                                    alignItems='center'
                                                    className={classes.roleContainer}
                                                >
                                                    <MuiChipsInput
                                                        fullWidth
                                                        label='Roles'
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        name='GatewayEnvironmentPermissions'
                                                        variant='outlined'
                                                        value={roles.concat(
                                                            validRoles,
                                                            invalidRoles
                                                        )}
                                                        alwaysShowPlaceholder={
                                                            false
                                                        }
                                                        placeholder='Enter roles and press Enter'
                                                        disabled={isReadOnly}
                                                        blurBehavior='clear'
                                                        data-testid='gateway-permission-roles'
                                                        InputProps={{
                                                            endAdornment:
                                                                        !roleValidity && (
                                                                            <InputAdornment
                                                                                position='end'
                                                                                className={classes.roleErrorAdornment}
                                                                            >
                                                                                <Error color='error' />
                                                                            </InputAdornment>
                                                                ),
                                                        }}
                                                        onAddChip={
                                                            handleRoleAddition
                                                        }
                                                        renderChip={(
                                                            ChipComponent,
                                                            key,
                                                            ChipProps
                                                        ) => (
                                                            <ChipComponent
                                                                key={
                                                                    ChipProps.label
                                                                }
                                                                label={
                                                                    ChipProps.label
                                                                }
                                                                onDelete={() =>
                                                                    handleRoleDeletion(
                                                                        ChipProps.label
                                                                    )
                                                                }
                                                                data-testid={
                                                                    ChipProps.label
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        invalidRoles.includes(
                                                                            ChipProps.label
                                                                        )
                                                                            ? red[300]
                                                                            : null,
                                                                    margin: '8px 8px 8px 0',
                                                                    float: 'left',
                                                                }}
                                                            />
                                                        )}
                                                        error={!roleValidity}
                                                        helperText={
                                                            !roleValidity ? (
                                                                <FormattedMessage
                                                                    id={
                                                                        'Gateway.AddEditGWEnvironment.permission.' +
                                                                        'Invalid'
                                                                    }
                                                                    defaultMessage='Invalid Role(s) Found'
                                                                />
                                                            ) : (
                                                                [
                                                                    permissionType ===
                                                                    'ALLOW' ? (
                                                                        <FormattedMessage
                                                                            id={
                                                                                'Gateway.AddEditGWEnvironment' +
                                                                                '.permission.allowed'
                                                                            }
                                                                            defaultMessage={
                                                                                'Use of this Gateway ' +
                                                                                'Environment is "Allowed" for ' +
                                                                                'above roles.'
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <FormattedMessage
                                                                            id={
                                                                                'Gateway.AddEditGWEnvironment' +
                                                                                '.permission.denied'
                                                                            }
                                                                            defaultMessage={
                                                                                'Use of this Gateway ' +
                                                                                'Environment is "Denied" for ' +
                                                                                'above roles.'
                                                                            }
                                                                        />
                                                                    ),
                                                                    ' ',
                                                                    <FormattedMessage
                                                                        id={
                                                                            'Gateway.AddEditGWEnvironment.permission.' +
                                                                            'help'
                                                                        }
                                                                        defaultMessage={
                                                                            'Enter a valid role and ' +
                                                                            'press `Enter`'
                                                                        }
                                                                    />,
                                                                ]
                                                            )
                                                        }
                                                    />
                                                </Box>
                                            )}
                                        </Box>
                                    </FormControl>
                                </Box>
                            </Grid>
                            {!isUniversalGatewayCreate && (
                                <>
                                    <Grid item xs={12}>
                                        <Box marginTop={2} marginBottom={2}>
                                            <StyledHr />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={3}>
                                        <Box
                                            display='flex'
                                            flexDirection='row'
                                            alignItems='center'
                                        >
                                            <Box flex='1'>
                                                <Typography
                                                    color='inherit'
                                                    variant='subtitle2'
                                                    component='div'
                                                >
                                                    <FormattedMessage
                                                        id='GatewayEnvironment.vhosts'
                                                        defaultMessage='Vhosts'
                                                    />
                                                </Typography>
                                                <Typography
                                                    color='inherit'
                                                    variant='caption'
                                                    component='p'
                                                >
                                                    <FormattedMessage
                                                        id={
                                                            'GatewayEnvironments.AddEditGWEnvironment.visibility.' +
                                                            'add.description'
                                                        }
                                                        defaultMessage='Configure vhosts'
                                                    />
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={9}>
                                        <Box component='div' m={1}>
                                            <AddEditVhost
                                                initialVhosts={vhosts}
                                                onVhostChange={onChange}
                                                gatewayType={gatewayType}
                                                isEditMode={editMode}
                                                isReadOnly={isReadOnly}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box marginTop={2} marginBottom={2}>
                                            <StyledHr />
                                        </Box>
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12} mb={2}>
                                <Box component='span' m={1}>
                                    <Button
                                        id='gateway-add'
                                        variant='contained'
                                        color='primary'
                                        onClick={formSaveCallback}
                                        disabled={
                                            hasFormErrors ||
                                            !roleValidity ||
                                            isReadOnly ||
                                            saving
                                        }
                                        data-testid='form-dialog-base-save-btn'
                                    >
                                        {saving ? (
                                            <CircularProgress size={16} />
                                        ) : (
                                            <>
                                                {id ? (
                                                    <FormattedMessage
                                                        id='GatewayEnvironments.AddEditGWEnvironment.form.update.btn'
                                                        defaultMessage='Update'
                                                    />
                                                ) : (
                                                    <FormattedMessage
                                                        id='GatewayEnvironments.AddEditGWEnvironment.form.add'
                                                        defaultMessage='Add'
                                                    />
                                                )}
                                            </>
                                        )}
                                    </Button>
                                </Box>
                                <RouterLink to='/settings/environments'>
                                    <Button variant='outlined'>
                                        <FormattedMessage
                                            id='GatewayEnvironments.AddEditGWEnvironment.form.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </RouterLink>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Box>
        </StyledContentBase>
    );
}

AddEditGWEnvironment.defaultProps = {
    dataRow: null,
};

AddEditGWEnvironment.propTypes = {
    dataRow: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        isReadOnly: PropTypes.bool.isRequired,
        permissions: PropTypes.shape({
            roles: PropTypes.arrayOf(PropTypes.string),
            permissionType: PropTypes.string,
        }),
        vhosts: PropTypes.shape([]),
    }),
    triggerButtonText: PropTypes.shape({}).isRequired,
    title: PropTypes.shape({}).isRequired,
};

export default AddEditGWEnvironment;
