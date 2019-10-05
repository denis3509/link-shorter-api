const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {jwtSecret, jwtExpirySeconds} = require('../config').jwt;
const createError = require('http-errors');
const db = require('../db');

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  linksTable: [{
    type: ObjectId,
    ref: 'Link',
  }],

});

userSchema.methods.addLinkToTable = function (link, callback) {
  const link_id = link._id;
  this.linksTable.push(link_id);
  this.save(callback);
};

userSchema.methods.removeLinkFromTable = function (link_id, callback) {
  this.linksTable.remove(link_id);
  this.save(callback);
};

userSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hashedPassword === hash;
};


userSchema.statics.signUp = function (userName, email, password, callback) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');

  const newUser = new User({
    userName,
    email,
    salt,
    hashedPassword,
  });
  newUser.save(callback);

};
userSchema.statics.signIn = function (email, password, callback) { //TODO move token generation to controller
  this.findOne({email: email}, (error, user) => {
    if (error) callback(error);
    if (user) {
      const isValid = user.validatePassword(password);
      if (isValid) {
        const {_id, userName} = user;
        const token = jwt.sign(
          {data : {user_id: _id, userName}},
          jwtSecret,
          {
            algorithm: 'HS256',
            expiresIn: jwtExpirySeconds,
          }
        );

        callback(null, {token, userName})
      } else {
        callback(createError(401, 'wrong password'))
      }
    } else {
      callback(createError(404, 'user not found'));
    }

  })
};
const User = mongoose.model('User', userSchema);

module.exports = User;