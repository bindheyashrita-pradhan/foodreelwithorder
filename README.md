<div align="center">

# 🍕 FoodReel Short-Video Food Discovery & Real-Time Ordering App

An interactive full-stack food discovery platform inspired by **Instagram/TikTok Reels** and **Food Delivery Platforms**. Customers explore dishes through full-screen video reels, customize portion sizes, and order directly from local restaurant partners.

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)


</div>

---

## App Showcase & Feature Gallery

---

### 1. Video Reels Feed & Instant Search
Full-screen auto-playing reels with double-tap like (`❤️`), bookmarking (`🔖`), sound toggle, restaurant brand badge, glowing price tags, and a floating glassmorphic search bar.

<div align="center">

| 🎬 Full-Screen Video Reel Feed | 🔍 Instant Dish Search Filter |
| :---: | :---: |
| <img src="Photos/1.png" alt="Reel Feed" width="400"/> | <img src="Photos/2.png" alt="Search Filter" width="400"/> |

| ❤️ Double-Tap Like & Bookmark | 🏪 Restaurant Profile View |
| :---: | :---: |
| <img src="Photos/3.png" alt="Likes and Bookmarks" width="400"/> | <img src="Photos/4.png" alt="Partner Profile" width="400"/> |

</div>

---

### 2. Smart Ordering & Dynamic Portion Customization
Customers customize portion sizes (**Small**, **Medium**, **Large**, **Full**) with real-time price calculation and interactive `+ / -` quantity stepper controls.

<div align="center">

| 🥞 Custom Quantity Stepper | 🥟 Small Portion Size Order |
| :---: | :---: |
| <img src="Photos/5.png" alt="Order Modal Stepper" width="400"/> | <img src="Photos/6.png" alt="Order Modal Small" width="400"/> |

</div>

---

### 3. Customer & Partner Order Management
Real-time tracking of order statuses (**Pending** ➡️ **Accepted** ➡️ **Completed** / **Rejected**) with instant delete/cancellation controls.

<div align="center">

| Customer "My Orders" Dashboard | 📦 Incoming Restaurant Orders |
| :---: | :---: |
| <img src="Photos/7.png" alt="My Orders" width="400"/> | <img src="Photos/8.png" alt="Partner Orders" width="400"/> |

</div>

---

### 4. Interactive Community & Comments
Slide-up reviews sheet allowing customers to share reviews, read feedback on dishes, and manage comments.

<div align="center">

| 💬 Community Comments List | ✍️ Empty Comments State |
| :---: | :---: |
| <img src="Photos/9.png" alt="Comments Active" width="400"/> | <img src="Photos/10.png" alt="Comments Empty" width="400"/> |

</div>

---

### 5. Food Partner Portal & Dish Creation
Restaurant partners upload food video reels directly to cloud storage and configure custom portion pricing.

<div align="center">

| ➕ Create Food & Portion Pricing | 📹 Video Upload Preview |
| :---: | :---: |
| <img src="Photos/12.png" alt="Create Food" width="400"/> | <img src="Photos/11.png" alt="Create Food Empty" width="400"/> |

</div>

---

### 🔐 6. Authentication & User Onboarding
Dedicated sign-in and registration workflows tailored for both **Customers** and **Food Partners**.

<div align="center">

| 👤 Customer Login | 📝 Customer Registration |
| :---: | :---: |
| <img src="Photos/13.png" alt="User Login" width="380"/> | <img src="Photos/14.png" alt="User Register" width="380"/> |

| 🏪 Partner Login | 📝 Partner Registration |
| :---: | :---: |
| <img src="Photos/15.png" alt="Partner Login" width="380"/> | <img src="Photos/16.png" alt="Partner Register" width="380"/> |

</div>

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **React 18 & Vite:** Lightning-fast UI development with component-based architecture.
- **React Router v6:** Client-side routing with protected partner/user views.
- **Axios:** API client with cross-origin credentials and Bearer token headers.
- **Modern CSS3 & Glassmorphism:** Spring physics animations (`@keyframes`), backdrop filters, and responsive mobile-first design.

### **Backend**
- **Node.js & Express.js:** RESTful API architecture with structured controllers, routes, and middleware.
- **MongoDB Atlas & Mongoose:** Schema modeling with dynamic subdocuments, population, and indexing.
- **JWT & Bcrypt:** Secure token-based authentication with password hashing.
- **Multer:** Multipart memory buffer handling for seamless video uploads.

