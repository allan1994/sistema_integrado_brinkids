const express = require('express');
const router = express.Router();
const birthdayParty = require('../models/extra-services-models');

router.post('/', async (req, res) => {
  if(req.body.name
    && req.body.type
    && req.body.text
    && req.body.quantity){

    const data = new Data({
      name: req.body.name,
      type: req.body.type,
      text: req.body.text,
      quantity: req.body.quantity,
    });

    try {
    console.log(req.body);
    const newData = await data.save();
    return res.status(201).json(newData);
    } catch (err) {
    return res.sendStatus(500);
    }
  }

return res.sendStatus(400);
});

module.exports = router;