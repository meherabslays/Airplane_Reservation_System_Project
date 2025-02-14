// config/db.js
const mysql = require('mysql');

// Create the connection
const db = mysql.createConnection({
  host: 'localhost',  
  user: 'batman',    
  password: 'batman1234',  
  database: 'airline_reservation_system'
});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);

  // Test query to ensure the connection is working
  db.query('SELECT 1 + 1 AS solution', (err, result) => {
    if (err) {
      console.error('Test query failed:', err);
      return;
    }
    console.log('Test query result:', result);
  });
});


module.exports = db;
