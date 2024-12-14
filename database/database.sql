DROP DATABASE IF EXISTS airline_reservation_system;
CREATE DATABASE airline_reservation_system;
USE airline_reservation_system;

CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Flights (
    flight_id INT PRIMARY KEY AUTO_INCREMENT,
    flight_number VARCHAR(20) UNIQUE NOT NULL,
    airline_name VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    seats_available INT NOT NULL CHECK (seats_available >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Reservations (
    reservation_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    flight_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES Flights(flight_id) ON DELETE CASCADE
);

CREATE TABLE Payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_status ENUM('completed', 'pending', 'failed') NOT NULL,
    payment_method ENUM('Credit Card', 'Debit Card', 'PayPal', 'Cash') NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES Reservations(reservation_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_email ON Users(email);
CREATE INDEX idx_flight_origin ON Flights(origin);
CREATE INDEX idx_flight_destination ON Flights(destination);
CREATE INDEX idx_status ON Reservations(status);

DELIMITER $$
CREATE PROCEDURE create_reservation(IN userId INT, IN flightId INT)
BEGIN
    DECLARE availableSeats INT;

    SELECT seats_available INTO availableSeats
    FROM Flights
    WHERE flight_id = flightId;

    IF availableSeats > 0 THEN
        START TRANSACTION;
        
        UPDATE Flights
        SET seats_available = seats_available - 1
        WHERE flight_id = flightId;

        INSERT INTO Reservations (user_id, flight_id, total_amount, status)
        SELECT userId, flightId, price, 'confirmed'
        FROM Flights
        WHERE flight_id = flightId;

        COMMIT;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No available seats';
    END IF;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE cancel_reservation(IN reservationId INT)
BEGIN
    DECLARE flightId INT;

    SELECT flight_id INTO flightId
    FROM Reservations
    WHERE reservation_id = reservationId;

    START TRANSACTION;

    UPDATE Flights
    SET seats_available = seats_available + 1
    WHERE flight_id = flightId;

    UPDATE Reservations
    SET status = 'cancelled'
    WHERE reservation_id = reservationId;

    COMMIT;
END $$
DELIMITER ;

DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Reservations;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Flights;

SELECT * FROM Users;
SELECT * FROM Flights;
SELECT * FROM Reservations;
SELECT * FROM Payments;
