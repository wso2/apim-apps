import { getSampleServiceMeta, getSampleOpenAPI } from '../../../support/mockData/serviceCatalog';
import Utils from "@support/utils";


describe("Service catalog create flow", () => {
    const { publisher, password, } = Utils.getUserInfo();

    beforeEach(function () {
        // login before each test
        cy.viewport(1920, 980)
        cy.loginToPublisher(publisher, password)
    })
    it.skip("Deploy sample service", () => {
        cy.visit(`/publisher/service-catalog`);
        cy.get('#itest-service-catalog-onboarding').should('be.visible')
        cy.get('#itest-services-landing-deploy-sample').click()

    });

    it("Create 15~25 services", () => {
        cy.getCookies()
            .then((cookies) => {
                let i = Utils.getRandomRange(10, 15);
                //let i = 1;

                while (i > 0) {
                    const random_number = Utils.getRandomDate();
                    const randomName = Utils.getRandomString();
                    
                    const sampleOAS = getSampleOpenAPI();
                    const serviceMeta = getSampleServiceMeta();

                    serviceMeta.name = `${randomName}-${random_number}`;
                    serviceMeta.version += `${random_number}`;
                    serviceMeta.serviceUrl += `${random_number}`;
                    sampleOAS.info.description += serviceMeta.name;
                    delete serviceMeta.serviceKey;
                    const definitionFile = new File([JSON.stringify(sampleOAS)],
                        'definitionFile.json', { type: 'application/json', lastModified: new Date().getTime() });
                    const serviceMetadataFile = new File([JSON.stringify(serviceMeta)],
                        'serviceMetadata.json', { type: 'application/json', lastModified: new Date().getTime() });

                    const formData = new FormData();
                    formData.append('serviceMetadata', serviceMetadataFile);
                    formData.append('definitionFile', definitionFile);

                    const tokenP1 = cookies.find(c => c.name === "WSO2_AM_TOKEN_1_Default");
                    // fetch(`${Cypress.config().baseUrl}/api/am/service-catalog/v1/services`, {
                    //     method: 'POST',
                    //     body: formData,
                    //     headers: {
                    //         'authorization': 'Bearer ' + tokenP1.value,
                    //     }
                    // }).then(response => {
                    //     //cy.log('response.status: ', response.status);
                    //     cy.log(response);
                    //   })

                    cy.request({
                        method: 'POST', 
                        url: `${Cypress.config().baseUrl}/api/am/service-catalog/v1/services`,
                        headers: {
                          'authorization': 'Bearer ' + tokenP1.value,
                        },
                        body: formData
                      }).then( ({ status }) => {
                        expect(status).to.eq(200)
                      }).then( ({ body }) => {
                        cy.log(body)
                      })
                      

                    i -= 1;
                    debugger;
                }

            })
        cy.visit(`/publisher/service-catalog`);

    });

    it("Delete all Services", () => {
        cy.wait(3000)
        cy.visit(`${Cypress.config().baseUrl}/publisher/service-catalog`);
        cy.wait(3000)
        cy.get('#itest-services-listing-total')
            .then(
                (countElement) => {
                    let totalServices = parseInt(countElement.text());
                    debugger;
                    while (totalServices  > 0) {
                        cy.get('#itest-service-card-delete').click();
                        cy.get('#itest-service-card-delete-confirm').click();
                        totalServices -= 1;
                    }
                    cy.get('#itest-service-catalog-onboarding').should('be.visible')
                }
            )
    });


})
