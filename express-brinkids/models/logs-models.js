const mongoose = require('mongoose');
const config = require('../config');

const priceDiscountSchema = new mongoose.Schema({
	code: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
});

const logsSchema = new mongoose.Schema({
	activity: {
	  type: String,
	  required: true,
	},
	action:{
	  type: String,
	  required: true,
	},
	dateOperation:{
	  type: Date,
	  required: true,
	},
	from:{
	  type: String,
	  required: true,
	},
	to: String,
	cco: String,
	price: Number,
	priceMethod: String,
	timeLojaFirst: String,
	timeLojaLast: String,
	priceDiscount: { priceDiscountSchema },
});

mongoose.connect(`mongodb://localhost/${config.database}`);
const logs = mongoose.model('Logs', logsSchema);

module.exports = logs;