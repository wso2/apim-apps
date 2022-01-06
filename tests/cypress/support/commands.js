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

Cypress.Commands.add('carbonLogout', () => {
    cy.get('[href="../admin/logout_action.jsp"]').click();
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

Cypress.Commands.add('loginToAdmin', (username, password) => {
    cy.portalLogin(username, password, 'admin');
})

Cypress.Commands.add('addNewTenant', (tenant = 'wso2.com', username = 'admin', password = 'admin') => {
    cy.visit('/carbon/tenant-mgt/add_tenant.jsp?region=region1&item=govern_add_tenants_menu');
    cy.get('#buttonRow .button');
    cy.get('#domain').click();
    cy.get('#domain').type(tenant);
    cy.get('#admin-firstname').click();
    cy.get('#admin-firstname').type(username);
    cy.get('#admin-lastname').click();
    cy.get('#admin-lastname').type(username);
    cy.get('#admin').click();
    cy.get('#admin').type(username);

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

Cypress.Commands.add('addNewUser', (name = 'newuser', roles = [], password = 'test123') => {
    // Visit the add user page
    cy.visit('/carbon/user/add-step1.jsp');
    cy.get('input[name="username"]').type(name);
    cy.get('#password').type(password);
    cy.get('#password-repeat').type(password);
    cy.get('.buttonRow input:first-child').click();

    // Go to step 2 where add roles
    cy.url().should('contains', '/carbon/user/add-step2.jsp');
    roles.forEach(role => {
        cy.get(`input[value="${role}"][type="checkbox"]`).check();
    });
    // Finish wizard
    cy.get('.buttonRow input:first-child').click();
    // cy.get('#messagebox-info p').contains(`User PRIMARY/${name} is added successfully.`).should('exist');
})

Cypress.Commands.add('addNewTenantUser', (
    tenantUser,
    password = 'test123',
    tenantRoles = ['Internal/publisher', 'Internal/creator', 'Internal/everyone'],
    tenant = 'wso2.com',
    tenantAdminUsername = 'admin',
    tenantAdminPassword = 'admin'
) => {
    cy.addNewTenant(tenant, tenantAdminUsername, tenantAdminPassword);
    cy.reload();
    cy.carbonLogout();
    cy.carbonLogin(`${tenantAdminUsername}@${tenant}`, tenantAdminPassword);
    cy.addNewUser(tenantUser, tenantRoles, password);
})

Cypress.Commands.add('deleteUser', (name) => {
    cy.get(`[onClick="deleteUser(\'${name}\')"]`).click();
    cy.get('.ui-dialog  .ui-dialog-buttonpane button:first-child').click();

    cy.get('#messagebox-info p').contains(`User ${name} is deleted successfully.`).should('exist');
    cy.get('.ui-dialog-buttonpane button').click();
});

Cypress.Commands.add('deleteApi', (name, version) => {
    cy.visit(`/publisher/apis`);
    cy.intercept('**/apis*').as('getApis');
    cy.wait('@getApis');
    cy.get(`[id="${name}${version}-delete-button"]`, { timeout: 30000 });
    cy.get(`[id="${name}${version}-delete-button"]`).click();
    cy.get('[data-testid="itest-id-deleteconf"]').click();
});

// Don't use this 
// Fails intermittently 
// Instead delete each api after the test is finish.
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
    cy.get('[data-testid="itest-id-createapi"]', { timeout: 30000 });
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
    // There is a UI error in the carbon console. We need to skip this so that the test will not fail.
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    });
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
    cy.get('[data-testid="itest-id-createapi"]', { timeout: 30000 });
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
    cy.get('#application-name').click();
    cy.get('#application-name').type(appName);
    cy.get('#application-description').click();
    cy.get('#application-description').type('{backspace}');
    cy.get('#application-description').type(appDescription);
    cy.get('[data-testid="application-save-btn"]').click();

    // Checking the app name exists in the overview page.
    cy.url().should('contain', '/overview');
    cy.get('[data-testid="application-title"]').contains(appName).should('exist');
});

Cypress.Commands.add('createAndPublishApi', (apiName = null) => {
    cy.visit(`/publisher/apis`);
    // select the option from the menu item
    cy.get('[data-testid="itest-id-createapi"]').click();
    cy.get('[data-testid="create-api-open-api"]').click();
    cy.get('[data-testid="open-api-file-select-radio"]').click();

    // upload the swagger
    cy.get('[data-testid="browse-to-upload-btn"]').then(function () {
        const filepath = 'api_artifacts/swagger_2.0.json'
        cy.get('input[type="file"]').attachFile(filepath)
    });

    // go to the next step
    cy.get('[data-testid="api-create-next-btn"]').click();

    // Fill the second step form
    if (apiName) {
        const random_number = Math.floor(Date.now() / 1000);

        cy.get('[data-testid="itest-id-apiname-input"]').clear().type(apiName);
        cy.get('[data-testid="itest-id-apicontext-input"] input').click();
        cy.get('[data-testid="itest-id-apicontext-input"] input').clear().type(`/api_${random_number}`);
    }
    cy.get('[data-testid="select-policy-dropdown"]').click();
    cy.get('[data-testid="policy-item-Silver"]').click();
    cy.get('[data-testid="policy-item-Unlimited"]').click();
    cy.get('#menu-policies').click('topLeft');

    // validate
    cy.intercept('**/lifecycle-state').as('lifeCycleStatus');
    // finish the wizard
    cy.get('[data-testid="api-create-finish-btn"]').click();
    cy.wait('@lifeCycleStatus', { requestTimeout: 30000 });

    // publish
    cy.get('[data-testid="publish-btn"]', { timeout: 30000 });
    cy.get('[data-testid="publish-btn"]').click();
    cy.get('[data-testid="published-status"]', { timeout: 30000 });
    cy.get('[data-testid="published-status"]').contains('Published').should('exist');

})

Cypress.Commands.add('logoutFromDevportal', (referer = '/devportal/apis') => {
    cy.visit('/devportal/apis?tenant=carbon.super');
    cy.get('#userToggleButton').click();
    cy.get('[data-testid="logout-link"]').click();
    cy.url().should('contain', '/devportal/logout');
    cy.url().should('contain', referer);
})

Cypress.Commands.add('logoutFromPublisher', () => {
    cy.get('[data-testid="logout-menu-dropdown"]', { timeout: 30000 });
    cy.get('[data-testid="logout-menu-dropdown"]').click();
    cy.get('[data-testid="logout-menu-item"]').click();
    cy.get('#usernameUserInput').should('exist');
})

