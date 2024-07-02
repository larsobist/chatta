const express = require('express');
const { getUsers, updateSelectedUser } = require('../controllers/userController');

const router = express.Router();

router.get('/users', getUsers);
router.post('/selectedUser', updateSelectedUser);

module.exports = router;
