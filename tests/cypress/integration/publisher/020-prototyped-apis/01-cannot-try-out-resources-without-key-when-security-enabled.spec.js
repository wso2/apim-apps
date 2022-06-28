const userName = 'admin';
const password = 'admin';
const apiName="Prototyped_sample";
const apiVersion='1.0.0';
before(function () {
    cy.loginToPublisher(userName, password);
    cy.on('uncaught:exception', (err, runnable) => {
        if (err.message.includes('applicationId is not provided')||err.message.includes('validateDescription is not a function')) {
          return false
        }
      });
})

it.only("Add Authorization Header for the api", () => {
    cy.deleteApi(apiName,apiVersion);
});