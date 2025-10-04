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

import React, { useState, useEffect, useContext } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import Alert from 'AppComponents/Shared/Alert';
import Settings from 'AppComponents/Shared/SettingsContext';
import MCPServer from 'AppData/MCPServer';
import ResourceNotFound from '../Base/Errors/ResourceNotFound';
import API from '../../data/api';
import ApiThumb from '../Apis/Listing/ApiThumb';

const PREFIX = 'ApisWithTag';

const classes = {
    tagedApisWrapper: `${PREFIX}-tagedApisWrapper`,
};

const Root = styled('div')(() => ({
    [`&.${classes.tagedApisWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
}));

/**
 * Renders Apis With Tag section.
 * @param {JSON} props Parent pros.
 * @returns {JSX} rendered Apis With Tag view.
 */
function ApisWithTag(props) {
    const intl = useIntl();

    const [apis, setApis] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const {
        tag, maxCount,
    } = props;
    const settingsContext = useContext(Settings);
    useEffect(() => {
        const isMCPServersRoute = window.location.pathname.includes('/mcp-servers');
        let promisedApis;
        if (isMCPServersRoute) {
            promisedApis = new MCPServer().getAllMCPServers({ query: 'tag:' + tag, limit: maxCount });
        } else {
            promisedApis = new API().getAllAPIs({ query: 'tag:' + tag, limit: maxCount });
        }
        promisedApis
            .then((response) => {
                setApis(response.obj);
            })
            .catch((error) => {
                const { status, response } = error;
                const message = intl.formatMessage({
                    defaultMessage: 'Invalid tenant domain',
                    id: 'LandingPage.ApisWithTag.invalid.tenant.domain',
                });
                if (response && response.body.code === 901300) {
                    settingsContext.setTenantDomain('INVALID');
                    Alert.error(message);
                }
                if (status === 404) {
                    setNotFound(true);
                }
            });
    }, []);
    if (notFound) {
        return <ResourceNotFound />;
    } else {
        return (
            apis && (
                <Root className={classes.tagedApisWrapper}>
                    {apis.list.map((api) => (
                        <ApiThumb api={api} key={api.id} />
                    ))}
                </Root>
            )
        );
    }
}

ApisWithTag.propTypes = {
    tag: PropTypes.string.isRequired,
    maxCount: PropTypes.number.isRequired,
};
export default ApisWithTag;
