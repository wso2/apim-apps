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

import React, { useState, useContext } from 'react';
// import { injectIntl } from 'react-intl';
// import { withStyles } from '@material-ui/core/styles';
import { API } from '@stoplight/elements';
import '@stoplight/elements/styles.min.css';
import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
// import RedirectToLogin from 'AppComponents/Login/RedirectToLogin';
import YAML from 'js-yaml';
import Api from 'AppData/api';

// const styles = theme =>({
//     // a[href*="stoplight.io"] : {
//     //     visibility: hidden,
//     // },
// });

function GenerateDocument() {
    const { api } = useContext(ApiContext);
    const [swagger, updateSwagger] = useState('');
    // const [notFound, updateNotFound] = useState(false);
    const apiClient = new Api();
    const promisedApi = apiClient.getSwaggerByAPIId(api.id);
    promisedApi
        .then((response) => {
            updateSwagger(YAML.safeDump(YAML.safeLoad(response.data)));
        })
        .catch((error) => {
            if (process.env.NODE_ENV !== 'production') {
                console.log(error);
            }
            const { status } = error;
            if (status === 404) {
                // updateNotFound(true);
                console.log('Swagger not found');
            } else if (status === 401) {
                // return <RedirectToLogin {...localProps}
                console.log('Auth failed');
            }
        });

    return (
        <div>
            <API
                apiDescriptionDocument={swagger}
                hideTryIt='true'
            />
        </div>
    );
}

export default GenerateDocument;
// export default injectIntl(withStyles(styles)(GenerateDocument));
