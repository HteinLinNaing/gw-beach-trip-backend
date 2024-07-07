const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

const photosFile = './photos.json';

app.get('/photos', (req, res) => {
    fs.readFile(photosFile, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading photos file' });
        }
        const photos = JSON.parse(data);
        res.json(photos);
    });
});

app.post('/photos', (req, res) => {
    const newPhoto = req.body;
    fs.readFile(photosFile, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading photos file' });
        }
        const photos = JSON.parse(data);
        photos.push(newPhoto);
        fs.writeFile(photosFile, JSON.stringify(photos, null, 2), err => {
            if (err) {
                return res.status(500).json({ error: 'Error writing photos file' });
            }
            res.status(201).json(newPhoto);
        });
    });
});

app.delete('/photos/:id', (req, res) => {
    const photoId = req.params.id;
    fs.readFile(photosFile, (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading photos file' });
        }
        let photos = JSON.parse(data);
        photos = photos.filter(photo => photo.id !== photoId);
        fs.writeFile(photosFile, JSON.stringify(photos, null, 2), err => {
            if (err) {
                return res.status(500).json({ error: 'Error writing photos file' });
            }
            res.status(204).end();
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
