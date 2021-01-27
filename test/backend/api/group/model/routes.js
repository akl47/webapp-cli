var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');

router.get('/',checkToken,controller.getAllModels);
router.get('/:id',checkToken,controller.getModelByID);
router.put('/:id',checkToken,controller.updateModelByID);
router.post('/',checkToken,controller.createModel);


module.exports = router;