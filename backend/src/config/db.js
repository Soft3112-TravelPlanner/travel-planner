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

        console.log('Database tables initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        connection.release();
    }
};

initDB();

module.exports = pool.promise();
