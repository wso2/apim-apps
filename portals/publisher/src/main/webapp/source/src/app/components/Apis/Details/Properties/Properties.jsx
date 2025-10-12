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
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint-disable react/jsx-no-bind */

import React, { useState, useContext, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Link, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import isEmpty from 'lodash.isempty';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import AddCircle from '@mui/icons-material/AddCircle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { FormattedMessage, injectIntl } from 'react-intl';
import CustomSplitButton from 'AppComponents/Shared/CustomSplitButton';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import APIContext, { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api.js';
import MCPServer from 'AppData/MCPServer';
import { doRedirectToLogin } from 'AppComponents/Shared/RedirectToLogin';
import { isRestricted } from 'AppData/AuthManager';
import Alert from 'AppComponents/Shared/Alert';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import Progress from 'AppComponents/Shared/Progress';
import { getBasePath, getTypeToDisplay } from 'AppComponents/Shared/Utils';
import EditableRow from './EditableRow';

const PREFIX = 'Properties';

const classes = {
    root: `${PREFIX}-root`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    FormControl: `${PREFIX}-FormControl`,
    FormControlOdd: `${PREFIX}-FormControlOdd`,
    buttonWrapper: `${PREFIX}-buttonWrapper`,
    paperRoot: `${PREFIX}-paperRoot`,
    addNewHeader: `${PREFIX}-addNewHeader`,
    addNewOther: `${PREFIX}-addNewOther`,
    addNewWrapper: `${PREFIX}-addNewWrapper`,
    addProperty: `${PREFIX}-addProperty`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    link: `${PREFIX}-link`,
    messageBox: `${PREFIX}-messageBox`,
    actions: `${PREFIX}-actions`,
    head: `${PREFIX}-head`,
    marginRight: `${PREFIX}-marginRight`,
    helpText: `${PREFIX}-helpText`,
    checkBoxStyles: `${PREFIX}-checkBoxStyles`,
    tableHead: `${PREFIX}-tableHead`,
    table: `${PREFIX}-table`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        paddingTop: 0,
        paddingLeft: 0,
        maxWidth: theme.custom.contentAreaWidth,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.FormControl}`]: {
        padding: 0,
        width: '100%',
        marginTop: 0,
        display: 'flex',
        flexDirection: 'row',
    },

    [`& .${classes.FormControlOdd}`]: {
        padding: 0,
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        marginTop: 0,
    },

    [`& .${classes.buttonWrapper}`]: {
        paddingTop: theme.spacing(3),
    },

    [`& .${classes.paperRoot}`]: {
        padding: theme.spacing(3),
        marginTop: theme.spacing(3),
    },

    [`& .${classes.addNewHeader}`]: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey['300'],
        fontSize: theme.typography.h6.fontSize,
        color: theme.typography.h6.color,
        fontWeight: theme.typography.h6.fontWeight,
    },

    [`& .${classes.addNewOther}`]: {
        padding: theme.spacing(2),
    },

    [`& .${classes.addNewWrapper}`]: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.palette.background.paper),
        border: 'solid 1px ' + theme.palette.grey['300'],
        borderRadius: theme.shape.borderRadius,
        marginTop: theme.spacing(2),
    },

    [`& .${classes.addProperty}`]: {
        marginRight: theme.spacing(2),
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.link}`]: {
        cursor: 'pointer',
    },

    [`& .${classes.messageBox}`]: {
        marginTop: 20,
    },

    [`& .${classes.actions}`]: {
        padding: '20px 0',
        '& button': {
            marginLeft: 0,
        },
    },

    [`& .${classes.head}`]: {
        fontWeight: 200,
        marginBottom: 20,
    },

    [`& .${classes.marginRight}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.helpText}`]: {
        paddingTop: theme.spacing(1),
    },

    [`& .${classes.checkBoxStyles}`]: {
        whiteSpace: 'nowrap',
        marginLeft: 10,
    },

    [`& .${classes.tableHead}`]: {
        fontWeight: 600,
    },

    [`& .${classes.table}`]: {
        '& th': {
            fontWeight: 600,
        },
    }
}));

/**
 *
 *
 * @class Properties
 * @extends {React.Component}
 */
