const { MongoClient } = require('mongodb');
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
    const client = new MongoClient(uri);

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

populateQuestions();

