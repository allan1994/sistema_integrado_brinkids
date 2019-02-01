const express = require('express');
const passport = require('../models/passport-models');
const passportServices = require('../models/passport-services-models');
const product = require('../models/product-models');
const discount = require('../models/discounts-models');
const birthday = require('../models/birthday-party-models');
const config = require('../config');

const router = express.Router();

router.post('/', async (req, res) => {

  console.log("Aqui vem o req.body:");
  console.log(req.body);

  if(req.body.time 
    && req.body.price){

    const data = new passport ({
      time: req.body.time,
      price: req.body.price,
    });

    try {
      const newPassport = await data.save();
      return res.status(201).json(newPassport);
    } catch (err) {
      return res.sendStatus(500);
    }
  }
});

String.prototype.toDate = function () {
    let str = this.split('T');
    let date = str[0];
    let str2 = this.split("@");
    let dateHour = new Date(date+"T"+str2[1]);
    console.log("toDate: ",dateHour);
    return dateHour;
}

router.get('/:idCria/:timeAdult', async (req, res) => {
  
  console.log(req.params.idCria);
  console.log(req.params.timeAdult);

  const productFinded = await product.find({ 'children.id': req.params.idCria });
  const adultEntered = (productFinded[0].time.getTime()/60000);
  
  const childName = await productFinded[0].children.name;

  const adultExit = (req.params.timeAdult/60000);
  var adultTime = (adultExit - adultEntered);
  
  console.log('entrada:', adultEntered);
  console.log('saída:', adultExit);
  console.log('diferença em minutos:', adultTime);
  
  const psjson = await passportServices.find({});
  const pjson = await passport.find({});

  let lastFinalTime = psjson[psjson.length-1].finalTime;//Último finalTime do json que foi pego do bd do passaporte service (psjson)
  let lastInitialTime = psjson[psjson.length-1].initialTime;//último tempo inicial do passaporte service
  let lastPrice = psjson[psjson.length-1].price; //preço que se paga quando fica entre o ultimo tempo inicial e tempo final do serviço
  var price;
  var serviceName;
  if(productFinded[0].service === 'Passaporte'){
    serviceName = "Passaporte";
    console.log(serviceName)

    if(adultTime>(lastFinalTime.toSS()/60)){
      let time = adultTime - (lastFinalTime.toSS()/60);
      console.log("time sem o ultimo tempo de serviço:", time);
      price = parseFloat((1+parseInt(time/parseFloat(pjson[0].time, 10)))*parseFloat(pjson[0].price, 10) + parseFloat(lastPrice, 10)).toFixed(2);
      console.log("preço:", price);
    
    } else {
    
      for(i = 0; i < psjson.length; i++){
        if(adultTime <= (psjson[i].finalTime.toSS()/60) && adultTime >= (psjson[i].initialTime.toSS()/60)){
          price = psjson[i].price;
          console.log("preço:", price);
        }
      }
    }
  
  } else {

    let x = 0, saveTheDate = 0;

    const productFinded = await product.find({ 'children.id': req.params.idCria });
    let birthdayFinded = await birthday.find({ 'guestList.name': new RegExp(productFinded[0].children.name)});
    console.log("convidado")
    if(birthdayFinded.length===0){
      birthdayFinded = await birthday.find({ 'birthdayPerson.name': new RegExp(productFinded[0].children.name)});
      console.log("aniversariante")
      if(birthdayFinded.length===0){//esse if é só para testes
       birthdayFinded = await birthday.find({});
       console.log("desespero")
      }
    }
    
    let birthdayDate, birthdayStart, birthdayEnd, test;
    
    for(i = 0; i < birthdayFinded.length; i++){//for para calcular qual o ultimo aniversário que a criança estará, esses calculos estão meio sem nexo, mas ainda não entendi como ter ctz que a criança tá no aniversário certo, só quando ela é cadastrada no sistema e bate com as informaões da guestList
      birthdayDate = birthdayFinded[i].birthdayDate.toISOString();
      test = (birthdayDate+"@"+birthdayFinded[i].end).toDate().getTime()/60000;
      if (saveTheDate < test && ((birthdayDate+"@"+birthdayFinded[i].start).toDate().getTime()/60000) - adultEntered < 120) {//aqui só é aceito como o aniversário certo quando o adulto deixa a criança pelo menos 2 horas antes, pra que não calcule com o valor do aniversário do dia que vem
        console.log( ( (birthdayDate+"@"+birthdayFinded[i].start).toDate().getTime()/60000 - adultEntered))
        saveTheDate = test;
        x=i;
        console.log(new Date(saveTheDate), "new x: ", x)
      }
    }  

    birthdayDate = birthdayFinded[x].birthdayDate.toISOString();
    birthdayStart = (birthdayDate+"@"+birthdayFinded[x].start).toDate().getTime()/60000;
    birthdayEnd = (birthdayDate+"@"+birthdayFinded[x].end).toDate().getTime()/60000;

    console.log("procurei", x);
    console.log(new Date()," ", new Date(birthdayEnd*60000));

    serviceName = "Aniversário";
    console.log(serviceName)
    var extraTime = 0;
    price = parseInt(0, 10).toFixed(2);
    console.log("entrada: ", new Date(adultEntered*60000) ,"\nsaída: ", new Date(adultExit*60000))
    console.log("start: ", new Date(birthdayStart*60000), "\nend: ", new Date(birthdayEnd*60000))
    if((birthdayStart - adultEntered) > 15){
      if(adultExit <= birthdayStart){
        extraTime += (adultExit - adultEntered)
        console.log("tempo corrido: ", extraTime)
      }else{
        extraTime += (birthdayStart - adultEntered);
        console.log("tempo antecipado: ", extraTime)
      }
    }

    if(adultExit>(birthdayEnd)){
      extraTime += (adultExit - birthdayEnd);
      console.log("tempo atrasado: ", extraTime -(birthdayStart - adultEntered))
      console.log("tempo extra: ", extraTime)
    }

    if((adultEntered >= (birthdayStart-15)) && adultExit <= birthdayEnd){

      price = 0.00;

    }else{
    
      adultTime = extraTime;
      if(adultTime>(lastFinalTime.toSS()/60)){
        let time = adultTime - (lastFinalTime.toSS()/60);
        console.log("time sem o ultimo tempo de serviço:", time);
        price = parseFloat((1+parseInt(time/parseFloat(pjson[0].time, 10)))*parseFloat(pjson[0].price, 10) + parseFloat(lastPrice, 10)).toFixed(2);
        console.log("preço:", price);
      
      } else {
      
        for(i = 0; i < psjson.length; i++){
          
          if(adultTime <= (psjson[i].finalTime.toSS()/60) && adultTime >= (psjson[i].initialTime.toSS()/60)){
            price = psjson[i].price;
            console.log("preço:", price);
          }

        }
      
      }
    
    }
  
  }
  
  const data = {
    service: serviceName,
    name: childName,
    time: parseInt(adultTime),
    value: price, 
  };
  
  try {
    return res.status(201).json(data);
  } catch (err) {
    return res.sendStatus(500);
  }

  console.log('executou router.get()');
  console.log('Tempo Total:', data.time);
  console.log('Preço:', price);
});

