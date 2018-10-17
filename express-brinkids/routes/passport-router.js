const express = require('express');
const passport = require('../models/passport-models');
//const passportServices = require('../models/passport-services-models');
const config = require('../config');

const router = express.Router();

router.post('/', async (req, res) => {

  console.log("Aqui vem o req.body:");
  console.log(req.body);

  if(req.body.time 
    && req.body.price){

    const data = {
      time: req.body.time,
      price: req.body.price,
    };

    try {
    return res.status(201).json(data);
    } catch (err) {
    return res.sendStatus(500);
    }
  }

return res.sendStatus(500);
});

router.get('/', (req, res) => {

    /*if(dataService.finalTime>0){
      if(dataService.finalTime<data.finalTime){
        let time = data.finalTime - dataService.finalTime;
        let price = time*data.price;
      } else {
          
      }
    } else {*/
      console.log('executou router.get()');
      let totalPrice=data.time*data.price;
      console.log('Tempo Total:', data.time);
      console.log('Preço:', totalPrice);
    //}
  
return res.sendStatus(500);
});

module.exports = router;