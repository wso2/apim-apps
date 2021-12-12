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
import API from 'AppData/api';
import { useQuery } from 'AppData/hooks/ReactQueryX';
import React, { useContext } from 'react';

const AppContext = React.createContext({ });
export const usePublisherSettings = () => {
    return useQuery('api-settings-get', API.getSettings);
};
export const withSettings = (WrappedComponent) => {
    const WithSettingsHOC = (props) => {
        const { data: settings } = usePublisherSettings();
        return <WrappedComponent {...props} settings={settings} />;
    };
    WithSettingsHOC.displayName = `withSettings(${WrappedComponent.displayName})`;
    return WithSettingsHOC;
};
export const useAppContext = () => useContext(AppContext);
export const useUser = () => useContext(AppContext).user;
export const AppContextProvider = AppContext.Provider;
export default AppContext;
