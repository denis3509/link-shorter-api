const db = require('../db');
const createError = require('http-errors');
const waterfall = require('async/waterfall');
const validate = require('url-validator');
const {jwtExpirySeconds, jwtSecret} = require('../config').jwt;
const jwt = require('jsonwebtoken');


const signUp = (req, res, next) => {
  const {
    userName,
    email,
    password,
  } = req.body;
  if (email && userName && password) {
    db.User.signUp(userName, email, password, (error, result) => {
      if (error) next(error);
      res.send(result);
    })
  } else {
    next(createError(400, 'bad request'));
  }
};

const signIn = (req, res, next) => {
  const {email, password} = req.body;
  if (email && password) {
    db.User.signIn(email, password, (error, result) => {
      if (error) next(error);

      const {token, userName} = result;

      res.cookie('token', token, {maxAge: jwtExpirySeconds * 1000});
      res.send({userName});
    })
  } else {
    next(createError(400, 'bad request'));
  }
};

const getLinksTable = (req, res, next) => {
  const {user_id} = req.user;
  // db.User.findById(_id, (error, user) => {
  //   if (error) next(error);
  //   db.Link.find({_id: {$in: user.linksTable}}, {_id: false, __v: false, shortPath : false,
  //      }, (error, result) => {
  //     if (error) next(error);
  //     res.send({linksTable: result});
  //   })
  //
  // })

  db.User.findById(user_id)
    .populate({path: 'linksTable'})
    .exec((error, result) => {
      if (error) next(error);
      res.send(result);
    })
};

const createLink = (req, res, next) => {
  let {url} = req.body;
  const user_id = req.user.user_id;


  if ((url.indexOf('http://') === -1) && (url.indexOf('https://') === -1)) url = 'http://' + url;
  const validUrl = validate(url);
  if (validUrl) {
    waterfall([
      function createLink(callback) {
        const isValidUrl = validate(url);
        if (isValidUrl) {
          const newLink = new db.Link({
            originalUrl: url,
          });
          newLink.save((error, link) => {
            if (error) {
              callback(error)
            }
            else {
              callback(null, link);
            }
          })
        } else {
          callback(createError(400, 'wrong url'));
        }
      },
      function addLinkToTable(link, callback) {
        db.User.findById(user_id, (error, user) => {
          if (error) {
            callback(error);
          } else if (user) {
            user.addLinkToTable(link, (error, user) => {
              if (error) {
                callback(error);
              } else {
                callback(null, link);
              }
            })
          } else {
            callback(createError(404, 'user not found'));
          }

        })
      }
    ], function (error, link) {
      if (error) {
        next(error)
      } else {
        res.send({shortUrl: link.shortUrl})
      }
    });
  } else {
    next(createError(400, 'wrong url'));
  }

};

const removeLink = (req, res, next) => {
  const {link_id} = req.body;
  const user_id = req.user.user_id;
  if (link_id) {
    db.User.findById(user_id, (error, user) => {
      if (error) next(error);
      user.removeLinkFromTable(link_id, (error, result) => {
        if (error) next(error);
        db.Link.findByIdAndRemove(link_id, (error, link) => {
          if (error) next(error);
          res.send({message: `link ${link.shortUrl} removed`})
        })
      })
    })
  }
};

const refreshToken = (req, res, next) => { //TODO test
  const {token} = req.cookies;
  if (!token) return next(createError(401, 'token not provided'));

  let payload;
  try {
    payload = jwt.verify(token,jwtSecret);
  }
  catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError(401, 'invalid token'));
    }
  }
  if (payload) {
    const nowUnixSeconds = Math.round(Number(Date.now()) / 1000);
    console.log((new Date(payload.exp)).toLocaleDateString()); // TODO payload wrong exp
    if (payload.exp/1000 - nowUnixSeconds > 30) {
      return res.status(400).end();
    }
    const {data} = payload;

    const token = jwt.sign(
      {data},
      jwtSecret, {
      algorithm: 'HS256',
    });

    res.cookie('token', token, {maxAge: jwtExpirySeconds * 1000}).end();

  } else {
    next(createError(401, 'invalid token'));
  }
};

module.exports = {
  signIn,
  signUp,
  getLinksTable,
  createLink,
  removeLink,
  refreshToken
};