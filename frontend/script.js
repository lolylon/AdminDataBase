async function fetchData(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);

    try {
        console.log(`Requesting ${endpoint} with method ${method} and body ${JSON.stringify(body)}`);
        const response = await fetch(endpoint, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results').textContent = 'An error occurred';
    }
}

// Функция для отображения данных в виде таблицы
// Function to display data in a table
function displayTable(data, type) {
    const resultsDiv = document.getElementById('results');
    if (!data || data.length === 0) {
        resultsDiv.innerHTML = 'No data found';
        return;
    }
    
    let table = '<table><tr>';
    
    if (type === 'customers') {
        table += '<th>ID</th><th>Full Name</th><th>Phone Number</th><th>Email</th><th>Address</th>';
    } else if (type === 'bookings') {
        table += '<th>ID</th><th>Customer ID</th><th>Rental ID</th><th>Booking Date</th><th>Return Date</th>';
    } else if (type === 'payments') {
        table += '<th>ID</th><th>Booking ID</th><th>Amount</th><th>Payment Date</th><th>Payment Method</th>';
    } else {
        table += '<th>ID</th><th>Car Name</th><th>Price</th><th>Status</th><th>Description</th>';
    }
    
    table += '</tr>';
    
    data.forEach(item => {
        table += '<tr>';
        
        if (type === 'customers') {
            table += `<td>${item.id}</td><td>${item.full_name}</td><td>${item.phone_number}</td><td>${item.email}</td><td>${item.address}</td>`;
        } else if (type === 'bookings') {
            table += `<td>${item.id}</td><td>${item.customer_id}</td><td>${item.rental_id}</td><td>${item.booking_date}</td><td>${item.return_date}</td>`;
        } else if (type === 'payments') {
            table += `<td>${item.id}</td><td>${item.booking_id}</td><td>${item.amount}</td><td>${item.payment_date}</td><td>${item.payment_method}</td>`;
        } else {
            table += `<td>${item.id}</td><td>${item.car_name}</td><td>${item.price}</td><td>${item.status}</td><td>${item.description}</td>`;
        }
        
        table += '</tr>';
    });
    
    table += '</table>';
    resultsDiv.innerHTML = table;
}

// Show all customers
document.getElementById('showCustomers').addEventListener('click', () => {
    fetchData('/customers').then(data => {
        displayTable(data, 'customers');
    });
});


// Обновим обработчики событий
document.getElementById('showData').addEventListener('click', () => {
    fetchData('/rentals').then(data => {
        displayTable(data);
    });
});

document.getElementById('searchData').addEventListener('click', () => {
    const carName = document.getElementById('carNameInput').value.trim();
    const status = document.getElementById('statusInput').value.trim();
    let queryParams = `?car_name=${encodeURIComponent(carName)}`;
    if (status) {
        queryParams += `&status=${encodeURIComponent(status)}`;
    }
    fetchData(`/rentals/search${queryParams}`).then(data => {
        displayTable(data);
    }).catch(error => {
        console.error('Error:', error);
        document.getElementById('results').textContent = 'An error occurred';
    });
});




// Show form to add a new rental
document.getElementById('addRecord').addEventListener('click', () => {
    document.getElementById('formContainer').style.display = 'block';
});

// Add a new rental
document.getElementById('addCarForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newRental = {
        car_name: document.getElementById('newCarName').value,
        price: parseFloat(document.getElementById('newCarPrice').value),
        status: document.getElementById('newCarStatus').value,
        description: document.getElementById('newCarDescription').value
    };
    fetchData('/rentals', 'POST', newRental).then(data => {
        if (data) {
            document.getElementById('results').textContent = JSON.stringify(data, null, 2);
        }
    });
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('addCarForm').reset();
});

// Cancel adding a new rental
document.getElementById('cancelAdd').addEventListener('click', () => {
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('addCarForm').reset();
});

// Show form to update a rental
document.getElementById('updateRecord').addEventListener('click', async () => {
    const rentalId = prompt('Enter Rental ID to update:'); // Запросить ID у пользователя
    const rental = await fetchData(`/rentals/${rentalId}`); // Ждем данных о записи
    if (rental) {
        document.getElementById('updateCarId').value = rental.id;
        document.getElementById('updateCarName').value = rental.car_name;
        document.getElementById('updateCarPrice').value = rental.price;
        document.getElementById('updateCarStatus').value = rental.status;
        document.getElementById('updateCarDescription').value = rental.description;
        document.getElementById('updateFormContainer').style.display = 'block';
    } else {
        document.getElementById('results').textContent = 'Rental not found';
    }
});

// Update a rental
document.getElementById('updateCarForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedRental = {
        car_name: document.getElementById('updateCarName').value,
        price: parseFloat(document.getElementById('updateCarPrice').value),
        status: document.getElementById('updateCarStatus').value,
        description: document.getElementById('updateCarDescription').value
    };
    const rentalId = document.getElementById('updateCarId').value;
    fetchData(`/rentals/${rentalId}`, 'PUT', updatedRental).then(data => {
        if (data) {
            document.getElementById('results').textContent = JSON.stringify(data, null, 2);
        }
    });
    document.getElementById('updateFormContainer').style.display = 'none';
    document.getElementById('updateCarForm').reset();
});

