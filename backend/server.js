// Importing all the necessary packages
const express = require('express'); // Loads the express library, making its functionality available. `require` works like `import` in C++.
const session = require('express-session');
const mysql = require('mysql2'); // MySQL Node.js package to interact with MySQL databases.
const bodyParser = require('body-parser'); // For parsing incoming request bodies in a middleware.
const bcrypt = require('bcrypt'); // For password hashing to store encrypted passwords securely.
const cors = require('cors'); // For enabling Cross-Origin Resource Sharing (CORS), to allow resources to be accessed from other domains.
const path = require('path');
const dotenv = require("dotenv"); // Loads environment variables from a .env file into process.env.
const cookieParser = require("cookie-parser"); // Middleware to parse cookies from client requests.
const baseHtmlPath = path.resolve("/home/ackerman/Desktop/My_Files/BOOKS/CSE_CU/academic_book/4th_semester/CSE_413_DATABASE/Project:AIRLINE_RESERVATION_SYSTEM/Airline_frontend/front_8");

// Load environment variables from a .env file into process.env.
dotenv.config();

// Creating an instance of an Express application (class).
const app = express();
const port = 3000; // Defining the port number to run the server on.
// Enable CORS for frontend (http://127.0.0.1:5500)
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Allow frontend from this domain
  methods: 'GET,POST,DELETE,PUT,PATCH',          // Allow these HTTP methods
  credentials: true,               // Allow cookies to be sent with the request
}));


// Serve static files from your frontend directory
app.use(express.static(baseHtmlPath));

// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(baseHtmlPath, 'index.html'));
});

// MySQL connection setup.
const db = mysql.createConnection({
  host: process.env.DB_HOST,        // Database host (e.g., localhost or an IP address).
  user: process.env.DB_USER,        // Database user with access privileges.
  password: process.env.DB_PASS,    // Password for the database user.
  database: process.env.DB_NAME     // Name of the database to connect to.
});

// Test MySQL connection
db.connect((err) => { // Establishes the connection to the MySQL database.
  // Callback function is triggered after the connection attempt is completed.
  if (err) {
    console.log('Error connecting to MySQL:', err); // Logs error if the connection fails.
  } else {
    console.log(`Connected to MySQL database: ${db.config.database}`); // Logs success if the connection is successful.
  }
});


// Middleware to parse JSON bodies in incoming requests.
app.use(bodyParser.json()); // It ensures that requests with JSON payload are correctly parsed.
//app.use(bodyParser.urlencoded({ extended: true }));
// Enabling CORS (Cross-Origin Resource Sharing) for the application.
// This will allow all origins (domains) to access this server.
// Middleware to parse cookies in client requests.
app.use(cookieParser());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded


app.use(session({
  secret: 'okay123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS
    httpOnly: true,
    sameSite: 'None' // Ensure cookies are sent cross-origin
  }
}));



// Login route to authenticate user
app.post('/login', async (req, res) => {
  const { email, pass } = req.body;

  // Check if the user is already logged in
  if (req.session.user) {
    return res.status(200).json({ message: 'Already logged in', redirect: '/dashboard' });
  }

  console.log('Request Body:', req.body);

  const query = 'SELECT * FROM Users WHERE email = ?'; // Fetch the user by email from the Users table
  db.query(query, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) { // If no user is found with the provided email
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result[0]; // The user object from the database query result

    const isPasswordCorrect = await bcrypt.compare(pass, user.password); // Compare the entered password with the hashed password

    if (isPasswordCorrect) { // If the passwords match
      req.session.user = {
        email: user.email,
        userId: user.user_id,
        username: user.first_name + ' ' + user.last_name,
        role: user.role,
      };

      // Log a message indicating that the user logged in successfully
      console.log(`${email} logged in`);

      // Define redirect URL based on user role
      let redirectUrl;
      if (user.role === 'customer') {
        redirectUrl = '/passengerDash.html';
      } else if (user.role === 'admin') {
        redirectUrl = '/adminDash.html';
      } else {
        return res.status(403).json({ message: 'Unauthorized role' });
      }
      // Send JSON response with redirect URL
      return res.status(200).json({ message: 'Login successful', redirect: redirectUrl });
    } else { // If the passwords do not match
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});


// Middleware to check if the user is authenticated.
// Redirects to a specific page if the user is not authenticated.
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();  // If the user is authenticated, proceed to the next middleware or route
  } else {
    // If the user is not authenticated, send the isAuth.html file after a 1.5 second delay
    return setTimeout(() => {
      res.sendFile(path.join(__dirname, '/home/ackerman/Desktop/My Files/BOOKS/CSE CU/academic-book/4th_semester/CSE_413 DATABASE/Project:AIRLINE_RESERVATION_SYSTEM/Airline_frontend/front_8', 'isAuth.html'));
    }, 1500);  // 1.5 second delay before sending the response
  }
}

