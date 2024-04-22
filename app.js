// Routes:
// 1. /login
//      -- GET: findOne() to match user and login.
//              If match, redirect to /quiz.
//              If no match, throw error.
//      -- POST: findOne() for unique username
//              If unique, save user and redirect to /quiz.
//              If not unique, throw error.
// 2. /quiz
//      -- GET: find() to get questions from database, store them in a local variable
//          and render quiz page.
// 3. /results
//      -- POST: $set to update user's score history in database.
// 4. /leaderboard
//      -- GET: find() to get top 10 users' score history from database and render leaderboard page.

