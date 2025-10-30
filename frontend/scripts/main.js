// This is the main script file for all pages *except* login/register.

document.addEventListener('DOMContentLoaded', () => {

    document.body.classList.add('fade-in'); // Page fade-in

    // --- Helper Variables ---
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // --- 1. DYNAMIC NAVBAR SETUP ---
    const setupNavbar = () => {
        const navLinks = document.getElementById('nav-links');
        if (!navLinks) return; 

        if (token) {
            if (role === 'user') {
                navLinks.innerHTML = `
                    <li><a href="index.html">Find a Vehicle</a></li>
                    <li><a href="dashboard-user.html">My Bookings</a></li>
                    <li><a href="#" id="logout-btn" class="btn-primary">Logout</a></li>
                `;
            } else if (role === 'agency') {
                navLinks.innerHTML = `
                    <li><a href="dashboard-agency.html">My Dashboard</a></li>
                    <li><a href="#" id="logout-btn" class="btn-primary">Logout</a></li>
                `;
            }
        } else {
            navLinks.innerHTML = `
                <li><a href="login.html">Login</a></li>
                <li><a href="register.html" class="btn-primary">Register</a></li>
            `;
        }
    };
    setupNavbar();


    // --- 2. LOGOUT BUTTON ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = 'index.html';
        });
    }

    // --- 3. Homepage Logic (index.html) ---
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!token) {
                alert('Please log in to search for vehicles.');
                window.location.href = 'login.html';
            } else {
                // UPDATED: Get vehicle type instead of date
                const location = document.getElementById('location').value;
                const vehicleType = document.getElementById('vehicle-type').value;
                // UPDATED: Redirect with 'type' parameter
                window.location.href = `search.html?location=${location}&type=${vehicleType}`;
            }
        });
    }

    // --- 4. Search Results Page Logic (search.html) ---
    const vehicleListContainer = document.getElementById('vehicle-list-container');
    if (vehicleListContainer) {

        if (!token) {
            alert('You must be logged in to view this page.');
            window.location.href = 'login.html';
            return; 
        }

        // UPDATED: This function now reads the URL
        const fetchVehicles = async () => {
            try {
                // Read the search params from the URL
                const params = new URLSearchParams(window.location.search);
                const location = params.get('location') || '';
                const type = params.get('type') || '';

                // Build the API URL with the search params
                const res = await fetch(`${API_BASE_URL}/api/vehicles?location=${location}&type=${type}`);
                const vehicles = await res.json();
                
                vehicleListContainer.innerHTML = ''; 
                if (vehicles.length === 0) {
                    vehicleListContainer.innerHTML = `
                        <div class="empty-list-message">
                            <h3>No Vehicles Found</h3>
                            <p>Your search for "${type || 'All Types'}" in "${location || 'All Locations'}" returned no results. Try a different search.</p>
                        </div>`;
                    return;
                }

                vehicles.forEach(vehicle => {
                    const vehicleCard = `
                        <div class="card">
                            <img src="${vehicle.image || 'assets/placeholder.jpg'}" alt="${vehicle.modelName}" class="card-image">
                            <div class="card-content">
                                <h4>${vehicle.modelName}</h4>
                                <p>Type: ${vehicle.type}</p>
                                <p>Agency: ${vehicle.agencyId ? vehicle.agencyId.agencyName : 'N/A'}</p>
                                ${vehicle.description ? `<p>${vehicle.description}</p>` : ''}
                                <p class="price">₹${vehicle.pricePerDay} / day</p>
                                <a href="vehicle-details.html?id=${vehicle._id}" class="btn-primary">Book Now</a>
                            </div>
                        </div>
                    `;
                    vehicleListContainer.innerHTML += vehicleCard;
                });

            } catch (err) {
                console.error('Error fetching vehicles:', err);
                vehicleListContainer.innerHTML = '<p>Error loading vehicles. Please try again.</p>';
            }
        };
        fetchVehicles();
    }

    // --- 5. User Dashboard Logic (dashboard-user.html) ---
    const userBookingList = document.getElementById('booking-list-container');
    if (userBookingList) {
        const fetchUserBookings = async () => {
            if (!token) {
                window.location.href = 'login.html'; 
                return;
            }
            try {
                const res = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.clear();
                        window.location.href = 'login.html';
                    }
                    throw new Error('Failed to fetch bookings');
                }

                const bookings = await res.json();
                userBookingList.innerHTML = '';
                if (bookings.length === 0) {
                    userBookingList.innerHTML = `
                        <div class="empty-list-message">
                            <h3>You have no bookings.</h3>
                            <p>Try finding a vehicle and making your first booking!</p>
                        </div>`;
                    return;
                }

                bookings.forEach(booking => {
                    const statusClass = booking.status === 'Cancelled' ? 'status-cancelled' : (booking.status === 'Confirmed' ? 'status-confirmed' : 'status-pending');
                    const bookingCard = `
                        <div class="card">
                            <div class="card-content">
                                <h4>${booking.vehicleId ? booking.vehicleId.modelName : 'Vehicle Removed'}</h4>
                                <p>Agency: ${booking.agencyId ? booking.agencyId.agencyName : 'N/A'}</p>
                                <p>Start Date: ${new Date(booking.startDate).toLocaleDateString()}</p>
                                <p>End Date: ${new Date(booking.endDate).toLocaleDateString()}</p>
                                <p>Pickup Time: ${booking.pickupTime || 'N/A'}</p>
                                <p class="status ${statusClass}" data-status-id="${booking._id}">Status: ${booking.status}</p>
                                <p class="price">Total: ₹${booking.totalPrice}</p>
                                ${booking.status !== 'Cancelled' ? 
                                    `<button class="btn-cancel" data-id="${booking._id}">Cancel Booking</button>` 
                                    : ''}
                            </div>
                        </div>
                    `;
                    userBookingList.innerHTML += bookingCard;
                });
            } catch (err) {
                console.error('Error fetching user bookings:', err);
            }
        };
        
        userBookingList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-cancel')) {
                const bookingId = e.target.dataset.id;
                
                if (!confirm('Are you sure you want to permanently delete this booking?')) {
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        alert('Booking deleted successfully.');
                        e.target.closest('.card').remove();
                    } else {
                        const data = await res.json();
                        alert(data.msg || 'Failed to delete booking.');
                    }
                } catch (err) {
                    console.error('Delete error:', err);
                }
            }
        });

        fetchUserBookings();
    }

    // --- 6. Agency Dashboard Logic (dashboard-agency.html) ---
    const addVehicleForm = document.getElementById('add-vehicle-form');
    const agencyBookingList = document.getElementById('agency-booking-list');
    const myVehiclesList = document.getElementById('my-vehicles-list'); 
    
    if (addVehicleForm) { 
        
        // A. Handle "Add Vehicle" Form
        addVehicleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (role !== 'agency' || !token) {
                alert('You must be logged in as an agency to add a vehicle.');
                return;
            }

            const formData = new FormData();
            formData.append('modelName', document.getElementById('modelName').value);
            formData.append('type', document.getElementById('type').value);
            formData.append('pricePerDay', document.getElementById('pricePerDay').value);

            const imageFile = document.getElementById('image').files[0];
            if (!imageFile) {
                alert('Please select an image file.');
                return;
            }
            formData.append('image', imageFile);

            const description = document.getElementById('description').value;
            if (description) {
                formData.append('description', description);
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData 
                });
                
                const data = await res.json();
                if (res.ok) {
                    alert('Vehicle added successfully!');
                    addVehicleForm.reset();
                    fetchAgencyBookings();
                    fetchMyVehicles(); 
                } else {
                    alert(data.msg || 'Failed to add vehicle.');
                }
            } catch (err) {
                console.error('Error adding vehicle:', err);
            }
        });

        // B. Fetch and Display Agency's Bookings
        const fetchAgencyBookings = async () => {
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
            try {
                const res = await fetch(`${API_BASE_URL}/api/bookings/agency-bookings`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!res.ok) {
                     if (res.status === 401) {
                        localStorage.clear();
                        window.location.href = 'login.html';
                    }
                    throw new Error('Failed to fetch agency bookings');
                }
                
                const bookings = await res.json();
                agencyBookingList.innerHTML = '';
                if (bookings.length === 0) {
                    agencyBookingList.innerHTML = `
                        <div class="empty-list-message">
                            <h3>No Bookings Yet</h3>
                            <p>When a user books one of your vehicles, it will appear here.</p>
                        </div>`;
                    return;
                }

                bookings.forEach(booking => {
                    const statusClass = booking.status === 'Cancelled' ? 'status-cancelled' : (booking.status === 'Confirmed' ? 'status-confirmed' : 'status-pending');
                    const bookingCard = `
                        <div class="card">
                            <div class="card-content">
                                <h4>${booking.vehicleId ? booking.vehicleId.modelName : 'Vehicle Removed'}</h4>
                                <p>Booked by: ${booking.userId ? booking.userId.username : 'N/A'}</p>
                                <p>Email: ${booking.userId ? booking.userId.email : 'N/A'}</p>
                                <p>Start Date: ${new Date(booking.startDate).toLocaleDateString()}</p>
                                <p>End Date: ${new Date(booking.endDate).toLocaleDateString()}</p>
                                <p>Pickup Time: ${booking.pickupTime || 'N/A'}</p>
                                <p class="status ${statusClass}" data-status-id="${booking._id}">Status: ${booking.status}</p>
                                <p class="price">Total: ₹${booking.totalPrice}</p>
                                ${booking.status !== 'Cancelled' ? 
                                    `<button class="btn-cancel" data-id="${booking._id}">Cancel Booking</button>` 
                                    : ''}
                            </div>
                        </div>
                    `;
                    agencyBookingList.innerHTML += bookingCard;
                });
            } catch (err) {
                console.error('Error fetching agency bookings:', err);
            }
        };
        
        // C. Fetch and Display Agency's Vehicles
        const fetchMyVehicles = async () => {
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
            try {
                const res = await fetch(`${API_BASE_URL}/api/vehicles/my-vehicles`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!res.ok) {
                    throw new Error('Failed to fetch your vehicles');
                }
                
                const vehicles = await res.json();
                myVehiclesList.innerHTML = '';
                if (vehicles.length === 0) {
                    myVehiclesList.innerHTML = `
                        <div class="empty-list-message">
                            <h3>No Vehicles Listed</h3>
                            <p>Use the "Add a New Vehicle" form to get started.</p>
                        </div>`;
                    return;
                }

                vehicles.forEach(vehicle => {
                    const vehicleCard = `
                        <div class="card">
                            <img src="${vehicle.image || 'assets/placeholder.jpg'}" alt="${vehicle.modelName}" class="card-image">
                            <div class="card-content">
                                <h4>${vehicle.modelName}</h4>
                                <p>${vehicle.type} - ₹${vehicle.pricePerDay}/day</p>
                                <button class="btn-cancel btn-delete" data-id="${vehicle._id}">Delete Vehicle</button>
                            </div>
                        </div>
                    `;
                    myVehiclesList.innerHTML += vehicleCard;
                });
            } catch (err) {
                console.error('Error fetching agency vehicles:', err);
            }
        };

        // D. Event Listeners for Deleting Vehicles
        myVehiclesList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-delete')) {
                const vehicleId = e.target.dataset.id;
                
                if (!confirm('Are you sure you want to permanently delete this vehicle? This action cannot be undone.')) {
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        alert('Vehicle deleted successfully.');
                        e.target.closest('.card').remove();
                    } else {
                        const data = await res.json();
                        alert(data.msg || 'Failed to delete vehicle.');
                    }
                } catch (err) {
                    console.error('Delete error:', err);
                }
            }
        });
        
        // E. Event Listener for Deleting Bookings
        agencyBookingList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-cancel')) {
                const bookingId = e.target.dataset.id;
                
                if (!confirm('Are you sure you want to permanently delete this user\'s booking?')) {
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                        method: 'DELETE', 
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        alert('Booking deleted successfully.');
                        e.target.closest('.card').remove();
                    } else {
                        const data = await res.json();
                        alert(data.msg || 'Failed to delete booking.');
                    }
                } catch (err) {
                    console.error('Delete error:', err);
                }
            }
        });

        // Load all data on page load
        fetchAgencyBookings();
        fetchMyVehicles();
    }

    // --- 7. Vehicle Details & Booking Page Logic ---
    const bookingDetailsForm = document.getElementById('booking-details-form');
    if (bookingDetailsForm) {
        
        let vehicleId = null;
        let agencyId = null;
        let pricePerDay = 0;

        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        const pickupTimeInput = document.getElementById('pickup-time');
        const totalDaysEl = document.getElementById('total-days');
        const totalPriceEl = document.getElementById('total-price');
        
        const payOnlineBtn = document.getElementById('pay-online-btn');
        const payLaterBtn = document.getElementById('pay-later-btn');
        
        // --- A. Fetch Vehicle Details on Page Load ---
        const fetchVehicleDetails = async () => {
            if (!token) {
                alert('You must be logged in to book a vehicle.');
                window.location.href = 'login.html';
                return;
            }
            
            const params = new URLSearchParams(window.location.search);
            vehicleId = params.get('id');
            if (!vehicleId) {
                alert('No vehicle ID specified.');
                window.location.href = 'search.html';
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`);
                if (!res.ok) {
                    throw new Error('Vehicle not found');
                }
                const vehicle = await res.json();
                
                document.getElementById('vehicle-image').src = vehicle.image || 'assets/placeholder.jpg';
                document.getElementById('vehicle-name').textContent = vehicle.modelName;
                document.getElementById('vehicle-agency').textContent = `Agency: ${vehicle.agencyId.agencyName}`;
                document.getElementById('vehicle-description').textContent = vehicle.description || 'No description available.';
                document.getElementById('vehicle-price-day').textContent = `₹${vehicle.pricePerDay} / day`;
                
                pricePerDay = vehicle.pricePerDay;
                agencyId = vehicle.agencyId._id;
                
            } catch (err) {
                console.error(err);
                alert('Error loading vehicle details.');
            }
        };
        
        // --- B. Calculate Total Price ---
        const calculateTotal = () => {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);

            if (startDateInput.value && endDateInput.value && endDate > startDate) {
                const timeDiff = endDate.getTime() - startDate.getTime();
                const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                if (days > 0) {
                    const total = days * pricePerDay;
                    totalDaysEl.textContent = days;
                    totalPriceEl.textContent = `₹${total}`;
                } else {
                    totalDaysEl.textContent = 0;
                    totalPriceEl.textContent = '₹0';
                }
            } else {
                totalDaysEl.textContent = 0;
                totalPriceEl.textContent = '₹0';
            }
        };
        
        startDateInput.addEventListener('change', calculateTotal);
        endDateInput.addEventListener('change', calculateTotal);

        // --- C. Get Form Data (Helper function) ---
        const getBookingDetails = () => {
            const totalDays = parseInt(totalDaysEl.textContent);
            if (totalDays <= 0) {
                alert('End date must be after the start date.');
                return null;
            }
            if (!pickupTimeInput.value) {
                alert('Please select a pickup time.');
                return null;
            }
            
            return {
                vehicleId: vehicleId,
                agencyId: agencyId,
                startDate: startDateInput.value,
                endDate: endDateInput.value,
                pickupTime: pickupTimeInput.value, 
                totalPrice: parseInt(totalPriceEl.textContent.replace('₹', '')),
            };
        };

        // --- D. Function to Create Booking (Called by Pay Later) ---
        const createBooking = async (status = 'Pending') => {
            const bookingDetails = getBookingDetails();
            if (!bookingDetails) return;

            bookingDetails.status = status;

            try {
                const res = await fetch(`${API_BASE_URL}/api/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(bookingDetails)
                });

                const data = await res.json();
                if (res.ok) {
                    alert('Booking successful! Your booking is Pending.');
                    window.location.href = 'dashboard-user.html';
                } else {
                    alert(data.msg || 'Booking failed.');
                }
            } catch (err) {
                console.error('Booking error:', err);
            }
        };

        // --- E. "Pay on Pickup" Button Logic ---
        payLaterBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to book and pay on pickup?')) {
                await createBooking('Pending');
            }
        });

        // --- F. "Pay Online" Button Logic (MOCK) ---
        payOnlineBtn.addEventListener('click', () => {
            const bookingDetails = getBookingDetails();
            if (!bookingDetails) return; // Validation failed

            // Save details to localStorage to pass to the mock page
            localStorage.setItem('tempBooking', JSON.stringify(bookingDetails));
            
            // Redirect to the mock payment page
            window.location.href = 'mock-payment.html';
        });
        
        // Initial load
        fetchVehicleDetails();
    }

});