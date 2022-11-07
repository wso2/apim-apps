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

class OpenAPIPage extends PublisherComonPage{
    static getUrl(){
        return 'publisher/apis/create/openapi';
    }
    static openAPIURLRadioButton(){
        return cy.get('#open-api-url-select-radio')
    }   
    static openFileSelectRadioButton(){
        return cy.get('#open-api-file-select-radio')
    }
    // typing on div also works '[data-testid="swagger-url-endpoint"]'
    static openAPIURLTextBox(){
        return cy.get('input[id="outlined-full-width"]')
    }
   static  waitUntilGetUrlValidatedDiv(timeoutInMs){
        return cy.get('#url-validated', { timeout: timeoutInMs })
    }
    static linterResultDivBlock(){
        return cy.get('[data-testid="itest-id-linter-results"]')
    }
    static errorsToggleButton(){
        return cy.get('div[data-testid="itest-id-linter-results"]>div>div>div>div>div>div>button[value="0"]')
    }
    static warningToggleButton(){
        return cy.get('div[data-testid="itest-id-linter-results"]>div>div>div>div>div>div>button[value="1"]')
    }
    static browseToUploadButton(){
        return cy.get(' #browse-to-upload-btn')
    } 
    static fileUploadInput(){
        return cy.get('input[type="file"]')
    } 
}
export default OpenAPIPage;