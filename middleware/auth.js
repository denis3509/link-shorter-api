const jwt = require('jsonwebtoken');
const {jwtSecret} = require('../config').jwt;
const createError = require('http-errors');

module.exports = (req, res, next) => {
  const {token} = req.cookies;
  if (!token)  return next(createError(401, 'token not provided'));


    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(createError(401, 'invalid token'));
      }
    }
    if (payload) {
      const {data} = payload;
      req.user = data;
      next();
    } else {
      next(createError(401, 'invalid token'));
    }

};