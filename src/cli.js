let fs = require('fs')
export function cli(args) {
    // TODO check that you are in the right directory
    if(args[2]=='--new'||args[2]=='-n') {
        args.slice(3).forEach(name => {
            newTemplateModel(name);
        });
    }else if ((args[2]=='--push'||args[2]=='-p')) {
        pushModels()
    }
}

function newTemplateModel(name) {
    //Check if models folder exists (if not add it)
    const dir = process.cwd() + '/models'
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    //Create new blank model with name
    let name = name.charAt(0).toUpperCase() + name.slice(1)
    const file = dir+'/'+name+'.json'
    const template = __dirname+'/template.json'
    if(!fs.existsSync(file)) {
        fs.copyFile(template, file, function (err) {
            if (err) throw err;
            console.log('New Model: '+name+'.json Saved!');
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

function createBackendAPI() {
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