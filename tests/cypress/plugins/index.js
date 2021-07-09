const browserify = require('@cypress/browserify-preprocessor')
const path = require('path');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
    // send in the options from your webpack.config.js, so it works the same
    // as your app's code
    const options = browserify.defaultOptions;
    options.browserifyOptions.transform[1][1].babelrc = true;
  
    on('file:preprocessor', browserify(options));
}

module.exports = (on, config) => {
  require('cypress-mochawesome-reporter/plugin')(on);
};

const sendAnEmail = (message) => {

  const nodemailer = require('nodemailer');
  const sgTransport = require('nodemailer-sendgrid-transport');
  const options = {
    auth: {
      api_user: 'sendgrid_USER',
      api_key: 'sendgrid_APIKEY'
    }
  }
  const client = nodemailer.createTransport(sgTransport(options));

  const email = {
    from: 'FROM_MAIL.PL',
    to: 'TO_MAIL.PL',
    subject: 'Hello',
    text: message,
    html: '<b>Hello world</b>'
  };
  client.sendMail(email, function(err, info) {
    return err? err.message : 'Message sent: ' + info.response;
  });
}

module.exports = (on, config) => {
  on('task', {
    sendMail (message) {
      return sendAnEmail(message);
    }
  })
}


// in plugins file
module.exports = (on, config) => {
  on('task', {
    log(message) {
      console.log(message)
      return null
    },
  })
}


module.exports = (on, config) => {
  on('after:run', (results) => {
    // results will look something like this when run via `cypress run`:
    // {
    //   totalDuration: 81,
    //   totalSuites: 0,
    //   totalTests: 1,
    //   totalFailed: 0,
    //   totalPassed: 1,
    //   totalPending: 0,
    //   totalSkipped: 0,
    //   browserName: 'electron',
    //   browserVersion: '59.0.3071.115',
    //   osName: 'darwin',
    //   osVersion: '16.7.0',
    //   cypressVersion: '3.1.0',
    //   config: {
    //     projectId: '1qv3w7',
    //     baseUrl: 'http://example.com',
    //     viewportWidth: 1000,
    //     viewportHeight: 660,
    //     // ... more properties...
    //   }
    //   // ... more properties...
    //   }
    // }

    if (results) {
      console.log('TEST RUN COMPLETED');
      // results will be undefined in interactive mode
      console.log(results.totalPassed, 'out of', results.totalTests, 'passed') ;      
    }
  })

  const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');  
  const exec = require('child_process').execSync;  
  module.exports = (on) => {  
    on('before:run', async (details) => {  
      console.log('override before:run');  
      await beforeRunHook(details);  
      //If you are using other than Windows remove below two lines  
      await exec("IF EXIST cypress\\screenshots rmdir /Q /S cypress\\screenshots")  
      await exec("IF EXIST cypress\\reports rmdir /Q /S cypress\\reports")  
    });

    on('after:run', async () => {  
        console.log('override after:run');  
        //if you are using other than Windows remove below line starts with await exec  
        await exec("npx jrm ./cypress/reports/junitreport.xml ./cypress/reports/junit/*.xml");  
        await afterRunHook();  
      });  
    };
}