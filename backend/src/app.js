const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const path = require('path');

dotenv.config();

const app = express();
app.disable('x-powered-by');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Rovera API is running...');
});

module.exports = app;
