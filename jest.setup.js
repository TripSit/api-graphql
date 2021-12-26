'use strict';

jest.mock('./server/data-sources/database');

require('regenerator-runtime/runtime');
const path = require('path');
require('dotenv').config({ path: path.resolve('.env.test') });
const Database = require('./server/data-sources/database');

// TODO
