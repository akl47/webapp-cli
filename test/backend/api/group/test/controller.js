exports.getAllTests = (req, res, next) => {
    db.Test.findAll({
    where:{activeFlag:true}
    }).then(tests=>{
        res.json(tests);
    }).catch(err=>{
        next(new RestError('Error getting all tests in database. '+err, 500))
    })
}

exports.getTestByID = (req,res,next) => {
    db.Test.findOne({
        where: {
            id: req.params.id,
            activeFlag:true
        }
    }).then(test=>{
        res.json(test)
    }).catch(err=>{
        next(new RestError('Error getting id: '+req.params.id+' test in database. '+err, 500))
    })
}

exports.updateTestByID = (req,res,next) => {
    db.Test.update(req.body,
        {
            where:{
                id: req.params.id,
                activeFlag: true
            },
            returning: true,
    }).then(test=>{
        res.json(test[1])
    }).catch(err=>{
        next(new RestError('Error updating id: '+req.params.id +' test in database. '+err, 500))
    })
}

exports.createTest = (req,res,next) => {
    db.Test.create(req.body)
    .then(test=>{
        res.json(test[1])
    }).catch(err=>{
        next(new RestError('Error creating test in database. '+err, 500))
    })
}

