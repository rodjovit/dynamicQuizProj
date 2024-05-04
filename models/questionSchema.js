let mongoose = require('mongoose');


const questionSchema = new mongoose.Schema({
	question_id: {
		type: String
	},
    type:{
        type: Boolean
    },
	question:{
		type: String,
        required: [true, 'Question Required']
	},
	correct_answer:{
		type: String,
        required: [true, 'Answer Required']
    },
    incorrect_answers:{
        type: Array,
        required: [true, 'Incorrect Answers Required']
    },
    category:{
        type: String,
        required: [true, 'Category Required']
    },
    difficulty:{
        type: String,
        required: [true, 'Difficulty Required']
    }
});

const questionCol=mongoose.model('Question', questionSchema)

module.exports = questionCol;