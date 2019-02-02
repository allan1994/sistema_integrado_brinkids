/** Arquivo reponsável por criar as rotas para funcionários */

const express = require('express');
const adult = require('../models/adult-models');
const Employees = require('../models/employees-models');

const Logs = require('../models/logs-models')
const router = express.Router();
const userSystem = require('../models/userSystem-models');

router.get('/', async (req, res) => {
  try {
    const employees = await adult.find({ isEmployee: true }).populate('identifierEmployee');

    return res.status(200).json(employees);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get('/:identifier', async (req, res) => {
  try {
    const adultFound = await adult.find({ _id: req.params.identifier, isEmployee: true });

    if (!adultFound) {
      return res.sendStatus(404);
    }

    return res.json(adultFound);
  } catch (err) {
    console.log(err);
    return res.sendStauts(500);
  }
});

router.get('/search/:search', async (req, res) => {
  try {
    const listSearch = req.params.search.split(' ');
    let firstName;
    let surName;
    let adultSearch;

    if (listSearch.length === 1) {
      [firstName] = listSearch;
      adultSearch = await adult.find({ 'name.firstName': new RegExp(firstName), isEmployee: true }).populate('identifierEmployee');
    } else {
      [firstName, surName] = listSearch;
      adultSearch = await adult.find({ 'name.firstName': new RegExp(firstName), 'name.surName': new RegExp(surName), isEmployee: true }).populate('identifierEmployee');
    }

    return res.json(adultSearch);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  try {
    const adultResult = await adult.findByIdAndUpdate(
      req.body.identifier,
      {
        identifierEmployee: req.body.identifier,
        isEmployee: true,
      },
    );

    if (!adultResult) {
      return res.sendStatus(404);
    }

    const employee = new Employees({
      gender: req.body.gender,
      education: req.body.education,
      kinship: {
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
      },
      birthplace: {
        city: req.body.birthplaceCity,
        state: req.body.birthplaceState,
      },
      workPortifolio: {
        number: req.body.WPNumber,
        series: req.body.WPSeries,
        state: req.body.WPState,
        PIS_PASEP: req.body.WPPIS_PASEP,
        dateIssue: new Date(req.body.WPDateIssue),
        placeIssue: req.body.WPPlaceIssue,
      },
      rg: {
        issuingBody: req.body.RgIssuingBody,
        state: req.body.RgState,
        dateIssue: new Date(req.body.RgDateIssue),
      },
      electionTitle: {
        number: req.body.ETnumber,
        zone: req.body.ETzone,
        section: req.body.ETsection,
        state: req.body.ETstate,
      },
      militaryReservist: {
        number: req.body.MRNumber,
        state: req.body.MRState,
        category: req.body.MRCategory,
      },
      passport: {
        number: req.body.PPNumber,
        typeFormat: req.body.PPType,
        issuingCountry: req.body.PPIssuingCountry,
        dateIssue: new Date(req.body.PPDateIssue),
        expirationDate: new Date(req.body.PPExpirationDate),
      },
      cnh: {
        record: req.body.CNHRecord,
        category: req.body.CNHCategory,
        expirationDate: new Date(req.body.CNHExpirationDate),
        comments: req.body.CNHComments,
        placeIssue: req.body.CNHPlaceIssue,
        dateIssue: new Date(req.body.CNHDateIssue),
      },
      employeeData: {
        officialPosition: req.body.EDOfficialPosition,
        admissionDate: new Date(req.body.EDAdmissionDate),
        resignationDate: '12/12/1970',
        reasonResignation: req.body.EDReasonResignation,
        record: req.body.EDRecord,
        state: req.body.EDState,
      },
      observations: req.body.observations,
    });
    const usuario = adultResult.email.split("@");
    
    const Login = new userSystem({
      user: usuario[0] + req.body.EDRecord,
      password: 'senha123',
      id: req.body.identifier,
      employees: adultResult.isEmployee,
    })
    const newLogin = await Login.save();
    const newEmployee = await employee.save();

    adultResult.identifierEmployee = newEmployee;

    adultResult.save();

    const log = new Logs({
      activity: 'Funcionario',
      action: 'Criação',
      dateOperation: new Date(),
      from: 'f', //ajsuta o id dps de fazer o login funcionar
      to: req.body.identifier,


    })
    const newLog = await log.save();

    return res.sendStatus(201);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.put('/exchange-data', async (req, res) => {
  if (req.body.phone
    && req.body.email
    && req.body.street
    && req.body.number
    && req.body.city
    && req.body.state
    && req.body.country
    && req.body.cep
    && req.body.observations) {
    const exchangeData = {
      phone: req.body.phone,
      email: req.body.email,
      address: {
        street: req.body.street,
        number: req.body.number,
        district: req.body.street,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        cep: parseInt(req.body.cep, 10),
      },
      observations: req.body.observations,
    };

    try {
      const adultChange = await adult.findByIdAndUpdate(req.body.identifier, exchangeData);
      const log = new Logs({
        activity: 'Funcionario',
        action: 'Edição',
        dateOperation: new Date(),
        from: 'f', //ajsuta o id dps de fazer o login funcionar
        to: req.body.identifier,


      })
      const newLog = await log.save();
      if (!adultChange) {
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

router.put('/reset-password', async (req, res) => {
  try {
    const userFind = await userSystem.findById(req.body.identifier);
    const log = new Logs({
      activity: 'Funcionario',
      action: 'Edição',
      dateOperation: new Date(),
      from: 'f', //ajsuta o id dps de fazer o login funcionar
      to: req.body.identifier,


    })
    const newLog = await log.save();
    if (!userFind) {
      return res.sendStatus(404);
    }

    userFind.set({ password: 'senha123' });
    await userFind.save();

    return res.sendStatus(204);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});
router.put('/rota', async (req, res) => {
  if (req.body.officialPosition) {
    try {
      const adultChange = await Employees.findById(req.body.identifier);

      adultChange.employeeData.officialPosition = req.body.officialPosition;

      adultChange.save();

      if (!adultChange) {
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
