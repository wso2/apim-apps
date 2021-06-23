import Utils from "@support/utils";

describe("API Create flow", () => {
    const username = 'admin'
    const password = 'admin'
    beforeEach(function () {
        // login before each test
        cy.loginToPublisher(username, password)
    })
    it("Deploy sample API", () => {
        cy.viewport(1920, 980)
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
        cy.get('#itest-id-deploy-sample-api').click();
        cy.get('#itest-api-name-version').should('be.visible');
        cy.url().should('contains', '/overview');
        cy.get("#itest-api-name-version").contains('PizzaShackAPI');
        cy.get('#itest-id-deleteapi-icon-button').click();
        cy.get('#itest-id-deleteconf').click();        
    })

    it("Create an API", () => {
        cy.createAPIByRestAPIDesign();
    })


    it("Create 2~4 APIs", () => {
        let i = Utils.getRandomRange(2, 4);
        while (i > 0) {
            cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
            cy.get('#itest-id-createapi').click()
            cy.get('#itest-id-createdefault').click()
            const random_number = Math.round(Math.random() * 1000);
            const randomName = Utils.generateName();
            const apiName = `${randomName}_api_${random_number}`
            cy.get('#itest-id-apiname-input').type(apiName);
            cy.get('#itest-id-apicontext-input').click();
            cy.get('#itest-id-apicontext-input').type(`/sample_context_${random_number}`);
            cy.get('#itest-id-apiversion-input').click();
            cy.get('#itest-id-apiversion-input').type(`v${random_number}`);
            cy.get('#itest-id-apiendpoint-input').click();
            cy.get('#itest-id-apiendpoint-input').type(`https://apis.wso2.com/sample${random_number}`);
            cy.get('#itest-create-default-api-button').click();
            cy.get("#itest-api-name-version").contains(apiName);
            i -= 1;
        }
    });

    it("Create API from swagger URL", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
        cy.get('#itest-id-createapi').click();
        cy.get('#itest-id-openapi').click();
        cy.get('#outlined-full-width').type('https://petstore.swagger.io/v2/swagger.json');
        cy.get('#itest-create-open-api-w1').click();
        cy.get('#itest-create-open-api-w2').click();
        cy.get("#itest-api-name-version").contains(`SwaggerPetstore :1.0.5`);
        cy.get("#itest-api-name-version").contains(`1.0.5`);    
        cy.get('#itest-id-deleteapi-icon-button').click();
        cy.get('#itest-id-deleteconf').click();             
    });


    it("Create API from swagger from file", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
        cy.get('#itest-id-createapi').click();
        cy.get('#itest-id-openapi').click();
        cy.get('#itest-openapi-archive-select').click();
        cy.get('#itest-select-swagger').then(function (el) {
            const filepath = 'api_artifacts/swagger_2.0.json'
            cy.get('input[type="file"]').attachFile(filepath)            
        })
        cy.get('#itest-create-open-api-w1').click();
        cy.get('#itest-id-apiversion-input').type('11');
        cy.get('#itest-create-open-api-w2').click();
        cy.get("#itest-api-name-version").contains('SwaggerPetstore:1.0.011');
        cy.get('#itest-id-deleteapi-icon-button').click();
        cy.get('#itest-id-deleteconf').click();
    });
    
    it("Create API from Open API 3", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
        cy.get('#itest-id-createapi').click();
        cy.get('#itest-id-openapi').click();
        cy.get('#outlined-full-width').type('https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.json');
        cy.get('#itest-create-open-api-w1').click();    
        cy.get('#itest-id-apiname-input').type('3');
        cy.get('#itest-id-apicontext-input').type('/abc3');
        cy.get('#itest-id-apiversion-input').type('3');
        cy.get('#itest-id-apiendpoint-input').click();
        cy.get('#itest-create-open-api-w2').click();
        cy.get("#itest-api-name-version").contains('SwaggerPetstore3 :1.0.03');
        cy.get('#itest-id-deleteapi-icon-button').click();
        cy.get('#itest-id-deleteconf').click();
    });

    it("Create API from Open API from file", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
        cy.get('#itest-id-createapi').click();
        cy.get('#itest-id-openapi').click();
        cy.get('#itest-openapi-archive-select').click();
        cy.get('#itest-select-swagger').then(function (el) {
            const filepath = 'api_artifacts/petstore_open_api_3.json'
            cy.get('input[type="file"]').attachFile(filepath)            
        })
        cy.get('#itest-create-open-api-w1').click();
        cy.get('#itest-id-apicontext-input').type('/abc4');
        cy.get('#itest-id-apiversion-input').type('4');
        cy.get('#itest-create-open-api-w2').click();
        cy.get("#itest-api-name-version").contains('SwaggerPetstore4 :1.0.04');
        cy.get('#itest-id-deleteapi-icon-button').click();
        cy.get('#itest-id-deleteconf').click();
    });

    /*
    it("Create API from GraphQL API file", () => {
        cy.visit(`${Utils.getAppOrigin()}/publisher/apis`)
        cy.get('#itest-id-createapi').click();
        cy.get('#itest-id-graphql').click();
        cy.get('#itest-select-graphql').then(function (el) {
            const filepath = 'api_artifacts/schema_graphql.graphql'
            cy.get('input[type="file"]').attachFile(filepath)            
        })
        cy.get('#itest-create-graphql-api-w1').click();
        cy.get('#itest-id-apiname-input').type('GraphQLAPI');
        cy.get('#itest-id-apicontext-input').type('/graphql1');
        cy.get('#itest-id-apiversion-input').type('v3');
        cy.get('#itest-id-apiendpoint-input').type('https://graphql.api.wso2.com');
        //cy.get('.MuiButton-contained-2732').click();
        cy.get('#itest-id-deleteapi-icon-button').click();
        cy.get('#itest-id-deleteconf').click();
    });
    */
})