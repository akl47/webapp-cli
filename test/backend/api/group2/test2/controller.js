exports.getAllTest2s = (req, res, next) => {
    db.Test2.findAll({
    where:{activeFlag:true}
    }).then(test2s=>{
        res.json(test2s);
    }).catch(err=>{
        next(new RestError('Error getting all test2s in database. '+err, 500))
    })
}

exports.getTest2ByID = (req,res,next) => {
    db.Test2.findOne({
        where: {
            id: req.params.id,
            activeFlag:true
        }
    }).then(test2=>{
        res.json(test2)
    }).catch(err=>{
        next(new RestError('Error getting id: '+req.params.id+' test2 in database. '+err, 500))
    })
}

exports.updateTest2ByID = (req,res,next) => {
    db.Test2.update(req.body,
        {
            where:{
                id: req.params.id,
                activeFlag: true
            },
            returning: true,
    }).then(test2=>{
        res.json(test2[1])
    }).catch(err=>{
        next(new RestError('Error updating id: '+req.params.id +' test2 in database. '+err, 500))
    })
}

exports.createTest2 = (req,res,next) => {
    db.Test2.create(req.body)
    .then(test2=>{
        res.json(test2[1])
    }).catch(err=>{
        next(new RestError('Error creating test2 in database. '+err, 500))
    })
}

