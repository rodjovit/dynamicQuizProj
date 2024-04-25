const { MongoClient } = require('mongodb');
const { get } = require('./dbManager');
// Connection URI
const uri = 'mongodb://localhost:27017';
// Database Name
const dbName = 'dynamicQuiz';
// URL of the API
const easyQ = 'https://opentdb.com/api.php?amount=31&category=9&difficulty=easy&type=boolean';
const medQ = 'https://opentdb.com/api.php?amount=30&category=9&difficulty=medium&type=boolean';
const hardQ = 'https://opentdb.com/api.php?amount=6&category=9&difficulty=hard&type=boolean';

// Function to fetch the data from the API
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

async function bulkInsert(dataToInsert) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('questions');
        const result = await collection.insertMany(dataToInsert);
        console.log(`${result.insertedCount} documents inserted.`);
    } finally {
        // Close the connection
        await client.close();
    }
}

function populateQuestions() {
    fetchData(easyQ).then(data => {
        bulkInsert(data);
        console.log('Easy questions inserted successfully');
        setTimeout(() => {
            fetchData(medQ).then(data => {
                bulkInsert(data);
                console.log('Medium questions inserted successfully');
                setTimeout(() => {
                    fetchData(hardQ).then(data => {
                        bulkInsert(data);
                        console.log('Hard questions inserted successfully');
                    });
                }, 5000);
            });
        }, 5000);
    });
}

//username, password, scoreHistory
async function addUser(user) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        if (await collection.findOne({ username: user.username })) {
            console.error('User already exists.');
            return;
        }
        const result = await collection.insertOne(user);
        console.log(`${result.insertedCount} user inserted.`);
    } catch (error) {
        console.error('Error adding user:', error);
    } finally {
        await client.close();
    }
}

async function addScore(username, score) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        const result = await collection.updateOne({ username }, { $push: { scoreHistory: score } });
        console.log(`${result.modifiedCount} user updated.`);
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await client.close();
    }
}

async function getUser(target) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        const result = await collection.findOne({ username: target });
        console.log(result);
    } catch (error) {
        console.error('Error getting user:', error);
    } finally {
        await client.close();
    }
}

async function deleteUser(username) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        const result = await collection.deleteOne({ username });
        console.log(`${result.deletedCount} user deleted.`);
    } catch (error) {
        console.error('Error deleting user:', error);
    } finally {
        await client.close();
    }
}

// populateQuestions();

let user = {
    username: 'test',
    password: 'password',
    scoreHistory: []
};

async function userTest() {
    await addUser(user);
    await addScore('test', 100);
    await getUser('test');
    await deleteUser('test');
}

userTest();