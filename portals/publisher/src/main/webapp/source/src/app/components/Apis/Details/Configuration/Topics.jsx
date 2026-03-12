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

import React, {
    useReducer, useEffect, useState, useCallback,
} from 'react';
import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import cloneDeep from 'lodash.clonedeep';
import isEmpty from 'lodash/isEmpty';
import Alert from 'AppComponents/Shared/Alert';
import Banner from 'AppComponents/Shared/Banner';
import API from 'AppData/api';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import { isRestricted } from 'AppData/AuthManager';
import AsyncOperation from '../Resources/components/AsyncOperation';
import GroupOfOperations from '../Resources/components/operationComponents/asyncapi/GroupOfOperations';
import AddOperation from '../Resources/components/AddOperation';
import SubscriptionConfig from '../Resources/components/operationComponents/asyncapi/SubscriptionConfig';
import { extractAsyncAPIPathParameters } from '../Resources/operationUtils';
import SaveOperations from '../Resources/components/SaveOperations';
import TopicsOperationsSelector from '../Resources/components/TopicsOperationsSelector';

const verbMap = {
    sub: 'subscribe',
    pub: 'publish',
};

/**
 * This component handles the Resource page in API details though it's written in a sharable way
 * that anyone could use this to render resources in anywhere else if needed.
 *
 * @export
 * @returns {React.Component} @inheritdoc
 */
