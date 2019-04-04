require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

const bmRouter = require('./bmRouter');
const validate = require('./validate');
const errorHandler = require('./errorHandler');

const app = express();

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(validate);
app.use(bmRouter);
app.use(errorHandler);

module.exports = app;
