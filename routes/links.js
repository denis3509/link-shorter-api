const express = require('express');
const router = express.Router();
const links = require('../controllers/links');
const authMiddleware = require('../middleware/auth');

router.post('/createLink',  links.createLink);

module.exports = router;
