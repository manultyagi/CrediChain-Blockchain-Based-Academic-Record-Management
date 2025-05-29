const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

// Admin credentials (mock version)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Setup DB
const db = new sqlite3.Database('./credichain.db');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// ----------------------
// Initialize DB
// ----------------------
db.serialize(() => {
    // Create Students table
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            unique_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            branch TEXT NOT NULL,
            year INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create Faculty table
    db.run(`
        CREATE TABLE IF NOT EXISTS faculty (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            unique_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            research_area TEXT,
            post TEXT
        )
    `);
});

// ----------------------
// API Endpoints
// ----------------------

// Admin Login
app.post('/api/admin_login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.json({ success: false, message: 'Invalid username or password' });
    }
});

// Add Faculty
app.post('/api/add_faculty', (req, res) => {
    const { name, unique_id, email, research_area, post } = req.body;

    db.run(
        'INSERT INTO faculty (name, unique_id, email, research_area, post) VALUES (?, ?, ?, ?, ?)',
        [name, unique_id, email, research_area, post],
        function (err) {
            if (err) {
                res.json({ success: false, message: 'Unique ID or Email already exists' });
            } else {
                res.json({ success: true, message: 'Faculty added successfully' });
            }
        }
    );
});

// Get All Faculty
app.get('/api/get_faculty', (req, res) => {
    db.all('SELECT * FROM faculty', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// ----------------------
// Start Server
// ----------------------
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
