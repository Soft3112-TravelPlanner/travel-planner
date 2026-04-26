const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
app.disable('x-powered-by');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Rovera API is running...');
});

module.exports = app;
