const livereload = require("livereload");
const path = require('path');

// Live reload browser
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, '../site/public'));
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 1000);
});
