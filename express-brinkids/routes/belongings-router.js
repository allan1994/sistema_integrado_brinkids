const express = require('express');
const belongings = require('../models/belongings-models');

const router = express.Router();

router.post('/', async (req, res) => {

	if(req.body.number){
		const data = new belongings ({
			number: req.body.number,
		});

		try {
	      const newBelongings = await data.save();
	      return res.status(201).json(newBelongings);
	    } catch (err) {
	      return res.sendStatus(500);
	    }
	 }

	return res.sendStatus(400);
});

router.get('/', async (req, res) => {
	try{
		const belongingsJson = await belongings.find({});
		return res.status(200).json(belongingsJson);
	} catch (err) {
    console.log(err);
    return res.sendStatus(500);
	}
});

router.put('/:identifier', async (req, res) => {
  try {
    const belongingsModified = await belongings.findByIdAndUpdate(req.params.identifier, {
    	$set: {
    		number: req.body.number,
    	},
    });

    if (!belongingsModified) {
    	return res.sendStatus(404);
    }

	} catch (err) {
    	console.log(err);
    	return res.sendStatus(500);
	}

	return res.sendStatus(400);
});

module.exports = router;