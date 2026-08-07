require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = require('./src/app');
const connectDB = require('./src/db/db.js');

connectDB();

// Use Render's dynamic port, or fallback to 3000 for local testing
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});