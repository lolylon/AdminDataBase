
-- Create database
CREATE DATABASE car_rental;

-- Connect to the database
\c car_rental;

-- Create rentals table
CREATE TABLE rentals (
    id SERIAL PRIMARY KEY,
    car_name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT
);

-- Create customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT
);

-- Create bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    rental_id INT REFERENCES rentals(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    return_date DATE
);

-- Create payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50)
);
