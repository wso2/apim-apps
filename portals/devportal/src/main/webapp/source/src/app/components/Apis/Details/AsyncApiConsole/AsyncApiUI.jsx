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

import React, { useState, useEffect, useContext } from 'react';
import { styled } from '@mui/material/styles';
import { ApiContext } from '../ApiContext';
import Api from '../../../../data/api';
import Progress from '../../../Shared/Progress';
import WebhookSubscriptionUI from './WebhookSubscriptionUI';
import GenericSubscriptionUI from './GenericSubscriptionUI';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import CONSTANTS from 'AppData/Constants';
import Alert from 'AppComponents/Shared/Alert';
import { useIntl } from 'react-intl';

const PREFIX = 'AsyncApiUI';

const classes = {
    endpointSelectorRoot: `${PREFIX}-endpointSelectorRoot`,
    selectList: `${PREFIX}-selectList`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
    [`& .${classes.endpointSelectorRoot}`]: {
        paddingBottom: '20px',
    },
    // this styling is used to resemble the switch to swagger-ui switch
    [`& .${classes.selectList}`]: {
        minWidth: '130px',
        maxWidth: '100%',
        border: '2px solid #41444e',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        fontWeight: 700,
        padding: '2px 2px 2px 10px',
        borderRadius: '4px',
        color: '#3b4151',
        '&.Mui-disabled': {
          backgroundColor: '#f5f5f5',
          color: '#999',
          border: '2px solid #ddd',
          cursor: 'not-allowed',
        },
    }
});

