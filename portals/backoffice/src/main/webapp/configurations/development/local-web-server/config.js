/**
 * We ditched the `npm i serve` (from vercel) because it doesn't support proxying to external URLs
 * More about that here: https://github.com/vercel/serve-handler/issues/30
 * This configuration file is related to https://github.com/lwsjs/local-web-server (ws command) used for serving production build artifacts
 * useful for running perf audits locally and bundle analyzer
 */
// TODO tmkasun: This config has no usage at the moment, should read the proxy configs from src/setupProxy.js
module.exports = {
    rewrite: [
        {
            from: '/apim/(.*)',
            to: 'https://localhost:9443/apim/$1',
        },
    ],
    directory: 'site/public/dist',
    port: '3000',
    spa: 'index.html',
    https: true,
    open: true,
};
