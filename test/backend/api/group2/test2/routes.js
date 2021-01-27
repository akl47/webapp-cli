var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');

router.get('/',checkToken,controller.getAllTest2s);
router.get('/:id',checkToken,controller.getTest2ByID);
router.put('/:id',checkToken,controller.updateTest2ByID);
router.post('/',checkToken,controller.createTest2);


module.exports = router;