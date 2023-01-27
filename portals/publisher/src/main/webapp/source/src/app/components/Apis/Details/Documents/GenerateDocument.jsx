/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState, useEffect } from 'react';
import { API } from '@stoplight/elements';
// Manually imported from stoplightio/elements and wrapped in 'apim_elements' id
import './elements.css';
// import '@stoplight/elements/styles.min.css';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { doRedirectToLogin } from 'AppComponents/Shared/RedirectToLogin';
import YAML from 'js-yaml';

function GenerateDocument(){
    const [api, updateAPI] = useAPI();
    const [swagger, updateSwagger] = useState('');

    useEffect(() => {
        let promisedApi = api.getSwagger(api.id);
        promisedApi
            .then((response) => {
                updateSwagger(YAML.safeDump(YAML.safeLoad(response.data)));
            })
            .catch((error) => {
                if(process.env.NODE_ENV !== 'production'){
                    console.error(error);
                }
                const {status} = error;
                if(status === 404){
                    this.setState({notFound:true});
                }else if(status === 401){
                    doRedirectToLogin();
                }
            });
    }, [api.id]);
    return(
        <div id='apim_elements'>
            <API
                apiDescriptionDocument={swagger}
                hideTryIt='true'
                router='memory'
                layout='sidebar'
            />
        </div>
    );
}

export default GenerateDocument;