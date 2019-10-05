const mongoose = require('mongoose');
require('../models/links');
require('../models/users');

const options = {
  useNewUrlParser: true,
  reconnectTries : Number.MAX_VALUE,
  reconnectInterval : 1,
  keepAlive: true,
  keepAliveInitialDelay: 300000
};
mongoose.connect('mongodb://localhost:27017/link-shorter-db', options);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:')); // TODO reconnect
db.once('open', console.log.bind(console,   'db connected'));
db.on('close', console.error.bind(console,'db connection closed:'));
db.on('disconnected', console.error.bind(console, 'db disconnected'));
db.on('reconnected', console.log.bind(console, 'color : green', 'db reconnected'));

const models = {
   User : mongoose.model('User'),
   Link : mongoose.model('Link')
};

module.exports =  models;