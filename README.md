# NovaCart – E-Commerce Web Application

NovaCart is a full-stack e-commerce web application that allows users to browse products, add items to their cart, place orders, and track their purchases. It includes an admin dashboard for managing products and customer orders.

## 🚀 Features

### Customer Features

* User registration and login
* Browse and search products
* Add products to the shopping cart
* Update cart quantities and remove items
* Checkout with delivery details
* Place orders using Cash on Delivery (COD)
* View personal order history

### Admin Features

* Admin dashboard with store statistics
* Add, edit, and delete products
* View customer orders
* Update order statuses
* Monitor product stock and recorded revenue

### Security

* Password hashing with bcrypt
* JSON Web Token (JWT) authentication
* Role-based authorization for admin operations
* Environment variables for database credentials and application secrets

## 🛠️ Technology Stack

**Frontend**

* HTML5
* CSS3
* JavaScript

**Backend**

* Node.js
* Express.js
* REST API

**Database**

* MySQL

**Additional Libraries**

* mysql2
* bcryptjs
* jsonwebtoken
* dotenv
* cors

## 📁 Project Structure

```text
novacart-ecommerce/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── db.js
│   └── server.js
├── frontend/
│   ├── admin.html
│   ├── cart.html
│   ├── checkout.html
│   ├── index.html
│   ├── login.html
│   ├── orders.html
│   ├── register.html
│   ├── script.js
│   └── style.css
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

* Node.js and npm
* MySQL Server
* Git

### 1. Clone the repository

```bash
git clone https://github.com/pranavmarimuthu123-cmd/novacart-ecommerce.git
cd novacart-ecommerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the database

Create a MySQL database named `ecommerce_db`.

Create the required tables: `users`, `products`, `orders`, and `order_items`.

Configure your database connection details using environment variables. Do not upload your actual `.env` file or credentials to GitHub.

Example environment variables:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
JWT_SECRET=replace_with_a_long_random_secret
```

Use the actual environment variable names expected by your backend's `db.js` and authentication code.

### 4. Start the application

```bash
npm run dev
```

If your `package.json` does not define a `dev` script, start the server using:

```bash
node backend/server.js
```

### 5. Open the application

* Store: http://localhost:5000
* API health check: http://localhost:5000/api/health
* Admin dashboard: http://localhost:5000/admin.html

## 🔐 Admin Access

Public registration creates regular user accounts. To grant admin access, update the role of your own registered account in MySQL and then log in again to obtain a token with the updated role.

Never expose admin credentials or database passwords publicly.

## 🧪 Testing

Test the main application workflow:

1. Register a new user.
2. Log in to the store.
3. Browse products and add items to the cart.
4. Complete checkout using valid delivery details.
5. View the order in My Orders.
6. Log in using an authorized admin account.
7. Add, edit, and delete products.
8. Update an order's status.

## 🎯 Project Objective

The objective of NovaCart is to gain practical experience in full-stack web development, REST API integration, database management, user authentication, and role-based access control.

## 👨‍💻 Author

**Pranav**

## 📄 License

This project was developed for educational and internship purposes.
