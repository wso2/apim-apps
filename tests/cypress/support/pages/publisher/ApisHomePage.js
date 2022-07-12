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
import Utils from "@support/utils";
import PublisherComonPage from './PublisherComonPage';
class ApisHomePage extends PublisherComonPage {
    getUrl(){
        return "/publisher/apis";
    }
    visitAPIsPage(){
        cy.visit(`${Utils.getAppOrigin()}` + this.getUrl())
    }
    getCreateAPIButton(){
        return cy.get('#itest-create-api-menu-button')
    }
    getCreateAPIDialog_StartFromScratchLink(){
        return cy.get('#itest-id-landing-rest-create-default')
    }
    getApiNameVersionH1(){
        return cy.get("#itest-api-name-version")
    }
    getApiStateDiv(){
        return cy.get('div[data-testid="itest-api-state"]')
    }
    getDeleteButtonOfAPI(apiName){ // e.g PizzaShack1.0.0
        return cy.get(`div[data-testid="card-action-${apiName}"] > div:nth-child(2) > div > button[id="itest-id-deleteapi-icon-button"]`)
    }
    getDeleteAPIDialog_DeletButton(){
        return cy.get('#itest-id-deleteconf')
    }
    getApiLinkOfAPI(apiName){
        return cy.get(`a[aria-label="${apiName} Thumbnail"]`)
    }
}

export default ApisHomePage;