function Properties(props) {
    /**
     * @inheritdoc
     * @param {*} props properties
     */
    const { intl } = props;

    const history = useHistory();
    const { api, updateAPI } = useContext(APIContext);
    // For MCP servers, use additionalPropertiesMap; for APIs, use additionalProperties
    let customPropertiesTemp;
    if (api.isMCPServer()) {
        customPropertiesTemp = api.additionalPropertiesMap ? Object.values(api.additionalPropertiesMap) : [];
    } else {
        customPropertiesTemp = cloneDeep(api.additionalProperties);
    }
    const { settings } = useAppContext();
    const [customProperties, setCustomProperties] = useState([]);
    const [additionalProperties, setAdditionalProperties] = useState([]);
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [propertyKey, setPropertyKey] = useState(null);
    const [propertyValue, setPropertyValue] = useState(null);
    // For MCP servers, use additionalPropertiesMap; for APIs, use additionalProperties  
    let initialCustomPropertyValue;
    if (api.isMCPServer()) {
        initialCustomPropertyValue = api.additionalPropertiesMap ? Object.values(api.additionalPropertiesMap) : [];
    } else {
        initialCustomPropertyValue = cloneDeep(api.additionalProperties);
    }
    const [customPropertyValue, setCustomPropertyValue] = useState(initialCustomPropertyValue);
    const [isUpdating, setUpdating] = useState(false);
    const [editing, setEditing] = useState(false);
    const [isAdditionalPropertiesStale, setIsAdditionalPropertiesStale] = useState(false);
    const [isVisibleInStore, setIsVisibleInStore] = useState(false);
    const [loading, setLoading] = useState(true);
    const iff = (condition, then, otherwise) => (condition ? then : otherwise);

    const getCreateOrPublishScopes = () => {
        if (api.apiType && api.apiType.toUpperCase() === MCPServer.CONSTS.MCP) {
            return ['apim:mcp_server_create', 'apim:mcp_server_manage', 'apim:mcp_server_publish'];
        } else {
            return ['apim:api_create', 'apim:api_publish'];
        }
    };
    const isCreateOrPublishRestricted = () => isRestricted(getCreateOrPublishScopes(), api);

    const keywords = ['provider', 'version', 'context', 'status', 'description',
        'subcontext', 'doc', 'lcstate', 'name', 'tags'];

    const toggleAddProperty = () => {
        setShowAddProperty(!showAddProperty);
    };
    const handleChange = (name) => (event) => {
        const { value } = event.target;
        if (name === 'propertyKey') {
            setPropertyKey(value);
        } else if (name === 'propertyValue') {
            setPropertyValue(value);
        }
    };
    const handleCustomPropertyValueChange = (name, value) => {
        setCustomPropertyValue((prevData) => {
            const existingData = prevData.find((data) => data.name === name);
            if (existingData) {
                return prevData.map((data) => (data.name === name ? { ...data, value } : data));
            }
            return [...prevData, { name, value }];
        });
    };

    const getDefaultCustomProperties = () => {
        api.getSettings().then((setting) => {
            if (setting.customProperties != null) {
                setCustomProperties(setting.customProperties);
            }
            
            // For MCP servers, work with additionalPropertiesMap data; for APIs, use additionalProperties
            let additionalPropertiesTemp;
            if (api.isMCPServer()) {
                // Convert additionalPropertiesMap values to array format for UI consistency
                additionalPropertiesTemp = customPropertiesTemp.filter(
                    (additionalProp) =>
                        !setting.customProperties.some((customProp) => customProp.Name === additionalProp.name)
                );
            } else {
                additionalPropertiesTemp = customPropertiesTemp.filter(
                    (additionalProp) =>
                        !setting.customProperties.some((customProp) => customProp.Name === additionalProp.name)
                );
            }
            
            // Remove special properties for both API and MCP Server
            if (Object.prototype.hasOwnProperty.call(additionalPropertiesTemp, 'github_repo')) {
                delete additionalPropertiesTemp.github_repo;
            }
            if (Object.prototype.hasOwnProperty.call(additionalPropertiesTemp, 'slack_url')) {
                delete additionalPropertiesTemp.slack_url;
            }
            setAdditionalProperties(additionalPropertiesTemp);
            setLoading(false);
        });
    };

    useEffect(() => {
        getDefaultCustomProperties();
    }, [api.id]);



    /**
     *
     *
     * @param {*} itemValue
     * @returns
     * @memberof Properties
     */
    const validateEmpty = function (itemValue) {
        if (itemValue === null) {
            return false;
        } else if (!isVisibleInStore && itemValue === '') {
            return true;
        } else {
            return false;
        }
    };

    const isKeyword = (itemValue) => {
        if (itemValue === null) {
            return false;
        }
        return keywords.includes(itemValue.toLowerCase()) || customProperties.some((property) =>
            property.Name.toLowerCase() === itemValue.toLowerCase()
        )
    };
    const hasWhiteSpace = (itemValue) => {
        if (itemValue === null) {
            return false;
        }
        const whitespaceChars = [' ', '\t', '\n'];
        return Array.from(itemValue).some((char) => whitespaceChars.includes(char));
    };
    /**
     *
     *
     * @param {*} oldAPI
     * @param {*} updateAPI
     * @memberof Properties
     */
    const handleSave = () => {
        setUpdating(true);
        // Handle github_repo and slack_url for both API and MCP Server
        if (Object.prototype.hasOwnProperty.call(additionalProperties, 'github_repo')) {
            if (api.isMCPServer() && api.additionalPropertiesMap && api.additionalPropertiesMap.github_repo) {
                additionalProperties.github_repo = api.additionalPropertiesMap.github_repo.value;
            } else if (!api.isMCPServer() && api.additionalProperties) {
                additionalProperties.github_repo = api.additionalProperties.github_repo;
            }
        }
        if (Object.prototype.hasOwnProperty.call(additionalProperties, 'slack_url')) {
            if (api.isMCPServer() && api.additionalPropertiesMap && api.additionalPropertiesMap.slack_url) {
                additionalProperties.slack_url = api.additionalPropertiesMap.slack_url.value;
            } else if (!api.isMCPServer() && api.additionalProperties) {
                additionalProperties.slack_url = api.additionalProperties.slack_url;
            }
        }
        const additionalPropertiesCopyForMap = cloneDeep(additionalProperties);
        const additionalPropertiesMap = {};
        const updatedAdditionalProperties = [];
        if (customProperties && customProperties.length > 0 && customPropertyValue && customPropertyValue.length > 0) {
            customPropertyValue.map((property) => {
                const matchingProperty = customProperties.find((item) => item.Name === property.name);
                if (matchingProperty) {
                    if (!Object.prototype.hasOwnProperty.call(property, 'display')) {
                        property.display = false;
                    }
                    additionalPropertiesMap[property.name] = property;
                    updatedAdditionalProperties.push(property);
                    return additionalPropertiesMap;
                }
                return additionalPropertiesMap;
            });
        }
        additionalPropertiesCopyForMap.map((property) => {
            additionalPropertiesMap[property.name] = property;
            updatedAdditionalProperties.push(property);
            return additionalPropertiesMap;
        });

        // For MCP Server, use additionalPropertiesMap only; for others, use both
        const updatePayload = api.isMCPServer()
            ? { additionalPropertiesMap }
            : { additionalProperties: updatedAdditionalProperties, additionalPropertiesMap };
        const updatePromise = updateAPI(updatePayload);
        updatePromise
            .then(() => {
                setUpdating(false);
            })
            .catch((error) => {
                setUpdating(false);
                if (process.env.NODE_ENV !== 'production') console.log(error);
                const { status } = error;
                if (status === 401) {
                    doRedirectToLogin();
                }
            });
    };


    const handleSaveAndDeploy = () => {
        setUpdating(true);
        // Handle github_repo and slack_url for both API and MCP Server
        if (Object.prototype.hasOwnProperty.call(additionalProperties, 'github_repo')) {
            if (api.isMCPServer() && api.additionalPropertiesMap && api.additionalPropertiesMap.github_repo) {
                additionalProperties.github_repo = api.additionalPropertiesMap.github_repo.value;
            } else if (!api.isMCPServer() && api.additionalProperties) {
                additionalProperties.github_repo = api.additionalProperties.github_repo;
            }
        }
        if (Object.prototype.hasOwnProperty.call(additionalProperties, 'slack_url')) {
            if (api.isMCPServer() && api.additionalPropertiesMap && api.additionalPropertiesMap.slack_url) {
                additionalProperties.slack_url = api.additionalPropertiesMap.slack_url.value;
            } else if (!api.isMCPServer() && api.additionalProperties) {
                additionalProperties.slack_url = api.additionalProperties.slack_url;
            }
        }
        const additionalPropertiesCopyForMap = cloneDeep(additionalProperties);
        const additionalPropertiesMap = {};
        const updatedAdditionalProperties = [];
        if (customProperties && customProperties.length > 0 && customPropertyValue && customPropertyValue.length > 0) {
            customPropertyValue.map((property) => {
                const matchingProperty = customProperties.find((item) => item.Name === property.name);
                if (matchingProperty) {
                    if (!Object.prototype.hasOwnProperty.call(property, 'display')) {
                        property.display = false;
                    }
                    additionalPropertiesMap[property.name] = property;
                    updatedAdditionalProperties.push(property);
                    return additionalPropertiesMap;
                }
                return additionalPropertiesMap;
            });
        }
        additionalPropertiesCopyForMap.map((property) => {
            additionalPropertiesMap[property.name] = property;
            updatedAdditionalProperties.push(property);
            return additionalPropertiesMap;
        });

        // For MCP Server, use additionalPropertiesMap only; for others, use both
        const updatePayload = api.isMCPServer()
            ? { additionalPropertiesMap }
            : { additionalProperties: updatedAdditionalProperties, additionalPropertiesMap };
        const updatePromise = updateAPI(updatePayload);
        updatePromise
            .then(() => {
                setUpdating(false);
            })
            .catch((error) => {
                setUpdating(false);
                if (process.env.NODE_ENV !== 'production') console.log(error);
                const { status } = error;
                if (status === 401) {
                    doRedirectToLogin();
                }
            })
            .finally(() => history.push({
                pathname: getBasePath(api.apiType) + api.id + '/deployments',
                state: 'deploy',
            }));
    };

    /**
     *
     *
     * @param {*} apiAdditionalProperties
     * @param {*} oldKey
     * @memberof Properties
     */
    const handleDelete = (oldKey) => {
        let additionalPropertiesCopy = cloneDeep(additionalProperties);
        additionalPropertiesCopy = additionalPropertiesCopy.filter((property) => property.name !== oldKey);
        setAdditionalProperties(additionalPropertiesCopy);

        if (additionalPropertiesCopy !== additionalProperties) {
            setIsAdditionalPropertiesStale(true);
        }
        if (additionalPropertiesCopy.length === 0) {
            if (customPropertiesTemp?.length === 0) {
                setIsAdditionalPropertiesStale(false);
            } else {
                setShowAddProperty(true);
            }
        }
    };
    const validateBeforeAdd = (fieldKey, fieldValue, additionalPropertiesCopy, action = 'add', oldKey) => {
        if (additionalPropertiesCopy != null && action === 'add') {
            let valid = true;
            additionalPropertiesCopy.forEach((property) => {
                if (property.name === fieldKey) {
                    Alert.warning(intl.formatMessage({
                        id: 'Apis.Details.Properties.Properties.property.name.exists',
                        defaultMessage: 'Property name already exists',
                    }));
                    valid = false;
                }
            });
            return valid;
        } else if (additionalPropertiesCopy != null && action === 'update' && oldKey === fieldKey) {
            let valid = true;
            additionalPropertiesCopy.forEach((property) => {
                if (property.name === fieldKey) {
                    Alert.warning(intl.formatMessage({
                        id: 'Apis.Details.Properties.Properties.property.name.exists',
                        defaultMessage: 'Property name already exists',
                    }));
                    valid = false;
                }
            });
            return valid;
        } else if (validateEmpty(fieldKey) || validateEmpty(fieldValue)) {
            Alert.warning(intl.formatMessage({
                id: 'Apis.Details.Properties.Properties.property.name.empty.error',
                defaultMessage: 'Property name/value can not be empty',
            }));
            return false;
        } else if (isKeyword(fieldKey)) {
            Alert.warning(intl.formatMessage({
                id: 'Apis.Details.Properties.Properties.property.name.keyword.error',
                defaultMessage:
                    'Property name can not be a system reserved keyword',
            }));
            return false;
        } else if (hasWhiteSpace(fieldKey)) {
            Alert.warning(intl.formatMessage({
                id:
                    `Apis.Details.Properties.Properties.property.name.has.whitespaces`,
                defaultMessage:
                    'Property name can not have any whitespaces in it',
            }));
            return false;
        } else {
            return true;
        }
    };
    /**
     *
     *
     * @param {*} apiAdditionalProperties
     * @param {*} oldRow
     * @param {*} newRow
     * @memberof Properties
     */
    const handleUpdateList = (oldRow, newRow) => {
        const additionalPropertiesCopy = cloneDeep(additionalProperties);

        const { oldKey, oldValue, isDisplayInStore } = oldRow;
        const { newKey, newValue, display } = newRow;
        if (oldKey === newKey && oldValue === newValue && isDisplayInStore === display) {
            Alert.warning(intl.formatMessage({
                id: 'Apis.Details.Properties.Properties.no.changes.to.save',
                defaultMessage: 'No changes to save',
            }));
            return false;
        }
        if (!validateBeforeAdd(newKey, newValue, additionalPropertiesCopy, 'update')) {
            return false;
        }

        const newProperty = {
            name: newKey,
            value: newValue,
            display,
        };
        let newPropertiesList = additionalPropertiesCopy.map((property) => {
            if (property.name === newKey) {
                return newProperty;
            }
            return property;
        });
        if (oldKey !== newKey) {
            newPropertiesList = newPropertiesList.filter((property) => property.name !== oldKey);
            newPropertiesList = [...newPropertiesList, newProperty];
        }
        setAdditionalProperties(newPropertiesList);
        return true;
    };
    /**
     *
     *
     * @param {*} apiAdditionalProperties
     * @memberof Properties
     */
    const handleAddToList = () => {
        const additionalPropertiesCopy = cloneDeep(additionalProperties);
        if (validateBeforeAdd(propertyKey, propertyValue, additionalPropertiesCopy, 'add')) {
            const newProperty = {
                name: propertyKey,
                value: propertyValue,
                display: isVisibleInStore,
            };
            setAdditionalProperties([...additionalPropertiesCopy, newProperty]);
            setPropertyKey(null);
            setPropertyValue(null);
        }
    };

    /**
     *
     *
     * @memberof Properties
     */
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddToList();
        }
    };

    const handleChangeVisibleInStore = (event) => {
        setIsVisibleInStore(event.target.checked);
    };
    const handleCustomPropChangeVisibleInStore = (name, event) => {
        const { checked } = event.target;
        setCustomPropertyValue((prevData) => {
            const existingData = prevData.find((data) => data.name === name);
            if (existingData) {
                return prevData.map((data) => (data.name === name ? { ...data, display: checked } : data));
            }
            return [...prevData, { name, display: checked }];
        });
    };
    /**
     *
     *
     * @param {*} additionalProperties
     * @param {*} apiAdditionalProperties
     * @returns
     * @memberof Properties
     */
    const renderAdditionalProperties = () => {
        const items = additionalProperties.map((property) => {
            return (
                <EditableRow
                    oldKey={property.name}
                    oldValue={property.value}
                    isDisplayInStore={property.display}
                    handleUpdateList={handleUpdateList}
                    handleDelete={handleDelete}
                    apiAdditionalProperties={additionalProperties}
                    {...props}
                    setEditing={setEditing}
                    isRestricted={isRestricted}
                    api={api}
                    validateEmpty={validateEmpty}
                    isKeyword={isKeyword}
                />
            );
        });
        return items;
    };
    const getKeyValue = () => {
        if (propertyKey === null) {
            return '';
        } else {
            return propertyKey;
        }
    };

    const isCustomPropsFilled = customProperties.every((property) => {
        const dataItem = customPropertyValue.find((data) => data.name === property.Name);
        if (property.Required) {
            return dataItem && dataItem.value !== '';
        }
        return true;
    });

    let renderSaveButton;
    if (customProperties && customProperties.length > 0 && isCustomPropsFilled) {
        renderSaveButton = (
            <CustomSplitButton
                advertiseInfo={api.advertiseInfo}
                api={api}
                handleSave={handleSave}
                handleSaveAndDeploy={handleSaveAndDeploy}
                isUpdating={isUpdating}
            />
        );
    } else if (
        (customProperties && customProperties.length > 0 && !isCustomPropsFilled)
        || editing
        || api.isRevision
        || (settings && settings.portalConfigurationOnlyModeEnabled)
        || (isEmpty(additionalProperties) && !isAdditionalPropertiesStale)
        || isCreateOrPublishRestricted()
    ) {
        renderSaveButton = (
            <Button
                id='save-api-properties'
                data-testid='save-api-properties-btn'
                disabled
                type='submit'
                variant='contained'
                color='primary'
            >
                <FormattedMessage
                    id='Apis.Details.Configuration.Configuration.save'
                    defaultMessage='Save'
                />
            </Button>
        );
    } else {
        renderSaveButton = (
            <CustomSplitButton
                advertiseInfo={api.advertiseInfo}
                api={api}
                handleSave={handleSave}
                handleSaveAndDeploy={handleSaveAndDeploy}
                isUpdating={isUpdating}
            />
        );
    }

    /**
     *
     *
     * @returns
     * @memberof Properties
     */

    if (loading) {
        return (
            <Progress />
        )
    }
    return (
        <Root>
            <div className={classes.titleWrapper}>
                {(() => {
                    if (api.apiType === API.CONSTS.APIProduct) {
                        return (
                            <Typography
                                id='itest-api-details-api-products-properties-head'
                                variant='h4'
                                component='h2'
                                align='left'
                                className={classes.mainTitle}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Properties.Properties.api.product.properties'
                                    defaultMessage='API Product Properties'
                                />
                            </Typography>
                        );
                    }

                    if (api.type === MCPServer.CONSTS.MCP) {
                        return (
                            <Typography
                                id='itest-mcp-server-details-properties-head'
                                variant='h4'
                                component='h2'
                                align='left'
                                className={classes.mainTitle}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Properties.Properties.mcp.server.properties'
                                    defaultMessage='MCP Server Properties'
                                />
                            </Typography>
                        );
                    }

                    return (
                        <Typography
                            id='itest-api-details-api-properties-head'
                            variant='h4'
                            component='h2'
                            align='left'
                            className={classes.mainTitle}
                        >
                            <FormattedMessage
                                id='Apis.Details.Properties.Properties.api.properties'
                                defaultMessage='API Properties'
                            />
                        </Typography>
                    );
                })()}

                {(!isEmpty(additionalProperties) || showAddProperty ||
                    (customProperties && customProperties.length > 0)) && (
                    <Box ml={1}>
                        <Button
                            id='add-new-property'
                            variant='outlined'
                            color='primary'
                            size='small'
                            onClick={toggleAddProperty}
                            disabled={showAddProperty
                                    || isCreateOrPublishRestricted() || api.isRevision
                                    || (settings && settings.portalConfigurationOnlyModeEnabled)}
                        >
                            <AddCircle className={classes.buttonIcon} />
                            <FormattedMessage
                                id='Apis.Details.Properties.Properties.add.new.property'
                                defaultMessage='Add New Property'
                            />
                        </Button>
                    </Box>
                )}
            </div>
            <Typography variant='caption' component='div' className={classes.helpText}>
                {(() => {
                    if (api.type === MCPServer.CONSTS.MCP) {
                        return (
                            <FormattedMessage
                                id='Apis.Details.Properties.Properties.help.main.mcp'
                                defaultMessage={
                                    'Usually, MCP Servers have a pre-defined set of properties such as the name, ' +
                                    'version, context, etc. MCP Server Properties allows you to add specific ' +
                                    'custom properties to the MCP Server.'
                                }
                            />
                        );
                    }
                    return (
                        <FormattedMessage
                            id='Apis.Details.Properties.Properties.help.main.api'
                            defaultMessage={
                                'Usually, APIs have a pre-defined set of properties such as the name, version, ' +
                                'context, etc. API Properties allows you to add specific custom properties to the API.'
                            }
                        />
                    );
                })()}
            </Typography>
            {isEmpty(additionalProperties) && !isAdditionalPropertiesStale && !showAddProperty &&
                customProperties.length === 0 && (
                <div className={classes.messageBox}>
                    <InlineMessage type='info' height={140}>
                        <div className={classes.contentWrapper}>
                            <Typography variant='h5' component='h3' className={classes.head}>
                                <FormattedMessage
                                    id='Apis.Details.Properties.Properties.add.new.property.message.title'
                                    defaultMessage='Create Additional Properties'
                                />
                            </Typography>
                            {(() => {
                                if (api.apiType === API.CONSTS.APIProduct) {
                                    return (
                                        <Typography component='p' className={classes.content}>
                                            <FormattedMessage
                                                id={
                                                    'Apis.Details.Properties.Properties.'
                                                        + 'APIProduct.add.new.property.message.content'
                                                }
                                                defaultMessage=
                                                    'Add specific custom properties to your API Product here.'
                                            />
                                        </Typography>
                                    );
                                }

                                if (api.type === MCPServer.CONSTS.MCP) {
                                    return (
                                        <Typography component='p' className={classes.content}>
                                            <FormattedMessage
                                                id={
                                                    'Apis.Details.Properties.Properties.'
                                                        + 'MCPServer.add.new.property.message.content'
                                                }
                                                defaultMessage='Add specific custom properties to your MCP Server here.'
                                            />
                                        </Typography>
                                    );
                                }

                                return (
                                    <Typography component='p' className={classes.content}>
                                        <FormattedMessage
                                            id='Apis.Details.Properties.Properties.add.new.property.message.content'
                                            defaultMessage='Add specific custom properties to your API here.'
                                        />
                                    </Typography>
                                );
                            })()}
                            <div className={classes.actions}>
                                <Button
                                    id='add-new-property'
                                    variant='outlined'
                                    color='primary'
                                    onClick={toggleAddProperty}
                                    disabled={isCreateOrPublishRestricted()
                                            || api.isRevision
                                            || (settings && settings.portalConfigurationOnlyModeEnabled)}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Properties.Properties.add.new.property'
                                        defaultMessage='Add New Property'
                                    />
                                </Button>
                            </div>
                        </div>
                    </InlineMessage>
                </div>
            )}
            {(!isEmpty(additionalProperties) || showAddProperty || isAdditionalPropertiesStale ||
                customProperties.length > 0) && (
                <Grid container spacing={7}>
                    <Grid item xs={12}>
                        <Paper className={classes.paperRoot}>
                            {customProperties && customProperties.map((property) => (
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            required={property.Required}
                                            id='custom-property-value'
                                            label={intl.formatMessage({
                                                id: 'Apis.Details.Properties.Properties.'
                                                        + 'show.add.property.custom.property.name',
                                                defaultMessage: '{message}',
                                            },
                                            { message: property.Name }
                                            )}
                                            key={property.Name}
                                            margin='dense'
                                            variant='outlined'
                                            className={classes.addProperty}
                                            value={customPropertyValue.find((data) =>
                                                data.name === property.Name)?.value || ''}
                                            onChange={(event) =>
                                                handleCustomPropertyValueChange(property.Name, event.target.value)}
                                            helperText={property.Required &&
                                                    validateEmpty(customPropertyValue.find((data) =>
                                                        data.name === property.Name)?.value)
                                                ? intl.formatMessage({
                                                    id: 'Apis.Details.Properties.Properties.is.mandatory',
                                                    defaultMessage: 'Mandatory fields cannot be empty',
                                                }) : property.Description
                                            }
                                            error={property.Required &&
                                                    validateEmpty(customPropertyValue.find((data) =>
                                                        data.name === property.Name)?.value)}
                                            disabled={isCreateOrPublishRestricted()}
                                        />
                                    </Grid>
                                    <Grid item xs={6} alignItems='center'>
                                        <Box pt={1}>
                                            <FormControlLabel
                                                control={(
                                                    <Checkbox
                                                        checked={customPropertyValue.find((data) =>
                                                            data.name === property.Name)?.display || false}
                                                        onChange={(event) =>
                                                            handleCustomPropChangeVisibleInStore(property.Name, event)}
                                                        name='checkedB'
                                                        color='primary'
                                                    />
                                                )}
                                                label={intl.formatMessage({
                                                    id: `Apis.Details.Properties.Properties.editable.show.in.devporal`,
                                                    defaultMessage: 'Show in devportal',
                                                })}
                                                className={classes.checkBoxStyles}
                                            />
                                        </Box>

                                    </Grid>
                                </Grid>
                            ))}
                            {(
                                (customProperties && customProperties.length > 0) ||
                                (!isEmpty(additionalProperties) || showAddProperty)
                            ) && (
                                <Table className={classes.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <FormattedMessage
                                                    id='Apis.Details.Properties.Properties.add.new.property.table'
                                                    defaultMessage='Property Name'
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormattedMessage
                                                    id='Apis.Details.Properties.Properties.add.new.property.value'
                                                    defaultMessage='Property Value'
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormattedMessage
                                                    id='Apis.Details.Properties.Properties.add.new.property.visibility'
                                                    defaultMessage='Visibility'
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant='srOnly'>
                                                    <FormattedMessage
                                                        id='Apis.Details.Properties.Properties.add.new.property.action'
                                                        defaultMessage='Action'
                                                    />
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {showAddProperty && (
                                            <>
                                                <TableRow>
                                                    <TableCell>
                                                        <TextField
                                                            fullWidth
                                                            required
                                                            id='property-name'
                                                            label={intl.formatMessage({
                                                                id: 'Apis.Details.Properties.Properties.show.add.'
                                                                        + 'property.property.name',
                                                                defaultMessage: 'Name',
                                                            })}
                                                            margin='dense'
                                                            variant='outlined'
                                                            className={classes.addProperty}
                                                            value={getKeyValue()}
                                                            onChange={handleChange('propertyKey')}
                                                            onKeyDown={handleKeyDown('propertyKey')}
                                                            helperText={validateEmpty(propertyKey) ? ''
                                                                : iff((isKeyword(propertyKey)
                                                                    || hasWhiteSpace(propertyKey)), intl.formatMessage({
                                                                    id: 'Apis.Details.Properties.Properties.'
                                                                                + 'show.add.property.invalid.error',
                                                                    defaultMessage: 'Invalid property name',
                                                                }), '')}
                                                            error={validateEmpty(propertyKey) || isKeyword(propertyKey)
                                                                    || hasWhiteSpace(propertyKey)}
                                                            disabled={isCreateOrPublishRestricted()}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            fullWidth
                                                            required
                                                            id='property-value'
                                                            label={intl.formatMessage({
                                                                id: 'Apis.Details.Properties.Properties.property.value',
                                                                defaultMessage: 'Value',
                                                            })}
                                                            margin='dense'
                                                            variant='outlined'
                                                            className={classes.addProperty}
                                                            value={propertyValue === null ? '' : propertyValue}
                                                            onChange={handleChange('propertyValue')}
                                                            onKeyDown={handleKeyDown('propertyValue')}
                                                            error={validateEmpty(propertyValue)}
                                                            disabled={isCreateOrPublishRestricted()}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormControlLabel
                                                            control={(
                                                                <Checkbox
                                                                    checked={isVisibleInStore}
                                                                    onChange={handleChangeVisibleInStore}
                                                                    name='checkedB'
                                                                    color='primary'
                                                                />
                                                            )}
                                                            label={intl.formatMessage({
                                                                id: 'Apis.Details.Properties.'
                                                                        + 'Properties.editable.show.in.devporal',
                                                                defaultMessage: 'Show in devportal',
                                                            })}
                                                            className={classes.checkBoxStyles}
                                                        />
                                                    </TableCell>
                                                    <TableCell align='right'>
                                                        <Box display='flex'>
                                                            <Button
                                                                id='properties-add-btn'
                                                                variant='contained'
                                                                color='primary'
                                                                disabled={
                                                                    !propertyValue
                                                                        || !propertyKey
                                                                        || isCreateOrPublishRestricted()
                                                                }
                                                                onClick={handleAddToList}
                                                                className={classes.marginRight}
                                                            >
                                                                <Typography variant='caption' component='div'>
                                                                    <FormattedMessage
                                                                        id='Apis.Details.Properties.Properties.add'
                                                                        defaultMessage='Add'
                                                                    />
                                                                </Typography>
                                                            </Button>

                                                            <Button onClick={toggleAddProperty}>
                                                                <Typography variant='caption' component='div'>
                                                                    <FormattedMessage
                                                                        id='Apis.Details.Properties.Properties.cancel'
                                                                        defaultMessage='Cancel'
                                                                    />
                                                                </Typography>
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell colSpan={4}>
                                                        <Typography variant='caption'>
                                                            <FormattedMessage
                                                                id='Apis.Details.Properties.Properties.help'
                                                                defaultMessage={
                                                                    'Property name should be unique, should not contain'
                                                                        + ' spaces, cannot be more than 80 chars '
                                                                        + 'and cannot be any of the following '
                                                                        + 'reserved keywords : provider, version, '
                                                                        + 'context, status, description, subcontext, '
                                                                        + 'doc, lcState, name, tags.'
                                                                }
                                                            />
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        )}
                                        {renderAdditionalProperties()}
                                    </TableBody>
                                </Table>
                            )}
                        </Paper>
                        <div className={classes.buttonWrapper}>
                            <Grid
                                container
                                direction='row'
                                alignItems='flex-start'
                                spacing={1}
                                className={classes.buttonSection}
                            >
                                <Grid item id='save-api-properties'>
                                    <div>
                                        {renderSaveButton}
                                    </div>
                                </Grid>
                                <Grid item>
                                    <Button
                                        component={Link}
                                        to={getBasePath(api.apiType) + api.id + '/overview'}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Properties.Properties.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Grid>
                                {isCreateOrPublishRestricted() && (
                                    <Grid item xs={12}>
                                        <Typography variant='body2' color='primary'>
                                            <FormattedMessage
                                                id='Apis.Details.Properties.Properties.update.not.allowed'
                                                defaultMessage='*You are not authorized to update properties of
                                                    the {type} due to insufficient permissions'
                                                values={{
                                                    type: getTypeToDisplay(api.apiType)
                                                }}
                                            />
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </div>
                    </Grid>
                </Grid>
            )}
        </Root>
    );
}

Properties.propTypes = {
    state: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
};
export default withAPI(injectIntl(Properties));
