# ShopKart — MERN E-Commerce Application

ShopKart is a full-stack e-commerce web application built with the MERN stack (MongoDB, Express, React, Node.js). It features end-to-end customer workflows including authentication, product discovery, wishlist and shopping cart management, checkout, Razorpay Test Mode payment integration, and complete order tracking.

---

## Key Features

- **Authentication & Security**
  - Customer registration, login, and logout.
  - JWT-based authentication using cookies with protected frontend and backend routes.
  - Customer-scoped data isolation (customers only access their own cart, wishlist, and orders).

- **Product Discovery & Management**
  - Product catalog browsing with category filtering and search.
  - Product detail views with real-time stock availability.
  - Dynamic wishlist management.

- **Cart & Checkout Workflow**
  - Interactive shopping cart with live quantity updates and stock limit validation.
  - Checkout form with complete shipping address validation.
  - Backend-authoritative order calculation (totals calculated server-side, never trusting client amounts).
  - Purchase-time product snapshots preserved in order documents.

- **Payments & Verification**
  - Integrated Razorpay Standard Checkout (Test Mode).
  - Server-side cryptographic payment signature verification using HMAC SHA-256.
  - Atomic order status transitions and inventory deduction upon verified payment.
  - Automatic cart cleanup following successful verification.

- **Order Management & Tracking**
  - Complete order history sorted newest first.
  - Individual order detail views with item breakdowns, payment identifiers, and shipping records.
  - Visual order status progression tracking.

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Payments**: Razorpay Node SDK
- **Security & Utilities**: JSON Web Token (JWT), Cookie-parser, CORS, Dotenv, Crypto

---

## Project Structure

```text
ShopKart/
├── backend/
│   ├── config/          # Service configurations (Razorpay)
│   ├── controllers/     # Request handlers and business logic
│   ├── middlewares/     # Authentication and validation middlewares
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # Helper functions
│   └── index.js         # Backend server entry point
├── frontend/
│   ├── public/          # Static public assets
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── Context/     # Cart and application state providers
│   │   ├── Pages/       # Page views (Home, Products, Orders, Checkout, etc.)
│   │   ├── Services/    # API clients and HTTP helper services
│   │   ├── App.jsx      # Route configurations and layout root
│   │   └── main.jsx     # Frontend entry point
│   └── vite.config.js   # Vite configuration
└── package.json
```

---

## Prerequisites

- **Node.js** (v18 or higher recommended) and **npm**
- **MongoDB** instance (local MongoDB or MongoDB Atlas)
- **Razorpay Account** (Test Mode API Key ID and Key Secret)

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Mds-1234/Shopkart.git
cd Shopkart
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:
```env
PORT=8085
dbUrl=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the backend server:
```bash
npm run dev
```
The backend server runs on `http://localhost:8085`.

### 3. Frontend Setup
Open a separate terminal window from the project root:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be running at `http://localhost:5173`.

---

## Frontend Routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Landing / Showcase page | Public |
| `/products` | Product browsing & category filtering | Public |
| `/products/:id` | Individual product details | Public |
| `/login` | Customer login | Public |
| `/register` | Customer account registration | Public |
| `/wishlist` | Saved wishlist items | Protected |
| `/cart` | Shopping cart management | Protected |
| `/checkout` | Shipping details & payment launch | Protected |
| `/orders` | Order history list | Protected |
| `/orders/:id` | Detailed order tracking & status | Protected |

---

## Backend API Endpoints

### Customer Routes (`/customers`)
- `POST /customers/register` — Register a new customer
- `POST /customers/login` — Authenticate and receive session cookie
- `POST /customers/logout` — Invalidate session and clear auth cookie
- `GET /customers/me` — Retrieve the currently authenticated customer profile

### Product Routes (`/products`)
- `GET /products` — Fetch all products (supports category and query filters)
- `GET /products/:id` — Retrieve single product details

### Cart Routes (`/cart`)
- `GET /cart` — Fetch items in the active customer's cart
- `POST /cart/:productId` — Add item to cart
- `PATCH /cart/:productId` — Update item quantity in cart
- `DELETE /cart/:productId` — Remove item from cart

### Wishlist Routes (`/wishlist`)
- `GET /wishlist` — Fetch customer wishlist
- `POST /wishlist/:productId` — Add product to wishlist
- `DELETE /wishlist/:productId` — Remove product from wishlist

### Order & Payment Routes (`/orders`)
- `POST /orders/create-payment-order` — Validates checkout, calculates authoritative total, and initializes Razorpay order
- `POST /orders/verify-payment` — Cryptographically verifies payment signature, deducts stock, marks order paid, and clears cart
- `GET /orders` — List authenticated customer's order history
- `GET /orders/:id` — Retrieve individual order details
- `PATCH /orders/:id/status` — Update order status stage

---

## Razorpay Test Mode Workflow

1. Start both backend and frontend servers.
2. Sign in with a registered account and add products to the cart.
3. Proceed to Checkout and provide valid shipping information.
4. Click **Proceed to Payment** to open Razorpay modal.
5. Use test credentials provided in the Razorpay dashboard (e.g. Test Netbanking or Test Card).
6. Upon successful payment verification on the backend, you are redirected to the Order Confirmation view.
7. View your order under **Orders** to verify order status and tracking details.

---

## Security & Best Practices

- **Zero Credential Exposure**: Real credentials and secret keys are stored in environment variables, excluded by `.gitignore`, and never committed to source control.
- **Server-Side Authoritative Totals**: Product pricing and checkout amounts are calculated strictly on the backend to prevent client tampering.
- **HMAC SHA-256 Signature Verification**: Payment proofs are validated on the backend before order confirmation and stock deduction.
- **Customer Scoping**: All database operations for carts, wishlists, and orders strictly match the authenticated user ID.

---

## Verification & Testing Checklist

- [x] Register new customer, log in, and log out.
- [x] Protected routes redirect unauthenticated users to `/login`.
- [x] Product list, search, and category filtering operational.
- [x] Wishlist addition, retrieval, and removal.
- [x] Cart quantity updates enforce inventory limits.
- [x] Checkout form validates shipping fields.
- [x] Razorpay order generated with backend-calculated amount.
- [x] Server verifies payment signature before order placement.
- [x] Cart clears automatically after verified checkout.
- [x] Inventory stock levels decrement upon payment completion.
- [x] Orders page displays history sorted newest first.
- [x] Order details show purchased items, pricing snapshots, and addresses.