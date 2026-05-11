const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expenses');
const destinationRoutes = require('./routes/destinations');
const restaurantRoutes = require('./routes/restaurants');
const tripRoutes = require('./routes/trips');
const reviewRoutes = require('./routes/reviews');
const path = require('path');

dotenv.config();

const app = express();
app.disable('x-powered-by');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/reviews', reviewRoutes);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Rovera API is running...');
});

module.exports = app;
