let fs = require('fs')
export function cli(args) {
    // TODO check that you are in the right directory
    if(args[2]=='--new'||args[2]=='-n') {
        args.slice(3).forEach(model => {
            newTemplateModel(model);
        });
    }else if ((args[2]=='--push'||args[2]=='-p')) {
        pushModels()
    }
}

function newTemplateModel(model) {
    // Split group/model name
    let modelName = model.split('/')[1]
    modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1)
    let groupName = model.split('/')[0].toLowerCase()

    //Check if models folder exists (if not add it)
    const dir = process.cwd() + '/models'
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    const groupDir = process.cwd() + '/models/' + groupName
    if (!fs.existsSync(groupDir)){
        fs.mkdirSync(groupDir);
    }
    //Create new blank model with name

    const file = groupDir+'/'+modelName+'.json'
    const template =
    `{
        "push":true,
        "name":"${modelName}",
        "group":"${groupName}",
        "model": {
            "id": true,
    
            "activeFlag": true
        },
        "api": {
            "get":true,
            "getID":true,
            "put":true,
            "post":true
        },
        "seed": {}
    }`
    
    if(!fs.existsSync(file)) {
        fs.writeFile(file, template, function (err) {
            if (err) throw err;
            console.log('New Model: '+groupName+'/'+modelName+'.json Saved!');
          });
    }
}

function pushModels() {
    const dir = process.cwd() + '/models'
    let files = fs.readdirSync(dir)
    // Backend api
    //backend/api/group/model/controler and routes.js
    // Backend Model
    //backend/models/group/model.js
    // Backend Migration
    //backend/migrations/time-create-model.js
    // Backend Seeds
    //backend/seeders/time-seed-model.js

    //Frontend Model
    //frontend/src/app/models/group/model.model.ts
    //Frontend Services
    //frontend/src/app/services/group/model.service.ts
}

function createBackendAPI(modelName) {
    //Create Routes.js
    const routes = 
    `var router = require('express').Router();
    var controller = require('./controller');
    const checkToken = require('../../../middleware/checkToken.js');
    
    router.get('/',checkToken,controller.getAll${modelName});
    router.get('/:id',checkToken,controller.get${modelName}ByID);
    router.put('/:id',checkToken,controller.update${modelName}ByID);
    router.post('/:id',checkToken,controller.create${modelName});
    
    
    module.exports = router;`
}