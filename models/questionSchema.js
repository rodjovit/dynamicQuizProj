let mongoose = require('mongoose');


const questionSchema = new mongoose.Schema({
	question_id: {
		type: String,
        required: [true, 'Question ID Required']
	},
	question:{
		type: String,
        required: [true, 'Question Required']
	},
	answer:{
		type: String,
        required: [true, 'Answer Required']
    },
    genre:{
        type: String,
        required: [true, 'Genre Required']
    },
    difficulty:{
        type: String,
        required: [true, 'Difficulty Required']
    }
});

const questionCol=mongoose.model('Question', questionSchema)

module.exports = questionCol;