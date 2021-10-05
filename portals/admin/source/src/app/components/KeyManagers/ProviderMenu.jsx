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
import LandingMenuItem from '../Shared/LandingMenuItem';
import ProviderCreateMenuSection from '../Shared/ProviderCreateMenuSection';



const ProviderMenu = () => {
    const Component = ProviderCreateMenuSection;

    return(
        <Component
            id='provider-type-menu'
            title={(
                <FormattedMessage
                    id='Provider.Type.Listing.menu'
                    defaultMessage='Provider Type'
                />
            )}
        >
            <LandingMenuItem
                id='provider-type-create-token-exchange'
                linkTo='/settings/key-managers/token-exchange-endpoint/create'
                helperText={(
                    <FormattedMessage
                        id='Provider.Type.Listing.Token.Exchange.content'
                        defaultMessage='Add third party key manager as a token exchange endpoint '
                    />
                )}
            >
                <FormattedMessage
                    id='Provider.Type.Listing.Token.Exchange.title'
                    defaultMessage='Token Exchange'
                />
            </LandingMenuItem>

            <LandingMenuItem
                id='provider-type-create-external-keymanager'
                linkTo='/settings/key-managers/external-key-manager/create'
                helperText={(
                    <FormattedMessage
                        id='Provider.Type.Listing.external.keymanager.content'
                        defaultMessage='Connect Third party key manager to API Manager'
                    />
                )}
            >
                <FormattedMessage
                    id='Provider.Type.Listing.external.keymanager.title'
                    defaultMessage='Direct Token'
                />
            </LandingMenuItem>
        </Component>
    );
}

export default ProviderMenu;
