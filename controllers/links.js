const db = require('../db');
const validate = require('url-validator');
const createError = require('http-errors');



const createLink = (req, res, next) => {
  let {url} = req.body;
  const user_id = req.user._id;

  if ((url.indexOf('http://')===-1)&&(url.indexOf('https://')===-1)) url = 'http://' + url;

    const validUrl = validate(url);
    if (validUrl) {
      const newLink = new db.Link({
        originalUrl: url,
      });
      newLink.save((error, link) => {
        if (error) {
          next(error)
        }
        else {
          res.send({shortUrl: link.shortUrl})
        }
      })
    } else {
      next(createError(400, 'wrong url'));
    }

};
const redirect = (req,res,next) =>{
  const {shortPath} = req.params;
  db.Link.findOne({shortPath : shortPath}, (error, link)=>{
    if (error) next(error);
    if (link) {
      res.redirect(link.getOriginalUrlRedirect())
    } else {
      createError(404,'link not found');
    }
  })
};


module.exports = {
  createLink,
  redirect
};