# NexaMart: A Full-Stack E-commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Project Overview

NexaMart is a modern, full-stack e-commerce application built with the MERN (MongoDB, Express.js, React, Node.js) stack. It provides a seamless shopping experience for users and robust product management capabilities for administrators.

## ✨ Key Features (Implemented)

* **User Authentication:** Secure user registration, login, and logout functionalities.
* **Product Catalog:** Browse a wide range of products with detailed information.
* **Shopping Cart:**
    * Add products to the cart.
    * Update product quantities in the cart.
    * Remove individual items from the cart.
    * Clear the entire cart.
    * Real-time cart item count indication on the navbar (dot indicator).
* **Admin Panel:** Dedicated routes for administrators to manage products.
* **Responsive Design:** Optimized for various screen sizes (desktop, tablet, mobile).
* **Dynamic UI:** Utilizes `framer-motion` for smooth animations and transitions.

## 💡 Future Features (Planned)

We are continuously working to enhance NexaMart with the following functionalities:

* **Order Management:**
    * Place orders with shipping and payment details.
    * View order history for users.
    * Admin panel for managing all orders (status updates, tracking).
* **Payment Gateway Integration:** Securely process payments (e.g., Stripe, PayPal).
* **User Profile Management:** Users can view and update their personal information, addresses, and payment methods.
* **Advanced Product Search & Filtering:** More sophisticated search options and filters (e.g., by price range, brand, availability).
* **Product Reviews & Ratings:** Allow users to leave reviews and rate products.
* **Wishlist Functionality:** Users can save products for later consideration.
* **Notifications:** Real-time notifications for order updates, promotions, etc.
* **Dashboard Enhancements:** More detailed user and sales analytics for admins.

## 🛠️ Technologies Used

**Backend:**
* **Node.js:** JavaScript runtime environment.
* **Express.js:** Web framework for Node.js.
* **MongoDB:** NoSQL database for storing data.
* **Mongoose:** ODM (Object Data Modeling) library for MongoDB and Node.js.
* **JWT (JSON Web Tokens):** For secure authentication.
* **Bcrypt.js:** For password hashing.
* **CORS:** Middleware for enabling Cross-Origin Resource Sharing.
* **Dotenv:** For managing environment variables.

**Frontend:**
* **React:** JavaScript library for building user interfaces.
* **React Router DOM:** For declarative routing.
* **Styled Components:** For styling React components with CSS-in-JS.
* **Framer Motion:** For animations.
* **React Icons:** For scalable vector icons.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* Node.js (v18 or higher recommended)
* npm (v8 or higher recommended)
* MongoDB (local installation or MongoDB Atlas account)
* Git

### 1. Clone the Repository

```bash
git clone <repository_url>
cd nexamart-ecommerce # Or whatever your project root folder is called
```

2. Backend Setup
Navigate to the server (or backend) directory:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create a .env file in the server directory and add the following environment variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_very_strong_and_secret_key_for_jwt
PORT=5000
```
Replace your_mongodb_connection_string with your MongoDB URI (e.g., from MongoDB Atlas).

Replace a_very_strong_and_secret_key_for_jwt with a unique, strong secret key.

Start the backend server:


```Bash
npm start

# Or if you have nodemon installed:
# nodemon server.js
```
The backend server will run on http://localhost:5000.

3. Frontend Setup
Open a new terminal and navigate to the client (or frontend) directory:

```Bash
cd ../client
Install frontend dependencies:
```

```Bash
npm install
```

Create a .env file in the client directory and add the following environment variable:
```
REACT_APP_API_URL=http://localhost:5000
```
This points your frontend to your local backend.

Start the frontend development server:

```Bash
npm run dev
The frontend application will typically open in your browser at http://localhost:5173 (or another available port).
```

## 🌍 Deployment
This project can be deployed using free-tier services:

Database: MongoDB Atlas (M0 Sandbox)

Backend: Render (Free Web Services)

Frontend: Netlify or Vercel (Free Static Site Hosting)

Refer to the documentation of each service for detailed deployment instructions. Remember to update your backend's CORS settings and frontend's REACT_APP_API_URL to reflect your deployed URLs.

## 🤝 Contributing
Contributions are welcome! If you have any suggestions, bug reports, or want to contribute to the codebase, please feel free to open an issue or submit a pull request.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
