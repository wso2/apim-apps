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
Cypress.Commands.add('portalLogin', (username, password, portal) => {
    Cypress.log({
        name: 'portalLogin',
        message: `${username} | ${password}`,
    })

    cy.visit(`${portal}`);
    if (portal === 'devportal') {
        cy.get('#itest-devportal-sign-in').click();
    }
    cy.url().should('contains', `/authenticationendpoint/login.do`);
    cy.get('#usernameUserInput').click();
    cy.get('#usernameUserInput').type('admin');
    cy.get('#password').type('admin');
    cy.get('#loginForm').submit();
    cy.url().should('contains', `${portal}`);
})

Cypress.Commands.add('loginToPublisher', (username, password) => {
    cy.portalLogin(username, password, 'publisher');
})

Cypress.Commands.add('loginToDevportal', (username, password) => {
    cy.portalLogin(username, password, 'devportal');
})

Cypress.Commands.add('deploySampleAPI', () => {
    cy.visit(`/publisher/apis`)
    cy.get('#itest-rest-api-create-menu').click()
    cy.get('#itest-id-deploy-sample').click()
    cy.get('#itest-api-name-version').should('be.visible');
    cy.url().should('contains', '/overview');
    cy.get("#itest-api-name-version").contains('PizzaShackAPI');
    return cy.location('pathname').then((pathName) => {
        const pathSegments = pathName.split('/');
        const apiUUID = pathSegments[pathSegments.length - 2];
        return { uuid: apiUUID };
    })
})

Cypress.Commands.add('createAPIByRestAPIDesign', (name, type = 'REST') => {
    const random_number = Math.floor(Date.now() / 1000);
    const randomName = `sample_api_${random_number}`;
    cy.visit(`/publisher/apis`)
    cy.get('#itest-id-createapi').click()
    cy.get('#itest-id-createdefault').click()
    cy.get('#itest-id-apiname-input').type(name || randomName);
    cy.get('#itest-id-apicontext-input').click();
    cy.get('#itest-id-apicontext-input').type(`/sample_context_${random_number}`);
    cy.get('#itest-id-apiversion-input').click();
    cy.get('#itest-id-apiversion-input').type(`v${random_number}`);
    cy.get('#itest-id-apiendpoint-input').click();
    cy.get('#itest-id-apiendpoint-input').type(`https://apis.wso2.com/sample${random_number}`);
    cy.get('#itest-create-default-api-button').click();
    cy.visit(`/publisher/apis`);
    cy.get(`#sample_api_${random_number}`).click();


    cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
    cy.get("#itest-api-name-version").contains(`v${random_number}`);
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
    cy.get('#itest-id-createapi').click()
    cy.get('#itest-id-createdefault').click()
    cy.get('#itest-id-apiname-input').type(name || randomName);
    cy.get('#itest-id-apicontext-input').click();
    cy.get('#itest-id-apicontext-input').type(`/sample_context_${random_number}`);
    cy.get('#itest-id-apiversion-input').click();
    cy.get('#itest-id-apiversion-input').type(`v${random_number}`);
    cy.get('#itest-id-apiendpoint-input').click();
    cy.get('#itest-create-default-api-button').click();
    cy.visit(`/publisher/apis`);
    cy.get(`#sample_api_${random_number}`).click();


    cy.get('#itest-api-name-version', { timeout: 30000 }).should('be.visible');
    cy.get("#itest-api-name-version").contains(`v${random_number}`);
    return cy.location('pathname').then((pathName) => {
        const pathSegments = pathName.split('/');
        const apiUUID = pathSegments[pathSegments.length - 2];
        return { uuid: apiUUID };
    })

})
