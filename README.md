# 🚗 CampusCab - Vehicle Rental Marketplace

**CampusCab** is a full-stack web application designed as a marketplace for vehicle rentals.  
Built with the **MERN stack (MongoDB, Express, React, Node.js)** and a **vanilla JavaScript frontend**, this platform allows vehicle agencies to list their vehicles and users to browse, book, and manage their rentals.

---

## ✨ Key Features

### 👤 User (Customer)
- **Authentication:** Secure User Registration and Login with JWT (JSON Web Tokens).  
- **Dynamic Navbar:** Shows “My Bookings” and “Logout” when a user is logged in.  
- **Vehicle Search:** Search vehicles by type directly from the homepage.  
- **Booking System:** Book a vehicle by selecting start date, end date, and pickup time.  
- **Dual Payment Options:**  
  - **Mock “Pay Online”** – Simulated payment that creates a *Confirmed* booking.  
  - **Pay on Pickup** – “Book now, pay later” option that creates a *Pending* booking.  
- **User Dashboard:** View all past and upcoming bookings.  
- **Cancel Bookings:** Users can delete their own bookings anytime.

---

### 💼 Business (Vehicle Agency)
- **Authentication:** Separate Registration and Login for agencies.  
- **Agency Dashboard:** Central hub for managing business activities.  
- **Vehicle Management:**  
  - Add vehicles with details, price, description, and images (using `multer`).  
  - View all vehicles in a “My Vehicle Listings” section.  
  - Delete owned vehicles.  
- **Booking Management:**  
  - View all bookings for agency vehicles.  
  - See customer details like name, email, and pickup time.  
  - Cancel user bookings when needed.

---

### 🎨 UI / UX
- **Modern Dark Theme:** Frosted glass (glassmorphism) interface.  
- **Dynamic Backgrounds:** Professional images for each section (Home, Auth, Dashboard).  
- **Responsive Design:** Optimized for desktop and mobile.  
- **Empty State Handling:** Clean “empty message” cards.  
- **Animated UI:** Subtle fade-in transitions for smooth experience.

---

## 🛠️ Tech Stack

### Frontend
- HTML5  
- CSS3 (Flexbox, Grid, Custom Properties, Animations)  
- JavaScript (ES6+) — Vanilla JS, Fetch API, DOM Manipulation  

### Backend
- Node.js  
- Express.js (Routing & REST API)  
- MongoDB (Database)  
- Mongoose (ODM)

### Key Libraries
- `bcryptjs` – Password hashing  
- `jsonwebtoken (JWT)` – Authentication and protected routes  
- `multer` – Image file uploads  
- `cors` – Cross-Origin Resource Sharing  

---

This project is licensed under the MIT License.
