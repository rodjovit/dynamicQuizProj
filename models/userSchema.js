let mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
	username: {
		type: String,
        required: [true, 'Username Required']
	},
	password:{
		type: String,
        required: [true, 'Password Required']
	},
	scoreHistory:{
		type: Array,
        default: []
	}
});

const userCol=mongoose.model('User', userSchema)

module.exports = userCol;