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
import PublisherComonPage from './PublisherComonPage';
class APIMenuPage extends PublisherComonPage{
    getUrl(apiID){
        return `publisher/apis/${apiID}/overview`;
    }
    getPortalConfigurationsMenu(){
        return cy.get('#itest-api-details-portal-config-acc > div > div > p')
    }
    getPortalConfigurations_BasicInforMenu(){
        return cy.get('#left-menu-itemDesignConfigurations')
    }
    getApiConfigurationsMenu(){
        cy.get('#itest-api-details-api-config-acc')
    }
    getAPIConfigurationsMenu(){
        return cy.get('#itest-api-details-api-config-acc')
    }
    getAPIConfigurationsMenu_ResourcesMenu(){
        return cy.get('#left-menu-itemresources')
    }
    getAPIConfigurationsMenu_LocalScopesMenu(){
        return cy.get('#left-menu-itemLocalScopes')
    }
    getAPIConfigurationsMenu_DocumentsMenu(){
        return cy.get('#left-menu-itemdocuments')
    }
    getDeploy_DeployementsMenu(){
        return cy.get('#left-menu-itemdeployments')
    }
    getPublish_LifecycleMenu(){
        return cy.get('#left-menu-itemlifecycle')
    }
}
export default APIMenuPage;