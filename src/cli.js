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
            console.group('Group: ', group, " | File: ", file)
            const fileData = fs.readFileSync(groupDir+'/'+file,'utf8')
            const jsonFile = JSON.parse(fileData)
            // Backend api
            //createBackendAPI(jsonFile)
            // Backend Model
            //createBackendModel(jsonFile)
            // Backend Migration
            //createBackendMigration(jsonFile)
            // Backend Seeds
            // TODO Create Backend Seeds
            //backend/seeders/time-seed-model.js

            //Frontend Model
            createFrontendModel(jsonFile)
            //frontend/src/app/models/group/model.model.ts
            //Frontend Services
            //frontend/src/app/services/group/model.service.ts
            console.groupEnd()
        })
        
    })
    
}

function createBackendAPI(jsonFile) {
    // TODO toggle on/off api end points in model file
    const groupName = jsonFile.group
    const modelName = uncapitalize(jsonFile.name)
    const ModelName = capitalize(modelName)
    const ModelNamePlural = inflection.pluralize(ModelName)
    const modelNamePlural = inflection.pluralize(modelName)
    //backend/api/group/model/controler
    // Create api folder
    makeDir(process.cwd() + '/backend/api/')
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
    console.log('Backend API: Done')
}

function createBackendModel(jsonFile) {
    const groupName = jsonFile.group
    const modelName = uncapitalize(jsonFile.name)
    const ModelName = capitalize(modelName)
    const ModelNamePlural = inflection.pluralize(ModelName)
    const modelNamePlural = inflection.pluralize(modelName)
    //backend/models/group/model.js
    // Create api folder
    makeDir(process.cwd() + '/backend/models/')
    // Create group folder
    const groupDir = process.cwd() + '/backend/models/' + groupName
    makeDir(groupDir)
    // create model folder
    const modelDir = groupDir + '/' + modelName
    makeDir(modelDir)

    const modelObject = jsonFile.model

    let model = 
    `'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ${ModelName} extends Model {
        static associate(models) {
            /*${ModelName}.belongsTo(models.TransactionCategoryGroup, {
            foreignKey: 'transactionCategoryGroupID',
            onDelete: 'CASCADE'
            })*/        
        }
    };
    ${ModelName}.init({
    `
    for (const [key, value] of Object.entries(modelObject)) {
        if(key == 'id' && value) {
            model += 
            `    id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        `
        } else if (key=='activeFlag' && value) {
            model += 
            `activeFlag: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        `
        } else {
            model += 
            `${key}: {
            `
            for (const [subkey, subvalue] of Object.entries(value)) {
                switch(subkey) {
                    case 'type':
                        model += `type: DataTypes.${subvalue.toUpperCase()},
            `   
                        break
                    case 'allowNull':
                        model += `allowNull: ${subvalue},
            `
                        break
                    case 'unique':
                        model += `unique: ${subvalue},
            `
                        break
                    case 'default':
                        if(typeof subvalue == 'string') {
                            model += `defaultValue: '${subvalue}',
        `
                        }  else {
                            model += `defaultValue: ${subvalue},
        `
                        }
                        
                        break
                }
            }
            model += `},
        `
            
        }
      }
    model +=
    `createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        sequelize,
        modelName: '${ModelName}',
    });
    return ${ModelName};
};`
    fs.writeFileSync(modelDir+`/${modelName}.js`,model)
    console.log('Backend Model: Done')
}

function createBackendMigration(jsonFile) {
    //backend/migrations/time-create-model.js
    const groupName = jsonFile.group
    const modelName = uncapitalize(jsonFile.name)
    const ModelName = capitalize(modelName)
    const ModelNamePlural = inflection.pluralize(ModelName)
    const modelNamePlural = inflection.pluralize(modelName)
    const modelObject = jsonFile.model

    // create migrations folder
    const migrationsDir = process.cwd() + '/backend/migrations'
    makeDir(migrationsDir)

    let migration = 
    `'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('${ModelNamePlural}', {
        `

    for (const [key, value] of Object.entries(modelObject)) {
        if(key == 'id' && value) {
            migration += 
            `id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        `
        } else if (key=='activeFlag' && value) {
            migration += 
            `activeFlag: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        `
        } else {
            migration += 
            `${key}: {
            `
            for (const [subkey, subvalue] of Object.entries(value)) {
                switch(subkey) {
                    case 'type':
                        migration += `type: Sequelize.${subvalue.toUpperCase()},
            `   
                        break
                    case 'allowNull':
                        migration += `allowNull: ${subvalue},
            `
                        break
                    case 'unique':
                        migration += `unique: ${subvalue},
            `
                        break
                    case 'default':
                        if(typeof subvalue == 'string') {
                            migration += `defaultValue: '${subvalue}',
        `
                        }  else {
                            migration += `defaultValue: ${subvalue},
        `
                        }
                        
                        break
                }
            }
            migration += `},
        `
            
        }
      }




    migration += 
    `createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('${ModelNamePlural}');
    }
};`
    const d = new Date();
    const t = ''+d.getFullYear()+d.getMonth()+d.getDate()+d.getHours()+d.getMinutes()+d.getSeconds()


    fs.writeFileSync(migrationsDir+`/${t}-create-${modelName}.js`,migration)
    console.log('Backend Migration: Done')

}

function createFrontendModel(jsonFile) {
    //backend/migrations/time-create-model.js
    const groupName = jsonFile.group
    const modelName = uncapitalize(jsonFile.name)
    const ModelName = capitalize(modelName)
    const ModelNamePlural = inflection.pluralize(ModelName)
    const modelNamePlural = inflection.pluralize(modelName)
    const modelObject = jsonFile.model

    // create models folder
    const modelsDir = process.cwd() + '/frontend/src/app/models'
    makeDir(modelsDir)

    // create group folder
    const groupDir = process.cwd() + '/frontend/src/app/models/' + groupName
    makeDir(groupDir)

    let model = 
    `export class ${ModelName} {`

    for (const [key, value] of Object.entries(modelObject)) {
        model += `
        ${key}?:`
        if (key == 'id') {
            model += 'number;'
        } else if (key == 'activeFlag') {
            model += 'boolean;'
        } else {
            if(typeof value == 'object') {
                for (const [subkey, subvalue] of Object.entries(value)) {
                    if(subkey == 'type') {
                        model += translateType(subvalue)
                    }
                }
            } else {
                model += translateType(value)
            }

        }
    }
    model += 
    `
}`

    fs.writeFileSync(groupDir+`/${modelName}.model.ts`,model)
    console.log('Frontend Model: Done')
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

function translateType(value) {
    if (value.toLowerCase() == 'integer' || value.toLowerCase() == 'decimal') {
        return 'number;'
    } else if (value.toLowerCase() == 'date') {
        return 'Date;'
    } else {
        return value
    }
}