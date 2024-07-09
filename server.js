require('dotenv').config(); // Add this line at the top of the file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = 5000;

// Postgres pool setup
const pool = new Pool({
    connectionString: "postgres://default:8uiNrDg1xTHn@ep-floral-mouse-a1ry6nvu-pooler.ap-southeast-1.aws.neon.tech/verceldb?sslmode=require",
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(cors({
    origin: 'https://gw-beach-trip.vercel.app',
}));
// app.use(bodyParser.json({ limit: '50mb' }));

// Create table if it doesn't exist
const createTable = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id UUID PRIMARY KEY,
        width INT,
        height INT,
        base64 TEXT
      )
    `);
    } finally {
        client.release();
    }
};

createTable();

app.get('/photos', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM photos ORDER BY RANDOM() LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching photos' });
    } finally {
        client.release();
    }
});

app.post('/photos', async (req, res) => {
    const { id, width, height, base64 } = req.body;
    const client = await pool.connect();
    try {
        await client.query('INSERT INTO photos (id, width, height, base64) VALUES ($1, $2, $3, $4)', [id, width, height, base64]);
        res.status(201).json({ id, width, height, base64 });
    } catch (err) {
        res.status(500).json({ error: 'Error saving photo' });
    } finally {
        client.release();
    }
});

app.delete('/photos/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM photos WHERE id = $1', [id]);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Error deleting photo' });
    } finally {
        client.release();
    }
});

app.listen(port, () => {
    console.log(`Server is running on https://gw-beach-trip-backend.vercel.app`);
});
