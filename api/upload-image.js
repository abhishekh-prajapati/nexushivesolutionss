// Vercel Serverless Function — Upload an image to the GitHub repo (img/ folder)
// Route: POST /api/upload-image
// Body: { base64Data: string, extension: string }

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const correctPassword = process.env.ADMIN_PASSWORD || 'Jita2025';

  if (token !== correctPassword) {
    return res.status(401).json({ error: 'Unauthorized: Invalid credentials.' });
  }

  const { base64Data, extension } = req.body;

  if (!base64Data) {
    return res.status(400).json({ error: 'Missing base64 image data.' });
  }

  const ext = (extension || 'png').replace(/^\./, '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({ error: `Invalid image format. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` });
  }

  const token  = process.env.GITHUB_TOKEN;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    return res.status(500).json({ error: 'Server configuration error: GitHub credentials missing.' });
  }

  // Strip the data URL prefix (data:image/png;base64,...) to get raw base64
  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');

  // Generate a unique filename
  const filename = `upload_${Date.now()}.${ext}`;
  const filePath = `img/${filename}`;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  try {
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `CMS: Upload image ${filename}`,
        content: base64Clean, // GitHub expects raw base64 (no data URL prefix)
        branch
      })
    });

    if (!putRes.ok) {
      const errBody = await putRes.json();
      throw new Error(errBody.message || `GitHub upload error: ${putRes.status}`);
    }

    console.log(`[api/upload-image] Successfully uploaded: ${filePath}`);
    res.status(200).json({ success: true, filePath });
  } catch (err) {
    console.error('[api/upload-image] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
