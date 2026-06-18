// Vercel Serverless Function — Verify the CMS admin password
// Route: POST /api/verify

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  const correctPassword = process.env.ADMIN_PASSWORD || 'Jita2025';

  if (token === correctPassword) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ error: 'Invalid password.' });
  }
};
