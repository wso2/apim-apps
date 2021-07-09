const fs = require('fs');
const AWS = require('aws-sdk');

var nodemailer = require('nodemailer');

// Enter copied or downloaded access ID and secret key here
const ID = '';
const SECRET = '';

// The name of the bucket that you have created
const BUCKET_NAME = 'apim-3.2.0-ui-testing';
var accessKeyId   = process.env.S3_SECRET_KEY;
var secretAccessKey = process.env.S3_ACCESS_KEY;
var testPlanId = process.env.TEST_PLAN_ID;


const s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});

const uploadFile = (fileName) => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);

  // Setting up S3 upload parameters
  const params = {
      Bucket: BUCKET_NAME,
      Key: 'mochawesome-bundle-' + testPlanId + '.html', // File name you want to save as in S3
      Body: fileContent,
      ACL: 'public-read',
      ContentType : "text/html"
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
      if (err) {
          throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);

      var content = `Click on ${data.Location} to view the complete test report`;
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: '',
          pass: ''
        }
      });

      var mailOptions = {
          from: "UI test APIM <prasappl@gmail.com>",
          to: "prasannadangalla@gmail.com",
          subject: `WSO2 APIM 3.2.0 UI TESTS ${testPlanId}`,
          html: content
      }


      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  });
};


console.log(accessKeyId);
console.log(secretAccessKey);
console.log(testPlanId)
uploadFile('./cypress/reports/html/mochawesome-bundle.html');