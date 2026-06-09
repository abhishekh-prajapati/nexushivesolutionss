// Vercel Serverless Function — Serve a JSON data file
// Route: GET /api/data?file=hero.json

const fs = require('fs');
const path = require('path');

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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  // Support both /api/data?file=hero.json and /api/data/hero.json (via rewrite)
  const filename = req.query.file || (req.url.split('/').pop().split('?')[0]);

  if (!filename || !SAFE_FILES.includes(filename)) {
    return res.status(400).json({ error: 'Invalid or missing file parameter.' });
  }

  const filePath = path.join(process.cwd(), 'data', filename);

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: `File not found: ${filename}` });
    }
    return res.status(500).json({ error: 'Failed to read data file.' });
  }
};
