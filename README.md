# E-Commerce Platform

## Introduction
E-Commerce Web is a modern e-commerce platform built using ReactJS for the frontend and ExpressJS for the backend. It utilizes TailwindCSS and Shadcn/UI for styling, along with MongoDB as the database. The platform supports various features, including real-time notification and communication, order tracking, and payment integration.

## Technologies Used
- **Frontend**: ReactJS, Vite, TailwindCSS, Shadcn/UI, OriginUI
- **Backend**: ExpressJS
- **Database**: MongoDB
- **Payment Integration**: Stripe, Momo, VNPAY
- **Real-Time Communication**: WebSocket

## Features
- Searching with filtering feature.
- Manage user profiles and orders. Support uploading images.
- Seller role: Products, orders, reviews, and inventory management.
- Complete checkout and transaction process.
- Real-time chat between buyers and sellers
- Order tracking and notifications.
- Third-party API integration: Stripe/Momo, GHN.
- JWT Tokens for authentication, support Google Login and registering with verification link throguh email.

## System Requirements
- Node.js version 14 or later
- MongoDB version 4.4 or later

## Installation
Follow these steps to set up the project on your local machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TaikiInomata/e-commerce-api.git
   ```
2. **Install dependencies**:
   ```bash
   cd e-commerce-api
   yarn
   ```
3. **Set up environment variables**:
   - Create a `.env` file and configure necessary variables like MongoDB connection string, Stripe/Momo API keys, etc.
4. **Run the application**:
   ```bash
   yarn dev
   ```

## Usage
- Open `http://localhost:8017` in your browser.
- Register a new account or log in.
- Browse products, add them to the cart, and proceed with checkout.

## Contact
For any inquiries or feedback, feel free to contact us at: ecommerceplatform.pp.204@gmail.com.

