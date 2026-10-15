# Shopkart - MERN Stack E-Commerce Platform

A full-stack e-commerce web application built using the MERN stack (MongoDB, Express, React, Node.js) with Razorpay payment gateway integration.

## Features

- **User Authentication**: Secure sign up, login, and JWT-based session handling.
- **Product Catalog**: Browse and explore products across various categories.
- **Cart & Wishlist**: Manage items in real time with dynamic updates.
- **Checkout & Payments**: Integrated Razorpay payment workflow.
- **Order Management**: Track orders and view transaction status.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS / Styling, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Payments**: Razorpay API
- **Authentication**: JWT & Cookie-parser

## Project Structure

```text
ShopKart/
├── backend/
│   ├── config/          # Configurations (Razorpay, etc.)
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth and validation middlewares
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   └── index.js         # Express server entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/             # React application source code
│   ├── index.html       # Entry HTML
│   └── vite.config.js   # Vite configuration
└── package.json
```

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Mds-1234/Shopkart.git
cd Shopkart
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
dbUrl = "your_mongodb_connection_string"
JWT_SECRET = "your_jwt_secret"
RAZORPAY_KEY_ID = "your_razorpay_key_id"
RAZORPAY_KEY_SECRET = "your_razorpay_key_secret"
```
Start the backend server:
```bash
npm run dev
# or
node index.js
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.