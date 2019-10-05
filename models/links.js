const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
const {hostname, portNumber} = require('../config');

const linkSchema = new Schema({
  originalUrl: {
    type: String,

  },
  shortPath : {
    type : String,
    unique : true,
    default : shortid.generate
  },
  clicks : {
    type : Number,
    default : 0,
  }

});
linkSchema.methods.getOriginalUrlRedirect = function () {
  this.clicks = this.clicks+1;
  this.save((error)=>{
    console.log(error);
  });
  return this.originalUrl;
};
linkSchema.virtual('shortUrl')
  .get(function() {
    return  `${hostname}:${portNumber}/${this.shortPath}`
  });

module.exports = mongoose.model('Link', linkSchema);