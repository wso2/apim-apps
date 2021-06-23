sudo apt-get update -y
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install cypress
npm install --save-dev cypress-file-upload
npm run test