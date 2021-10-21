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

import React from 'react';
import { FormattedMessage } from 'react-intl';
import LandingMenuItem from 'AppComponents/Apis/Listing/Landing/components/LandingMenuItem';
import LandingMenu from 'AppComponents/Apis/Listing/Landing/components/LandingMenu';
import APICreateMenuSection from 'AppComponents/Apis/Listing/components/APICreateMenuSection';

const AdvertiseOnlyAPIMenu = (props) => {
    const { isCreateMenu } = props;

    const Component = isCreateMenu ? APICreateMenuSection : LandingMenu;
    const dense = isCreateMenu;
    return (
        <Component
            openList={dense}
            title={(
                <FormattedMessage
                    id='Apis.Listing.SampleAPI.SampleAPI.advertiseonly.api'
                    defaultMessage='Advertise Only API'
                />
            )}
        >
            <LandingMenuItem
                dense={dense}
                id='itest-id-create-advertise-only-api'
                linkTo='/apis/create/advertiseonly/create'
                helperText={(
                    <FormattedMessage
                        id='Apis.Listing.SampleAPI.SampleAPI.advertiseonly.create.api'
                        defaultMessage='Create an API for advertise purposes only'
                    />
                )}
            >
                <FormattedMessage
                    id='Apis.Listing.SampleAPI.SampleAPI.advertiseonly.create.api.title'
                    defaultMessage='Create Advertise Only API'
                />
            </LandingMenuItem>
            <LandingMenuItem
                dense={dense}
                id='itest-id-import-advertise-only-api'
                linkTo='/apis/create/advertiseonly/import'
                helperText={(
                    <FormattedMessage
                        id='Apis.Listing.SampleAPI.SampleAPI.advertiseonly.import.api'
                        defaultMessage='Import an API definition for advertise purposes only'
                    />
                )}
            >
                <FormattedMessage
                    id='Apis.Listing.SampleAPI.SampleAPI.advertiseonly.import.api.title'
                    defaultMessage='Import Advertise Only API'
                />
            </LandingMenuItem>
        </Component>
    );
};

export default AdvertiseOnlyAPIMenu;
