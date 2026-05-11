const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const initDB = async () => {
    const connection = await pool.promise().getConnection();
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                username VARCHAR(100) UNIQUE,
                email VARCHAR(191) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                preferences VARCHAR(100) DEFAULT 'Budget',
                tc VARCHAR(11) NULL,
                birth_date DATE NULL,
                phone VARCHAR(20) NULL,
                avatar VARCHAR(255),
                role ENUM('user', 'admin') DEFAULT 'user',
                failed_attempts INT DEFAULT 0,
                lock_until DATETIME DEFAULT NULL,
                token_version INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        try {
            await connection.query("ALTER TABLE users ADD COLUMN tc VARCHAR(11) NULL");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.error('ALTER tc error:', e); }
        try {
            await connection.query("ALTER TABLE users ADD COLUMN birth_date DATE NULL");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.error('ALTER birth_date error:', e); }
        try {
            await connection.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL");
        } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.error('ALTER phone error:', e); }


        await connection.query(`
            CREATE TABLE IF NOT EXISTS token_blacklist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                token TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS destinations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                city VARCHAR(255),
                country VARCHAR(255),
                lat DECIMAL(10,8),
                lng DECIMAL(11,8),
                estimated_cost DECIMAL(10,2),
                rating DECIMAL(3,1),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Ensure city and country columns exist for older schemas
        const [columns] = await connection.query('SHOW COLUMNS FROM destinations');
        const columnNames = columns.map(c => c.Field);
        if (!columnNames.includes('city')) {
            await connection.query('ALTER TABLE destinations ADD COLUMN city VARCHAR(255) AFTER description');
        }
        if (!columnNames.includes('country')) {
            await connection.query('ALTER TABLE destinations ADD COLUMN country VARCHAR(255) AFTER city');
        }

        await connection.query(`
            CREATE TABLE IF NOT EXISTS restaurants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                destination_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                cuisine VARCHAR(100),
                lat DECIMAL(10,8),
                lng DECIMAL(11,8),
                FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                trip_id INT NULL,
                title VARCHAR(255) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                category VARCHAR(100),
                date DATE,
                receipt_photo VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS trips (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                destination_id INT NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                accommodation JSON,
                transport JSON,
                checklist JSON,
                planned_activities JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('Database tables initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        connection.release();
    }
};

initDB();

module.exports = pool.promise();
