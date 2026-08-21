<div align="center">

# 🍕 FoodReel Short-Video Food Discovery & Real-Time Ordering App

An interactive full-stack food discovery platform inspired by **Instagram/TikTok Reels** and **Food Delivery Platforms**. Customers explore dishes through full-screen video reels, customize portion sizes, and order directly from local restaurant partners.

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

##  App Showcase & Feature Gallery

---

###  1. Video Reels Feed & Instant Dish Search
Full-screen auto-playing video reels with double-tap to like (`❤️`), bookmarking (`🔖`), sound toggle, restaurant brand badge, glowing price tags, and a floating glassmorphic search bar.

| 🎬 Reel Feed & Audio Controls | 🔍 Instant Dish Search Filter | ❤️ Double-Tap Like & Bookmark |
| :---: | :---: | :---: |
| <img src="Photos/1.png" alt="Reel Feed" width="260"/> | <img src="screenshots/search-filter.png" alt="Search Filter" width="260"/> | <img src="screenshots/likes-bookmarks.png" alt="Likes & Bookmarks" width="260"/> |

---

###  2. Smart Ordering & Dynamic Portion Customization
Customers customize portion sizes (**Small**, **Medium**, **Large**, **Full**) with real-time price calculation and interactive `+ / -` quantity stepper controls.

| 🥟 Small Portion Order | 🥞 Custom Quantity Stepper | 📋 Customer "My Orders" Dashboard |
| :---: | :---: | :---: |
| <img src="screenshots/order-modal-small.png" alt="Small Portion Order" width="260"/> | <img src="screenshots/order-modal-stepper.png" alt="Quantity Stepper" width="260"/> | <img src="screenshots/my-orders.png" alt="My Orders" width="260"/> |

---

### 💬 3. Interactive Comments & Social Community
Slide-up comments sheet allowing customers to share reviews, read feedback on dishes, and edit or delete their comments.

| 💬 Community Comments List | ✍️ Empty Comments State |
| :---: | :---: |
| <img src="screenshots/comments-active.png" alt="Comments List" width="260"/> | <img src="screenshots/comments-empty.png" alt="Empty Comments" width="260"/> |

---

### 🏪 4. Restaurant Food Partner Dashboard
Restaurant partners can upload dishes with custom portion pricing directly to cloud storage, track customer metrics, view restaurant profiles, and manage live incoming customer orders.

| ➕ Create Food & Portion Pricing | 📦 Incoming Customer Orders | 🏪 Partner Restaurant Profile |
| :---: | :---: | :---: |
| <img src="screenshots/create-food.png" alt="Create Food" width="260"/> | <img src="screenshots/partner-orders.png" alt="Partner Orders" width="260"/> | <img src="screenshots/partner-profile.png" alt="Partner Profile" width="260"/> |

---

### 🔐 5. Dual-Role Authentication
Dedicated sign-in and registration workflows tailored for both **Customers** and **Food Partners**.

| 👤 Customer Login | 📝 Customer Registration | 🏪 Partner Login | 📝 Partner Registration |
| :---: | :---: | :---: | :---: |
| <img src="screenshots/user-login.png" alt="User Login" width="220"/> | <img src="screenshots/user-register.png" alt="User Register" width="220"/> | <img src="screenshots/partner-login.png" alt="Partner Login" width="220"/> | <img src="screenshots/partner-register.png" alt="Partner Register" width="220"/> |

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

```text
foodreelwithorder/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # User & Partner Authentication
│   │   │   └── food.controller.js       # Reels, Likes, Saves & Comments
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js       # JWT Verification & Role Checks
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── foodpartner.model.js
│   │   │   ├── food.model.js            # Video dishes & portion prices
│   │   │   ├── order.model.js           # Customer orders & statuses
│   │   │   ├── likes.model.js
│   │   │   └── comment.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── food.routes.js
│   │   │   └── order.routes.js
│   │   ├── services/
│   │   │   └── storage.service.js       # Supabase Cloud Storage
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Dynamic navigation based on role
│   │   │   ├── ReelFeed.jsx             # Video player, search & interactions
│   │   │   ├── OrderModal.jsx           # Dynamic portion sizing & stepper
│   │   │   ├── CommentModal.jsx         # Real-time reviews
│   │   │   └── BottomNav.jsx
│   │   ├── pages/
│   │   │   ├── auth/                    # User & Partner Login/Register
│   │   │   ├── food-partner/            # CreateFood, PartnerOrders, Profile
│   │   │   └── general/                 # Home, MyOrders, Saved
│   │   └── App.jsx
│   └── package.json
├── screenshots/                         # UI Showcase images
└── README.md