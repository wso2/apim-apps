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
class APIBasicInfoPage {
    getUrl(apiID){
        return `publisher/apis/${apiID}/configuration`;
    }
    getTagsTextBox(){
        return cy.get('#tags')
    }
    getDefaultVersionYesRadio(){
        return cy.get('input[name="defaultVersion"][value="true"]')
    }
    getDefaultVersionNoRadio(){
        return cy.get('input[name="defaultVersion"][value="false"]')
    }
    getThirdPartyYesRadio(){
        return cy.get('input[name="advertised"][value="true"]')
    }
    getThirdPartyNoRadio(){
        return cy.get('input[name="advertised"][value="false"]')
    }
    getSaveButton(){
        return cy.get('#design-config-save-btn')
    }
    getUpdateToolTip(){
        return cy.get('div[role="status"][aria-live="polite"]')
    }
    getEditDescriptionButton(){
        return cy.get('#edit-api-thumbnail-btn + div > button')
    }
    getEditThumbnailButton(){
        return cy.get('#edit-api-thumbnail-btn > button')
    }
    getThumbnailUploadButton(){
        return cy.get('#edit-api-thumbnail-upload-btn')
    }
    getDescriptionTextArea(){
        return cy.get('#itest-description-textfield')
    }
    getUpdateContectButton(){
        return cy.get('div[role="dialog"] > header > div > div > div:nth-child(2) > button')
    }
    getThumbnailFileUpload(){
        return cy.get('input[type="file"]')
    }
}
export default APIBasicInfoPage;