#!/usr/bin/env node
/* eslint-env node */
'use strict';

const gitClone = require('git-clone');

const packageJson = require('./package.json');

let repository = packageJson.repository.url;
repository = repository.substring(repository.indexOf('https://'));

const tag = 'v' + packageJson.version;

const destination = process.argv[2] || './';

process.stdout.write(`Cloning Git repository from ${repository} to ` +
    `${destination} using ${tag}...`);

gitClone(repository, destination, {checkout: tag}, () => {
  process.stdout.write(' done!\n');
});
