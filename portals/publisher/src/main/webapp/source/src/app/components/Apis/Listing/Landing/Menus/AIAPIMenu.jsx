/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import { FormattedMessage } from 'react-intl';
import LandingMenuItem from 'AppComponents/Apis/Listing/Landing/components/LandingMenuItem';
import LandingMenu from 'AppComponents/Apis/Listing/Landing/components/LandingMenu';
import APICreateMenuSection from 'AppComponents/Apis/Listing/components/APICreateMenuSection';

const AIAPIMenu = (props) => {
    const { icon, isCreateMenu } = props;
    const Component = isCreateMenu ? APICreateMenuSection : LandingMenu;
    const dense = isCreateMenu;

    return (
        <Component
            id='itest-ai-api-create-title'
            title={(
                <FormattedMessage
                    id='Apis.Listing.AIAPI.ai.api'
                    defaultMessage='AI API'
                />
            )}
            icon={icon}
        >
            <LandingMenuItem
                dense={dense}
                id='itest-ai-api-create-description'
                linkTo='/apis/create/ai-api'
                helperText={(
                    <FormattedMessage
                        id='Apis.Listing.SampleAPI.SampleAPI.ai.api.import.content'
                        defaultMessage='Create AI APIs by importing service provider APIs'
                    />
                )}
            >
                <FormattedMessage
                    id='Apis.Listing.SampleAPI.SampleAPI.ai.api.create.title'
                    defaultMessage='Create AI API'
                />
            </LandingMenuItem>
        </Component>
    );
};

export default AIAPIMenu;