### **Cloud Storage**
- **Supabase Storage:** Direct object storage for streaming high-definition `.mp4` video files with public CDN delivery.

---

## 📂 Project Structure

foodreelwithorder/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js           # Handles User & Partner Authentication
│   │   │   ├── food-partner.controller.js   # Food Partner Profile & Analytics
│   │   │   └── food.controller.js           # Video Reels, Likes, Saves & Comments Logic
│   │   ├── db/
│   │   │   └── db.js                        # MongoDB Atlas Connection
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js           # JWT Verification & Role-Based Auth Guards
│   │   ├── models/
│   │   │   ├── comment.model.js             # User Reviews & Comments Schema
│   │   │   ├── food.model.js                # Video Dishes & Portion Prices (Small/Med/Large)
│   │   │   ├── foodpartner.model.js         # Restaurant Partner Schema (Name, Address, Phone)
│   │   │   ├── likes.model.js               # Likes Tracker Schema
│   │   │   ├── order.model.js               # Customer Orders & Status Schema
│   │   │   ├── save.model.js                # Saved/Bookmarked Dishes Schema
│   │   │   └── user.model.js                # Customer Account Schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js               # /api/auth Endpoints (Login/Register)
│   │   │   ├── food-partner.routes.js       # /api/food-partner Endpoints (Profile/Details)
│   │   │   ├── food.routes.js               # /api/food Endpoints (Reels Feed, Like, Save, Comment)
│   │   │   └── order.routes.js              # /api/orders Endpoints (Create, Partner/User Orders, Status)
│   │   ├── services/
│   │   │   └── storage.service.js           # Supabase Cloud Storage (Public Video CDN)
│   │   └── app.js                           # Express App Configuration & Middlewares
│   ├── .env                                 # Backend Environment Variables
│   ├── .env.example                         # Environment Variables Template
│   ├── package-lock.json
│   ├── package.json
│   └── server.js                            # Server Entrypoint (Listens on Port)
│
├── frontend/
│   ├── public/                              # Static Icons & Web Assets
│   ├── src/
│   │   ├── assets/                          # App Media & Assets
│   │   ├── components/
│   │   │   ├── BottomNav.jsx                # Mobile Bottom Navigation Bar (Home & Saved)
│   │   │   ├── CommentModal.jsx             # Slide-Up Comments & Reviews Modal
│   │   │   ├── Navbar.jsx                   # Top Header Navbar with Dynamic Role Actions
│   │   │   ├── OrderModal.jsx               # Custom Portion Sizing & Quantity Stepper Modal
│   │   │   └── ReelFeed.jsx                 # Full-Screen Video Player with Search & Micro-Interactions
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── ChooseRegister.jsx       # Role Selection (Customer vs Restaurant Partner)
│   │   │   │   ├── FoodPartnerLogin.jsx     # Food Partner Sign-In
│   │   │   │   ├── FoodPartnerRegister.jsx  # Food Partner Registration
│   │   │   │   ├── UserLogin.jsx            # Customer Sign-In
│   │   │   │   └── UserRegister.jsx         # Customer Registration
│   │   │   ├── food-partner/
│   │   │   │   ├── CreateFood.jsx           # Dish Creation with Dynamic Portion Pricing
│   │   │   │   ├── PartnerOrders.jsx        # Partner Dashboard for Incoming Customer Orders
│   │   │   │   └── Profile.jsx              # Restaurant Profile & Menu Management
│   │   │   └── general/
│   │   │       ├── Home.jsx                 # Home Video Reels Feed
│   │   │       ├── MyOrders.jsx             # Customer Order Tracking & History
│   │   │       └── Saved.jsx                # Bookmarked Video Dishes Collection
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx                # React Router v6 Configuration
│   │   ├── styles/                          # Component & Page Stylesheets
│   │   ├── App.css                          # Global Resets & Keyframe Animations
│   │   ├── App.jsx                          # Root Application Component
│   │   └── main.jsx                         # React 18 DOM Entrypoint
│   ├── .env                                 # Frontend Environment Variables
│   ├── .gitignore
│   ├── eslint.config.js                     # ESLint Configuration
│   ├── index.html                           # Single Page HTML Template
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js                       # Vite Bundler Configuration
│
├── Photos/                                  # UI Showcase Screenshots (1.png - 16.png)
├── LICENSE                                  # MIT License
└── README.md                                # Project Documentation




---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use, modify, and build upon this code for personal or commercial projects.

Copyright (c) 2026 Bindheyashrita Pradhan




