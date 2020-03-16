const { readFileSync } = require('fs');
const { resolve } = require('path');

const crt = readFileSync(resolve(__dirname, 'localhost.ts.sv.cert'), 'utf8');
const key = readFileSync(resolve(__dirname, 'localhost.ts.sv.key'), 'utf8');

module.exports = { crt, key };
