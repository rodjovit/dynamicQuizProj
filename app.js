const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/dynamicQuiz';
const bodyParser = require('body-parser');
const questionSchema = require('./models/questionSchema');
const userSchema = require('./models/userSchema');
const questionCol = require('./models/questionSchema');
const userCol = require('./models/userSchema');
var session = require('express-session');
const app = express();
app.set('views', __dirname+'/views');
app.set('view engine', 'pug');

const PORT = process.env.PORT || 3000;
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dynamicQuiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
	secret:'shhhhh',
	saveUninitialized: false,
	resave: false
}));

// Routes
app.get('/', function (req, res){
	if (!req.session.user){
        res.redirect('/login');
    }
    else{
    	res.render('select', {trusted: req.session.user});
	}
});

// Login Route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', express.urlencoded({extended:false}), async (req, res, next)=>{
	let untrusted= {user: req.body.username, password: req.body.password};
	try{
		let result = await userCol.findOne({username: req.body.username});
		if (untrusted.password.toString().toUpperCase()==result.password.toString().toUpperCase()){
			let trusted={name: result._id.toString()};
            req.session.user = trusted;
			res.redirect('/select');
		} else{
			res.redirect('/login');
		}
	} catch (err){
		next(err)		
	}
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('register');
    });

app.post('/register', express.urlencoded({extended:false}), async (req, res, next)=>{
    try{
        if (req.body.username in userCol){
            res.redirect('/login');
        }
        let user = new userCol({username: req.body.username, password: req.body.password});
        await user.save();
        res.redirect('/login');
    } catch(err){
        next(err);
    }
});

app.get('/add_question', (req, res) => {
    if (!req.session.user){
        res.redirect('/login');
    }
    res.render('add_question');
});

app.post('/add_question', express.urlencoded({extended:false}), async (req, res, next)=>{
    try{
        if (!req.session.user){
            res.redirect('/login');
        }
        if (req.body.correct_answer === 'True'){
            wrong = ['False'];
        } else {
            wrong = ['True'];
        }
        let question = new questionCol({question: req.body.question,
                                        correct_answer: req.body.correct_answer,
                                        incorrect_answers: wrong,
                                        category: req.body.category, 
                                        difficulty: req.body.difficulty});
        await question.save();
        res.redirect('/select');
    } catch(err){
        next(err);
    }
});

// Quiz Route
app.get('/select', async (req, res) => {
  if (!req.session.user){
    res.redirect('/login');
  }
  res.render('select')
});

app.post('/select', express.urlencoded({extended:false}), async (req, res, next)=>{
    try{
        if (!req.session.user){
            res.redirect('/login');
        }
        const category = req.body.category;
        const difficulty = req.body.difficulty;
        const pipeline = [
            { $match: { category: category, difficulty: difficulty } }, 
            { $sample: { size: 10 } }
          ];
        const questions = await questionCol.aggregate(pipeline).toArray();
        for (let question of questions){
            question.question = question.question.replace(/&quot;/g, '"');
            question.question = question.question.replace(/&#039;/g, "'");
            question.question = question.question.replace(/&amp;/g, "&");
            question.question = question.question.replace(/&lt;/g, "<");
            question.question = question.question.replace(/&gt;/g, ">");
            question.question = question.question.replace(/&deg;/g, '°')
        }
        res.render('question', { questions })
    }
    catch(err){
        next(err);
    }
});

app.post('/leaderboard', express.urlencoded({extended:false}), async (req, res, next)=>{
    try{
        if (!req.session.user){
            res.redirect('/login');
        }
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        const dbName = 'dynamicQuiz';
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        const users = await collection.find({}, { projection: {_id: 0, username: 1, scoreHistory: { $slice: -1 } } }).sort({ '****': -1 }).limit(10).toArray();
        //sort the scoreHistory for each user in descending order
        users.forEach(user => {
            user.scoreHistory.sort((a, b) => b - a);
        });
        //sort the users by their highest score
        users.sort((a, b) => b.scoreHistory[0] - a.scoreHistory[0]);
        res.render('leaderboard', { users });
    } catch(err){
        next(err);
    }
});

app.post('/question', express.urlencoded({extended:false}), async (req, res, next)=>{
    try{
        if (!req.session.user){
            res.redirect('/login');
        }
        const category = req.body.category;
        const difficulty = req.body.difficulty;
        const cAnswers = [];
        const pipeline = [
            { $match: { category: category, difficulty: difficulty } }, 
            { $sample: { size: 10 } }
          ];
        const questions = await questionCol.aggregate(pipeline);
        for (let question of questions){
            question.question = question.question.replace(/&quot;/g, '"');
            question.question = question.question.replace(/&#039;/g, "'");
            question.question = question.question.replace(/&amp;/g, "&");
            question.question = question.question.replace(/&lt;/g, "<");
            question.question = question.question.replace(/&gt;/g, ">");
            question.question = question.question.replace(/&deg;/g, '°')
            cAnswers.push(question.correct_answer)
        }
         //array logic goes here
        //  const results = [];
        //  for


        //update user scoreHistory goes here

        //render the next page and pass the new array (of user results) and score to the scores page 
        res.render('question', { questions : questions })
    }
    catch(err){
        next(err);
    }
});

app.post('/scores', (req, res) => {
    // if (!req.body.userAnswers || !req.body.realAnswers) {
    //     return res.status(400).send('User answers or real answers are missing.');
    // }
    // const userAnswers = JSON.parse(req.body.userAnswers);
    // const correctAnswers = JSON.parse(req.body.realAnswers);
    // console.log(userAnswers);
    // console.log(correctAnswers);
    console.log(req.body);
    res.render('scores');
});

app.get('/scores', (req, res) => {
    res.render('scores');
});

app.get('/leaderboard', async (req, res) => {
    if (!req.session.user){
        res.redirect('/login');
      }
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    const dbName = 'dynamicQuiz';
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        const users = await collection.find({}, { projection: {_id: 0, username: 1, scoreHistory: { $slice: -1 } } }).sort({ '****': -1 }).limit(10).toArray();
        //sort the scoreHistory for each user in descending order
        users.forEach(user => {
            user.scoreHistory.sort((a, b) => b - a);
        });
        //sort the users by their highest score
        users.sort((a, b) => b.scoreHistory[0] - a.scoreHistory[0]);
        res.render('leaderboard', { users });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).send('Error getting leaderboard');
    } finally {
      await client.close();
    }
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
