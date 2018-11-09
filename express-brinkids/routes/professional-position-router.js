const express = require('express');
const professionalPosition = require('../models/professional-position-models');
const config = require('../config');

const router = express.Router();

router.post('/', async (req, res) => {

  if(req.body.name
    && req.body.description
    && req.body.classes
    && req.body.functions){

    const data = new professionalPosition ({
      name: req.body.name,
      description: req.body.description,
      classes: req.body.classes,
      functions: req.body.functions,
    });

    try {
      console.log('tentando salvar...');
      console.log(data);
      const newProfessionalPosition = await data.save();
      return res.status(201).json(newProfessionalPosition);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
});

router.get('/', (req, res) => {
  professionalPosition.find({}, (err, result) =>{
    try{
      res.status(200).json(result)
    }catch (err){
      res.sendStatus(500)
    }
  });
});

router.put('/', async (req, res) => {
  if (req.body.name
    && req.body.description
    && req.body.classes
    && req.body.functions) {
      const exchangeData = {
        name: req.body.phone,
        description: req.body.email,
        classes: req.body.street,
        functions: req.body.number,
      };

    try {
      const professionalPositionChange = await professionalPosition.findByIdAndUpdate(req.body.identifier, exchangeData);

      if (!professionalPositionChange) {
        return res.sendStauts(404);
      }

      return res.sendStatus(204);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  } else {
    return res.sendStatus(400);
  }
});

module.exports = router;