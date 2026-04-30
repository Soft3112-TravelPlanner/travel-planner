const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fix() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Checking columns...');
        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        const columnNames = columns.map(c => c.Field);
        
        if (!columnNames.includes('tc')) {
            console.log('Adding tc...');
            await connection.query('ALTER TABLE users ADD COLUMN tc VARCHAR(11) NULL');
        }
        if (!columnNames.includes('birth_date')) {
            console.log('Adding birth_date...');
            await connection.query('ALTER TABLE users ADD COLUMN birth_date DATE NULL');
        }
        if (!columnNames.includes('phone')) {
            console.log('Adding phone...');
            await connection.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL');
        }
        
        console.log('Final columns:', (await connection.query('SHOW COLUMNS FROM users'))[0].map(c => c.Field));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

fix();