// Serve the login page.
app.get("/login", (req, res) => {
  res.sendFile(path.join(baseHtmlPath, "index.html"));
});

// Serve the dashboard based on the user's role.
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    // Redirect to login if the session is not set.
    return res.redirect("/login");
  }

  const role = req.session.user.role; // Extract the user's role from the session.

  if (role === "customer") {
    res.sendFile(path.join(__dirname, "../../Airline_frontend/front_8/", "passengerDash.html"));
  } else if (role === "admin") {
    res.sendFile(path.join(__dirname, "../../Airline_frontend/front_8/", "adminDash.html"));
  } else {
    // If the role is not recognized, send an unauthorized status.
    res.status(403).send("Unauthorized");
  }
});








//----------------------------------------------------------------------------------------------
// Endpoint to Register a User.
app.post('/api/register', (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

  if (!first_name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Error hashing password' });
    }

    const query =
      'INSERT INTO Users (first_name, last_name, email, phone, password) ' +
      'VALUES (?, ?, ?, ?, ?)';

    db.query(query, [first_name, last_name, email, phone, hashedPassword], (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Error registering user' });
      }

      res.status(201).json({ message: 'User registered successfully', showLoginForm: true });
    });
  });
});

//route for log out :

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});


// Endpoint to Get All Users.
app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM Users'; // SQL query to fetch all users from the Users table.
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching users' }); // Sends an error response if fetching fails.
    }
    res.status(200).json(results); // Sends the list of users in the response if successful.
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`); // Logs a message indicating the server is running.
});

// Endpoint to Update a User.
app.put('/api/update_user', (req, res) => {
  const { id, first_name, last_name, email, phone, user_role } = req.body; // Destructures the update data for the user.

  // SQL query to update the user's information.
  const query =
    'UPDATE Users SET first_name = ?, last_name = ?, email = ?, phone = ?, user_role = ? ' +
    'WHERE user_id = ?';

  // Executes the update query.
  db.query(query, [first_name, last_name, email, phone, user_role, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating user' }); // Handles query errors.
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' }); // Sends error if no user is updated.
    }

    res.status(200).json({ message: 'User updated successfully' }); // Sends success response if update is successful.
  });
});

// Endpoint to Delete a User.
app.delete('/api/delete_user', (req, res) => {
  const { id } = req.query; // Extracts user ID from query parameters.

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' }); // Sends an error if no ID is provided.
  }

  // SQL query to delete the user by their ID.
  const query = 'DELETE FROM Users WHERE user_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user' }); // Handles query errors.
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' }); // Sends error if no user is deleted.
    }

    res.status(200).json({ message: 'User deleted successfully' }); // Sends success response if deletion is successful.
  });
});



//---------------------------------------------------------------

//adding flights from the adminDash 
app.post('/api/add-flight', (req, res) => {
  const {
    flight_number,
    airline_name,
    origin,
    destination,
    departure_time,
    arrival_time,
    price,
    seats_available
  } = req.body;

  // Input validation
  if (
    !flight_number || !airline_name || !origin || !destination ||
    !departure_time || !arrival_time || !price || !seats_available
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (new Date(departure_time) >= new Date(arrival_time)) {
    return res.status(400).json({ error: 'Departure time must be earlier than arrival time' });
  }

  if (price <= 0 || seats_available <= 0) {
    return res.status(400).json({ error: 'Price and seats must be positive values' });
  }

  // Manually format the date strings to avoid UTC and 'T' issues
  const formattedDepartureTime = formatDateToMySQL(departure_time);
  const formattedArrivalTime = formatDateToMySQL(arrival_time);

  // SQL query to insert a new flight into the Flights table
  const query =
    'INSERT INTO Flights (flight_number, airline_name, origin, destination, departure_time, arrival_time, price, seats_available) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [
    flight_number,
    airline_name,
    origin,
    destination,
    formattedDepartureTime,
    formattedArrivalTime,
    price,
    seats_available
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error adding flight:', err);
      return res.status(500).json({ error: 'Error adding flight' });
    }
    res.status(201).json({ message: 'Flight added successfully' });
  });
});

//----------------------------------------------------------------------------------------------
// Function to format date in 'YYYY-MM-DD HH:MM:SS' format without UTC or 'T' issues
function formatDateToMySQL(dateString) {
  const date = new Date(dateString.replace('T', ' '));
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// API endpoint to fetch all flights and show in adminDash
app.get('/api/get-flights', (req, res) => {
  const query = 'SELECT flight_id, flight_number, airline_name, origin, destination, departure_time, arrival_time, price, seats_available FROM Flights';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching flights:', err);
      return res.status(500).json({ error: 'Error fetching flight data' });
    }
    res.json(results);
  });
});




// Fetch all flights.
app.get('http://127.0.0.1:3000/api/get-flights', (req, res) => {
  const query = 'SELECT * FROM Flights'; // SQL query to fetch all flights from the Flights table.
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching flights' }); // Handles query errors.
    res.status(200).json(results); // Sends the list of flights in the response if successful.
  });
});


//------------------------------------------------------------------------------------------------
// API to delete a flight by ID from adminDash
app.delete('/api/delete-flight/:id', (req, res) => {
  const flightId = req.params.id; // Get the flight_id from the URL parameters

  // Validate the input
  if (!flightId || isNaN(flightId)) {
    return res.status(400).json({ message: 'Invalid flight ID provided.' });
  }

  // SQL query to delete the flight
  const query = 'DELETE FROM Flights WHERE flight_id = ?';

  // Execute the query
  db.query(query, [flightId], (err, result) => {
    if (err) {
      console.error('Error deleting flight:', err);
      return res.status(500).json({ message: 'Error deleting flight. Please try again later.' });
    }

    // Check if a flight was deleted
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Flight deleted successfully.' });
    } else {
      return res.status(404).json({ message: 'Flight not found.' });
    }
  });
});

//----------------------------------------------------------------------------------------

// Update ticket price by flight ID
app.put('/api/update-price', (req, res) => {
  const { flightId, newPrice } = req.body;

  // Validate inputs
  if (!flightId || !newPrice) {
    return res.status(400).json({ message: 'Flight ID and new price are required.' });
  }

  // SQL query to update the ticket price
  const query = 'UPDATE Flights SET price = ? WHERE flight_id = ?';

  db.query(query, [newPrice, flightId], (err, result) => {
    if (err) {
      console.error('Error updating price:', err);
      return res.status(500).json({ message: 'Error updating ticket price.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Flight not found.' });
    }

    res.status(200).json({ message: 'Price updated successfully.' });
  });
});



//-----------------------------------------------------------------------------------------
// Backend route for flight cards for the index2

app.get('/api/flight-card', async (req, res) => {
  try {
    const [flights] = await db.query('SELECT * FROM Flights');
    res.json({ success: true, data: flights });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching flights' });
  }
});


//--------------------------------------------------------------------------------------

// Set up the endpoint to fetch flight data
app.get('/api/flight-card-fetch', (req, res) => {
  const query = `
      SELECT flight_id, airline_name, origin, destination, departure_time, arrival_time, price
      FROM Flights
      WHERE seats_available > 0;  
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching flight data:', error);
      return res.status(500).json({ error: 'Error fetching flight data' });
    }
    res.json(results);
  });
});

