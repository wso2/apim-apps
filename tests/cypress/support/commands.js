import 'cypress-file-upload';

Cypress.Commands.add('carbonLogin', (username, password) => {
    Cypress.log({
        name: 'carbonLogin',
        message: `${username} | ${password}`,
    })

    cy.visit(`/carbon/admin/login.jsp`);
    cy.get('#txtUserName').type(username);
    cy.get('#txtPassword').type(password);
    cy.get('form').submit();
})
Cypress.Commands.add('portalLogin', (username = 'admin', password = 'admin', portal) => {
    Cypress.log({
        name: 'portalLogin',
        message: `${username} | ${password}`,
    })

    if (portal === 'devportal') {
        cy.visit('/devportal/apis?tenant=carbon.super');
        cy.get('[data-testid="itest-devportal-sign-in"]').click();
    } else{
        cy.visit(`${portal}`);
    }
    cy.url().should('contains', `/authenticationendpoint/login.do`);
    cy.get('#usernameUserInput').click();
    cy.get('#usernameUserInput').type(username);
    cy.get('#password').type(password);
    cy.get('#loginForm').submit();
    cy.url().should('contains', `${portal}`);
})

Cypress.Commands.add('loginToPublisher', (username, password) => {
    cy.portalLogin(username, password, 'publisher');
})

Cypress.Commands.add('loginToDevportal', (username, password) => {
    cy.portalLogin(username, password, 'devportal');
})
Cypress.Commands.add('addNewTenant', (tenant = 'wso2.com', password = 'admin') => {
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';
    cy.carbonLogin(carbonUsername, carbonPassword);
    cy.visit('/carbon/tenant-mgt/add_tenant.jsp?region=region1&item=govern_add_tenants_menu');
    cy.get('#buttonRow .button');
    cy.get('#domain').click();
    cy.get('#domain').type(tenant);
    cy.get('#admin-firstname').click();
    cy.get('#admin-firstname').type('admin');
    cy.get('#admin-lastname').click();
    cy.get('#admin-lastname').type('admin');
    cy.get('#admin').click();
    cy.get('#admin').type('admin');
    cy.on('uncaught:exception', (err, runnable) => {
        expect(err.message).to.include('isDomainNameAvailable is not defined')

        // using mocha's async done callback to finish
        // this test so we prove that an uncaught exception
        // was thrown
        done()

        // return false to prevent the error from
        // failing this test
        return false
    });
    cy.get('#admin-password').click();
    cy.get('#admin-password').type(password);
    cy.get('#admin-password-repeat').click();
    cy.get('#admin-password-repeat').type(password);
    cy.get('#admin-email').click();
    cy.get('#admin-email').type(`admin@${tenant}`);
    cy.get('#buttonRow .button').click();
})


Cypress.Commands.add('deleteAllApis', () => {
    cy.visit(`/publisher/apis`);
    cy.get('[data-testid="itest-id-deleteapi-icon-button"]').each(($btn) => {
        cy.wrap($btn).click();
        cy.get('[data-testid="itest-id-deleteconf"]').click();
    })
});

Cypress.Commands.add('deploySampleAPI', () => {
    cy.deleteAllApis();
    cy.get('[data-testid="deploy-sample-api-btn"]').click();
    cy.get('[data-testid="itest-api-name-context"]', { timeout: 30000 }).should('be.visible');
    cy.url().should('contains', '/overview');
    cy.get('[data-testid="itest-api-name-context"]').contains('/pizzashack');
    return cy.location('pathname').then((pathName) => {
        const pathSegments = pathName.split('/');
        const apiUUID = pathSegments[pathSegments.length - 2];
        return { uuid: apiUUID };
    });
});

Cypress.Commands.add('createAPIByRestAPIDesign', (name, type = 'REST') => {
    const random_number = Math.floor(Date.now() / 1000);
    const randomName = `sample_api_${random_number}`;
    cy.visit(`/publisher/apis`);
    cy.get('[data-testid="itest-id-createapi"]').click();
    cy.get('[data-testid="itest-id-createdefault"]').click();
    cy.get('[data-testid="itest-id-apiname-input"]').type(name || randomName);
    cy.get('[data-testid="itest-id-apicontext-input"] input').click();
    cy.get('[data-testid="itest-id-apicontext-input"] input').type(`/sample_context_${random_number}`);
    cy.get('[data-testid="itest-id-apiversion-input"] input').click();
    cy.get('[data-testid="itest-id-apiversion-input"] input').type(`v${random_number}`);
    cy.get('[data-testid="itest-id-apiendpoint-input"]').click();
    cy.get('[data-testid="itest-id-apiendpoint-input"]').type(`https://apis.wso2.com/sample${random_number}`);
    cy.get('[data-testid="itest-create-default-api-button"]').click();
    cy.visit(`/publisher/apis`);
    cy.get(`#sample_api_${random_number}`).click();


    cy.get('[data-testid="itest-api-name-version"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="itest-api-name-version"]').contains(`v${random_number}`);
    return cy.location('pathname').then((pathName) => {
        const pathSegments = pathName.split('/');
        const apiUUID = pathSegments[pathSegments.length - 2];
        return { uuid: apiUUID };
    })

})

Cypress.Commands.add('createAPIWithoutEndpoint', (name, type = 'REST') => {
    const random_number = Math.floor(Date.now() / 1000);
    const randomName = `sample_api_${random_number}`;
    cy.visit(`/publisher/apis`)
    cy.get('[data-testid="itest-id-createapi"]').click();
    cy.get('[data-testid="itest-id-createdefault"]').click();
    cy.get('[data-testid="itest-id-apiname-input"]').type(name || randomName);
    cy.get('[data-testid="itest-id-apicontext-input"] input').click();
    cy.get('[data-testid="itest-id-apicontext-input"] input').type(`/sample_context_${random_number}`);
    cy.get('[data-testid="itest-id-apiversion-input"] input').click();
    cy.get('[data-testid="itest-id-apiversion-input"] input').type(`v${random_number}`);
    cy.get('[data-testid="itest-id-apiendpoint-input"]').click();
    cy.get('[data-testid="itest-create-default-api-button"]').click();
    cy.visit(`/publisher/apis`);
    cy.get(`#sample_api_${random_number}`).click();


    cy.get('[data-testid="itest-api-name-version"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="itest-api-name-version"]').contains(`v${random_number}`);
    return cy.location('pathname').then((pathName) => {
        const pathSegments = pathName.split('/');
        const apiUUID = pathSegments[pathSegments.length - 2];
        return { uuid: apiUUID };
    })
})

