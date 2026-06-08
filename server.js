const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable JSON body parser with a high limit for payloads (e.g. image base64s if needed)
app.use(express.json({ limit: '10mb' }));

// Serve static assets from the current directory
app.use(express.static(__dirname));

// Safe whitelist of JSON database files
const SAFE_FILES = [
  'hero.json',
  'services.json',
  'events.json',
  'testimonials.json',
  'about.json',
  'resources.json',
  'glossary.json',
  'tips.json'
];

// Endpoint to fetch JSON data
app.get('/api/data/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!SAFE_FILES.includes(filename)) {
    return res.status(400).json({ error: 'Invalid file request.' });
  }

  const filePath = path.join(__dirname, 'data', filename);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'File not found.' });
      }
      return res.status(500).json({ error: 'Failed to read data.' });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      res.status(500).json({ error: 'Corrupted data format in server file.' });
    }
  });
});

// Endpoint to save JSON data
app.post('/api/save', (req, res) => {
  const { filename, data } = req.body;

  if (!filename || !data) {
    return res.status(400).json({ error: 'Missing filename or payload content.' });
  }

  if (!SAFE_FILES.includes(filename)) {
    return res.status(400).json({ error: 'Unauthorized write file destination.' });
  }

  const filePath = path.join(__dirname, 'data', filename);
  const formattedData = JSON.stringify(data, null, 2);

  fs.writeFile(filePath, formattedData, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing to ${filename}:`, err);
      return res.status(500).json({ error: 'Failed to write data to local disk.' });
    }
    console.log(`Successfully updated local database: ${filename}`);
    res.json({ success: true, message: `Successfully updated ${filename}` });
  });
});

// Endpoint to upload base64 images and save to img/
app.post('/api/upload-image', (req, res) => {
  const { base64Data, extension } = req.body;

  if (!base64Data) {
    return res.status(400).json({ error: 'Missing base64 data payload.' });
  }

  // Remove data:image/...;base64, prefix if present
  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Clean, 'base64');

  // Verify it is a valid image extension (default to png)
  const ext = extension ? extension.replace(/^\./, "") : 'png';
  if (!['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid image format type.' });
  }

  // Generate unique filename
  const filename = `upload_${Date.now()}.${ext}`;
  const imgDir = path.join(__dirname, 'img');

  // Ensure img/ directory exists
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  const filePath = path.join(imgDir, filename);

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving image:', err);
      return res.status(500).json({ error: 'Failed to write image file to disk.' });
    }
    console.log(`Successfully uploaded image asset: img/${filename}`);
    res.json({ success: true, filePath: `img/${filename}` });
  });
});

// Serve admin.html explicitly
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 NexusHive Solutions Local CMS Server Started!`);
  console.log(`👉 Access Website: http://localhost:${PORT}`);
  console.log(`👉 Access CMS Panel: http://localhost:${PORT}/admin.html`);
  console.log(`========================================================`);
});
