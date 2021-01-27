let fs = require('fs')
let inflection = require( 'inflection' );
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
    makeDir(dir)
    const groupDir = process.cwd() + '/models/' + groupName
    makeDir(groupDir)
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
    let groups = fs.readdirSync(dir)
    groups.forEach(group=>{
        const groupDir = dir + '/' + group
        let files = fs.readdirSync(groupDir)
        files.forEach(file=> {
            console.log('Group: ', group, " | File: ", file)
            const fileData = fs.readFileSync(groupDir+'/'+file,'utf8')
            const jsonFile = JSON.parse(fileData)
            // Backend api
            createBackendAPI(jsonFile.name, jsonFile.group)
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
        })
        
    })
    
}

function createBackendAPI(modelName, groupName) {
    modelName = uncapitalize(modelName)
    const ModelName = capitalize(modelName)
    const ModelNamePlural = inflection.pluralize(ModelName)
    const modelNamePlural = inflection.pluralize(modelName)
    //backend/api/group/model/controler
    // Create group folder
    const groupDir = process.cwd() + '/backend/api/' + groupName
    makeDir(groupDir)
    // create model folder
    const modelDir = groupDir + '/' + modelName
    makeDir(modelDir)

    //Create Routes.js
    const routes = 
    `var router = require('express').Router();
var controller = require('./controller');
const checkToken = require('../../../middleware/checkToken.js');

router.get('/',checkToken,controller.getAll${ModelNamePlural});
router.get('/:id',checkToken,controller.get${ModelName}ByID);
router.put('/:id',checkToken,controller.update${ModelName}ByID);
router.post('/',checkToken,controller.create${ModelName});


module.exports = router;`

    fs.writeFileSync(modelDir+'/routes.js',routes)

    const controller = 
    `exports.getAll${ModelNamePlural} = (req, res, next) => {
    db.${ModelName}.findAll({
    where:{activeFlag:true}
    }).then(${modelNamePlural}=>{
        res.json(${modelNamePlural});
    }).catch(err=>{
        next(new RestError('Error getting all ${modelNamePlural} in database. '+err, 500))
    })
}

exports.get${ModelName}ByID = (req,res,next) => {
    db.${ModelName}.findOne({
        where: {
            id: req.params.id,
            activeFlag:true
        }
    }).then(${modelName}=>{
        res.json(${modelName})
    }).catch(err=>{
        next(new RestError('Error getting id: '+req.params.id+' ${modelName} in database. '+err, 500))
    })
}

exports.update${ModelName}ByID = (req,res,next) => {
    db.${ModelName}.update(req.body,
        {
            where:{
                id: req.params.id,
                activeFlag: true
            },
            returning: true,
    }).then(${modelName}=>{
        res.json(${modelName}[1])
    }).catch(err=>{
        next(new RestError('Error updating id: '+req.params.id +' ${modelName} in database. '+err, 500))
    })
}

exports.create${ModelName} = (req,res,next) => {
    db.${ModelName}.create(req.body)
    .then(${modelName}=>{
        res.json(${modelName}[1])
    }).catch(err=>{
        next(new RestError('Error creating ${modelName} in database. '+err, 500))
    })
}

`
    fs.writeFileSync(modelDir+'/controller.js',controller)
}

fucnction createBackendModel(modelName, groupName) {
    
}
function capitalize(str) {
    return str.substring( 0, 1 ).toUpperCase() + str.substring( 1 );
}


function uncapitalize(str) {
    return str.substring( 0, 1 ).toLowerCase() + str.substring( 1 );
}

function makeDir(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}