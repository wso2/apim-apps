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
    } else {
        cy.visit(`${portal}`);
    }
    cy.url().should('contain', `/authenticationendpoint/login.do`);
    cy.get('#usernameUserInput').click();
    cy.get('#usernameUserInput').type(username);
    cy.get('#password').type(password);
    cy.get('#loginForm').submit();
    cy.url().should('contain', `${portal}`);
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

    // There is a UI error in the carbon console. We need to skip this so that the test will not fail.
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
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
    cy.intercept('**/apis*').as('getApis');
    cy.wait('@getApis').then((interception) => {
        if (interception.response && interception.response.body && interception.response.body.count > 0) {
            cy.get('[data-testid="itest-id-deleteapi-icon-button"]', { timeout: 30000 });
            cy.get('[data-testid="itest-id-deleteapi-icon-button"]').each(($btn) => {
                cy.wrap($btn).click();
                cy.get('[data-testid="itest-id-deleteconf"]').click();
            })
        }
    })
});

Cypress.Commands.add('deploySampleAPI', () => {
    cy.deleteAllApis();
    cy.get('[data-testid="deploy-sample-api-btn"]').click();
    cy.get('[data-testid="itest-api-name-context"]', { timeout: 30000 }).should('be.visible');
    cy.url().should('contain', '/overview');
    cy.get('[data-testid="itest-api-name-context"]').contains('/pizzashack');
    /* 
    TODO
    There are intermittent occasions where the api is not publish we need to have a check here to
    manually publish if this happens. Otherwise the tests can fail intermittently.
    */
});

Cypress.Commands.add('createAPIByRestAPIDesign', (name = null, version = null, context = null) => {
    const random_number = Math.floor(Date.now() / 1000);

    const apiName = name ? name : `sample_api_${random_number}`;
    const apiVersion = version ? version : `v${random_number}`;
    const apiContext = context ? context : `/sample_context_${random_number}`;
    cy.visit(`/publisher/apis`);
    cy.get('[data-testid="itest-id-createapi"]').click();
    cy.get('[data-testid="itest-id-createdefault"]').click();
    cy.get('[data-testid="itest-id-apiname-input"]').type(apiName);
    cy.get('[data-testid="itest-id-apicontext-input"] input').click();
    cy.get('[data-testid="itest-id-apicontext-input"] input').type(apiContext);
    cy.get('[data-testid="itest-id-apiversion-input"] input').click();
    cy.get('[data-testid="itest-id-apiversion-input"] input').type(apiVersion);
    cy.get('[data-testid="itest-id-apiendpoint-input"]').click();
    cy.get('[data-testid="itest-id-apiendpoint-input"]').type(`https://apis.wso2.com/sample${random_number}`);
    cy.get('[data-testid="itest-create-default-api-button"]').click();
    cy.visit(`/publisher/apis`);
    cy.get(`#${apiName}`).click();


    cy.get('[data-testid="itest-api-name-version"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="itest-api-name-version"]').contains(apiVersion);
})

Cypress.Commands.add('createAndPublishAPIByRestAPIDesign', (name = null, version = null, context = null) => {
    const random_number = Math.floor(Date.now() / 1000);

    const apiName = name ? name : `sample_api_${random_number}`;
    const apiVersion = version ? version : `v${random_number}`;
    const apiContext = context ? context : `/sample_context_${random_number}`;
    cy.visit(`/publisher/apis`);
    cy.get('[data-testid="itest-id-createapi"]').click();
    cy.get('[data-testid="itest-id-createdefault"]').click();
    cy.get('[data-testid="itest-id-apiname-input"]').type(apiName);
    cy.get('[data-testid="itest-id-apicontext-input"] input').click();
    cy.get('[data-testid="itest-id-apicontext-input"] input').type(apiContext);
    cy.get('[data-testid="itest-id-apiversion-input"] input').click();
    cy.get('[data-testid="itest-id-apiversion-input"] input').type(apiVersion);
    cy.get('[data-testid="itest-id-apiendpoint-input"]').click();
    cy.get('[data-testid="itest-id-apiendpoint-input"]').type(`https://apis.wso2.com/sample${random_number}`);
    cy.get('[data-testid="select-policy-dropdown"]').click();
    cy.get('[data-testid="policy-item-Silver"]').click();
    cy.get('[data-testid="policy-item-Unlimited"]').click();
    cy.get('#menu-policies').click('topLeft');
    cy.get('#itest-id-apicreatedefault-createnpublish').click();

    // Wait for the api to load
    cy.get('[data-testid="itest-api-name-version"]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid="itest-api-name-version"]').contains(apiVersion);
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
})

Cypress.Commands.add('createApp', (appName, appDescription) => {
    cy.visit('/devportal/applications/create?tenant=carbon.super');
    // Filling the form
    cy.get('#application-name').dblclick();
    cy.get('#application-name').type(appName);
    cy.get('#application-description').click();
    cy.get('#application-description').type('{backspace}');
    cy.get('#application-description').type(appDescription);
    cy.get('[data-testid="application-save-btn"]').click();

    // Checking the app name exists in the overview page.
    cy.url().should('contain', '/overview');
    cy.get('[data-testid="application-title"]').contains(appName).should('exist');
})

Cypress.Commands.add('logoutFromDevportal', (referer = '/devportal/apis') => {
    cy.visit('/devportal/apis?tenant=carbon.super');
    cy.get('#userToggleButton').click();
    cy.get('[data-testid="logout-link"]').click();
    cy.url().should('contain', '/devportal/logout');
    cy.url().should('contain', referer);
})

