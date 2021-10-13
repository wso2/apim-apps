/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *  
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
describe("do nothing", () => {
    const username = 'admin'
    const password = 'admin'

    beforeEach(function () {
        cy.loginToPublisher(username, password)
        // login before each test
    });
    const downloadMediator = (type) => {
        cy.get(`[data-testid="mediation-edit-${type}"]`).click();
        cy.get('[data-testid="mediation-policy-global"]').click();

        cy.document().then((doc) => {
            const fileName = doc.querySelector('[data-testid="mediation-policy-global-radios"] button').getAttribute('data-testid');
            const downloadsFolder = Cypress.config('downloadsFolder')
            const downloadedFilename = `${downloadsFolder}/${fileName}.xml`;
            cy.get(`[data-testid="${fileName}"]`).click();


            cy.readFile(downloadedFilename, 'binary', { timeout: 15000 })
                .should(buffer => expect(buffer.length).to.be.gt(100));
            cy.get('[data-testid="cancel-seq"]').click();
        })
    }
    const uploadMediator = (type) => {
        cy.get(`[data-testid="mediation-edit-${type}"]`).click();
        cy.get('[data-testid="mediation-policy-custom"]').click();

        // upload the image
        const fileName = 'json_to_xml_in_message_custom';
        const filepath = `api_artifacts/${fileName}.xml`;
        cy.get('input[type="file"]').attachFile(filepath);
        // select and close popup
        cy.get('[data-testid="select-mediator-from-list"]').click();
        // save runtime configs
        cy.get('[data-testid="save-runtime-configurations"]').click();
        cy.get(`[data-testid="mediation-edit-${type}"]`).then(() => {
            cy.get(`[data-testid="mediation-edit-${type}"]`).click();
            
            cy.contains(fileName).should('exist');
        });
    }
    it.only("Download mediation policies for In Flow, Out Flow, Fault Flow", () => {
        cy.createAPIByRestAPIDesign();
        cy.get('[data-testid="left-menu-itemRuntimeConfigurations"]').click();

        //Downloading
        downloadMediator('IN');
        downloadMediator('OUT');
        downloadMediator('FAULT');

        // Uploading
        uploadMediator('IN');
        uploadMediator('OUT');
        uploadMediator('FAULT');
    });

    after(function () {
        // Test is done. Now delete the api
        cy.get(`[data-testid="itest-id-deleteapi-icon-button"]`).click();
        cy.get(`[data-testid="itest-id-deleteconf"]`).click();
    })
});