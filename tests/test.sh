sudo apt-get update -y
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install cypress
npm install --save-dev cypress-file-upload
VAR=`grep "PublisherUrl" deployment.properties |cut -d'=' -f2`
VAR2=${VAR//[\\]}
export CYPRESS_BASE_URL=${VAR2//\/publisher}
echo $CYPRESS_BASE_URL;
npm run test
