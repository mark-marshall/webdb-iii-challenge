const express = require('express');
const knex = require('knex');
const knexConfig = require('./knexfile').development;

const db = knex(knexConfig);

const server = express();
server.use(express.json());

server.listen(8000, () => console.log(`\nrunning on 8000\n`));