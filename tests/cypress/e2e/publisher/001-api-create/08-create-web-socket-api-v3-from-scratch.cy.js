import Utils from "@support/utils";

describe("WebSocket API (V3) - Topics Page Tests", () => {
    // suppress ResizeObserver error which can cause unexpected navigation
    Cypress.on('uncaught:exception', (err, runnable) => {
        if (err.message && err.message.includes('ResizeObserver loop limit exceeded')) {
            return false; 
        }
    });

    const { publisher, password } = Utils.getUserInfo();
    let apiId;

    after(() => {
        const id = apiId || Cypress.env('wsApiId');
        if (id) {
            cy.getCookie('WSO2_AM_TOKEN_1_Default').then((cookie) => {
                if (cookie) {
                    Utils.deleteAPI(id);
                } else {
                    cy.loginToPublisher(publisher, password);
                    Utils.deleteAPI(id);
                }
            });
        }
    });

    const navigateToTopics = () => {
        cy.visit(`/publisher/apis/${apiId}/topics`);
        cy.get('#add-operation-button', { timeout: 30000 }).should('be.visible');
    };

    it("1. Create WebSocket API from scratch", () => {
        cy.loginToPublisher(publisher, password);
        const random_number = Math.floor(Date.now() / 1000);
        const randomName = Utils.generateName();
    
        cy.visit(`/publisher/apis/create/streamingapi/ws`);
        cy.get('#itest-id-apiname-input').type(randomName);
        cy.get('#itest-id-apicontext-input').click().type(`/sample_context_${random_number}`);
        cy.get('#itest-id-apiversion-input').click().type(`v${random_number}`);
        cy.get('#itest-id-apiendpoint-input').click().type('wss://www.example.com/socketserver');
    
        cy.intercept('**/apis/**').as('apiGet');
        cy.get('[data-testid="itest-create-streaming-api-button"]').click();
        cy.wait('@apiGet', { timeout: 30000 }).then((data) => {
            apiId = data.response.body.id;
            Cypress.env('wsApiId', apiId);
            cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
            cy.get('#itest-api-name-version').contains(`v${random_number}`);
        });
    });

    it("2. Add a channel and an operation from UI and verify it appears in spec", () => {
        cy.loginToPublisher(publisher, password);
        navigateToTopics();

        // add a send operation on a new channel 'newchannel'
        cy.get('#add-operation-selection-dropdown').click();
        cy.get('li[data-value="send"]', { timeout: 5000 }).click();
        cy.get('input[placeholder="Enter Channel Address"]').clear().type('newchannel');
        cy.get('#operation-name').clear().type('sendMessages'); cy.get('#add-operation-button').click();
        cy.contains('newchannel', { timeout: 5000 }).should('be.visible');

        cy.intercept('PUT', '**/asyncapi').as('saveTopics');
        cy.get('[data-testid="custom-select-save-button"]').click();
        cy.wait('@saveTopics', { timeout: 15000 }).then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });

        // navigate to AsyncAPI definition page and verify the spec is updated
        cy.intercept('GET', '**/asyncapi').as('getSpec');
        cy.visit(`/publisher/apis/${apiId}/asyncApi-definition`);
        cy.wait('@getSpec', { timeout: 15000 });

        cy.get('@getSpec').then((interception) => {
            const spec = interception.response.body;
            cy.log('Spec from definition page: ' + JSON.stringify(spec));
            const channel = Object.values(spec.channels || {}).find(
                (ch) => ch.address === 'newchannel'
            );
            expect(channel).to.exist;

            const operation = spec.operations?.['sendMessages'];
            expect(operation).to.exist;
            expect(operation.action).to.equal('send');
            expect(operation.channel?.$ref).to.include('newchannel');

        });

    });

    it("4. Duplicate operation names are not allowed", () => {
        apiId = apiId || Cypress.env('wsApiId');
        cy.loginToPublisher(publisher, password);
        navigateToTopics();

        // try to add an operation with same name as already saved 'sendMessages'
        cy.get('#add-operation-selection-dropdown').click();
        cy.get('li[data-value="send"]', { timeout: 5000 }).click();
        cy.get('input[placeholder="Enter Channel Address"]').clear().type('/notifications');
        cy.get('#operation-name').clear().type('sendMessages');
        cy.get('#add-operation-button').click();

        // warning alert should appear
        cy.contains('already exists', { timeout: 5000 }).should('be.visible');

        // operation count should not increase
        cy.get('[data-testid="custom-select-save-button"]').should('be.visible');
        cy.intercept('PUT', '**/asyncapi').as('saveTopics');
        cy.get('[data-testid="custom-select-save-button"]').click();
        cy.wait('@saveTopics', { timeout: 15000 });

        cy.intercept('GET', '**/asyncapi').as('getSpecAfterDuplicate');
        
        cy.visit(`/publisher/apis/${apiId}/asyncApi-definition`);
        cy.wait('@getSpecAfterDuplicate', { timeout: 15000 }).then(({ response }) => {
            const spec = response.body;
            expect(Object.keys(spec.operations || {})).to.include('sendMessages');
            expect(Object.keys(spec.operations || {}).filter((k) => k === 'sendMessages')).to.have.length(1);
        });
    });

    it("5. Adding an operation to an existing channel", () => {
        apiId = apiId || Cypress.env('wsApiId');
        cy.loginToPublisher(publisher, password);
        navigateToTopics();

        cy.get('input[placeholder="Enter Channel Address"]').click();
        // existing channel 'newchannel' from test 2 should appear in dropdown
        cy.contains('newchannel', { timeout: 5000 }).should('be.visible');
        // select it from dropdown
        cy.contains('newchannel').click();
        // add a receive operation on the same existing channel
        cy.get('#add-operation-selection-dropdown').click();
        cy.get('li[data-value="receive"]', { timeout: 5000 }).click();
        cy.get('#operation-name').clear().type('receiveMessages');
        cy.get('#add-operation-button').click();

        cy.intercept('PUT', '**/asyncapi').as('saveTopics');
        cy.get('[data-testid="custom-select-save-button"]').click();
        cy.wait('@saveTopics', { timeout: 15000 }).then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });

        cy.intercept('GET', '**/asyncapi').as('getSpec');
        cy.visit(`/publisher/apis/${apiId}/asyncApi-definition`);
        cy.wait('@getSpec', { timeout: 15000 });

        cy.get('@getSpec').then((interception) => {
            const spec = interception.response.body;
            // verify only ONE channel with address 'newchannel' exists (not duplicated)
            const newChannels = Object.values(spec.channels || {}).filter(
                (ch) => ch.address === 'newchannel'
            );
            expect(newChannels).to.have.length(1);
        });
    });

});