//------------------------------------------------------------------------------------------------------------

//Show the searched flight cards
app.post('/api/searched-flight-card', (req, res) => {
  const { origin, destination, travel_date, passengers } = req.body;

  if (!origin || !destination || !travel_date || !passengers) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Query to find flights based on search criteria
  const query = `
    SELECT * FROM Flights
    WHERE origin = ? AND destination = ?
    AND DATE(departure_time) = ?
    AND seats_available >= ?
  `;

  // Execute the query with user input
  db.query(query, [origin, destination, travel_date, passengers], (err, results) => {
    if (err) {
      console.error('Error fetching flights:', err);
      return res.status(500).json({ message: 'Error fetching flights data.' });
    }

    if (results.length === 0) {
      return res.json([]);  // Return an empty array if no flights match
    }

    // Return the matching flights data
    res.json(results);
  });
});








//Update your ticket purchasing or reservation endpoint to use the authentication middleware:

app.post('/api/reservations', isAuthenticated, (req, res) => {
  const { flight_id, total_amount } = req.body;
  const user_id = req.session.user.id; // Use logged-in user's ID

  const query = `
    INSERT INTO Reservations (user_id, flight_id, total_amount, status)
    VALUES (?, ?, ?, 'pending')`;
  db.query(query, [user_id, flight_id, total_amount], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error booking reservation' });
    res.status(201).json({ message: 'Reservation booked successfully', reservation_id: result.insertId });
  });
});


// Update flight details.
app.put('/api/flights/:id', (req, res) => {
  const { id } = req.params; // Gets the flight ID from route parameters.
  const { origin, destination, departure_time, arrival_time, price, seats_available } = req.body; // Extracts flight data from the request body.

  const query =
    'UPDATE Flights SET origin = ?, destination = ?, departure_time = ?, arrival_time = ?, price = ?, seats_available = ? ' +
    'WHERE flight_id = ?';

  // Executes the query to update flight details.
  db.query(query, [origin, destination, departure_time, arrival_time, price, seats_available, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating flight' }); // Handles query errors.
    res.status(200).json({ message: 'Flight updated successfully' }); // Sends success response if update is successful.
  });
});


