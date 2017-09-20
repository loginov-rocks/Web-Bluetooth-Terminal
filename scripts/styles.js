const config = require('./config'),
    fs = require('fs');

fs.copyFileSync(config.directories.nodeModules + '/normalize.css/normalize.css',
    config.directories.styles + '/normalize.css');
