document.addEventListener('DOMContentLoaded', () => {
    // Target the new form, not just the button
    const paymentForm = document.querySelector('.payment-form'); 
    const confirmBtn = document.getElementById('confirm-payment-btn');
    const mockTotalPriceEl = document.getElementById('mock-total-price');
    const buttonTotalPriceEl = document.getElementById('button-total-price'); 
    const token = localStorage.getItem('token');

    // 1. Get the booking details we saved from the previous page
    const bookingDetails = JSON.parse(localStorage.getItem('tempBooking'));

    if (!bookingDetails || !token) {
        alert('Error: No booking details found. Returning to search.');
        window.location.href = 'search.html';
        return;
    }

    // 2. Display the total price in both places
    const priceText = `₹${bookingDetails.totalPrice}`;
    mockTotalPriceEl.textContent = priceText;
    buttonTotalPriceEl.textContent = priceText; // Update button text

    // 3. Use the form's submit event listener
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Simulate a delay for a "real" payment process
        confirmBtn.textContent = 'Processing...';
        confirmBtn.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay

        // 4. Add the "Confirmed" status and a mock payment ID
        bookingDetails.status = 'Confirmed';
        bookingDetails.paymentId = `mock_online_${new Date().getTime()}`;

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
                alert('Payment successful and booking confirmed!');
                // 5. Clean up and redirect
                localStorage.removeItem('tempBooking');
                window.location.href = 'dashboard-user.html';
            } else {
                alert(data.msg || 'Booking failed.');
                // Reset button on failure
                confirmBtn.innerHTML = `Pay <span id="button-total-price">${priceText}</span>`; 
                confirmBtn.disabled = false;
            }
        } catch (err) {
            console.error('Booking error:', err);
            alert('An error occurred during booking.');
            confirmBtn.innerHTML = `Pay <span id="button-total-price">${priceText}</span>`; 
            confirmBtn.disabled = false;
        }
    });
});