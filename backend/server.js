// Importing all the necessary packages
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const baseHtmlPath = path.resolve("/home/ackerman/Desktop/My_Files/BOOKS/CSE_CU/academic_book/4th_semester/CSE_413_DATABASE/Project:AIRLINE_RESERVATION_SYSTEM/Airline_frontend/front_8");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument;



dotenv.config();


const app = express();

const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: 'GET,POST,DELETE,PUT,PATCH',
  credentials: true,
}));



app.use(express.static(baseHtmlPath));

// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(baseHtmlPath, 'index.html'));
});

// MySQL connection setup.
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});




db.connect((err) => {
  if (err) {
    console.log('Error connecting to MySQL:', err);
  } else {
    console.log(`Connected to MySQL database: ${db.config.database}`);
  }
});


// Middleware to parse JSON bodies in incoming requests.
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: 'okay123',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  }
}));



// Login route to authenticate user
app.post('/login', async (req, res) => {
  const { email, pass } = req.body;
  if (req.session.user) {
    return res.status(200).json({ message: 'Already logged in', redirect: '/dashboard' });
  }

  console.log('Request Body:', req.body);
  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result[0];

    const isPasswordCorrect = await bcrypt.compare(pass, user.password);

    if (isPasswordCorrect) {
      req.session.user = {
        email: user.email,
        userId: user.user_id,
        username: user.first_name + ' ' + user.last_name,
        role: user.role,
        phone: user.phone,
      };

      console.log(`${email} logged in`);

      
      console.log('Session after login:', req.session.user);

      // Define redirect URL based on user role
      let redirectUrl;
      if (user.role === 'customer') {
        redirectUrl = '/passengerDash.html';
        console.log('Session after executing passengerDash ridirection:', req.session.user);
      } else if (user.role === 'admin') {
        redirectUrl = '/adminDash.html';
      } else {
        return res.status(403).json({ message: 'Unauthorized role' });
      }
      return res.status(200).json({ message: 'Login successful', redirect: redirectUrl });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});


// Serve the login page.
app.get("/login", (req, res) => {
  res.sendFile(path.join(baseHtmlPath, "index.html"));
});

// Serve the dashboard based on the user's role.
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const role = req.session.user.role;

  if (role === "customer") {
    res.sendFile(path.join(__dirname, "../../Airline_frontend/front_8/", "passengerDash.html"));
  } else if (role === "admin") {
    res.sendFile(path.join(__dirname, "../../Airline_frontend/front_8/", "adminDash.html"));
  } else {
    res.status(403).send("Unauthorized");
  }
});



//fetch data from session in the passengerDash
app.get('/api/profile', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      username: req.session.user.username,
      email: req.session.user.email,
      phone: req.session.user.phone || 'N/A'  
    });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});








//fetching from Reservations table users booked flights :
app.get('/api/get-bookings', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not logged in' });
  }

  const userId = req.session.user.userId;
  console.log("Fetching bookings for user ID:", userId); 
  const query = `
      SELECT r.reservation_id, r.booking_date, r.status, f.flight_number, f.origin, f.destination
      FROM Reservations r
      JOIN Flights f ON r.flight_id = f.flight_id
      WHERE r.user_id = ?
      ORDER BY r.booking_date DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching bookings', error: err });
    }

    // Return the bookings data
    console.log("SQL Query Results:", results); 
    return res.json({ bookings: results });
  });
});










//cancelling Reservations in the passengerDash:
app.post('/api/cancel-booking', (req, res) => {
  const { reservationId } = req.body;

  if (!reservationId) {
    return res.status(400).json({ message: 'Reservation ID is required' });
  }

  const cancelQuery = 'UPDATE Reservations SET status = "Cancelled" WHERE reservation_id = ?';

  db.query(cancelQuery, [reservationId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    return res.status(200).json({ message: 'Reservation cancelled successfully' });
  });
});






//fetching in the manage bookings table in adminDash
app.get('/api/admin/bookings', (req, res) => {
  console.log("Fetching bookings...");

  const sql = `
    SELECT 
      r.reservation_id, 
      CONCAT(u.first_name, ' ', u.last_name) AS username,
      u.email AS user_email,
      u.phone AS user_phone,
      r.booking_date, 
      r.status, 
      r.total_amount, 
      'Paid' AS payment_status
    FROM Reservations r
    JOIN Users u ON r.user_id = u.user_id
    ORDER BY r.booking_date ASC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log("Query Results:", JSON.stringify(results, null, 2)); 

    
    res.setHeader('Content-Type', 'application/json');
    res.json(results);
  });
});












// extraaaaa Backend route to log session data 
app.get('/api/check-session-1', (req, res) => {
  console.log('Session when passengerDash loads :', req.session.user);
  res.json({ user: req.session.user });
});




// extraaaaa Backend route to log session data 
app.get('/api/check-session', (req, res) => {
  console.log('Session when  index2 loads:', req.session.user);
  res.json({ user: req.session.user });
});










