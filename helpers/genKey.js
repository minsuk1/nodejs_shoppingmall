const { v1: uuidv1 } = require('uuid');

module.exports = (user_id) => user_id + uuidv1();