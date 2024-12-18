const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "frontend")));

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "car_rental",
    password: "123",
    port: 5432,
});

app.get("/rentals/search", async (req, res) => {
    const { car_name, status } = req.query;
    let query = "SELECT * FROM rentals WHERE 1=1";
    const params = [];

    if (car_name) {
        query += " AND car_name ILIKE $1";
        params.push(`%${car_name}%`);
    }
    if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
    }

    try {
        console.log('Executing query:', query); 
        console.log('With parameters:', params); 
        const result = await pool.query(query, params);
        console.log('Query result:', result.rows); 
        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).send("No rentals found");
        }
    } catch (err) {
        console.error('Error executing query:', err); 
        res.status(500).send("Error searching rentals");
    }
});



app.get("/rentals", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM rentals");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching rentals");
    }
});

app.get("/rentals/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM rentals WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).send("Rental not found");
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching rental");
    }
});


app.post("/rentals", async (req, res) => {
    const { car_name, price, status, description } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO rentals (car_name, price, status, description) VALUES ($1, $2, $3, $4) RETURNING *",
            [car_name, price, status, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding rental");
    }
});


app.put("/rentals/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    const { car_name, price, status, description } = req.body;

    try {
        const result = await pool.query(
            "UPDATE rentals SET car_name = $1, price = $2, status = $3, description = $4 WHERE id = $5 RETURNING *",
            [car_name, price, status, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Rental not found");
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating rental");
    }
});


app.delete("/rentals/:id(\\d+)", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM rentals WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Rental not found");
        }

        res.status(200).json({ message: "Rental deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting rental");
    }
});

app.get("/rentals/calculate", async (req, res) => {
    const { ids } = req.query;
    let query = "SELECT SUM(price) AS total_price FROM rentals";
    const params = [];

    if (ids) {
        const idArray = ids.split(',').map(id => parseInt(id, 10));
        query += " WHERE id = ANY($1)";
        params.push(idArray);
    }

    try {
        const result = await pool.query(query, params);
        if (result.rows.length === 0 || result.rows[0].total_price === null) {
            return res.status(404).send("No rentals found for calculation");
        }
        res.status(200).json({ totalPrice: result.rows[0].total_price });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error calculating total price");
    }
});


app.get("/customers", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM customers");
        console.log(result.rows); 
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching customers");
    }
});


app.get("/customers/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).send("Customer not found");
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching customer");
    }
});


app.post("/customers", async (req, res) => {
    console.log('Received POST request to /customers with body:', req.body);
    const { full_name, phone_number, email, address } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO customers (full_name, phone_number, email, address) VALUES ($1, $2, $3, $4) RETURNING *",
            [full_name, phone_number, email, address]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding customer:', err);
        res.status(500).send("Error adding customer");
    }
});


app.put("/customers/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    const { full_name, phone_number, email, address } = req.body;
    try {
        const result = await pool.query(
            "UPDATE customers SET full_name = $1, phone_number = $2, email = $3, address = $4 WHERE id = $5 RETURNING *",
            [full_name, phone_number, email, address, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("Customer not found");
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating customer");
    }
});


app.delete("/customers/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM customers WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("Customer not found");
        }
        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting customer");
    }
});



app.get("/bookings", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM bookings");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching bookings");
    }
});


app.get("/bookings/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).send("Booking not found");
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching booking");
    }
});


app.post("/bookings", async (req, res) => {
    const { customer_id, rental_id, booking_date, return_date } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO bookings (customer_id, rental_id, booking_date, return_date) VALUES ($1, $2, $3, $4) RETURNING *",
            [customer_id, rental_id, booking_date, return_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding booking");
    }
});


app.put("/bookings/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    const { customer_id, rental_id, booking_date, return_date } = req.body;

    try {
        const rentalCheck = await pool.query("SELECT status FROM rentals WHERE id = $1", [rental_id]);
        if (rentalCheck.rows.length === 0) {
            return res.status(404).send("Rental not found");
        }
        if (rentalCheck.rows[0].status === 'Rent') {
            console.log(`Car with ID ${rental_id} is already rented`);
            return res.status(400).send("Car is already rented");
        }

        const result = await pool.query(
            "UPDATE bookings SET customer_id = $1, rental_id = $2, booking_date = $3, return_date = $4 WHERE id = $5 RETURNING *",
            [customer_id, rental_id, booking_date, return_date, id]
        );
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating booking");
    }
});


app.delete("/bookings/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM bookings WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("Booking not found");
        }
        res.status(200).json({ message: "Booking deleted successfully", booking: result.rows[0] });
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.status(500).send("Error deleting booking");
    }
});


app.get("/payments", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM payments");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching payments");
    }
});

app.get("/rentals/status-count", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM rentals
            GROUP BY status
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching rental counts by status:', err);
        res.status(500).send("Error fetching rental counts by status");
    }
});

app.get("/payments/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).send("Payment not found");
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching payment");
    }
});

app.post("/payments", async (req, res) => {
    const { booking_id, amount, payment_date, payment_method } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO payments (booking_id, amount, payment_date, payment_method) VALUES ($1, $2, $3, $4) RETURNING *",
            [booking_id, amount, payment_date, payment_method]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding payment");
    }
});

app.post("/trigger-delete-booking/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM bookings WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("Booking not found");
        }
        res.status(200).json({ message: "Booking deleted successfully, rental status updated", booking: result.rows[0] });
    } catch (err) {
        console.error('Error triggering delete booking:', err);
        res.status(500).send("Error triggering delete booking");
    }
});


app.put("/payments/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    const { booking_id, amount, payment_date, payment_method } = req.body;
    try {
        const result = await pool.query(
            "UPDATE payments SET booking_id = $1, amount = $2, payment_date = $3, payment_method = $4 WHERE id = $5 RETURNING *",
            [booking_id, amount, payment_date, payment_method, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("Payment not found");
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating payment");
    }
});

app.delete("/payments/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM payments WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("Payment not found");
        }
        res.status(200).json({ message: "Payment deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting payment");
    }
});

app.get("/combined-data", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                rentals.id AS rental_id, rentals.car_name, rentals.price, rentals.status, rentals.description,
                bookings.id AS booking_id, bookings.booking_date, bookings.return_date,
                customers.id AS customer_id, customers.full_name, customers.phone_number, customers.email, customers.address,
                payments.id AS payment_id, payments.amount, payments.payment_date, payments.payment_method
            FROM rentals
            LEFT JOIN bookings ON rentals.id = bookings.rental_id
            LEFT JOIN customers ON bookings.customer_id = customers.id
            LEFT JOIN payments ON bookings.id = payments.booking_id
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching combined data:', err);
        res.status(500).send("Error fetching combined data");
    }
});


app.post("/bookings", async (req, res) => {
    const { customer_id, rental_id, booking_date, return_date } = req.body;

    try {
        const rentalCheck = await pool.query("SELECT status FROM rentals WHERE id = $1", [rental_id]);
        if (rentalCheck.rows.length === 0) {
            return res.status(404).send("Rental not found");
        }
        if (rentalCheck.rows[0].status === 'Rent') {
            console.log(`Car with ID ${rental_id} is already rented`);
            return res.status(400).send("Car is already rented");
        }

        const result = await pool.query(
            "INSERT INTO bookings (customer_id, rental_id, booking_date, return_date) VALUES ($1, $2, $3, $4) RETURNING *",
            [customer_id, rental_id, booking_date, return_date]
        );
        
        await pool.query("UPDATE rentals SET status = 'Rent' WHERE id = $1", [rental_id]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding booking");
    }
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