// Middleware to check if the user is authenticated.
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();  
  } else {   
    return setTimeout(() => {
      res.sendFile(path.join(__dirname, '/home/ackerman/Desktop/My Files/BOOKS/CSE CU/academic-book/4th_semester/CSE_413 DATABASE/Project:AIRLINE_RESERVATION_SYSTEM/Airline_frontend/front_8', 'isAuth.html'));
    }, 1500);  
  }
}

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



app.post('/api/logout', (req, res) => {
  console.log('Session before delete and distroy:', req.session.user);
  delete req.session.user;
  console.log('Session after deletion:', req.session.user);
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to destroy session' });
    }
    console.log("Session destroyed");
    console.log('Session after destruction:', req.session);
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});


// Endpoint to Get All Users.
app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM Users'; 
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching users' }); 
    }
    res.status(200).json(results);
  });
});



// Endpoint to Update a User.
app.put('/api/update_user', (req, res) => {
  const { id, first_name, last_name, email, phone, user_role } = req.body; 
  const query =
    'UPDATE Users SET first_name = ?, last_name = ?, email = ?, phone = ?, user_role = ? ' +
    'WHERE user_id = ?';

  // Executes the update query.
  db.query(query, [first_name, last_name, email, phone, user_role, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating user' }); 
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    res.status(200).json({ message: 'User updated successfully' }); 
  });
});

// Endpoint to Delete a User.
app.delete('/api/delete_user', (req, res) => {
  const { id } = req.query; 

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' }); 
  }

  // SQL query to delete the user by their ID.
  const query = 'DELETE FROM Users WHERE user_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user' }); 
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' }); 
    }

    res.status(200).json({ message: 'User deleted successfully' });
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
  const query = 'SELECT * FROM Flights'; 
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching flights' }); 
    res.status(200).json(results); 
  });
});


//------------------------------------------------------------------------------------------------
// API to delete a flight by ID from adminDash
app.delete('/api/delete-flight/:id', (req, res) => {
  const flightId = req.params.id;

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

//-------------------------------------------------------------------------------------------
app.post('/api/book-flight', (req, res) => {
  // Ensure the user is logged in
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  const userId = req.session.user.userId;
  const { flight_id } = req.body;

  // Query to get flight details
  const flightDetailsQuery = 'SELECT flight_number, origin, destination, departure_time, arrival_time, price FROM Flights WHERE flight_id = ?';
  db.query(flightDetailsQuery, [flight_id], (err, flightResult) => {
    if (err) {
      console.error('Error fetching flight details:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (flightResult.length === 0 || flightResult[0].seats_available <= 0) {
      return res.status(400).json({ success: false, message: 'Flight not available or fully booked.' });
    }

    // Proceed with booking the flight
    const bookingQuery = 'INSERT INTO Reservations (user_id, flight_id, booking_date, status, total_amount) VALUES (?, ?, NOW(), ?, ?)';
    const totalAmount = flightResult[0].price; 
    const status = 'confirmed'; 

    db.query(bookingQuery, [userId, flight_id, status, totalAmount], (err, bookingResult) => {
      if (err) {
        console.error('Error booking flight:', err);
        return res.status(500).json({ success: false, message: 'Booking failed' });
      }

      // Save complete flight and booking details in the session
      req.session.latestBooking = {
        reservation_id: bookingResult.insertId,
        flight_number: flightResult[0].flight_number,
        origin: flightResult[0].origin,
        destination: flightResult[0].destination,
        departure_time: flightResult[0].departure_time,
        arrival_time: flightResult[0].arrival_time,
        booking_date: new Date(),
        status: 'confirmed',
        price: totalAmount
      };

      console.log('Booking successful:', req.session.latestBooking); 

      // Decrease available seats in Flights table
      const updateSeatsQuery = 'UPDATE Flights SET seats_available = seats_available - 1 WHERE flight_id = ?';
      db.query(updateSeatsQuery, [flight_id], (err, result) => {
        if (err) {
          console.error('Error updating available seats:', err);
          return res.status(500).json({ success: false, message: 'Failed to update available seats' });
        }
        return res.status(200).json({ success: true, message: 'Flight booked successfully' });
      });
    });
  });
});









// Update flight details.
app.put('/api/flights/:id', (req, res) => {
  const { id } = req.params; 
  const { origin, destination, departure_time, arrival_time, price, seats_available } = req.body; 
  const query =
    'UPDATE Flights SET origin = ?, destination = ?, departure_time = ?, arrival_time = ?, price = ?, seats_available = ? ' +
    'WHERE flight_id = ?';
  db.query(query, [origin, destination, departure_time, arrival_time, price, seats_available, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating flight' }); 
    res.status(200).json({ message: 'Flight updated successfully' }); 
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`); // Logs a message indicating the server is running.
});
