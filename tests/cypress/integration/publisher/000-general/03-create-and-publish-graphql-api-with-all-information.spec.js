/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
let apiId;
describe("Create GraphQl API from file", () => {
    const username = 'admin';
    const password = 'admin';
    const filepath = 'api_artifacts/schema_graphql.graphql';
    const modifiedFilepath = 'api_artifacts/modified_schema_graphql.graphql';
    const apiVersion='1.0.0';
    const apiContext="/swapi";
    const apiName='StarWarsAPIGQL';
    const applicationName='Graphql Client App';
    const starWarsQueryRequest=`query{
      human(id:1000){\n
         id\n
         name\n
      }\n
      droid(id:2000){\n
         name\n
         friends{\n
             name\n
             appearsIn\n
             {downarrow}{backspace}`;

    const starWarsQueryResponse=`{
      "data": {
        "human": {
          "id": "1000",
          "name": "Luke Skywalker"
        },
        "droid": {
          "name": "C-3PO",
          "friends": [
            {
              "name": "Luke Skywalker",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "Han Solo",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "Leia Organa",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            },
            {
              "name": "R2-D2",
              "appearsIn": [
                "NEWHOPE",
                "EMPIRE",
                "JEDI"
              ]
            }
          ]
        }
      }
    }`;

    const starWarsSubscriptionRequest=`subscription {
      reviewAdded(episode: JEDI) {
         stars\n
         episode\n
   
         commentary\n`;
    
    const starWarsSubscriptionResponse=`{"data":{"createReview":{"stars":3,"episode":"JEDI","commentary":"Excellent"}}}`;


    beforeEach(function(){
        //add role filmsubscriber
        cy.carbonLogin(username, password);
        cy.visit('/carbon/role/add-step1.jsp');
        cy.get('input[name="roleName"]').type('FilmSubscriber');
        cy.get('td.buttonRow').find('input').eq(0).click();
        cy.get('#ygtvcheck2 > .ygtvspacer').click();
        cy.get('#ygtvcheck34 > .ygtvspacer').click();
        cy.get('#ygtvcheck48 > .ygtvspacer').click();
        cy.get('td.buttonRow').find('input').eq(1).click();
        cy.get('.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix>.ui-dialog-buttonset>.ui-button.ui-corner-all.ui-widget',{timeout:4000}).click();

        cy.carbonLogout();
        
        cy.loginToPublisher(username, password);
        cy.on('uncaught:exception', (err, runnable) => {
          if (err.message.includes('applicationId is not provided')||err.message.includes('validateDescription is not a function')) {
            return false
          }
        });
      
    })

    it("Verify GraphQl API Capabilities", () => {

        //create a graphql API
        cy.createGraphqlAPIfromFile(apiName,apiVersion,apiContext,filepath).then(value => {
          apiId = value;
          cy.log(value)
        //verify that show more operations button at overview page redirects to operaion page
        cy.get('[data-testid="show-more-navigate-to-operation"]').should('have.attr', 'href')
        .then((href) => {
          cy.get('#itest-api-details-api-config-acc').click();
          cy.get('#left-menu-operations').click();
          cy.url().should('eq', `${Utils.getAppOrigin().toLowerCase()}${href}`);
        })
          
        //schema definition
        cy.get('#itest-api-details-api-config-acc').click();
        cy.contains('a','Schema Definition').click();
        
        //modify a graphql schema definition
        cy.modifyGraphqlSchemaDefinition(modifiedFilepath);

        //localscopes
        cy.get('#left-menu-itemLocalScopes',{timeout: Cypress.config().largeTimeout}).should('have.attr', 'href')
        .then((href) => {
          cy.visit(`${Utils.getAppOrigin()}${href}/create`);
          cy.createLocalScope('adminScope','admin scope',"sample description",['admin']);
          cy.get('#left-menu-itemLocalScopes').should('have.attr', 'href')
        .then((href) => {
          cy.visit(`${Utils.getAppOrigin()}${href}/create`);
          cy.createLocalScope('filmSubscriberScope','filmSubscriber scope',"sample description",['FilmSubscriber']);

    
        cy.get('#left-menu-operations',{timeout: Cypress.config().largeTimeout}).click();
        
        cy.get('table').get('[data-testid="allCharacters-tbl-row"]').find('td').eq(2).click().get('ul').contains('li','Unlimited').click();
        cy.get('table').get('[data-testid="allCharacters-tbl-row"]').find('td').eq(3).click().get('ul').contains('li','adminScope').click();
        cy.get("#menu-").click();
        cy.get('table').get('[data-testid="allCharacters-tbl-row"]').find('td').eq(4).get('[data-testid="allCharacters-security-btn"]').click();
        
        cy.get('table').get('[data-testid="allDroids-tbl-row"]').find('td').eq(2).click().get('ul').contains('li','Unlimited').click();
        cy.get('table').get('[data-testid="allDroids-tbl-row"]').find('td').eq(3).click().get('ul').contains('li','filmSubscriberScope').click();
        cy.get("#menu-").click();
        cy.get('[data-testid="custom-select-save-button"]').click();

        //deployments
        cy.location('pathname').then((pathName) => {
          const pathSegments = pathName.split('/');
          const uuid = pathSegments[pathSegments.length - 2];
          cy.visit(`${Utils.getAppOrigin()}/publisher/apis/${uuid}/deployments`);
          
          cy.get('#deploy-btn', {timeout: Cypress.config().largeTimeout}).should('not.have.class', 'Mui-disabled').click({force:true});
             
          //publish
          cy.get("#left-menu-overview",{timeout: Cypress.config().largeTimeout}).click();
          cy.get('[data-testid="publish-state-button"]',{timeout: Cypress.config().largeTimeout}).should('not.be.disabled').click({force:true});

          //visit dev portal and view API
          cy.logoutFromPublisher();
          cy.loginToDevportal(username, password);

          // create an application
          cy.createApplication(applicationName,"50PerMin","Sample Description");

          //go to apis
          cy.get('[data-testid="itest-link-to-apis"]', {timeout: Cypress.config().largeTimeout}).click();

          cy.get('table > tbody > tr',{timeout: Cypress.config().largeTimeout}).get(`[area-label="Go to ${apiName}"]`).click();

          //should contain two urls : HTTP URL and Websocket URL
          cy.get('#gateway-envirounment', {timeout: Cypress.config().largeTimeout}).get('[data-testid="http-url"]').should('exist');
          cy.get('#gateway-envirounment').get('[data-testid="websocket-url"]').should('exist');
          
          // Go to application subscription page
          cy.get("#left-menu-credentials").click();
          cy.get('button[aria-label="Open"]').click();
          cy.get('ul').contains('li',applicationName).click();
          cy.get("#subscribe-to-api-btn").click();
          
          cy.get("#left-menu-test", {timeout: Cypress.config().largeTimeout}).click();

          cy.intercept('**/applications/').then((res) => {
            // Check if the application exists
            cy.get("#selected-application", {timeout: Cypress.config().largeTimeout}).should('exist');
          });

          cy.intercept('**/generate-token').as('getToken');
          cy.get('#gen-test-key', {timeout: Cypress.config().largeTimeout}).click();
          cy.wait('@getToken', {timeout: Cypress.config().largeTimeout}).its('response.statusCode').should('eq', 200);

          cy.get('[aria-label="Query Editor"]').type(starWarsQueryRequest);
          cy.get('.topBar').get('.execute-button-wrap').get('button.execute-button').click();

          cy.intercept('POST','/swapi/1.0.0',(res) => {
            expect(res.body).to.include(starWarsQueryResponse);
          }).as("queryResponse");
          
          cy.reload();
          cy.intercept('**/applications/').then((res) => {
            // Check if the application exists
            cy.get("#selected-application", {timeout: Cypress.config().largeTimeout}).should('exist');
          });

          cy.intercept('**/generate-token').as('getToken');
          cy.get('#gen-test-key', {timeout: Cypress.config().largeTimeout}).click();
          cy.wait('@getToken', {timeout: Cypress.config().largeTimeout}).its('response.statusCode').should('eq', 200);

          cy.get('[aria-label="Query Editor"]').type('{backspace}'+starWarsSubscriptionRequest);
          cy.get('.topBar').get('.execute-button-wrap').get('button.execute-button').click();
          
          cy.intercept('GET','/swapi/1.0.0/*',(res) => {
            expect(res).property('status').to.equal(200);
            expect(res).property('type').to.equal('websocket');
          }).as("switchProtocol");
          /*
          cy.request({
            method: 'POST',
            url: 'http://localhost:8080/graphql',
            headers:{
              'accept': "application/json", 
              'Content-type': "application/json"
            },
            body: {
              "query":`mutation {createReview(episode: JEDI, review: { stars: 3, commentary: \"Excellent\"}) { stars   episode   commentary }}`,
              "variables":null
            },
          }).then((resp) => {
            expect(JSON.stringify(resp.body)).to.include(starWarsSubscriptionResponse);
          });   */ 
        });

        })
        })
      }
        
        );;

        
        
    });


    after(function () {
      cy.deleteApplication(applicationName);
      cy.logoutFromDevportal();
      cy.loginToPublisher(username, password);
      cy.log("app id " + apiId);
        // Test is done. Now delete the api
        if (apiId != null) {
          Utils.deleteAPI(apiId);
          cy.wait(3000);
        }
    })
})