export default function Topics(props) {
    const {
        disableUpdate,
        disableAddOperation,
        componentValidator,
    } = props;

    const [api, updateAPI] = useAPI();
    const [pageError, setPageError] = useState(false);
    const [sharedScopes, setSharedScopes] = useState();
    const [sharedScopesByName, setSharedScopesByName] = useState();
    const [asyncAPISpec, setAsyncAPISpec] = useState({});
    const [securityDefScopes, setSecurityDefScopes] = useState({});
    const isAsyncAPI = api.type === 'WEBSUB' || api.type === 'WS' || api.type === 'SSE';
    const [markedOperations, setSelectedOperation] = useState({});
    const [isAsyncV3, setIsAsyncV3] = useState(false);

    const intl = useIntl();
    /**
     *
     * @param {*} spec
     * @param {*} ref
     */
    function getRefTarget(spec, ref) {
        const arr = ref.split('/');
        const i = (arr[0] === '#') ? 1 : 0;
        let target = spec;
        for (let j = i; j < arr.length; j++) {
            target = target[arr[j]];
        }
        return target;
    }

    function buildChannelMap(spec) {
        const channelMap = {};
        const channelIndex = {};
        if (spec.channels) {
            Object.entries(spec.channels).forEach(([key, channelObj]) => {
                const address = channelObj.address || `/${key}`;
                channelIndex[`#/channels/${key}`] = address;
                channelIndex[`#/channels/${key.replace(/\//g, '~1')}`] = address;
                channelMap[address] = channelMap[address] || { 
                    parameters: channelObj.parameters || {},
                    ...(channelObj.description && { description: channelObj.description }),
                };
            });
        }
        if (spec.operations) {
            Object.entries(spec.operations).forEach(([opName, opObj]) => {
                const { action } = opObj;
                const channelRef = opObj.channel && opObj.channel.$ref;
                const channelAddress = channelRef ? channelIndex[channelRef] || channelRef : null;
        
                if (!channelAddress) return;
        
                if (!channelMap[channelAddress]) {
                    channelMap[channelAddress] = { parameters: [] };
                }
                if (!channelMap[channelAddress][action]) {
                    channelMap[channelAddress][action] = { 'x-operations': [], 'x-auth-type': 'Any' };
                }
        
                channelMap[channelAddress][action]['x-operations'].push(opName);
        
                if (opObj['x-auth-type']) {
                    channelMap[channelAddress][action]['x-auth-type'] = opObj['x-auth-type'];
                }
                if (opObj['x-uri-mapping']) {
                    channelMap[channelAddress][action]['x-uri-mapping'] = opObj['x-uri-mapping'];
                }
                if (opObj['x-scopes']) {
                    channelMap[channelAddress][action]['x-scopes'] = opObj['x-scopes'];
                }
        
                if (opObj.messages) {
                    const chRef = opObj.channel && opObj.channel.$ref;
                    const chKey = chRef && chRef.replace('#/channels/', '');
                    const channelSpecObj = chKey && spec.channels[chKey];
                
                    if (channelSpecObj && channelSpecObj.messages) {
                        const allProperties = {};
                
                        opObj.messages.forEach((msgRef) => {
                            const msgKey = msgRef.$ref && msgRef.$ref.split('/messages/')[1];
                            if (!msgKey) return;
                
                            const channelMsg = channelSpecObj.messages[msgKey];
                            if (!channelMsg || !channelMsg.$ref) return;
                
                            const componentMsg = getRefTarget(spec, channelMsg.$ref);
                            if (!componentMsg) return;
                
                            let resolvedPayload = componentMsg.payload;
                            if (resolvedPayload && resolvedPayload.$ref) {
                                resolvedPayload = getRefTarget(spec, resolvedPayload.$ref);
                            }
                
                            if (!resolvedPayload || !resolvedPayload.properties) return;
                
                            Object.entries(resolvedPayload.properties).forEach(([propName, propVal]) => {
                                allProperties[propName] = {
                                    ...propVal,
                                    'x-operation': opName,
                                    'x-message': msgKey,
                                };
                            });
                        });
                
                        if (Object.keys(allProperties).length > 0) {
                            const existing = channelMap[channelAddress][action].message;
                            channelMap[channelAddress][action].message = {
                                payload: {
                                    type: 'object',
                                    properties: {
                                        ...(existing?.payload?.properties || {}),
                                        ...allProperties,
                                    },
                                },
                            };
                        }
                    }
                }
            });
        }
        return channelMap;
    }
    
    /**
     * Rebuild the AsyncAPI v3 `operations` object from the UI channel map.
     */
    function rebuildOperations(channelMap, originalSpec) {
        const newOperations = {};
        const newChannels = { ...(originalSpec.channels || {}) };
        const newComponents = { messages: {} };
    
        const addressToName = {};
        if (originalSpec.channels) {
            Object.entries(originalSpec.channels).forEach(([channelName, channelObj]) => {
                addressToName[channelObj.address] = channelName;
            });
        }
    
        Object.entries(channelMap).forEach(([channelAddress, channelObj]) => {
            // Check if any existing channel has this address
            const existingChannelName = addressToName[channelAddress];
    
            // If found, use the existing channel name; otherwise derive from address with random string
            let channelName;
            if (existingChannelName) {
                channelName = existingChannelName;
            } else {
                const baseChannel = channelAddress.replace(/^\//, '').split('/')[0];
                const randomId = Math.random().toString(36).substring(2, 7);
                channelName = `${baseChannel}_${randomId}`;
            }
    
            if (!existingChannelName) {
                // newly added channel 
                const parametersArray = channelObj.parameters || [];
                newChannels[channelName] = {
                    address: channelAddress,
                    ...(Object.keys(parametersArray).length > 0  && { parameters: parametersArray }),
                };
            } else {
                newChannels[existingChannelName] = {
                    ...newChannels[existingChannelName],
                    ...(channelObj.description && { description: channelObj.description }),
                };
            }
    
            ['send', 'receive'].forEach((action) => {
                const verbInfo = channelObj[action];
                if (!verbInfo) return;
                // Build operation entries FIRST so newOperations[opName] exists for message wiring
                (verbInfo['x-operations'] || []).forEach((opName) => {
                    const { messages: _oldMessages, ...restOfOriginal } = originalSpec.operations?.[opName] || {};
                    newOperations[opName] = {
                        ...restOfOriginal,
                        action,
                        channel: { $ref: `#/channels/${channelName}` },
                        'x-auth-type': verbInfo['x-auth-type'],
                        ...(verbInfo['x-uri-mapping'] && { 'x-uri-mapping': verbInfo['x-uri-mapping'] }),
                        ...(verbInfo['x-scopes'] && { 'x-scopes': verbInfo['x-scopes'] }),
                        messages: [],             // start fresh, re-wired below from UI state
                    };
                });
                // Wire payload properties AFTER operations exist
                if (verbInfo.message && verbInfo.message.payload && verbInfo.message.payload.properties) {
                    const byMessage = {};
                    Object.entries(verbInfo.message.payload.properties).forEach(([propName, propVal]) => {
                        const msgName = propVal['x-message'] || propVal['x-operation'] || '__default__';
                        byMessage[msgName] = byMessage[msgName] || { opName: propVal['x-operation'], props: {} };
                        const { 'x-operation': _op, 'x-message': _msg, ...cleanProp } = propVal;
                        byMessage[msgName].props[propName] = cleanProp;
                    });
    
                    Object.entries(byMessage).forEach(([msgName, { opName, props: msgProps }]) => {
                        // add message schema to components.schemas.{msgName}
                        newComponents.schemas = newComponents.schemas || {};
                        newComponents.schemas[msgName] = {
                            type: 'object',
                            properties: msgProps,
                        };
    
                        // refer message schema in components.messages.{msgName}
                        newComponents.messages[msgName] = {
                            payload: { $ref: `#/components/schemas/${msgName}` },
                        };
    
                        // refer message in channels.{channelName}.messages.{msgName} from components
                        newChannels[channelName] = {
                            ...newChannels[channelName],
                            messages: {
                                ...(newChannels[channelName]?.messages || {}),
                                [msgName]: { $ref: `#/components/messages/${msgName}` },
                            },
                        };
    
                        // refer operations.{opName}.messages[] from channels
                        if (opName && opName !== '__default__' && newOperations[opName]) {
                            newOperations[opName].messages = newOperations[opName].messages || [];
                            const ref = { $ref: `#/channels/${channelName}/messages/${msgName}` };
                            if (!newOperations[opName].messages.some((m) => m.$ref === ref.$ref)) {
                                newOperations[opName].messages.push(ref);
                            }
                        }
                    });
                }
            });
        });
        return { newOperations, newChannels, newComponents };
    }

    /**
     *
     * @param {*} spec
     * @param {*} parent
     */
    function resolveSpec(spec, source) {
        if (typeof source === 'object') {
            let o = {};
            Object.entries(source).forEach(([k, v]) => {
                if (v !== null) {
                    if (k !== '$ref') {
                        o[k] = resolveSpec(spec, v);
                    } else {
                        const resolvedRef = resolveSpec(spec, getRefTarget(spec, v));
                        o = { ...o, ...resolvedRef };
                    }
                }
            });
            return o;
        }
        return source;
    }

    /**
     *
     * @param {*} state
     * @param {*} configAction
     */
    function websubSubscriptionConfigReducer(state, configAction) {
        const { action, value } = configAction;
        const nextState = { ...state };
        switch (action) {
            case 'enable':
                nextState.enable = value;
                if (!value) {
                    nextState.secret = '';
                }
                break;
            case 'signingAlgorithm':
            case 'signatureHeader':
            case 'secret':
                nextState[action] = value;
                break;
            default:
                return nextState;
        }
        return nextState;
    }
    const initialWebsubSubscriptionConfig = api.websubSubscriptionConfiguration || {
        enable: false,
        signingAlgorithm: '',
        signatureHeader: '',
        secret: '',
    };

    const [websubSubscriptionConfiguration, websubSubscriptionConfigDispatcher] = useReducer(
        websubSubscriptionConfigReducer, initialWebsubSubscriptionConfig,
    );

    /**
     *
     *
     * @param {*} currenPaths
     * @param {*} action
     */
    function operationsReducer(currentOperations, operationAction) {
        const { action, data } = operationAction;
        const { target, verb, value } = data || {};
        const addedOperations = cloneDeep(currentOperations);
        let updatedOperation;
        if (target) {
            updatedOperation = cloneDeep(currentOperations[target]);
        }

        switch (action) {
            case 'init':
                setSelectedOperation({});
                return data || (isAsyncV3 ? {} : asyncAPISpec.channels);
            case 'toggleSecurityStatus':
                setSelectedOperation({});
                return Object.entries(currentOperations).reduce((channelAcc, [channelKey, channelObj]) => {
                    const newChannel = { ...channelObj };
                    newChannel['x-auth-type'] = data.disable ? 'None' : 'Any';
                    const newChannelAcc = { ...channelAcc };
                    newChannelAcc[channelKey] = newChannel;
                    return newChannelAcc;
                }, {});
            case 'description':
                updatedOperation[action] = value;
                return {
                    ...currentOperations,
                    [target]: { ...currentOperations[target], description: updatedOperation.description },
                };
            case 'uriMapping':
                return {
                    ...currentOperations,
                    [target]: {
                        ...currentOperations[target],
                        [verb]: {
                            ...currentOperations[target][verb],
                            'x-uri-mapping': value,
                        },
                    },
                };
            case 'authType':
                if (isAsyncV3) {
                    return {
                        ...currentOperations,
                        [target]: {
                            ...currentOperations[target],
                            [verb]: {
                                ...currentOperations[target][verb],
                                'x-auth-type': value ? 'Any' : 'None',
                            },
                        },
                    };
                }
                updatedOperation['x-auth-type'] = value ? 'Any' : 'None';
                return {
                    ...currentOperations,
                    [target]: { ...currentOperations[target], 'x-auth-type': updatedOperation['x-auth-type'] },
                };
            case 'add':
                // If target is not there add an empty object
                if (!addedOperations[data.target]) {
                    addedOperations[data.target] = {};
                }
                addedOperations[data.target].parameters = extractAsyncAPIPathParameters(data.target);
                // eslint-disable-next-line no-case-declarations
                let alreadyExistCount = 0;
                for (let currentVerb of data.verbs) {
                    if (isAsyncV3) {
                        const ACTION_ALIASES = { pub: 'send', sub: 'receive' };
                        const normalizedVerb = ACTION_ALIASES[currentVerb.toLowerCase()]
                        || currentVerb.toLowerCase();
                        const opName = data.operationName;
                        if (!addedOperations[data.target][normalizedVerb]) {
                            addedOperations[data.target][normalizedVerb] = {
                                'x-operations': [],
                                'x-auth-type': 'Any',
                            };
                        }
                        const existingOps = addedOperations[data.target][normalizedVerb]['x-operations'];
                        if (opName && existingOps.includes(opName)) {
                            Alert.warning(intl.formatMessage(
                                {
                                    id: 'Apis.Details.Configuration.Topic.already.operation.exist.error',
                                    defaultMessage: 'Operation "{opName}" already exists for {verb} on {channel}',
                                },
                                { opName, verb: normalizedVerb, channel: data.target },
                            ));
                            alreadyExistCount++;
                        } else if (opName) {
                            addedOperations[data.target][normalizedVerb]['x-operations'].push(opName);
                        }
                    } else {
                        currentVerb = verbMap[currentVerb];
                        if (addedOperations[data.target][currentVerb]) {
                            const message = intl.formatMessage(
                                {
                                    id: 'Apis.Details.Configuration.Topic.already.opreation.verb.exist.error',
                                    defaultMessage: 'Operation already exist with {data_target} and {current_Verb}',
                                },
                                { data_target: data.target, current_Verb: currentVerb },
                            );
                            Alert.warning(message);
                            console.warn(message);
                            alreadyExistCount++;
                        } else {
                            addedOperations[data.target][currentVerb] = { };
                        }
                    }
                }
                if (alreadyExistCount === data.verbs.length) {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Configuration.Topic.already.exist.error',
                        defaultMessage: 'Operation(s) already exist!',
                    }));
                    return currentOperations;
                }
                return addedOperations;
            case 'parameter':
                updatedOperation.parameters = updatedOperation.parameters || { };
                updatedOperation.parameters[value.name] = { ...value };
                delete updatedOperation.parameters[value.name].name;
                return {
                    ...currentOperations,
                    [target]: { ...currentOperations[target], parameters: updatedOperation.parameters },
                };
            case 'deleteNamedOperation': {
                const channelCopy = cloneDeep(currentOperations[target]);
                if (channelCopy && channelCopy[verb] && channelCopy[verb]['x-operations']) {
                    channelCopy[verb]['x-operations'] = channelCopy[verb]['x-operations'].filter((n) => n !== value);
                }
                return { ...currentOperations, [target]: channelCopy };
            }
            case 'addPayloadProperty':
                updatedOperation[verb].message = updatedOperation[verb].message || { };
                updatedOperation[verb].message.payload = updatedOperation[verb].message.payload || { };
                updatedOperation[verb].message.payload.type = 'object';
                updatedOperation[verb].message.payload.properties = updatedOperation[verb].message.payload.properties
                    || { };
                updatedOperation[verb].message.payload.properties[value.name] = {
                    description: value.description,
                    type: value.type,
                    ...(isAsyncV3 && {
                        'x-operation': value.operation,
                        'x-message': value.message,
                    }),
                };
                break;
            case 'deletePayloadProperty': {
                const existingProps = updatedOperation[verb]?.message?.payload?.properties || {};
                const { [value]: _removed, ...remainingProps } = existingProps;
                return {
                    ...currentOperations,
                    [target]: {
                        ...currentOperations[target],
                        [verb]: {
                            ...currentOperations[target][verb],
                            message: {
                                ...currentOperations[target][verb]?.message,
                                payload: {
                                    ...currentOperations[target][verb]?.message?.payload,
                                    properties: remainingProps,
                                },
                            },
                        },
                    },
                };
            }
            case 'payloadProperty':
                updatedOperation[verb].message.payload.properties[value.name] = value;
                break;
            case 'scopes': {
                const defValue = value[0];
                updatedOperation[verb]['x-scopes'] = [];
                for (let i = 0; i < defValue.length; i++) {
                    updatedOperation[verb]['x-scopes'].push(defValue[i]);
                }

                for (const selectedScope of defValue) {
                    if (selectedScope
                        && !securityDefScopes[selectedScope]
                        && securityDefScopes[selectedScope] !== '') {
                        let scopeDescription = '';
                        if (selectedScope in sharedScopesByName) {
                            if (sharedScopesByName[selectedScope].scope.description !== null) {
                                scopeDescription = sharedScopesByName[selectedScope].scope.description;
                            }
                            securityDefScopes[selectedScope] = scopeDescription;
                        }
                        setSecurityDefScopes(securityDefScopes);
                    }
                }
                break;
            }
            default:
                return currentOperations;
        }
        return {
            ...currentOperations,
            [target]: { ...currentOperations[target], [verb]: updatedOperation[verb] },
        };
    }
    const [operations, operationsDispatcher] = useReducer(operationsReducer, {});

    /**
     * Enable security for all topics/operations
     */
    const enableSecurity = () => {
        operationsDispatcher({ action: 'toggleSecurityStatus', data: { disable: false } });
    };

    /**
     * Disable security for all topics/operations
     */
    const disableSecurity = () => {
        operationsDispatcher({ action: 'toggleSecurityStatus', data: { disable: true } });
    };

    /**
     *
     *
     * @param {*} operation
     * @param {*} checked
     */
    function onOperationSelectM(operation, checked) {
        const { target, verb } = operation;
        setSelectedOperation((currentSelections) => {
            const nextSelectedOperations = cloneDeep(currentSelections);
            if (!nextSelectedOperations[target]) {
                nextSelectedOperations[target] = {};
            }
            if (checked) {
                nextSelectedOperations[target][verb] = checked;
            } else {
                delete nextSelectedOperations[target][verb];
            }
            if (isEmpty(nextSelectedOperations[target])) {
                delete nextSelectedOperations[target];
            }
            return nextSelectedOperations;
        });
    }
    const onMarkAsDelete = useCallback(onOperationSelectM, [setSelectedOperation]);

    /**
     *
     * @param {*} spec
     */
    function verifySecurityScheme(spec) {
        /* eslint-disable no-param-reassign */
        spec.components = spec.components || {};
        spec.components.securitySchemes = spec.components.securitySchemes || {};
        spec.components.securitySchemes.oauth2 = spec.components.securitySchemes.oauth2 || { type: 'oauth2' };
        spec.components.securitySchemes.oauth2.flows = spec.components.securitySchemes.oauth2.flows || {};
        spec.components.securitySchemes.oauth2.flows.implicit = spec.components.securitySchemes.oauth2.flows.implicit
            || {};
        spec.components.securitySchemes.oauth2.flows.implicit.scopes = spec.components.securitySchemes.oauth2.flows
            .implicit.scopes || {};
        /* eslint-enable no-param-reassign */
    }

    /**
     * This method sets the securityDefinitionScopes from the spec
     * @param {Object} spec The original swagger content.
     */
    function setSecurityDefScopesFromSpec(spec) {
        verifySecurityScheme(spec);
        setSecurityDefScopes(cloneDeep(spec.components.securitySchemes.oauth2.flows.implicit.scopes));
    }

    /**
     * This method sets the scopes of the spec from the securityDefinitionScopes
     */
    function setSpecScopesFromSecurityDefScopes() {
        verifySecurityScheme(asyncAPISpec);
        asyncAPISpec.components.securitySchemes.oauth2.flows.implicit.scopes = securityDefScopes;
    }

    /**
     *
     * @param {*} rawSpec The original swagger content.
     * @returns {null}
     */
    function resolveAndUpdateSpec(rawSpec) {
        const asyncSpecVersion = rawSpec?.asyncapi || '2.0.0';
        const asyncv3 = parseInt(asyncSpecVersion.split('.')[0], 10) >= 3;
        if (asyncv3) {
            const channelData = buildChannelMap(rawSpec);
            operationsDispatcher({ action: 'init', data: channelData });
            setAsyncAPISpec(rawSpec);
        } else {
            const resolvedChannels = resolveSpec(rawSpec, rawSpec);
            const resolvedSpec = { ...rawSpec, channels: resolvedChannels.channels };
            operationsDispatcher({ action: 'init', data: resolvedSpec.channels });
            setAsyncAPISpec(resolvedSpec);
        }
        setSecurityDefScopesFromSpec(rawSpec);
    }

    /**
     *
     * Update the asyncapi using /asyncapi PUT operation and then fetch the updated API Object doing a apis/{api-uuid}
     * GET
     * @param {JSON} spec Updated full AsyncAPI spec ready to PUT
     * @returns {Promise} Promise resolving to updated API object
     */
    function updateAsyncAPIDefinition(spec) {
        return api
            .updateAsyncAPIDefinition(spec)
            .then((response) => resolveAndUpdateSpec(response.body))
            .then(updateAPI)
            .catch((error) => {
                console.error(error);
                if (error.response) {
                    setPageError(error.response.body);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Configuration.Topic.update.definition.error',
                        defaultMessage: 'Error while updating the definition',
                    }));
                }
            });
    }

    /**
     *
     * This method modifies the security definition scopes by removing the scopes which are not present
     * in operations and which are shared scopes
     * @param {Array} apiOperations Operations list
     */
    function updateSecurityDefinition(apiOperations) {
        Object.keys(securityDefScopes).forEach((key) => {
            let isScopeExistsInOperation = false;
            for (const [, verbs] of Object.entries(apiOperations)) {
                for (const [, verbInfo] of Object.entries(verbs)) {
                    // Checking if the scope resides in the operation
                    for (const secDef of verbInfo.security || []) {
                        if (secDef
                            && secDef.default
                            && secDef.default.includes(key)) {
                            isScopeExistsInOperation = true;
                            break;
                        }
                    }

                    if (isScopeExistsInOperation) {
                        break;
                    }
                }
                if (isScopeExistsInOperation) {
                    break;
                }
            }
        });
        setSecurityDefScopes(securityDefScopes);
    }

    /**
     *
     * Save the OpenAPI changes using REST API, type parameter is required to
     * identify the locally created data structured, i:e type `operation` will assume that `data` contains the
     * object structure of locally created operation object which is a combination of REST API
     * response `operations` field and OpenAPI spec operation information
     * @param {String} type Type of data object
     * @param {Object} data Data object
     * @returns {Promise|null} A promise object which resolve to Swagger PUT response body.
     */
    function updateAsyncAPI() {
        const copyOfOperations = cloneDeep(operations);
        for (const [target, verbs] of Object.entries(markedOperations)) {
            for (const verb of Object.keys(verbs)) {
                delete copyOfOperations[target][verb];
                if (!copyOfOperations[target].publish && !copyOfOperations[target].subscribe) {
                    delete copyOfOperations[target];
                }
            }
        }

        updateSecurityDefinition(copyOfOperations);
        setSpecScopesFromSecurityDefScopes();
        
        let specToSave;
        if (isAsyncV3) {
            const { newOperations, newChannels, newComponents } = rebuildOperations(copyOfOperations, asyncAPISpec);
            specToSave = {
                ...asyncAPISpec,
                channels: newChannels,
                operations: newOperations,
                components: {
                    ...asyncAPISpec.components,
                    schemas: {
                        ...(asyncAPISpec.components?.schemas || {}),
                        ...newComponents.schemas,
                    },
                    messages: {
                        ...(asyncAPISpec.components?.messages || {}),
                        ...newComponents.messages,
                    },
                },
            };
        } else {
            specToSave = { ...asyncAPISpec, channels: copyOfOperations };
        }
        if (websubSubscriptionConfiguration !== api.websubSubscriptionConfiguration) {
            return updateAPI({ websubSubscriptionConfiguration })
                .catch((error) => {
                    console.error(error);
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Configuration.Topic.update.api.error',
                        defaultMessage: 'Error while updating the API',
                    }));
                })
                .then(() => updateAsyncAPIDefinition(specToSave));
        }
        return updateAsyncAPIDefinition(specToSave);

    }

    useEffect(() => {
        if (api.apitype !== 'APIProduct') {
            API.getAllScopes()
                .then((response) => {
                    if (response.body && response.body.list) {
                        const sharedScopesList = [];
                        const sharedScopesByNameList = {};
                        const shared = true;
                        for (const scope of response.body.list) {
                            const modifiedScope = {};
                            modifiedScope.scope = scope;
                            modifiedScope.shared = shared;
                            sharedScopesList.push(modifiedScope);
                            sharedScopesByNameList[scope.name] = modifiedScope;
                        }
                        setSharedScopes(sharedScopesList);
                        setSharedScopesByName(sharedScopesByNameList);
                    }
                });
        }
    }, []);

    useEffect(() => {
        api.getAsyncAPIDefinition()
            .then((response) => {
                const asyncSpecVersion = response.body?.asyncapi || '2.0.0';
                setIsAsyncV3(parseInt(asyncSpecVersion.split('.')[0], 10) >= 3);
                resolveAndUpdateSpec(response.body);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                    setPageError(error.response.body);
                }
                console.error(error);
            });
    }, [api.id]);

    // Note: Make sure not to use any hooks after/within this condition , because it returns conditionally
    // If you do so, You will probably get `Rendered more hooks than during the previous render.` exception
    // if ((!pageError && isEmpty(openAPISpec)) || (resolvedSpec.errors.length === 0 && isEmpty(resolvedSpec.spec))) {
    if ((!pageError && isEmpty(asyncAPISpec))) {
        return (
            <Grid container direction='row' justifyContent='center' alignItems='center'>
                <Grid item>
                    <CircularProgress disableShrink />
                </Grid>
            </Grid>
        );
    }

    return (
        <Grid container direction='row' justifyContent='flex-start' spacing={2} alignItems='stretch'>
            {pageError && (
                <Grid item md={12}>
                    <Banner onClose={() => setPageError(null)} disableActions type='error' message={pageError} />
                </Grid>
            )}
            {!isRestricted(['apim:api_create'], api) && !disableAddOperation
            && api.type === 'WEBSUB' && (api.gatewayVendor === 'wso2') && (
                <Grid item md={12} xs={12}>
                    <SubscriptionConfig
                        websubSubscriptionConfigDispatcher={websubSubscriptionConfigDispatcher}
                        websubSubscriptionConfiguration={websubSubscriptionConfiguration}
                    />
                </Grid>
            )}
            {!isRestricted(['apim:api_create'], api) && !disableAddOperation
            && (api.gatewayVendor === 'wso2') && (
                <Grid item md={12} xs={12}>
                    <AddOperation operationsDispatcher={operationsDispatcher}
                        isAsyncAPI={isAsyncAPI} api={api} isAsyncV3={isAsyncV3}/>
                </Grid>
            )}
            <Grid item md={12}>
                <Paper>
                    {(api.gatewayVendor === 'wso2') && (api.type === 'WS') && (
                        <TopicsOperationsSelector
                            operations={operations}
                            enableSecurity={enableSecurity}
                            disableSecurity={disableSecurity}
                        />
                    )}
                    {
                        operations && Object.entries(operations).map(([target, operation]) => (
                            <GroupOfOperations tag={target} operation={operation}>
                                <Grid
                                    container
                                    direction='row'
                                    justifyContent='flex-start'
                                    spacing={1}
                                    alignItems='stretch'
                                >
                                    {(isAsyncV3 ? ['send', 'receive'] : ['subscribe', 'publish']).map((verb) => (
                                        operation[verb] && (
                                            <Grid key={`${target}_${verb}`} item md={12}>
                                                <AsyncOperation
                                                    target={target}
                                                    verb={verb}
                                                    highlight
                                                    operation={operation}
                                                    spec={asyncAPISpec}
                                                    api={api}
                                                    operationsDispatcher={operationsDispatcher}
                                                    sharedScopes={sharedScopes}
                                                    markAsDelete={Boolean(
                                                        markedOperations[target] && markedOperations[target][verb],
                                                    )}
                                                    onMarkAsDelete={onMarkAsDelete}
                                                    disableDelete={api.gatewayType === 'solace'}
                                                    componentValidator={componentValidator}
                                                    isAsyncV3={isAsyncV3}
                                                />
                                            </Grid>
                                        )
                                    ))}
                                </Grid>
                            </GroupOfOperations>
                        ))
                    }
                </Paper>
                <Grid
                    style={{ marginTop: '25px' }}
                    container
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                >
                    {!disableUpdate && (
                        <SaveOperations
                            operationsDispatcher={operationsDispatcher}
                            updateAsyncAPI={updateAsyncAPI}
                            api={api}
                        />
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
}

Topics.defaultProps = {
    operationProps: { disableDelete: false },
    disableUpdate: false,
    disableAddOperation: false,
};

Topics.propTypes = {
    disableAddOperation: PropTypes.bool,
    disableUpdate: PropTypes.bool,
    operationProps: PropTypes.shape({
        disableDelete: PropTypes.bool,
    }),
};