router.get('/discount/:idCria/:codDesc/:valueChild/', async (req, res) => {

  const productFinded = await product.find({ 'children.id': req.params.idCria }); //achando o produto pelo id da criança, vindo do fronto na var idCria
  const adultEntered = productFinded[0].time; // pegando o tempo que o resposável deixou a criança na loja do produto
  
  const adultExit = req.params.timeAdult; // pegando o tempo que o adulto tirou a criança/produto da loja
  const adultTime = ((adultExit/60000) - (adultEntered.getTime()/60000)); // tempo que a criança ficou na loja
  
  const discountFinded = await discount.find({ 'name': req.params.codDesc }) //pesquisando desconto pelo código que recebe do front

  const childName = await productFinded[0].children.name; // nome da criança pra salvar quem vai usar o desconto, já que essa rota é só de desconto para crianças
  console.log(productFinded[0].children.name)

  if(discountFinded[0].type === 'Fixo'){

    price = parseFloat(discountFinded[0].value).toFixed(2);
    
    if(req.params.valueChild <= discountFinded[0].value){
      price = parseFloat(req.params.valueChild).toFixed(2);
    }
    
    console.log("valor do desconto:", price);
  
  } else {
  
    price = req.params.valueChild;
    price = parseFloat(price*(discountFinded[0].value/100)).toFixed(2);
    console.log("valor do desconto:", price);
  
  }
  
  const data = {
    name: childName,
    time: adultTime,
    value: price, 
    discount: discountFinded[0].name,
  
  };
  try {
    return res.status(201).json(data);
  } catch (err) {
    return res.sendStatus(500);
  }

  console.log('executou router.get()');
  console.log('Tempo Total:', data.time);
  console.log('Preço:', price);
});

router.get('/discountAdult/:idAdult/:value/:codDesc', async (req, res) => {

  const discountFinded = await discount.find({ 'name': req.params.codDesc });
  let finalPrice = req.params.value;
  let valueDisc = discountFinded[0].value;

  const adultFinded = await product.find({ 'adult.id': req.params.idAdult });
  let adultName = adultFinded[0].adult.name;
  console.log(adultName);

  if(discountFinded[0].type === 'Fixo'){
    finalPrice = parseFloat(valueDisc).toFixed(2);
    console.log("preço descontado:", finalPrice);
  } else {
    finalPrice = parseFloat(finalPrice*(valueDisc/100)).toFixed(2);
    console.log("preço descontado:", finalPrice);
  }

   const data = {
    name: adultName,
    value: finalPrice, //valor que vai ficar no final para o cliente pagar
    discount: discountFinded[0].name,
  };
  try {
    return res.status(201).json(data);
  } catch (err) {
    return res.sendStatus(500);
  }


});

router.delete('/:identifier', async (req, res) => {
  console.log('executed');
  const productFinded = await product.find({ 'children.id': req.params.identifier });
  console.log(productFinded[0]._id);
  try {
    const deletedService = await product.findByIdAndRemove(productFinded[0]._id);

    if (!deletedService) {
      return res.sendStatus(404);
    }

    return res.sendStatus(204);
  } catch (err) {
    console.log(err);

    return res.sendStatus(500);
  }
});

module.exports = router;