// Cancel updating a rental
document.getElementById('cancelUpdate').addEventListener('click', () => {
    document.getElementById('updateFormContainer').style.display = 'none';
    document.getElementById('updateCarForm').reset();
});

// Delete a rental
document.getElementById('deleteRecord').addEventListener('click', () => {
    const rentalId = prompt('Enter Rental ID to delete:'); // Запросить ID у пользователя
    fetchData(`/rentals/${rentalId}`, 'DELETE').then(data => {
        if (data) {
            document.getElementById('results').textContent = JSON.stringify(data, null, 2);
        }
    });
});

// Perform calculation: Calculate total price of selected cars
document.getElementById('calculate').addEventListener('click', () => {
    const selectedCars = prompt('Enter the IDs of the cars to calculate, separated by commas (or leave blank to calculate the total price of all cars):');
    
    let queryParams = '';
    if (selectedCars) {
        const ids = selectedCars.split(',').map(id => id.trim()).join(',');
        queryParams = `?ids=${ids}`;
    }

    fetchData(`/rentals/calculate${queryParams}`).then(data => {
        if (data) {
            document.getElementById('results').textContent = `Total Price: $${data.totalPrice}`;
        } else {
            document.getElementById('results').textContent = 'No rentals found for calculation';
        }
    }).catch(error => {
        console.error('Error:', error);
        document.getElementById('results').textContent = 'An error occurred';
    });
});

// Show all bookings
document.getElementById('showBookings').addEventListener('click', () => {
    fetchData('/bookings').then(data => {
        displayTable(data, 'bookings');
    });
});

// Show form to add a new booking
document.getElementById('addBooking').addEventListener('click', () => {
    document.getElementById('bookingFormContainer').style.display = 'block';
    document.getElementById('bookingFormTitle').innerText = 'Add New Booking';
});

// Add a new booking
document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newBooking = {
        customer_id: document.getElementById('bookingCustomerId').value,
        rental_id: document.getElementById('bookingRentalId').value,
        booking_date: document.getElementById('bookingDate').value,
        return_date: document.getElementById('returnDate').value
    };
    fetchData('/bookings', 'POST', newBooking).then(data => {
        if (data) {
            displayTable([data], 'bookings');
        }
    });
    document.getElementById('bookingFormContainer').style.display = 'none';
    document.getElementById('bookingForm').reset();
});

// Cancel adding/updating a booking
document.getElementById('cancelBooking').addEventListener('click', () => {
    document.getElementById('bookingFormContainer').style.display = 'none';
    document.getElementById('bookingForm').reset();
});




// Show form to add a new customer
document.getElementById('addCustomer').addEventListener('click', () => {
    document.getElementById('customerFormContainer').style.display = 'block';
    document.getElementById('customerFormTitle').innerText = 'Add New Customer';
});

// Add a new customer
// Add a new customer
// Add a new customer
document.getElementById('customerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newCustomer = {
        full_name: document.getElementById('customerName').value,
        phone_number: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value,
        address: document.getElementById('customerAddress').value
    };
    fetchData('/customers', 'POST', newCustomer).then(data => {
        if (data) {
            displayTable([data], 'customers');
        }
    });
    document.getElementById('customerFormContainer').style.display = 'none';
    document.getElementById('customerForm').reset();
});


// Cancel adding/updating a customer
document.getElementById('cancelCustomer').addEventListener('click', () => {
    document.getElementById('customerFormContainer').style.display = 'none';
    document.getElementById('customerForm').reset();
});

// Show all payments
document.getElementById('showPayments').addEventListener('click', () => {
    fetchData('/payments').then(data => {
        displayTable(data, 'payments');
    });
});

// Show form to add a new payment
document.getElementById('addPayment').addEventListener('click', () => {
    document.getElementById('paymentFormContainer').style.display = 'block';
    document.getElementById('paymentFormTitle').innerText = 'Add New Payment';
});

// Add a new payment
document.getElementById('paymentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newPayment = {
        booking_id: document.getElementById('paymentBookingId').value,
        amount: document.getElementById('paymentAmount').value,
        payment_date: document.getElementById('paymentDate').value,
        payment_method: document.getElementById('paymentMethod').value
    };
    fetchData('/payments', 'POST', newPayment).then(data => {
        if (data) {
            displayTable([data], 'payments');
        }
    });
    document.getElementById('paymentFormContainer').style.display = 'none';
    document.getElementById('paymentForm').reset();
});

// Cancel adding/updating a payment
document.getElementById('cancelPayment').addEventListener('click', () => {
    document.getElementById('paymentFormContainer').style.display = 'none';
    document.getElementById('paymentForm').reset();
});
