const { readFileSync } = require('fs');
const { resolve } = require('path');

const crt = readFileSync(resolve(__dirname, 'client-cert.pem'), 'utf8');
const key = readFileSync(resolve(__dirname, 'client-key.pem'), 'utf8');

module.exports = { crt, key };
