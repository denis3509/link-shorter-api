const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const authMiddleware = require('../middleware/auth');

router.get('/table', authMiddleware, users.getLinksTable);
router.post('/signIn', users.signIn);
router.post('/signUp', users.signUp);
router.post('/link', authMiddleware, users.createLink);
router.delete('/link', authMiddleware, users.removeLink);
router.get('/refreshToken', users.refreshToken);
module.exports = router;
