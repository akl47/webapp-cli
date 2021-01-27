var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');

router.get('/',checkToken,controller.getAllTests);
router.get('/:id',checkToken,controller.getTestByID);
router.put('/:id',checkToken,controller.updateTestByID);
router.post('/',checkToken,controller.createTest);


module.exports = router;