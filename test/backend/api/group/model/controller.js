exports.getAllModels = (req, res, next) => {
    db.Model.findAll({
    where:{activeFlag:true}
    }).then(models=>{
        res.json(models);
    }).catch(err=>{
        next(new RestError('Error getting all models in database. '+err, 500))
    })
}

exports.getModelByID = (req,res,next) => {
    db.Model.findOne({
        where: {
            id: req.params.id,
            activeFlag:true
        }
    }).then(model=>{
        res.json(model)
    }).catch(err=>{
        next(new RestError('Error getting id: '+req.params.id+' model in database. '+err, 500))
    })
}

exports.updateModelByID = (req,res,next) => {
    db.Model.update(req.body,
        {
            where:{
                id: req.params.id,
                activeFlag: true
            },
            returning: true,
    }).then(model=>{
        res.json(model[1])
    }).catch(err=>{
        next(new RestError('Error updating id: '+req.params.id +' model in database. '+err, 500))
    })
}

exports.createModel = (req,res,next) => {
    db.Model.create(req.body)
    .then(model=>{
        res.json(model[1])
    }).catch(err=>{
        next(new RestError('Error creating model in database. '+err, 500))
    })
}

