
describe("Runtime configuration", () => {
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    const apiName = 'newapi' + Math.floor(Date.now() / 1000);
    const apiVersion = '1.0.0';

    before(function () {
        //cy.carbonLogin(carbonUsername, carbonPassword);
        //cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
        cy.loginToPublisher(publisher, password);
    })

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
        //cy.wait(5000);
        cy.get(`[data-testid="mediation-edit-${type}"]`).then(() => {
            cy.get(`[data-testid="mediation-edit-${type}"]`).click();

            cy.contains(fileName).should('exist');
        });
    }
    it.only("Download mediation policies for In Flow, Out Flow, Fault Flow", () => {
        cy.createAPIByRestAPIDesign(apiName, apiVersion);
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
          cy.deleteApi(apiName, apiVersion);

        //cy.visit('carbon/user/user-mgt.jsp');
        //cy.deleteUser(publisher);
    })
});