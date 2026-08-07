// create server
const express = require('express');
const cookieParser = require('cookie-parser'); 
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/food-partner.routes');
const cors = require('cors');

const app = express();

// Configure CORS to accept requests from both local and deployed frontend
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "http://localhost:3000",
        // Add your frontend online URL here when you deploy to Netlify/Vercel
    ],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello World - API is running!");
});

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);

module.exports = app;