export default function AsyncApiUI(props) {

    const intl = useIntl();
    const {
        authorizationHeader,
        URLs,
        securitySchemeType,
        accessTokenProvider,
    } = props;
    const { api } = useContext(ApiContext);
    const isAdvertised = api.advertiseInfo && api.advertiseInfo.advertised;

    const getPreferredEndpoint = (URLsObj, apiType) => {
      if (!URLsObj) return '';
      if (apiType === CONSTANTS.API_TYPES.WS) {
        // prefer ws, but if ws does not exist fall back to wss
        if (URLsObj.ws) return URLsObj.ws;
        if (URLsObj.wss) return URLsObj.wss;
        return '';
      }
      // for non-WS APIs prefer http, but if http does not exist fall back to https
      if (URLsObj.http) return URLsObj.http;
      if (URLsObj.https) return URLsObj.https;
      return '';
    };
    let initialEndpoint;
    initialEndpoint = getPreferredEndpoint(URLs, api.type);

    let expandable = true;
    if (!URLs || (!URLs.http && !URLs.https)) {
        expandable = false;
    }

    const [allTopics, setAllTopics] = useState('');
    const [endPoint, setEndpoint] = useState(initialEndpoint);

    useEffect(() => {
      const newInitialEndpoint = getPreferredEndpoint(URLs, api.type);
      setEndpoint(newInitialEndpoint || '');
    }, [URLs, api.type]);

    useEffect(() => {
        const apiID = api.id;
        const apiClient = new Api();
        const promisedTopics = apiClient.getAllTopics(apiID);
        promisedTopics.then((response) => {
            setAllTopics(response.body);
        }).catch((error) => {
            console.log(error);
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.AsyncApiConsole.AsyncApiUI.topics.get.error',
                defaultMessage: 'Error while retrieving topics for the API.',
            }));
        });
    }, []);

    const handleServerChange = (event) => {
        setEndpoint(event.target.value);
    };

    function generateAccessToken() {
        let token;
        if (authorizationHeader === 'apikey') {
            token = accessTokenProvider();
        } else if (securitySchemeType === 'BASIC') {
            token = 'Basic ' + accessTokenProvider();
        } else if (isAdvertised) {
            token = accessTokenProvider();
        } else {
            token = 'Bearer ' + accessTokenProvider();
        }
        return token;
    }

    function generateGenericWHSubscriptionCurl(subscription, customEndpoint) {
        const {
            topic, callback, secret, mode, lease,
        } = subscription;
        const token = generateAccessToken();
        const endpoint = customEndpoint || endPoint;
        if (mode === 'subscribe') {
            let curl = `curl -X POST '${endpoint}' -H 'Content-Type: application/x-www-form-urlencoded' -d 'hub.topic=${encodeURIComponent(topic)}' -d 'hub.callback=${encodeURIComponent(callback)}' -d 'hub.mode=${mode}'`;
            if (secret) {
                curl += ` -d 'hub.secret=${secret}'`;
            }
            if (lease) {
                curl += ` -d 'hub.lease_seconds=${lease}'`;
            }
            if (api.advertiseInfo && api.advertiseInfo.adveritsed && authorizationHeader !== '') {
                curl += ` -H '${authorizationHeader}: ${token}'`;
            } else {
                curl += ` -H 'Authorization: ${token}'`;
            }
            return curl;
        } else {
            let curl = `curl -X POST '${endpoint}' -H 'Content-Type: application/x-www-form-urlencoded' -d 'hub.topic=${encodeURIComponent(topic)}' -d 'hub.callback=${encodeURIComponent(callback)}' -d 'hub.mode=${mode}' -H 'Authorization: ${token}'`;
            if (isAdvertised && authorizationHeader !== '') {
                curl = `curl -X POST '${endpoint}' -H 'Content-Type: application/x-www-form-urlencoded' -d 'hub.topic=${encodeURIComponent(topic)}' -d 'hub.callback=${encodeURIComponent(callback)}' -d 'hub.mode=${mode}' -H '${authorizationHeader}: ${token}'`;
            }
            return curl;
        }
    }

    function getTopicName(topic) {
        let topicName = topic.name;
        // Remove the / from the topic name
        if (topicName.charAt(0) === '/') {
            topicName = topicName.substring(1);
        }
        return topicName;
    }

    function generateWSSubscriptionCommand(topic, customEndpoint) {
        const token = generateAccessToken();
        const endpoint = customEndpoint || endPoint;
        if (topic.name.includes('*')) {
            let wscat = `wscat -c '${endpoint}' -H '${securitySchemeType === 'API-KEY' ? 'apikey' : 'Authorization'}: ${token}'`;
            if (isAdvertised && authorizationHeader !== '') {
                wscat = `wscat -c '${endpoint}' -H '${authorizationHeader}: ${token}'`;
            }
            return wscat;
        } else {
            let wscat = `wscat -c '${endpoint}/${getTopicName(topic)}' -H '${securitySchemeType === 'API-KEY' ? 'apikey': 'Authorization'}: ${token}'`;
            if (isAdvertised && authorizationHeader !== '') {
                wscat = `wscat -c '${endpoint}/${getTopicName(topic)}' -H '${authorizationHeader}: ${token}'`;
            }
            return wscat;
        }
    }

    function generateSSESubscriptionCommand(topic, customEndpoint) {
        const token = generateAccessToken();
        const endpoint = customEndpoint || endPoint;
        if (topic.name.includes('*')) {
            let curl = `curl -X GET '${endpoint}' -H 'Authorization: ${token}'`;
            if (isAdvertised && authorizationHeader !== '') {
                curl = `curl -X GET '${endpoint}' -H '${authorizationHeader}: ${token}'`;
            }
            return curl;
        } else {
            let curl = `curl -X GET '${endpoint}/${getTopicName(topic)}' -H 'Authorization: ${token}'`;
            if (isAdvertised && authorizationHeader !== '') {
                curl = `curl -X GET '${endpoint}/${getTopicName(topic)}' -H '${authorizationHeader}: ${token}'`;
            }
            return curl;
        }
    }

    function generateASYNCSubscriptionCommand(topic, customEndpoint) {
        const token = generateAccessToken();
        const endpoint = customEndpoint || endPoint;
        if (topic.name.includes('*')) {
            let curl = `curl -X GET '${endpoint}' -H 'Authorization: ${token}'`;
            if (authorizationHeader !== '') {
                curl = `curl -X GET '${endpoint}' -H '${authorizationHeader}: ${token}'`;
            }
            return curl;
        } else {
            let curl = `curl -X GET '${endpoint}/${getTopicName(topic)}' -H 'Authorization: ${token}'`;
            if (authorizationHeader !== '') {
                curl = `curl -X GET '${endpoint}/${getTopicName(topic)}' -H '${authorizationHeader}: ${token}'`;
            }
            return curl;
        }
    }

    if (!allTopics) {
        return <Progress />;
    } else {
        return (
            <Root>
                <FormControl variant="standard" className={classes.endpointSelectorRoot}>
                    <InputLabel>Servers</InputLabel>
                    <Select
                        variant="standard"
                        className={classes.selectList}
                        id="api-endpoint-select"
                        value={endPoint}
                        displayEmpty
                        disabled={Object.keys(URLs).length === 0 || !Object.values(URLs).some((url) => url)}
                        onChange={handleServerChange}
                    >
                      {Object.keys(URLs).length === 0 || !Object.values(URLs).some((url) => url) ? (
                        <MenuItem value='' disabled>
                          <em>No servers available</em>
                        </MenuItem>
                      ) : (
                        Object.entries(URLs).map(([key, value]) => {
                          if (value) {
                            return <MenuItem value={value} key={key}>{value}</MenuItem>;
                          }
                          return null;
                        })
                      )}
                    </Select>
                </FormControl>
                {api.type === CONSTANTS.API_TYPES.WEBSUB && allTopics.list.map((topic, index) => (
                    <WebhookSubscriptionUI
                        topic={topic}
                        generateGenericWHSubscriptionCurl={generateGenericWHSubscriptionCurl}
                        endPoint={endPoint}
                        expandable
                    />
                ))}
                {api.type === CONSTANTS.API_TYPES.SSE && allTopics.list.map((topic, index) => (
                    <GenericSubscriptionUI
                        generateGenericSubscriptionCommand={generateSSESubscriptionCommand}
                        endPoint={endPoint}
                        topic={topic}
                        expandable
                    />
                ))}
                {api.type === CONSTANTS.API_TYPES.WS && allTopics.list.map((topic, index) => (
                    <GenericSubscriptionUI
                        generateGenericSubscriptionCommand={generateWSSubscriptionCommand}
                        endPoint={endPoint}
                        topic={topic}
                        expandable
                    />
                ))}
                {api.type === CONSTANTS.API_TYPES.ASYNC && allTopics.list.map((topic, index) => (
                    <GenericSubscriptionUI
                        generateGenericSubscriptionCommand={generateASYNCSubscriptionCommand}
                        endPoint={endPoint}
                        topic={topic}
                        expandable={expandable}
                    />
                ))}
            </Root>
        );
    }
}
