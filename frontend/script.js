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

document.getElementById('showCustomers').addEventListener('click', () => {
    fetchData('/customers').then(data => {
        displayTable(data, 'customers');
    });
});


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



document.getElementById('addRecord').addEventListener('click', () => {
    document.getElementById('formContainer').style.display = 'block';
});

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

document.getElementById('cancelAdd').addEventListener('click', () => {
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('addCarForm').reset();
});

document.getElementById('updateRecord').addEventListener('click', async () => {
    const rentalId = prompt('Enter Rental ID to update:'); 
    const rental = await fetchData(`/rentals/${rentalId}`); 
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

document.getElementById('cancelUpdate').addEventListener('click', () => {
    document.getElementById('updateFormContainer').style.display = 'none';
    document.getElementById('updateCarForm').reset();
});

document.getElementById('deleteRecord').addEventListener('click', () => {
    const rentalId = prompt('Enter Rental ID to delete:'); 
    fetchData(`/rentals/${rentalId}`, 'DELETE').then(data => {
        if (data) {
            document.getElementById('results').textContent = JSON.stringify(data, null, 2);
        }
    });
});

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

document.getElementById('showBookings').addEventListener('click', () => {
    fetchData('/bookings').then(data => {
        displayTable(data, 'bookings');
    });
});

document.getElementById('addBooking').addEventListener('click', () => {
    document.getElementById('bookingFormContainer').style.display = 'block';
    document.getElementById('bookingFormTitle').innerText = 'Add New Booking';
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bookingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newBooking = {
            customer_id: document.getElementById('bookingCustomerId').value,
            rental_id: document.getElementById('bookingRentalId').value,
            booking_date: document.getElementById('bookingDate').value,
            return_date: document.getElementById('returnDate').value
        };
        fetchData('/bookings', 'POST', newBooking).then(data => {
            displayTable([data], 'bookings');
        }).catch(error => {
            console.error('Error adding booking:', error);
            if (error.message.includes('400')) {
                document.getElementById('resultsBookings').textContent = 'Error adding booking: Car is already rented';
            } else {
                document.getElementById('resultsBookings').textContent = 'Error adding booking';
            }
        });
        document.getElementById('bookingFormContainer').style.display = 'none';
        document.getElementById('bookingForm').reset();
    });

    async function fetchData(endpoint, method = 'GET', body = null) {
        const options = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) options.body = JSON.stringify(body);

        try {
            const response = await fetch(endpoint, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
});


document.getElementById('cancelBooking').addEventListener('click', () => {
    document.getElementById('bookingFormContainer').style.display = 'none';
    document.getElementById('bookingForm').reset();
});

document.getElementById('addCustomer').addEventListener('click', () => {
    document.getElementById('customerFormContainer').style.display = 'block';
    document.getElementById('customerFormTitle').innerText = 'Add New Customer';
});


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



document.getElementById('cancelCustomer').addEventListener('click', () => {
    document.getElementById('customerFormContainer').style.display = 'none';
    document.getElementById('customerForm').reset();
});


document.getElementById('showPayments').addEventListener('click', () => {
    fetchData('/payments').then(data => {
        displayTable(data, 'payments');
    });
});


document.getElementById('addPayment').addEventListener('click', () => {
    document.getElementById('paymentFormContainer').style.display = 'block';
    document.getElementById('paymentFormTitle').innerText = 'Add New Payment';
});


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


document.getElementById('cancelPayment').addEventListener('click', () => {
    document.getElementById('paymentFormContainer').style.display = 'none';
    document.getElementById('paymentForm').reset();
});



function displayStatusCount(data) {
    const resultsDiv = document.getElementById('statusCountResults');
    if (!data || data.length === 0) {
        resultsDiv.innerHTML = 'No data found';
        return;
    }
    
    let table = '<table><tr><th>Status</th><th>Count</th></tr>';
    
    data.forEach(item => {
        table += `<tr><td>${item.status}</td><td>${item.count}</td></tr>`;
    });
    
    table += '</table>';
    resultsDiv.innerHTML = table;
}

document.getElementById('countByStatus').addEventListener('click', () => {
    fetchData('/rentals/status-count').then(data => {
        displayStatusCount(data);
    }).catch(error => {
        console.error('Error:', error);
        document.getElementById('statusCountResults').textContent = 'An error occurred';
    });
});



function displayCombinedData(data) {
    const resultsDiv = document.getElementById('combinedDataResults');
    if (!data || data.length === 0) {
        resultsDiv.innerHTML = 'No data found';
        return;
    }
    
    let table = '<table><tr><th>Rental ID</th><th>Car Name</th><th>Price</th><th>Status</th><th>Description</th><th>Booking ID</th><th>Booking Date</th><th>Return Date</th><th>Customer ID</th><th>Full Name</th><th>Phone Number</th><th>Email</th><th>Address</th><th>Payment ID</th><th>Amount</th><th>Payment Date</th><th>Payment Method</th></tr>';
    
    data.forEach(item => {
        table += `<tr>
                    <td>${item.rental_id}</td>
                    <td>${item.car_name}</td>
                    <td>${item.price}</td>
                    <td>${item.status}</td>
                    <td>${item.description}</td>
                    <td>${item.booking_id}</td>
                    <td>${item.booking_date}</td>
                    <td>${item.return_date}</td>
                    <td>${item.customer_id}</td>
                    <td>${item.full_name}</td>
                    <td>${item.phone_number}</td>
                    <td>${item.email}</td>
                    <td>${item.address}</td>
                    <td>${item.payment_id}</td>
                    <td>${item.amount}</td>
                    <td>${item.payment_date}</td>
                    <td>${item.payment_method}</td>
                  </tr>`;
    });
    
    table += '</table>';
    resultsDiv.innerHTML = table;
}


document.getElementById('showCombinedData').addEventListener('click', () => {
    fetchData('/combined-data').then(data => {
        displayCombinedData(data);
    }).catch(error => {
        console.error('Error:', error);
        document.getElementById('combinedDataResults').textContent = 'An error occurred';
    });
});


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('triggerDeleteBooking').addEventListener('click', () => {
        const bookingId = prompt('Enter Booking ID to delete:'); 
        if (bookingId) {
            fetchData(`/trigger-delete-booking/${bookingId}`, 'POST').then(data => {
                document.getElementById('triggerResults').textContent = JSON.stringify(data, null, 2);
            }).catch(error => {
                console.error('Error triggering delete booking:', error);
                document.getElementById('triggerResults').textContent = 'An error occurred';
            });
        } else {
            document.getElementById('triggerResults').textContent = 'Booking ID is required';
        }
    });
});



document.addEventListener('DOMContentLoaded', function() {
    function deleteBooking() {
        const bookingId = prompt('Enter Booking ID to delete:'); 
        if (bookingId) {
            fetchData(`/bookings/${bookingId}`, 'DELETE').then(data => {
                document.getElementById('resultsBookings').textContent = JSON.stringify(data, null, 2);
            }).catch(error => {
                console.error('Error deleting booking:', error);
                document.getElementById('resultsBookings').textContent = 'An error occurred';
            });
        } else {
            document.getElementById('resultsBookings').textContent = 'Booking ID is required';
        }
    }

    document.getElementById('deleteBooking').addEventListener('click', deleteBooking);
});

async function fetchData(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
